# Deploy NextJS with CDK

[![View on Construct Hub](https://constructs.dev/badge?package=cdk-nextjs-standalone)](https://constructs.dev/packages/cdk-nextjs-standalone)

## What is this?

A CDK construct to deploy a NextJS app using AWS CDK.
Supported NextJs versions: >=12.3.0+ (includes 13.0.0+)

Uses the [standalone output](https://nextjs.org/docs/advanced-features/output-file-tracing) build mode.

## Quickstart

Add the dependency `esbuild@0.17.16` to your project along with `cdk-nextjs-standalone`.

```shell
npm install -D esbuild@0.17.16 cdk-nextjs-standalone
```

```ts
import path from 'path';
import { Nextjs } from 'cdk-nextjs-standalone';

new Nextjs(this, 'Web', {
  nextjsPath: './web', // relative path to nextjs project root
});
```

## Documentation

Available on [Construct Hub](https://constructs.dev/packages/cdk-nextjs-standalone/).

## Customization

### Increased Security
```ts
import { RemovalPolicy, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CfnWebAcl } from "aws-cdk-lib/aws-wafv2";
import { SecurityPolicyProtocol, type DistributionProps } from "aws-cdk-lib/aws-cloudfront";
import { Nextjs, type NextjsDistributionProps } from "cdk-nextjs-standalone";
import { Bucket, BlockPublicAccess, BucketEncryption } from "aws-cdk-lib/aws-s3";

// Because of `WebAcl`, this stack must be deployed in us-east-1. If you want
// to deploy Nextjs in another region, add WAF in separate stack deployed in us-east-1
export class UiStack {
  constructor(scope: Construct, id: string) {
    const webAcl = new CfnWebAcl(this, "WebAcl", { ... });
    new Nextjs(this, "NextSite", {
      nextjsPath: "...",
      defaults: {
        assetDeployment: {
          bucket: new Bucket(this, "NextjsAssetDeploymentBucket", {
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
          }),
        },
        distribution: {
          functionUrlAuthType: FunctionUrlAuthType.AWS_IAM,
          cdk: {
            distribution: {
              webAclId: webAcl.attrArn,
              minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            } as DistributionProps,
          },
        } satisfies Partial<NextjsDistributionProps>,
      },
    });
  }
}
```

### Discord Chat

We're in the #open-next channel on the [Serverless Stack Discord](https://discord.gg/sst).

## About

Deploys a NextJs static site with server-side rendering and API support. Uses AWS lambda and CloudFront.

There is a new (since Next 12) [standalone output mode which uses output tracing](https://nextjs.org/docs/advanced-features/output-file-tracing) to generate a minimal server and static files.
This standalone server can be converted into a CloudFront distribution and a lambda handler that handles SSR, API, and routing.

The CloudFront default origin first checks S3 for static files and falls back to an HTTP origin using a lambda function URL.

## Benefits

This approach is most compatible with new NextJs features such as ESM configuration, [middleware](https://nextjs.org/docs/advanced-features/middleware), next-auth, and React server components ("appDir").

The unmaintained [@serverless-nextjs project](https://github.com/serverless-nextjs/serverless-next.js) uses the deprecated `serverless` NextJs build target which [prevents the use of new features](https://github.com/serverless-nextjs/serverless-next.js/pull/2478).
This construct was created to use the new `standalone` output build and newer AWS features like lambda function URLs and fallback origins.

You may want to look at [Serverless Stack](https://sst.dev) and its [NextjsSite](https://docs.sst.dev/constructs/NextjsSite) construct for an improved developer experience if you are building serverless applications on CDK.

## Dependencies

Built on top of [open-next](https://open-next.js.org/), which was partially built using the original core of cdk-nextjs-standalone.

## Heavily based on

- [Open-next](https://open-next.js.org/)
- <https://github.com/iiroj/iiro.fi/commit/bd43222032d0dbb765e1111825f64dbb5db851d9>
- <https://github.com/sladg/nextjs-lambda>
- <https://github.com/serverless-nextjs/serverless-next.js/tree/master/packages/compat-layers/apigw-lambda-compat>
- [Serverless Stack](https://github.com/serverless-stack/sst)
  - [RemixSite](https://github.com/serverless-stack/sst/blob/master/packages/resources/src/NextjsSite.ts) construct
  - [NextjsSite](https://github.com/serverless-stack/sst/blob/master/packages/resources/src/RemixSite.ts) construct

## Contribute

Hey there, we value every new contribution a lot 🙏🏼 thank you.

Here is a short HowTo before you get started:

1. Please make sure to create a bug first
2. Link the bug in your pull request
3. Run `yarn build` after you made your changes and before you open a pull request

### Projen
Don't manually update package.json or use npm CLI. Update dependencies in .projenrc.js then run yarn projen.

## Breaking changes

- v3.0.0: Using open-next for building, ARM64 architecture for image handling, new build options.

- v2.0.0: SST wrapper changed, lambda/assets/distribution defaults now are in the `defaults` prop, refactored distribution settings into the new NextjsDistribution construct. If you are upgrading, you must temporarily remove the `customDomain` on your existing 1.x.x app before upgrading to >=2.x.x because the CloudFront distribution will get recreated due to refactoring, and the custom domain must be globally unique across all CloudFront distributions. Prepare for downtime.
