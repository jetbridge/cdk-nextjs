/* eslint-disable import/no-extraneous-dependencies */
import { Sha256 } from '@aws-crypto/sha256-js';
import { SignatureV4 } from '@smithy/signature-v4';
import type { CloudFrontHeaders, CloudFrontRequest, CloudFrontRequestHandler } from 'aws-lambda';

const debug = false;

/**
 * This Lambda@Edge handler fixes s3 requests, fixes the host header, and
 * signs requests as they're destined for Lambda Function URL that requires
 * IAM Auth.
 */
export const handler: CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request;
  if (debug) console.log('input request', JSON.stringify(request, null, 2));

  escapeQuerystring(request);
  request.headers['x-forwarded-host'] = request.headers.host;
  await signRequest(request);

  if (debug) console.log('output request', JSON.stringify(request), null, 2);
  return request;
};

/**
 * Lambda URL will reject query parameters with brackets so we need to encode
 * https://github.dev/pwrdrvr/lambda-url-signing/blob/main/packages/edge-to-origin/src/translate-request.ts#L19-L31
 */
function escapeQuerystring(request: CloudFrontRequest) {
  request.querystring = request.querystring.replace(/\[/g, '%5B').replace(/]/g, '%5D');
}

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
export async function signRequest(request: CloudFrontRequest) {
  if (!sigv4) {
    const region = getRegionFromLambdaUrl(request.origin?.custom?.domainName || '');
    sigv4 = getSigV4(region);
  }
  // remove x-forwarded-for b/c it changes from hop to hop
  delete request.headers['x-forwarded-for'];
  const headerBag = cfHeadersToHeaderBag(request.headers);
  let body: string | undefined;
  if (request.body?.data) {
    body = Buffer.from(request.body.data, 'base64').toString();
  }
  const params = queryStringToQueryParamBag(request.querystring);
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

/**
 * Bag or Map used for HeaderBag or QueryStringParameterBag for `sigv4.sign()`
 */
type Bag = Record<string, string>;
/**
 * Converts CloudFront headers (can have array of header values) to simple
 * header bag (object) required by `sigv4.sign`
 *
 * NOTE: only includes headers allowed by origin policy to prevent signature
 * mismatch
 */
export function cfHeadersToHeaderBag(headers: CloudFrontHeaders): Bag {
  let headerBag: Bag = {};
  // assume first header value is the best match
  // headerKey is case insensitive whereas key (adjacent property value that is
  // not destructured) is case sensitive. we arbitrarily use case insensitive key
  for (const [headerKey, [{ value }]] of Object.entries(headers)) {
    headerBag[headerKey] = value;
  }
  return headerBag;
}

/**
 * Converts simple header bag (object) to CloudFront headers
 */
export function headerBagToCfHeaders(headerBag: Bag): CloudFrontHeaders {
  const cfHeaders: CloudFrontHeaders = {};
  for (const [headerKey, value] of Object.entries(headerBag)) {
    /*
      When your Lambda function adds or modifies request headers and you don't include the header key field, Lambda@Edge automatically inserts a header key using the header name that you provide. Regardless of how you've formatted the header name, the header key that's inserted automatically is formatted with initial capitalization for each part, separated by hyphens (-).
      See: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html
    */
    cfHeaders[headerKey] = [{ value }];
  }
  return cfHeaders;
}

/**
 * Converts CloudFront querystring to QueryParamaterBag for IAM Sig V4
 */
export function queryStringToQueryParamBag(querystring: string): Bag {
  const oldParams = new URLSearchParams(querystring);
  const newParams: Bag = {};
  for (const [k, v] of oldParams) {
    newParams[k] = v;
  }
  return newParams;
}
