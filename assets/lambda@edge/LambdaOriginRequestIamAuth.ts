import { Sha256 } from '@aws-crypto/sha256-js';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import type { CloudFrontHeaders, CloudFrontRequest, CloudFrontRequestHandler } from 'aws-lambda';
import { fixHostHeader, handleS3Request } from './common';

/**
 * This fixes the "host" header to be the host of the origin.
 * The origin is the lambda server function URL.
 * If we don't provide its expected "host", it will not know how to route the request.
 */
export const handler: CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request;
  // console.log('request', JSON.stringify(request, null, 2));

  handleS3Request(request);
  fixHostHeader(request);
  await signRequest(request);
  // console.log(JSON.stringify(request), null, 2);
  return request;
};

let sigv4: SignatureV4;

/**
 * When `NextjsDistributionProps.functionUrlAuthType` is set to
 * `lambda.FunctionUrlAuthType.AWS_IAM` we need to sign the `CloudFrontRequest`s
 * with AWS IAM SigV4 so that CloudFront can invoke the Nextjs server and image
 * optimization functions via function URLs. When configured, this lambda@edge
 * function has the permission, lambda:InvokeFunctionUrl, to invoke both
 * functions.
 * @link https://medium.com/@dario_26152/restrict-access-to-lambda-functionurl-to-cloudfront-using-aws-iam-988583834705
 */
async function signRequest(request: CloudFrontRequest) {
  if (!sigv4) {
    sigv4 = getSigV4();
  }
  const headerBag = cfHeadersToHeaderBag(request.headers);
  // don't sign x-forwarded-for b/c it changes from hop to hop
  delete headerBag['x-forwarded-for'];
  let body: string | undefined;
  if (request.body?.data) {
    body = Buffer.from(request.body.data, 'base64').toString();
  }
  const query = queryStringToQuery(request.querystring);
  const signed = await sigv4.sign({
    method: request.method,
    headers: headerBag,
    hostname: headerBag.host,
    path: request.uri,
    body,
    query,
    protocol: 'https',
  });
  request.headers = headerBagToCfHeaders(signed.headers);
}

function getSigV4(): SignatureV4 {
  const region = process.env.AWS_REGION;
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

type HeaderBag = Record<string, string>;
/**
 * Converts CloudFront headers (can have array of header values) to simple
 * header bag (object) required by `sigv4.sign`
 */
function cfHeadersToHeaderBag(cfHeaders: CloudFrontHeaders): HeaderBag {
  let headerBag: HeaderBag = {};
  for (const [header, values] of Object.entries(cfHeaders)) {
    headerBag[header] = values[0].value;
  }
  return headerBag;
}

/**
 * Converts simple header bag (object) to CloudFront headers
 */
function headerBagToCfHeaders(headerBag: HeaderBag): CloudFrontHeaders {
  const cfHeaders: CloudFrontHeaders = {};
  for (const [header, value] of Object.entries(headerBag)) {
    cfHeaders[header] = [{ key: header, value }];
  }
  return cfHeaders;
}

/**
 * Converts `CloudFrontRequest`'s querystring into `HttpRequest`'s query
 */
function queryStringToQuery(querystring: string): Record<string, string> {
  const query: Record<string, string> = {};
  const kvPairs = querystring.split('&').filter(Boolean);
  for (const kvPair of kvPairs) {
    const [key, value] = kvPair.split('=');
    if (key && value) query[key] = value;
  }
  return query;
}
