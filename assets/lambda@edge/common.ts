import type { CloudFrontRequest } from 'aws-lambda';

export function handleS3Request(request: CloudFrontRequest) {
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
}

/**
 * This tries to fix the "host" header to be the host of the origin. The origin
 * is the lambda server function URL. If we don't provide its expected "host",
 * it will not know how to route the request.
 */
export function fixHostHeader(request: CloudFrontRequest) {
  const originDomainName = request.origin?.custom?.domainName;
  if (originDomainName) {
    // fix host header and pass along the original host header
    const originalHost = request.headers.host[0].value;
    request.headers['x-forwarded-host'] = [{ key: 'x-forwarded-host', value: originalHost }];
    request.headers.host = [{ key: 'host', value: originDomainName }];
  }
}
