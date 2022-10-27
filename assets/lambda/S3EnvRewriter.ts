import type { CdkCustomResourceEvent, CdkCustomResourceHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as JSZip from 'jszip';
import * as micromatch from 'micromatch';

type Replacements = Record<string, string>;

export interface RewriteReplacementsConfig {
  env?: Record<string, string>; // replace keys with values in files
  jsonS3Bucket?: string;
  jsonS3Key?: string;
}

export interface RewriterParams {
  bucket: string;
  s3keys: string[];
  replacementConfig: RewriteReplacementsConfig;
  debug?: boolean;
}

export const replaceTokenGlobs = ['**/*.html', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.json'];

async function tryGetObject(bucket, key, tries) {
  const s3 = new AWS.S3();
  try {
    return await s3.getObject({ Bucket: bucket, Key: key }).promise();
  } catch (err) {
    console.warn('Failed to retrieve object', key, err);
    // if access denied - wait a few seconds and try again
    if (err.code === 'AccessDenied' && tries < 5) {
      console.info('Retrying for object', key);
      await new Promise((res) => setTimeout(res, 5000));
      return tryGetObject(bucket, key, ++tries);
    } else {
      // for now.. skip it. might be a rollback and the file is no longer available.
      // there might be a bug here with calling this script before all files are uploaded
      // this should be investigated more
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
  const { s3keys, bucket, debug } = scriptParams;
  if (!s3keys || !bucket) {
    console.error('Missing required properties');
    return;
  }

  const promises = s3keys.map(async (key) => {
    // get file
    const keyParams = { Bucket: bucket, Key: key };
    if (debug) console.info('Rewriting', key, 'in bucket', bucket);
    const res = await tryGetObject(bucket, key, 0);
    if (!res) return;

    // do rewrites
    let newBody;
    if (key.endsWith('.zip')) {
      newBody = await doRewritesForZipFile(res, scriptParams, replacementValues);
      return;
    } else {
      newBody = await doRewritesForTextFile(res, scriptParams, replacementValues);
    }
    if (!newBody) return;

    // upload
    if (debug) console.info('Rewrote', key, 'in bucket', bucket);
    const putParams = {
      ...keyParams,
      Body: newBody,
      ContentType: res.ContentType,
      ContentEncoding: res.ContentEncoding,
      CacheControl: res.CacheControl,
    };
    await s3.putObject(putParams).promise();
  });
  await Promise.all(promises);
};

// search and replace tokenized values of designated objects in s3
export const handler: CdkCustomResourceHandler = async (event) => {
  const requestType = event.RequestType;
  if (requestType === 'Create' || requestType === 'Update') {
    await doRewrites(event);
  }

  return event;
};

export const doRewritesForTextFile = async (
  object: AWS.S3.GetObjectOutput,
  params: RewriterParams,
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

export const doRewritesForZipFile = async (
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

    console.log('Rewrote', key, 'in zip file, filename=', file.name);

    // update
    archive.file(file.name, bodyPost);
  });
  await Promise.all(promises);

  // save
  const zipOutput = await archive.generateAsync({ type: 'nodebuffer' });
  return zipOutput;
};

const getReplacementValues = async (scriptParams: RewriterParams): Promise<Replacements> => {
  const { env: envMap, jsonS3Bucket, jsonS3Key } = scriptParams.replacementConfig;

  // get values we're replacing
  // can be a map or a JSON file in S3
  let env: Record<string, string> = { ...envMap };

  // values may be stored in S3 as a JSON file
  if (jsonS3Bucket && jsonS3Key) {
    if (scriptParams.debug) console.info('Getting replacement values from S3', jsonS3Bucket, jsonS3Key);
    const data = await tryGetObject(jsonS3Bucket, jsonS3Key, 0);
    if (data?.Body) {
      const json = data.Body.toString('utf-8');
      env = { ...env, ...JSON.parse(json) };
    } else {
      // throw new Error('Failed to get replacement values from S3 - empty file');
    }
  }

  return env;
};
