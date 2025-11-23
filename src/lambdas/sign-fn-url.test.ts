import type { CloudFrontRequest, CloudFrontRequestEvent } from 'aws-lambda';
import { getRegionFromLambdaUrl, signRequest } from './sign-fn-url';

describe('LambdaOriginRequestIamAuth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // dummy AWS credentials
    process.env = { ...process.env, ...getFakeAwsCreds() };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test('signRequest should add x-amz headers', async () => {
    const event = getFakePageRequest();
    const request: CloudFrontRequest = event.Records[0].cf.request;

    await signRequest(request);

    const securityHeaders = [
      'x-amz-date',
      'x-amz-security-token',
      'x-amz-content-sha256',
      'authorization',
      'origin-authorization',
    ];
    const hasSignedHeaders = securityHeaders.every((h) => h in request.headers);
    expect(hasSignedHeaders).toBe(true);
  });

  test('signRequest should omit volatile headers', async () => {
    const event = getFakePageRequest();
    const request: CloudFrontRequest = event.Records[0].cf.request;

    await signRequest(request);
    const signedAuthorizationHeader = request.headers.authorization[0].value;

    const volatileHeaders = ['via', 'x-forwarded-for'];
    volatileHeaders.forEach((h) => expect(signedAuthorizationHeader).not.toContain(h));
  });

  test('getRegionFromLambdaUrl should correctly get region', () => {
    const event = getFakePageRequest();
    const request = event.Records[0].cf.request;
    const actual = getRegionFromLambdaUrl(request.origin?.custom?.domainName || '');
    expect(actual).toBe('us-east-1');
  });
});

function getFakePageRequest(): CloudFrontRequestEvent {
  return {
    Records: [
      {
        cf: {
          config: {
            distributionDomainName: 'd6b8brjqfujeb.cloudfront.net',
            distributionId: 'EHX2SDUU61T7U',
            eventType: 'origin-request',
            requestId: '',
          },
          request: {
            clientIp: '1.1.1.1',
            headers: {
              authorization: [
                {
                  key: 'Authorization',
                  value: 'Bearer token',
                },
              ],
              host: [
                {
                  key: 'Host',
                  value: 'd6b8brjqfujeb.cloudfront.net',
                },
              ],
              'accept-language': [
                {
                  key: 'Accept-Language',
                  value: 'en-US,en;q=0.9',
                },
              ],
              referer: [
                {
                  key: 'Referer',
                  value: 'https://d6b8brjqfujeb.cloudfront.net/some/path',
                },
              ],
              'x-forwarded-for': [
                {
                  key: 'X-Forwarded-For',
                  value: '1.1.1.1',
                },
              ],
              'user-agent': [
                {
                  key: 'User-Agent',
                  value:
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
                },
              ],
              via: [
                {
                  key: 'Via',
                  value: '2.0 8bf94e29f889f8d0076c4502ae008b58.cloudfront.net (CloudFront)',
                },
              ],
              'accept-encoding': [
                {
                  key: 'Accept-Encoding',
                  value: 'br,gzip',
                },
              ],
              'sec-ch-ua': [
                {
                  key: 'sec-ch-ua',
                  value: '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
                },
              ],
            },
            method: 'GET',
            querystring: '',
            uri: '/some/path',
            origin: {
              custom: {
                customHeaders: {},
                domainName: 'kjtbbx7u533q7p7n5font6gpci0phrng.lambda-url.us-east-1.on.aws',
                keepaliveTimeout: 5,
                path: '',
                port: 443,
                protocol: 'https',
                readTimeout: 30,
                sslProtocols: ['TLSv1.2'],
              },
            },
            body: {
              action: 'read-only',
              data: '',
              encoding: 'base64',
              inputTruncated: false,
            },
          },
        },
      },
    ],
  };
}

