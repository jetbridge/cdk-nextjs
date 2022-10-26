import type { CdkCustomResourceEvent, CdkCustomResourceHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as JSZip from 'jszip';
import * as micromatch from 'micromatch';

type Replacements = Record<string, string>;

interface RewriterParams {
  bucket: string;
  s3keys: string[];
  replacements: Replacements;
}

export const replaceTokenGlobs = ['**/*.html', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.json'];

async function tryGetObject(bucket, key, tries) {
  const s3 = new AWS.S3();
  try {
    return await s3.getObject({ Bucket: bucket, Key: key }).promise();
  } catch (err) {
    console.error('Failed to retrieve object', key, err);
    // for now.. skip it. might be a rollback and the file is no longer available.
    // // if access denied - wait a few seconds and try again
    // if (err.code === 'AccessDenied' && tries < 10) {
    //   console.info('Retrying for object', key);
    //   await new Promise((res) => setTimeout(res, 5000));
    //   return tryGetObject(bucket, key, ++tries);
    // } else {
    //   throw err;
    // }
  }
}

const doRewrites = async (event: CdkCustomResourceEvent) => {
  // rewrite static files
  const s3 = new AWS.S3();
  const { s3keys, bucket, replacements } = event.ResourceProperties as unknown as RewriterParams;
  if (!s3keys || !bucket || !replacements) {
    console.error('Missing required properties');
    return;
  }
  const promises = s3keys.map(async (key) => {
    // get file
    const params = { Bucket: bucket, Key: key };
    console.info('Rewriting', key, 'in bucket', bucket);
    const res = await tryGetObject(bucket, key, 0);
    if (!res) return;

    let newBody;
    if (key.endsWith('.zip')) {
      newBody = await doRewritesForZipFile(res, replacements);
      return;
    } else {
      newBody = await doRewritesForTextFile(res, replacements);
    }
    if (!newBody) return;

    // upload
    console.info('Rewrote', key, 'in bucket', bucket);
    const putParams = {
      ...params,
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

export const doRewritesForTextFile = async (object: AWS.S3.GetObjectOutput, replacements: Replacements) => {
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

export const doRewritesForZipFile = async (object: AWS.S3.GetObjectOutput, replacements: Replacements) => {
  const archive = await JSZip.loadAsync(object.Body as Buffer);

  // iterate through zip
  const promises = Object.keys(archive.files).map(async (key) => {
    const file = archive.files[key];
    if (file.dir) return;

    // file type we care about?
    if (!micromatch.isMatch(file.name, replaceTokenGlobs, { dot: true })) return;

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
