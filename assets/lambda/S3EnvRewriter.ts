import type { CdkCustomResourceEvent, CdkCustomResourceHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as JSZip from 'jszip';
import * as micromatch from 'micromatch';

type Replacements = Record<string, string>;

interface RewriteReplacementsConfig {
  env?: Record<string, string>; // replace keys with values in files
  jsonS3Bucket?: string;
  jsonS3Key?: string;
}

interface RewriterParams {
  bucket: string;
  s3keys: string[];
  replacementConfig: RewriteReplacementsConfig;
  debug?: boolean;
  cloudfrontDistributionId?: string;
}

const replaceTokenGlobs = ['**/*.html', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.json'];

// script entry point
// search and replace tokenized values of designated objects in s3
export const handler: CdkCustomResourceHandler = async (event) => {
  const requestType = event.RequestType;
  if (requestType === 'Create' || requestType === 'Update') {
    await doRewrites(event);
  }

  return event;
};

async function tryGetObject(bucket: string, key: string, tries = 0) {
  const s3 = new AWS.S3();
  try {
    return await s3.getObject({ Bucket: bucket, Key: key }).promise();
  } catch (err) {
    console.warn('Failed to retrieve object', key, err);
    // if access denied - wait a few seconds and try again
    if (err.code === 'AccessDenied' && tries < 2) {
      // console.info('Retrying for object', key);
      await new Promise((res) => setTimeout(res, 5000));
      return tryGetObject(bucket, key, ++tries);
    } else {
      // for now.. skip it. might be a rollback and the file is no longer available.
      // there might be a bug here with calling this script before all files are uploaded
      // this should be investigated more
      // for some reason _ssgManifest.js and _buildManifest.js always fail i don't know why. it's ok i guess.
      console.error('Failed to retrieve object', key, err);
      // throw err;
    }
  }
}

const doRewrites = async (event: CdkCustomResourceEvent) => {
  const scriptParams = event.ResourceProperties as unknown as RewriterParams;

  // get values we're replacing
  const replacementValues = await getReplacementValues(scriptParams);
  if (!Object.keys(replacementValues).length) {
    console.info('No replacements found, bailing');
    return;
  }

  // rewrite static files
  const s3 = new AWS.S3();
  const { s3keys, bucket, debug, cloudfrontDistributionId } = scriptParams;
  if (!s3keys || !bucket) {
    console.error('Missing required properties');
    return;
  }

  // iterate over s3keys and rewrite files
  const rewrittenPaths: string[] = [];
  const promises = s3keys.map(async (key) => {
    // get file
    const keyParams = { Bucket: bucket, Key: key };
    if (debug) console.info(`Retrieving s3://${bucket}/${key}`);
    const res = await tryGetObject(bucket, key);
    if (!res) return;

    // do rewrites
    let newBody;
    if (key.endsWith('.zip')) {
      newBody = await doRewritesForZipFile(res, scriptParams, replacementValues);
    } else {
      newBody = await doRewritesForTextFile(res, scriptParams, replacementValues);
    }
    if (!newBody) return;

    // upload
    if (debug) console.info('Rewrote', key);
    const putParams = {
      ...keyParams,
      Body: newBody,
      ContentType: res.ContentType,
      ContentEncoding: res.ContentEncoding,
      CacheControl: res.CacheControl,
    };
    const putRes = await s3.putObject(putParams).promise();
    if (debug) console.info(`Uploaded s3://${bucket}/${key}`, putRes);
    rewrittenPaths.push('/' + key);
  });
  await Promise.all(promises);

  // invalidate items that were just rewritten in cloudfront
  if (cloudfrontDistributionId && rewrittenPaths.length) {
    console.info('Invalidating rewritten files in cache', rewrittenPaths);
    const cloudfront = new AWS.CloudFront();
    const invalidationRes = await cloudfront
      .createInvalidation({
        DistributionId: cloudfrontDistributionId,
        InvalidationBatch: {
          CallerReference: Date.now().toString(),
          Paths: {
            Quantity: rewrittenPaths.length,
            Items: rewrittenPaths,
          },
        },
      })
      .promise();
  }
};

const doRewritesForTextFile = async (
  object: AWS.S3.GetObjectOutput,
  _params: RewriterParams,
  replacements: Replacements
) => {
  // get body
  const bodyPre = object.Body?.toString('utf-8');
  if (!bodyPre) return;
  let bodyPost = bodyPre;

  // do replacements of tokens
  Object.entries(replacements as Record<string, string>).forEach(([token, value]) => {
    bodyPost = bodyPost.replace(token, value);
  });

  // didn't change?
  if (bodyPost === bodyPre) return;

  return bodyPost;
};

const doRewritesForZipFile = async (
  object: AWS.S3.GetObjectOutput,
  params: RewriterParams,
  replacements: Replacements
) => {
  const archive = await JSZip.loadAsync(object.Body as Buffer);

  // iterate through zip
  const promises = Object.keys(archive.files).map(async (key) => {
    const file = archive.files[key];
    // if (params.debug) console.info('Looking at file', file.name, 'in zip...');
    if (file.dir) return;
    if (file.name.includes('node_modules/')) return;

    // file type we care about?
    if (!micromatch.isMatch(file.name, replaceTokenGlobs, { dot: true })) return;
    if (params.debug) console.info('Maybe rewriting', file.name, 'in zip...');

    // unzip to buffer
    const bodyPre = await file.async('string');
    let bodyPost = bodyPre;

    // do replacements of tokens
    Object.entries(replacements).forEach(([token, value]) => {
      bodyPost = bodyPost.replace(token, value);
    });

    // didn't change?
    if (bodyPost === bodyPre) return;

    console.info('Rewrote', key, 'in zip file, filename=', file.name);

    // update
    archive.file(file.name, bodyPost);
    return true; // rewrote
  });
  const rewriteResults = await Promise.all(promises);
  // didn't rewrite anything? we're done
  if (!rewriteResults.some(Boolean)) return;

  // save
  const zipOutput = await archive.generateAsync({
    type: 'nodebuffer',
    platform: 'UNIX',
    compression: 'STORE', // skip compressing
  });
  console.info('Rewrote zip file', Math.round(zipOutput.byteLength / 1024), 'kb');

  return zipOutput;
};

const getReplacementValues = async (scriptParams: RewriterParams): Promise<Replacements> => {
  const { env: envMap, jsonS3Bucket, jsonS3Key } = scriptParams.replacementConfig;

  // get values we're replacing
  // can be a map or a JSON file in S3
  let env: Record<string, string> = { ...envMap };

  // values may be stored in S3 as a JSON file
  if (jsonS3Bucket && jsonS3Key) {
    if (scriptParams.debug) console.info(`Getting replacement values from s3://${jsonS3Bucket}/${jsonS3Key}`);
    const data = await tryGetObject(jsonS3Bucket, jsonS3Key);
    if (data?.Body) {
      const json = data.Body.toString('utf-8');
      env = { ...env, ...JSON.parse(json) };
    } else {
      // throw new Error('Failed to get replacement values from S3 - empty file');
    }
  }

  return env;
};
