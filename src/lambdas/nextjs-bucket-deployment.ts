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
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve as resolvePath } from "node:path";
import { Readable } from "node:stream";
import type {
  ListObjectsV2CommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import type { CloudFormationCustomResourceHandler } from "aws-lambda";
import type * as JSZipType from "jszip";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Options, Upload } from "@aws-sdk/lib-storage";
// @ts-ignore jsii doesn't support esModuleInterop
// eslint-disable-next-line no-duplicate-imports
import _JSZip from "jszip";
import * as micromatch from "micromatch";
import * as mime from "mime-types";

import type {
  CustomResourceProperties,
  NextjsBucketDeploymentProps,
} from "../NextjsBucketDeployment";

/* eslint-disable import/no-extraneous-dependencies */

const JSZip = _JSZip as JSZipType;

const s3 = new S3Client({});

export const handler: CloudFormationCustomResourceHandler = async (
  event,
  context,
) => {
  debug({ event });
  let responseStatus: "SUCCESS" | "FAILED" = "SUCCESS";
  try {
    if (event.RequestType === "Create" || event.RequestType === "Update") {
      const props = getProperties(event);
      let tmpDir = "";
      const { assetsTmpDir, sourceDirPath, sourceZipFilePath } =
        initDirectories();
      tmpDir = assetsTmpDir;
      debug("Downloading zip");
      await downloadFile({
        bucket: props.sourceBucketName,
        key: props.sourceKeyPrefix,
        localDestinationPath: sourceZipFilePath,
      });
      debug("Extracting zip");
      await extractZip({
        sourceZipFilePath,
        destinationDirPath: sourceDirPath,
      });
      const filePaths = listFilePaths(sourceDirPath);
      if (
        props.substitutionConfig &&
        Object.keys(props.substitutionConfig).length
      ) {
        debug(
          "Replacing environment variables: " +
            JSON.stringify(props.substitutionConfig),
        );
        substitute({ config: props.substitutionConfig, filePaths });
      }
      // must find old object keys before uploading new objects so we know which objects to prune
      const oldObjectKeys = await listOldObjectKeys({
        bucketName: props.destinationBucketName,
        keyPrefix: props.destinationKeyPrefix,
      });
      if (!props.zip) {
        debug("Uploading objects to: " + props.destinationBucketName);
        await uploadObjects({
          bucket: props.destinationBucketName,
          keyPrefix: props.destinationKeyPrefix,
          filePaths,
          baseLocalDir: sourceDirPath,
          putConfig: props.putConfig,
          queueSize: props.queueSize,
        });
        if (props.prune) {
          debug("Emptying/pruning bucket: " + props.destinationBucketName);
          await pruneBucket({
            bucketName: props.destinationBucketName,
            filePaths,
            baseLocalDir: sourceDirPath,
            keyPrefix: props.destinationKeyPrefix,
            oldObjectKeys,
          });
        }
      } else {
        debug("Uploading zip to: " + props.destinationBucketName);
        const zipBuffer = await zipObjects({ tmpDir: sourceDirPath });
        await uploadZip({
          zipBuffer,
          bucket: props.destinationBucketName,
          keyPrefix: props.destinationKeyPrefix,
        });
      }
      if (tmpDir.length) {
        debug("Removing temp directory");
        rmSync(tmpDir, { force: true, recursive: true });
      }
      responseStatus = "SUCCESS";
    }
  } catch (err) {
    console.error(err);
    responseStatus = "FAILED";
  }
  await cfnResponse({ event, context, responseStatus });
};

function debug(value: unknown) {
  if (process.env.DEBUG) console.log(JSON.stringify(value, null, 2));
}

function getProperties(
  event: Parameters<CloudFormationCustomResourceHandler>[0],
) {
  const props = event.ResourceProperties;
  return {
    ...props,
    prune: props.prune === "true",
    zip: props.zip === "true",
  } as CustomResourceProperties & { ServiceToken: string };
}

function initDirectories() {
  const assetsTmpDir = mkdtempSync(resolvePath(tmpdir(), "assets-"));
  const sourceZipDirPath = resolvePath(assetsTmpDir, "source-zip");
  mkdirSync(sourceZipDirPath);
  const sourceZipFilePath = resolvePath(sourceZipDirPath, "temp.zip");
  // trailing slash expected by adm-zip's `extractAllTo` method
  const sourceDirPath = resolvePath(assetsTmpDir, "source") + "/";
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
  const data = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  return new Promise(async (resolve, reject) => {
    const body = data.Body;
    if (body instanceof Readable) {
      const writeStream = createWriteStream(localDestinationPath);
      body
        .pipe(writeStream)
        .on("error", (err) => reject(err))
        .on("close", () => resolve(null));
    }
  });
}

