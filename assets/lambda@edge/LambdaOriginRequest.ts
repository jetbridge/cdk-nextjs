import type { CloudFrontRequestHandler } from 'aws-lambda';
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
  return request;
};
