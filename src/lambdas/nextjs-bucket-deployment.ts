/* eslint-disable import/no-extraneous-dependencies */
import {
  createReadStream,
  createWriteStream,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve as resolvePath } from 'node:path';
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
import type { CloudFormationCustomResourceHandler } from 'aws-lambda';
import type * as JSZipType from 'jszip';
// @ts-ignore jsii doesn't support esModuleInterop
// eslint-disable-next-line no-duplicate-imports
import _JSZip from 'jszip';
import * as micromatch from 'micromatch';
import * as mime from 'mime-types';
import type { CustomResourceProperties, NextjsBucketDeploymentProps } from '../NextjsBucketDeployment';
const JSZip = _JSZip as JSZipType;

const s3 = new S3Client({});

export const handler: CloudFormationCustomResourceHandler = async (event, context) => {
  debug({ event });
  let responseStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
  try {
    if (event.RequestType === 'Create' || event.RequestType === 'Update') {
      const props = getProperties(event);
      let tmpDir = '';
      const { assetsTmpDir, sourceDirPath, sourceZipFilePath } = initDirectories();
      tmpDir = assetsTmpDir;
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
        debug('Emptying/pruning bucket: ' + props.destinationBucketName);
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
        const zipBuffer = await zipObjects({ tmpDir: sourceDirPath });
        await uploadZip({
          zipBuffer,
          bucket: props.destinationBucketName,
          keyPrefix: props.destinationKeyPrefix,
        });
      }
      if (tmpDir.length) {
        debug('Removing temp directory');
        rmSync(tmpDir, { force: true, recursive: true });
      }
      responseStatus = 'SUCCESS';
    }
  } catch (err) {
    console.error(err);
    responseStatus = 'FAILED';
  }
  await cfnResponse({ event, context, responseStatus });
};

function debug(value: unknown) {
  if (process.env.DEBUG) console.log(JSON.stringify(value, null, 2));
}

function getProperties(event: Parameters<CloudFormationCustomResourceHandler>[0]) {
  const props = event.ResourceProperties;
  return {
    ...props,
    prune: props.prune === 'true',
    zip: props.zip === 'true',
  } as CustomResourceProperties & { ServiceToken: string };
}

function initDirectories() {
  const assetsTmpDir = mkdtempSync(resolvePath(tmpdir(), 'assets-'));
  const sourceZipDirPath = resolvePath(assetsTmpDir, 'source-zip');
  mkdirSync(sourceZipDirPath);
  const sourceZipFilePath = resolvePath(sourceZipDirPath, 'temp.zip');
  // trailing slash expected by adm-zip's `extractAllTo` method
  const sourceDirPath = resolvePath(assetsTmpDir, 'source') + '/';
  mkdirSync(sourceDirPath);
  return { assetsTmpDir, sourceZipFilePath, sourceDirPath };
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
  const zipBuffer = readFileSync(sourceZipFilePath);
  const archive = await JSZip.loadAsync(zipBuffer);
  for (const [zipRelativePath, zipObject] of Object.entries(archive.files)) {
    const absPath = resolvePath(sourceDirPath, zipRelativePath);
    if (zipObject.dir) {
      mkdirSync(absPath, { recursive: true });
    } else {
      const pathDirname = dirname(absPath);
      if (!existsSync(pathDirname)) {
        mkdirSync(pathDirname, { recursive: true });
      }
      const fileContents = await zipObject.async('string');
      let isSymLink = false;
      const unixPermissions = zipObject?.unixPermissions;
      if (typeof unixPermissions === 'number') {
        // https://github.com/twolfson/grunt-zip/pull/52/files
        // eslint-disable-next-line no-bitwise
        isSymLink = (unixPermissions & 0xf000) === 0xa000;
      }
      if (isSymLink) {
        symlinkSync(fileContents, absPath);
      } else {
        writeFileSync(absPath, fileContents);
      }
    }
  }
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
    if (filePath.includes('node_modules')) continue;
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
    const keyPaths: string[] = [];
    if (keyPrefix) keyPaths.push(keyPrefix);
    keyPaths.push(relative(tmpDir, path));
    return {
      ContentType: contentType,
      ...putObjectOptions,
      Bucket: bucket,
      // .slice(1) to remove leading slash b/c s3 will create top level / folder
      Key: join(...keyPaths),
      Body: createReadStream(path),
    };
  });
  return Promise.all(putObjectInputs.map((input) => s3.send(new PutObjectCommand(input))));
}

/**
 * Zips objects taking into account symlinks
 * @see https://github.com/Stuk/jszip/issues/386#issuecomment-634773343
 */
function zipObjects({ tmpDir }: { tmpDir: string }): Promise<Buffer> {
  const zip = new JSZip();
  const filePaths = listFilePaths(tmpDir);
  for (const filePath of filePaths) {
    const relativePath = relative(tmpDir, filePath);
    const stat = lstatSync(filePath);
    if (stat.isSymbolicLink()) {
      zip.file(relativePath, readlinkSync(filePath), {
        dir: stat.isDirectory(),
        unixPermissions: parseInt('120755', 8),
      });
    } else {
      zip.file(relativePath, readFileSync(filePath), { dir: stat.isDirectory(), unixPermissions: stat.mode });
    }
  }
  return zip.generateAsync({
    type: 'nodebuffer',
    platform: 'UNIX',
    compression: 'STORE',
  });
}

async function uploadZip({
  bucket,
  keyPrefix,
  zipBuffer,
}: {
  bucket: CustomResourceProperties['destinationBucketName'];
  keyPrefix?: CustomResourceProperties['destinationKeyPrefix'];
  zipBuffer: Buffer;
}) {
  return s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: keyPrefix,
      Body: zipBuffer,
      ContentType: 'application/zip',
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

interface CfnResponseProps {
  event: Parameters<CloudFormationCustomResourceHandler>[0];
  context: Parameters<CloudFormationCustomResourceHandler>[1];
  responseStatus: 'SUCCESS' | 'FAILED';
  responseData?: Record<string, string>;
  physicalResourceId?: string;
}
/**
 * Inspired by: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-lambda-function-code-cfnresponsemodule.html
 */
function cfnResponse(props: CfnResponseProps) {
  const body = JSON.stringify({
    Status: props.responseStatus,
    Reason: 'See the details in CloudWatch Log Stream: ' + props.context.logStreamName,
    PhysicalResourceId: props.physicalResourceId || props.context.logStreamName,
    StackId: props.event.StackId,
    RequestId: props.event.RequestId,
    LogicalResourceId: props.event.LogicalResourceId,
    Data: props.responseData,
  });
  return fetch(props.event.ResponseURL, {
    method: 'PUT',
    body,
    headers: { 'content-type': '', 'content-length': body.length.toString() },
  });
}
