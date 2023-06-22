import qs from 'node:querystring';
import { Sha256 } from '@aws-crypto/sha256-js';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import type { CloudFrontHeaders, CloudFrontRequest, CloudFrontRequestHandler } from 'aws-lambda';
import { fixHostHeader, handleS3Request } from './common';

const debug = false;

/**
 * This Lambda@Edge handler fixes s3 requests, fixes the host header, and
 * signs requests as they're destined for Lambda Function URL that requires
 * IAM Auth.
 */
export const handler: CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request;
  if (debug) console.log('request', JSON.stringify(request, null, 2));

  handleS3Request(request);
  fixHostHeader(request);
  if (isLambdaUrlRequest(request)) {
    await signRequest(request);
  }
  if (debug) console.log(JSON.stringify(request), null, 2);
  return request;
};

let sigv4: SignatureV4;

export function isLambdaUrlRequest(request: CloudFrontRequest) {
  return /[a-z0-9]+\.lambda-url\.[a-z0-9-]+\.on\.aws/.test(request.origin?.custom?.domainName || '');
}

/**
 * When `NextjsDistributionProps.functionUrlAuthType` is set to
 * `lambda.FunctionUrlAuthType.AWS_IAM` we need to sign the `CloudFrontRequest`s
 * with AWS IAM SigV4 so that CloudFront can invoke the Nextjs server and image
 * optimization functions via function URLs. When configured, this lambda@edge
 * function has the permission, lambda:InvokeFunctionUrl, to invoke both
 * functions.
 * @link https://medium.com/@dario_26152/restrict-access-to-lambda-functionurl-to-cloudfront-using-aws-iam-988583834705
 */
export async function signRequest(request: CloudFrontRequest) {
  if (!sigv4) {
    const region = getRegionFromLambdaUrl(request.origin?.custom?.domainName || '');
    sigv4 = getSigV4(region);
  }
  const headerBag = cfHeadersToHeaderBag(request);
  let body: string | undefined;
  if (request.body?.data) {
    body = Buffer.from(request.body.data, 'base64').toString();
  }
  const params = queryStringToParams(request);
  const signed = await sigv4.sign({
    method: request.method,
    headers: headerBag,
    hostname: headerBag.host,
    path: request.uri,
    body,
    query: params,
    protocol: 'https',
  });
  request.headers = headerBagToCfHeaders(signed.headers);
}

function getSigV4(region: string): SignatureV4 {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;
  if (!region) throw new Error('AWS_REGION missing');
  if (!accessKeyId) throw new Error('AWS_ACCESS_KEY_ID missing');
  if (!secretAccessKey) throw new Error('AWS_SECRET_ACCESS_KEY missing');
  if (!sessionToken) throw new Error('AWS_SESSION_TOKEN missing');
  return new SignatureV4({
    service: 'lambda',
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
    sha256: Sha256,
  });
}

export function getRegionFromLambdaUrl(url: string): string {
  const region = url.split('.').at(2);
  if (!region) throw new Error("Region couldn't be extracted from Lambda Function URL");
  return region;
}

type HeaderBag = Record<string, string>;
/**
 * Converts CloudFront headers (can have array of header values) to simple
 * header bag (object) required by `sigv4.sign`
 *
 * NOTE: only includes headers allowed by origin policy to prevent signature
 * mismatch
 */
export function cfHeadersToHeaderBag(request: CloudFrontRequest): HeaderBag {
  let headerBag: HeaderBag = {};
  for (const [header, values] of Object.entries(request.headers)) {
    // don't sign 'x-forwarded-for' b/c it changes from hop to hop
    if (header === 'x-forwarded-for') continue;
    if (request.uri === '_next/image') {
      // _next/image origin policy only allows accept
      if (header === 'accept') {
        headerBag[header] = values[0].value;
      }
    } else {
      headerBag[header] = values[0].value;
    }
  }
  return headerBag;
}

/**
 * Converts simple header bag (object) to CloudFront headers
 */
export function headerBagToCfHeaders(headerBag: HeaderBag): CloudFrontHeaders {
  const cfHeaders: CloudFrontHeaders = {};
  for (const [header, value] of Object.entries(headerBag)) {
    cfHeaders[header] = [{ key: header, value }];
  }
  return cfHeaders;
}

/**
 * Converts CloudFront querystring to `HttpRequest.query` for IAM Sig V4
 *
 * NOTE: only includes query parameters allowed at origin to prevent signature
 * mismatch errors
 */
export function queryStringToParams(request: CloudFrontRequest) {
  const params: Record<string, string> = {};
  const _params = new URLSearchParams(request.querystring);
  for (const [k, v] of _params) {
    if (request.uri === '_next/image') {
      // _next/image origin policy only allows these querystrings
      if (['url', 'q', 'w'].includes(k)) {
        params[k] = v;
      }
    } else {
      params[k] = v;
    }
  }
  return params;
}