function getFakeAwsCreds() {
  return {
    AWS_REGION: 'us-east-1',
    AWS_ACCESS_KEY_ID: 'ZSBAT5GENDHC3XYRH36I',
    AWS_SECRET_ACCESS_KEY: 'jpWfApw1AO0xzGZeeT1byQq1zqfQITVqVhTkkql4',
    AWS_SESSION_TOKEN:
      'ZQoJb3JpZ2luX2VjEFgaCXVzLWVhc3QtMSJGMEQCIHijzdTXh59aSe2hRfCWpFd2/jacPUC+8rCq3qBIiuG2AiAGX8jqld+p04nPYfuShi1lLN/Z1hEXG9QSNEmEFLTxGSqmAgiR//////////8BEAIaDDI2ODkxNDQ2NTIzMSIMrAMO5/GTvMgoG+chKvoB4f4V1TfkZiHOlmeMK6Ep58mav65A0WU3K9WPzdrJojnGqqTuS85zTlKhm3lfmMxCOtwS/OlOuiBQ1MZNlksK2je1FazgbXN46fNSi+iHiY9VfyRAd0wSLmXB8FFrCGsU92QOy/+deji0qIVadsjEyvBRxzQj5oIUI5sb74Yt7uNvka9fVZcT4s4IndYda0N7oZwIrApCuzzBMuoMAhabmgVrZTbiLmvOiFHS2XZWBySABdygqaIzfV7G4hjckvcXhtxpkw+HJUZTNzVUlspghzte1UG6VvIRV8ax3kWA3zqm8nA/1gHkl40DubJIXz1AJbg5Cps5moE1pjD7vNijBjqeAZh0Q/e0awIHnV4dXMfXUu5mWJ7Db9K1eUlSSL9FyiKeKd94HEdrbIrnPuIWVT/I/5RjNm7NgPYiqmpyx3fSpVcq9CKws0oEfBw6J9Hxk0IhV8yWFZYNMWIarUUZdmL9vVeJmFZmwyL4JjY1s/SZIU/oa8DtvkmP4RG4tTJfpyyhoKL0wJOevkYyoigNllBlLN59SZAT8CCADpN/B+sK',
  };
}

// function getFakeImageEvent(): CloudFrontRequestEvent {
//   return {
//     Records: [
//       {
//         cf: {
//           config: {
//             distributionDomainName: 'd6b8brjqfujeb.cloudfront.net',
//             distributionId: 'EHX2SDUU61T7U',
//             eventType: 'origin-request',
//             requestId: '',
//           },
//           request: {
//             body: {
//               action: 'read-only',
//               data: '',
//               encoding: 'base64',
//               inputTruncated: false,
//             },
//             clientIp: '35.148.139.0',
//             headers: {
//               accept: [
//                 {
//                   key: 'Accept',
//                   value:
//                     'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//                 },
//               ],
//               'x-forwarded-for': [
//                 {
//                   key: 'X-Forwarded-For',
//                   value: '35.148.139.0',
//                 },
//               ],
//               'user-agent': [
//                 {
//                   key: 'User-Agent',
//                   value: 'Amazon CloudFront',
//                 },
//               ],
//               via: [
//                 {
//                   key: 'Via',
//                   value: '2.0 56233ac1c78ee7b920e664cc0c7f287e.cloudfront.net (CloudFront)',
//                 },
//               ],
//               'accept-encoding': [
//                 {
//                   key: 'Accept-Encoding',
//                   value: 'br,gzip',
//                 },
//               ],
//               host: [
//                 {
//                   key: 'Host',
//                   value: 'lqlihcxizzcsefhpfcx2rnkgnu0pzrar.lambda-url.us-east-1.on.aws',
//                 },
//               ],
//             },
//             method: 'GET',
//             origin: {
//               custom: {
//                 customHeaders: {},
//                 domainName: 'lqlihcxizzcsefhpfcx2rnkgnu0pzrar.lambda-url.us-east-1.on.aws',
//                 keepaliveTimeout: 5,
//                 path: '',
//                 port: 443,
//                 protocol: 'https',
//                 readTimeout: 30,
//                 sslProtocols: ['TLSv1.2'],
//               },
//             },
//             querystring: 'url=%2Fprince-akachi-LWkFHEGpleE-unsplash.jpg&w=96&q=75&badParam=bad',
//             uri: '/_next/image',
//           },
//         },
//       },
//     ],
//   };
// }
