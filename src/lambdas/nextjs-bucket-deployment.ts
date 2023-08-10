/* eslint-disable import/no-extraneous-dependencies */
import {
  createReadStream,
  createWriteStream,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { relative, resolve as resolvePath } from 'node:path';
import { Readable } from 'node:stream';
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import * as AdmZip from 'adm-zip';
import type { CdkCustomResourceHandler } from 'aws-lambda';
import * as micromatch from 'micromatch';
import * as mime from 'mime-types';
import type { CustomResourceProperties, NextjsBucketDeploymentProps } from '../NextjsBucketDeployment';

const s3 = new S3Client({});

export const handler: CdkCustomResourceHandler = async (event) => {
  debug({ event });
  if (event.RequestType === 'Create' || event.RequestType === 'Update') {
    const props = event.ResourceProperties as CustomResourceProperties & { ServiceToken: string };
    let tmpDir = '';
    try {
      const { tmpDir: _tmpDir, sourceDirPath, sourceZipFilePath } = initDirectories();
      tmpDir = _tmpDir;
      debug('Downloading zip');
      await downloadFile({
        bucket: props.sourceBucketName,
        key: props.sourceKeyPrefix,
        localDestinationPath: sourceZipFilePath,
      });
      debug('Extracting zip');
      await extractZip({ sourceZipFilePath, sourceDirPath });
      const filePaths = listFilePaths(sourceDirPath);
      if (props.substitutionConfig && Object.keys(props.substitutionConfig).length) {
        console.log('Replacing environment variables: ' + JSON.stringify(props.substitutionConfig));
        substitute({ config: props.substitutionConfig, filePaths });
      }
      if (props.prune) {
        console.log('Emptying/pruning bucket: ' + props.destinationBucketName);
        await pruneBucket({ bucketName: props.destinationBucketName, keyPrefix: props.destinationKeyPrefix });
      }
      if (!props.zip) {
        debug('Uploading objects to: ' + props.destinationBucketName);
        await uploadObjects({
          bucket: props.destinationBucketName,
          keyPrefix: props.destinationKeyPrefix,
          filePaths,
          tmpDir: sourceDirPath,
          putConfig: props.putConfig,
        });
      } else {
        debug('Uploading zip to: ' + props.destinationBucketName);
        await zipObjects({
          bucket: props.destinationBucketName,
          keyPrefix: props.destinationKeyPrefix,
          filePaths,
          tmpDir: sourceDirPath,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (tmpDir.length) {
        rmSync(tmpDir, { force: true, recursive: true });
      }
    }
  }
  // don't return PhysicalResourceId so Custom Resource will be run every time.
  return {};
};

function debug(value: unknown) {
  if (process.env.DEBUG) JSON.stringify(value, null, 2);
}

function initDirectories() {
  const tmpDir = mkdtempSync(tmpdir());
  const sourceZipDirPath = resolvePath(tmpDir, 'source-zip');
  mkdirSync(sourceZipDirPath);
  const sourceZipFilePath = resolvePath(sourceZipDirPath, 'temp.zip');
  const sourceDirPath = resolvePath(tmpDir, 'source');
  mkdirSync(sourceDirPath);
  return { tmpDir, sourceZipFilePath, sourceDirPath };
}

async function downloadFile({
  bucket,
  key,
  localDestinationPath,
}: {
  bucket: string;
  key?: string | undefined;
  localDestinationPath: string;
}) {
  const data = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return new Promise(async (resolve, reject) => {
    const body = data.Body;
    if (body instanceof Readable) {
      const writeStream = createWriteStream(localDestinationPath);
      body
        .pipe(writeStream)
        .on('error', (err) => reject(err))
        .on('close', () => resolve(null));
    }
  });
}

async function extractZip({ sourceZipFilePath, sourceDirPath }: { sourceZipFilePath: string; sourceDirPath: string }) {
  const zip = new AdmZip(sourceZipFilePath);
  zip.extractAllTo(sourceDirPath);
}

/**
 * Given path of directory, returns array of all file paths within directory
 */
function listFilePaths(dirPath: string): string[] {
  const filePaths: string[] = [];
  const directory = readdirSync(dirPath, { withFileTypes: true });
  for (const d of directory) {
    const filePath = resolvePath(dirPath, d.name);
    if (d.isDirectory()) {
      filePaths.push(...listFilePaths(filePath));
    } else {
      filePaths.push(filePath);
    }
  }
  return filePaths;
}

function substitute({ filePaths, config }: { filePaths: string[]; config: Record<string, string> }) {
  const findRegExp = new RegExp(Object.keys(config).join('|'), 'g');
  for (const filePath of filePaths) {
    const fileContents = readFileSync(filePath, { encoding: 'utf8' });
    const newFileContents = fileContents.replace(findRegExp, (matched) => {
      const matchedEnvVar = config[matched];
      if (matchedEnvVar) {
        return matchedEnvVar;
      } else {
        console.warn(`Could not find matched value: ${matched} in environment object. Substituting ''`);
        return '';
      }
    });
    if (fileContents !== newFileContents) {
      writeFileSync(filePath, newFileContents);
    }
  }
}

async function pruneBucket({ bucketName, keyPrefix }: { bucketName: string; keyPrefix?: string }) {
  const deleteObjectPromises: Promise<unknown>[] = [];
  let numObjectsDeleted = 0;
  let nextToken: string | undefined = undefined;
  do {
    const cmd: ListObjectsV2CommandInput = { Bucket: bucketName, Prefix: keyPrefix };
    if (nextToken) {
      cmd.ContinuationToken = nextToken;
    }
    const res = await s3.send(new ListObjectsV2Command(cmd));
    const contents = res.Contents;
    nextToken = res.NextContinuationToken;
    if (contents?.length) {
      const objects = contents?.map((o) => ({ Key: o.Key }));
      numObjectsDeleted += objects?.length;
      deleteObjectPromises.push(
        s3.send(
          new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: { Objects: objects },
          })
        )
      );
    }
  } while (nextToken);
  await Promise.all(deleteObjectPromises);
  console.log(`Number of objects deleted for bucket ${bucketName}: ${numObjectsDeleted}`);
}

function uploadObjects({
  bucket,
  keyPrefix,
  filePaths,
  tmpDir,
  putConfig = {},
}: {
  bucket: CustomResourceProperties['destinationBucketName'];
  keyPrefix?: CustomResourceProperties['destinationKeyPrefix'];
  filePaths: string[];
  tmpDir: string;
  putConfig: CustomResourceProperties['putConfig'];
}) {
  const putObjectInputs: PutObjectCommandInput[] = filePaths.map((path) => {
    const contentType = mime.lookup(path) || undefined;
    const putObjectOptions = getPutObjectOptions({ path, putConfig });
    return {
      ContentType: contentType,
      ...putObjectOptions,
      Bucket: bucket,
      // .slice(1) to remove leading slash b/c s3 will create top level / folder
      Key: resolvePath('/' + keyPrefix, relative(tmpDir, path)).slice(1),
      Body: createReadStream(path),
    };
  });
  return Promise.all(putObjectInputs.map((input) => s3.send(new PutObjectCommand(input))));
}

async function zipObjects({
  bucket,
  keyPrefix,
  filePaths,
  tmpDir,
}: {
  bucket: CustomResourceProperties['destinationBucketName'];
  keyPrefix?: CustomResourceProperties['destinationKeyPrefix'];
  filePaths: string[];
  tmpDir: string;
}) {
  const destinationZipDir = resolvePath(tmpDir, 'destination-zip');
  const destinationZip = new AdmZip(destinationZipDir);
  for (const filePath of filePaths) {
    destinationZip.addLocalFile(filePath);
  }
  destinationZip.writeZip();
  const contentType = mime.lookup(destinationZipDir) || undefined;
  return s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: keyPrefix,
      Body: createReadStream(destinationZipDir),
      ContentType: contentType,
    })
  );
}

function getPutObjectOptions({
  path,
  putConfig = {},
}: {
  path: string;
  putConfig: NextjsBucketDeploymentProps['putConfig'];
}): Partial<PutObjectCommandInput> {
  let putObjectOptions: Partial<PutObjectCommandInput> = {};
  for (const [key, value] of Object.entries(putConfig)) {
    if (micromatch.isMatch(path, key)) {
      putObjectOptions = { ...putObjectOptions, ...value };
    }
  }
  return putObjectOptions;
}
