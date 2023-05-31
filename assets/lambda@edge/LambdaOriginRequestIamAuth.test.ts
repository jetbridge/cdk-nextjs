import type { CloudFrontRequestEvent, CloudFrontRequestHandler } from 'aws-lambda';
import { cfHeadersToHeaderBag, signRequest } from './LambdaOriginRequestIamAuth';

type CloudFrontRequestContext = Parameters<CloudFrontRequestHandler>[1];

/**
 * Simple test to debug lambda@edge functions
 */
describe('LambdaOriginRequestIamAuth', () => {
  test('signRequest should add x-amz headers', async () => {
    // dummy AWS credentials
    process.env = { ...process.env, ...getFakeAwsCreds() };
    const event = getFakeCloudFrontRequest();
    const request = event.Records[0].cf.request;
    await signRequest(request);
    const securityHeaders = ['x-amz-date', 'x-amz-security-token', 'x-amz-content-sha256', 'authorization'];
    const hasSignedHeaders = securityHeaders.every((h) => h in request.headers);
    expect(hasSignedHeaders).toBe(true);
  });

  test('cfHeadersToHeaderBag should transform correctly', () => {
    const cfHeaders = {
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
    };
    const headerBag = cfHeadersToHeaderBag(cfHeaders);
    expect(headerBag).toEqual({
      host: 'd6b8brjqfujeb.cloudfront.net',
      'accept-language': 'en-US,en;q=0.9',
    });
  });

  test('cfHeadersToHeaderBag should transform correctly', () => {
    const cfHeaders = {
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
    };
    const headerBag = cfHeadersToHeaderBag(cfHeaders);
    expect(headerBag).toEqual({
      host: 'd6b8brjqfujeb.cloudfront.net',
      'accept-language': 'en-US,en;q=0.9',
    });
  });
});

function getFakeCloudFrontRequest(): CloudFrontRequestEvent {
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
                  value: 'https://d6b8brjqfujeb.cloudfront.net/batches/2/overview',
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
