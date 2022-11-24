import url from 'url';
import type { CloudFrontRequest, CloudFrontRequestHandler } from 'aws-lambda';

/**
 * This fixes the "host" header to be the host of the origin.
 * The origin is the lambda server function URL.
 * If we don't provide its expected "host", it will not know how to route the request.
 */
export const handler: CloudFrontRequestHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  // console.log('request', JSON.stringify(request, null, 2));

  // remove cookies from requests to S3
  if (request.origin?.s3) {
    request.headers.cookie = [];
    request.headers.host = [
      {
        key: 'host',
        value: request.origin.s3.domainName,
      },
    ]; // sending the wrong host header to S3 will cause a 403
  }

  // get config (only for custom lambda HTTP origin)
  const originUrlHeader = getCustomHeaderValue(request, 'x-origin-url');
  if (!originUrlHeader) return callback(null, request);
  const originUrl = url.parse(originUrlHeader, true);
  if (!originUrl.host) throw new Error('Origin url host is missing');

  // fix host header and pass along the original host header
  const originalHost = request.headers.host[0].value;
  request.headers['x-forwarded-host'] = [{ key: 'x-forwarded-host', value: originalHost }];
  request.headers.host = [{ key: 'host', value: originUrl.host }];
  callback(null, request);
};

/**
 * We can't use environment variables in the lambda@edge function.
 * We have to use custom headers for passing configuration to the lambda@edge function.
 */
function getCustomHeaderValue(request: CloudFrontRequest, headerName: string): string | undefined {
  const originUrlHeader = request.origin?.custom?.customHeaders?.[headerName];

  if (!originUrlHeader || !originUrlHeader[0]) {
    if (request.origin?.custom) {
      // we should have an origin url header for custom lambda HTTP origin
      console.error('Origin header wasn"t set correctly, cannot get origin url');
    }
    return undefined;
  }

  return originUrlHeader[0].value;
}
