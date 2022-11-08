import url from 'url';
import type { CloudFrontRequestHandler } from 'aws-lambda';

/**
 * This fixes the "host" header to be the host of the origin.
 * The origin is the lambda server function URL.
 * If we don't provide its expected "host", it will not know how to route the request.
 */
export const handler: CloudFrontRequestHandler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  // console.log(JSON.stringify(request, null, 2))

  // get origin url from header
  const originUrlHeader = request.origin?.custom?.customHeaders['x-origin-url'];
  if (!originUrlHeader || !originUrlHeader[0]) {
    console.error('Origin header wasn"t set correctly, cannot get origin url');
    return callback(null, request);
  }
  const urlHeader = originUrlHeader[0].value;
  const originUrl = url.parse(urlHeader, true);
  if (!originUrl.host) throw new Error('Origin url host is missing');

  request.headers['x-forwarded-host'] = [{ key: 'x-forwarded-host', value: request.headers.host[0].value }];
  request.headers.host = [{ key: 'host', value: originUrl.host }];
  callback(null, request);
};