async function extractZip({
  sourceZipFilePath,
  destinationDirPath,
}: {
  sourceZipFilePath: string;
  destinationDirPath: string;
}) {
  const zipBuffer = readFileSync(sourceZipFilePath);
  const archive = await JSZip.loadAsync(zipBuffer);
  for (const [zipRelativePath, zipObject] of Object.entries(archive.files)) {
    if (!zipObject.dir) {
      const absPath = resolvePath(destinationDirPath, zipRelativePath);
      const pathDirname = dirname(absPath);
      if (!existsSync(pathDirname)) {
        mkdirSync(pathDirname, { recursive: true });
      }
      const fileContents = await zipObject.async("nodebuffer");
      let isSymLink = false;
      const unixPermissions = zipObject?.unixPermissions;
      if (typeof unixPermissions === "number") {
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

function substitute({
  filePaths,
  config,
}: {
  filePaths: string[];
  config: Record<string, string>;
}) {
  const findRegExp = new RegExp(Object.keys(config).join("|"), "g");
  for (const filePath of filePaths) {
    if (filePath.includes("node_modules")) continue;
    const fileContents = readFileSync(filePath, { encoding: "utf8" });
    const newFileContents = fileContents.replace(findRegExp, (matched) => {
      const matchedEnvVar = config[matched];
      if (matchedEnvVar) {
        return matchedEnvVar;
      } else {
        console.warn(
          `Could not find matched value: ${matched} in environment object. Substituting ''`,
        );
        return "";
      }
    });
    if (fileContents !== newFileContents) {
      writeFileSync(filePath, newFileContents);
    }
  }
}

async function listOldObjectKeys({
  bucketName,
  keyPrefix,
}: {
  bucketName: string;
  keyPrefix?: string;
}): Promise<string[]> {
  const oldObjectKeys: string[] = [];
  let nextToken: string | undefined = undefined;
  do {
    const cmd: ListObjectsV2CommandInput = {
      Bucket: bucketName,
      Prefix: keyPrefix,
    };
    if (nextToken) {
      cmd.ContinuationToken = nextToken;
    }
    const res = await s3.send(new ListObjectsV2Command(cmd));
    const contents = res.Contents;
    nextToken = res.NextContinuationToken;
    if (contents?.length) {
      for (const { Key: key } of contents) {
        if (key) {
          oldObjectKeys.push(key);
        }
      }
    }
  } while (nextToken);
  return oldObjectKeys;
}

/**
 * Create S3 Key given local path
 */
function createS3Key({
  keyPrefix,
  path,
  baseLocalDir,
}: {
  keyPrefix?: string;
  path: string;
  baseLocalDir: string;
}) {
  const objectKeyParts: string[] = [];
  if (keyPrefix) objectKeyParts.push(keyPrefix);
  objectKeyParts.push(relative(baseLocalDir, path));
  return join(...objectKeyParts);
}

async function* chunkArray(array: string[], chunkSize: number) {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

async function uploadObjects({
  bucket,
  keyPrefix,
  filePaths,
  baseLocalDir,
  putConfig = {},
  queueSize,
}: {
  bucket: CustomResourceProperties["destinationBucketName"];
  keyPrefix?: CustomResourceProperties["destinationKeyPrefix"];
  filePaths: string[];
  baseLocalDir: string;
  putConfig: CustomResourceProperties["putConfig"];
  queueSize: CustomResourceProperties["queueSize"];
}) {
  for await (const filePathChunk of chunkArray(filePaths, 100)) {
    const putObjectInputs: PutObjectCommandInput[] = filePathChunk.map(
      (path) => {
        const contentType = mime.lookup(path) || undefined;
        const putObjectOptions = getPutObjectOptions({ path, putConfig });
        const key = createS3Key({ keyPrefix, path, baseLocalDir });
        return {
          ContentType: contentType,
          ...putObjectOptions,
          Bucket: bucket,
          Key: key,
          Body: createReadStream(path),
        };
      },
    );

    // Call put objects serially, prevents XAmzContentSHA256Mismatch errors
    // This seems to be a bug within the lib storage package, I have opened an issue here: https://github.com/aws/aws-sdk-js-v3/issues/6940
    await putObjectInputs.reduce(async (acc, params) => {
      await acc;
      const opts: Options = {
        client: s3,
        params,
      };
      if (queueSize) {
        opts.queueSize = queueSize;
      }
      const upload = new Upload(opts);
      console.log("uploading", params);
      return upload.done();
    }, Promise.resolve<any>(null));
  }
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
        unixPermissions: parseInt("120755", 8),
      });
    } else {
      zip.file(relativePath, readFileSync(filePath), {
        dir: stat.isDirectory(),
        unixPermissions: stat.mode,
      });
    }
  }
  return zip.generateAsync({
    type: "nodebuffer",
    platform: "UNIX",
    compression: "STORE",
  });
}

async function uploadZip({
  bucket,
  keyPrefix,
  zipBuffer,
}: {
  bucket: CustomResourceProperties["destinationBucketName"];
  keyPrefix?: CustomResourceProperties["destinationKeyPrefix"];
  zipBuffer: Buffer;
}) {
  return s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: keyPrefix,
      Body: zipBuffer,
      ContentType: "application/zip",
    }),
  );
}

