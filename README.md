# Deploy a NextJS with CDK

## What is this?

A CDK construct to deploy a NextJS 12.3.0+ app using AWS CDK.

## Quickstart

```ts
import path from 'path';
import { NextJs } from 'cdk-nextjs-standalone';

new NextJs(this, 'Web', {
  path: path.resolve('./web'), // provide path to nextjs project root
});
```

## About

Deploys a NextJs static site with server-side rendering and API support. Uses AWS lambda and CloudFront.

There is a new (since Next 12) [`standalone` output mode which uses output tracing](https://nextjs.org/docs/advanced-features/output-file-tracing) to generate a minimal server and static files.
This standalone server can be converted into a CloudFront distribution and a lambda handler that translates between a APIGatewayProxyV2 request/response and Next request/response.

The CloudFront default origin first checks S3 for static files and falls back to an HTTP origin using a lambda function URL.

## Benefits

This approach is most compatible with new NextJs features such as ESM configuration and [middleware](https://nextjs.org/docs/advanced-features/middleware).

The [@serverless-nextjs project](https://github.com/serverless-nextjs/serverless-next.js) uses the deprecated `serverless` NextJs build target which [prevents the use of new features](https://github.com/serverless-nextjs/serverless-next.js/pull/2478).
This construct was created to use the new `standalone` output build and newer AWS features like lambda function URLs and fallback origins.

## Status

This is _experimental_ and a work in progress. I hope others can benefit from it and contribute to make it more stable and featureful.

I have managed to get the server bundling working even under the most finicky of circumstances (pnpm monorepo). Server-side rendering works. Static files and public files work.

If you

## To-do

- [ ] Handle Next image requests
- [ ] Support deployment as a Lambda@Edge function (see caveats)
- [ ] [Serverless stack integration](https://github.com/serverless-stack/sst/pull/2049)

## Depdendencies

NextJs requires the `sharp` native library. It is provided in a zip file from [lambda-layer-sharp](https://github.com/Umkus/lambda-layer-sharp/releases).

All other required dependencies should be bundled by NextJs [output tracing](https://nextjs.org/docs/advanced-features/output-file-tracing). This standalone output is included in the lambda function bundle.

## Edge functions

It should be possible to build the lambda handler as a Lambda@Edge function, the main blocker is resolving the CDK tokens in env vars on the server side because edge functions cannot have environment variables. These tokens are not present at build-time. One of these issues needs to be fixed for that to work most likely: https://github.com/vercel/next.js/issues/40827 https://github.com/aws/aws-cdk/issues/19257

## Performance

**Testing with [sst-prisma](https://github.com/jetbridge/sst-prisma):**

`Duration: 616.43 ms Billed Duration: 617 ms Memory Size: 2048 MB Max Memory Used: 131 MB Init Duration: 481.08 ms`

**On my nextjs app using Material-UI**

`Duration: 957.56 ms Billed Duration: 958 ms Memory Size: 1024 MB Max Memory Used: 127 MB Init Duration: 530.86 ms`

<img width="1835" alt="next-server-mui" src="https://user-images.githubusercontent.com/245131/191592979-fe83f0a5-7926-4094-be9e-2f9193df5487.png">

## Heavily based on:

- https://github.com/iiroj/iiro.fi/commit/bd43222032d0dbb765e1111825f64dbb5db851d9
- https://github.com/sladg/nextjs-lambda
- https://github.com/serverless-nextjs/serverless-next.js/tree/master/packages/compat-layers/apigw-lambda-compat
- [Serverless Stack](https://github.com/serverless-stack/sst)
  - [RemixSite](https://github.com/serverless-stack/sst/blob/master/packages/resources/src/NextjsSite.ts) construct
  - [NextjsSite](https://github.com/serverless-stack/sst/blob/master/packages/resources/src/RemixSite.ts) construct

This module is largely made up of code from the above projects.

## Questions

- Do we need to manually handle CloudFront invalidation? It looks like `BucketDeployment` takes care of that for us
- How is the `public` dir supposed to be handled? (Right now using an OriginGroup to look in the S3 origin first and if 403/404 then try lambda origin)
- Is there anything we should be doing with the various manifests nextjs spits out? (e.g., not sure what the purpose of [this](https://github.com/serverless-stack/sst/blob/master/packages/resources/src/NextjsSite.ts#L1357) is)
  - Do we need to create static routes? Or anything else?
- Do we need to handle ISR?
- How should images be handled?
