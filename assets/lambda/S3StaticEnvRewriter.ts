import type { CdkCustomResourceEvent, CdkCustomResourceHandler } from 'aws-lambda';
import AWS from 'aws-sdk';

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
  const { s3keys, bucket, replacements } = event.ResourceProperties;
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

    // get body
    const bodyPre = res.Body?.toString('utf-8');
    if (!bodyPre) return;
    let bodyPost = bodyPre;

    // do replacements of tokens
    Object.entries(replacements as Record<string, string>).forEach(([token, value]) => {
      bodyPost = bodyPost.replace(token, value);
    });

    // didn't change?
    if (bodyPost === bodyPre) return;

    // upload
    console.info('Rewrote', key, 'in bucket', bucket);
    const putParams = {
      ...params,
      Body: bodyPost,
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