function getPutObjectOptions({
  path,
  putConfig = {},
}: {
  path: string;
  putConfig: NextjsBucketDeploymentProps["putConfig"];
}): Partial<PutObjectCommandInput> {
  let putObjectOptions: Partial<PutObjectCommandInput> = {};
  for (const [key, value] of Object.entries(putConfig)) {
    if (micromatch.isMatch(path, key)) {
      putObjectOptions = { ...putObjectOptions, ...value };
    }
  }
  return putObjectOptions;
}

async function pruneBucket({
  bucketName,
  filePaths,
  baseLocalDir,
  keyPrefix,
  oldObjectKeys,
}: {
  bucketName: string;
  filePaths: string[];
  baseLocalDir: string;
  keyPrefix?: string;
  oldObjectKeys: string[];
}) {
  const newObjectKeys = filePaths.map((path) =>
    createS3Key({ keyPrefix, path, baseLocalDir }),
  );
  // find old objects that are not currently in new objects to prune.
  const oldObjectKeysToBeDeleted: string[] = [];
  for (const key of oldObjectKeys) {
    if (!newObjectKeys.includes(key)) {
      oldObjectKeysToBeDeleted.push(key);
    }
  }
  if (oldObjectKeysToBeDeleted.length) {
    const deletePromises = [];

    // AWS limits S3 delete commands to 1000 keys per call
    const deleteCommandLimit = 1000;

    for (
      let i = 0;
      i < oldObjectKeysToBeDeleted.length;
      i += deleteCommandLimit
    ) {
      const objectChunk = oldObjectKeysToBeDeleted.slice(
        i,
        i + deleteCommandLimit,
      );

      deletePromises.push(
        s3.send(
          new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: { Objects: objectChunk.map((k) => ({ Key: k })) },
          }),
        ),
      );
    }

    await Promise.all(deletePromises);

    debug(
      `Objects pruned in ${bucketName}: ${oldObjectKeysToBeDeleted.join(", ")}`,
    );
  } else {
    debug(`No objects to prune`);
  }
}

interface CfnResponseProps {
  event: Parameters<CloudFormationCustomResourceHandler>[0];
  context: Parameters<CloudFormationCustomResourceHandler>[1];
  responseStatus: "SUCCESS" | "FAILED";
  responseData?: Record<string, string>;
  physicalResourceId?: string;
}
/**
 * Inspired by: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-lambda-function-code-cfnresponsemodule.html
 */
function cfnResponse(props: CfnResponseProps) {
  const body = JSON.stringify({
    Status: props.responseStatus,
    Reason:
      "See the details in CloudWatch Log Stream: " +
      props.context.logStreamName,
    PhysicalResourceId: props.physicalResourceId || props.context.logStreamName,
    StackId: props.event.StackId,
    RequestId: props.event.RequestId,
    LogicalResourceId: props.event.LogicalResourceId,
    Data: props.responseData,
  });
  return fetch(props.event.ResponseURL, {
    method: "PUT",
    body,
    headers: { "content-type": "", "content-length": body.length.toString() },
  });
}
