# Deploy NextJS with CDK

[![View on Construct Hub](https://constructs.dev/badge?package=cdk-nextjs-standalone)](https://constructs.dev/packages/cdk-nextjs-standalone)

## What is this?

A CDK construct to deploy a NextJS app using AWS CDK.
Supported NextJs versions: >=12.3.0+ (includes 13.0.0+)

Uses the [standalone output](https://nextjs.org/docs/advanced-features/output-file-tracing) build mode.

## Quickstart

```ts
import path from 'path';
import { Nextjs } from 'cdk-nextjs-standalone';

new Nextjs(this, 'Web', {
  nextjsPath: './web', // relative path to nextjs project root
});
```

## Documentation

Available on [Construct Hub](https://constructs.dev/packages/cdk-nextjs-standalone/).

### Discord Chat

We're in the #nextjs channel on the [Serverless Stack Discord](https://discord.gg/sst).

## About

Deploys a NextJs static site with server-side rendering and API support. Uses AWS lambda and CloudFront.

There is a new (since Next 12) [standalone output mode which uses output tracing](https://nextjs.org/docs/advanced-features/output-file-tracing) to generate a minimal server and static files.
This standalone server can be converted into a CloudFront distribution and a lambda handler that handles SSR, API, and routing.

The CloudFront default origin first checks S3 for static files and falls back to an HTTP origin using a lambda function URL.

## Benefits

This approach is most compatible with new NextJs features such as ESM configuration and [middleware](https://nextjs.org/docs/advanced-features/middleware).

The unmaintained [@serverless-nextjs project](https://github.com/serverless-nextjs/serverless-next.js) uses the deprecated `serverless` NextJs build target which [prevents the use of new features](https://github.com/serverless-nextjs/serverless-next.js/pull/2478).
This construct was created to use the new `standalone` output build and newer AWS features like lambda function URLs and fallback origins.

## Dependencies

NextJs requires the `sharp` native library. It is provided in a zip file from [lambda-layer-sharp](https://github.com/Umkus/lambda-layer-sharp/releases).

All other required dependencies should be bundled by NextJs [output tracing](https://nextjs.org/docs/advanced-features/output-file-tracing). This standalone output is included in the lambda function bundle.

## Cold start performance

#### Testing with [sst-prisma](https://github.com/jetbridge/sst-prisma)

`Duration: 616.43 ms Billed Duration: 617 ms Memory Size: 2048 MB Max Memory Used: 131 MB Init Duration: 481.08 ms`

#### On my nextjs app using Material-UI

`Duration: 957.56 ms Billed Duration: 958 ms Memory Size: 1024 MB Max Memory Used: 127 MB Init Duration: 530.86 ms`

<img width="1835" alt="next-server-mui" src="https://user-images.githubusercontent.com/245131/191592979-fe83f0a5-7926-4094-be9e-2f9193df5487.png">

## Heavily based on

- <https://github.com/iiroj/iiro.fi/commit/bd43222032d0dbb765e1111825f64dbb5db851d9>
- <https://github.com/sladg/nextjs-lambda>
- <https://github.com/serverless-nextjs/serverless-next.js/tree/master/packages/compat-layers/apigw-lambda-compat>
- [Serverless Stack](https://github.com/serverless-stack/sst)
  - [RemixSite](https://github.com/serverless-stack/sst/blob/master/packages/resources/src/NextjsSite.ts) construct
  - [NextjsSite](https://github.com/serverless-stack/sst/blob/master/packages/resources/src/RemixSite.ts) construct

## Serverless-stack (SST) wrapper

(TODO: will be moved to SST at some point)

```ts
import { BaseSiteEnvironmentOutputsInfo, Nextjs, NextjsProps } from 'cdk-nextjs-standalone';
import { Construct } from 'constructs';
import { App, Stack } from '@serverless-stack/resources';
import path from 'path';
import { CfnOutput } from 'aws-cdk-lib';

export interface NextjsSstProps extends NextjsProps {
  app: App;
}

class NextjsSst extends Nextjs {
  constructor(scope: Construct, id: string, props: NextjsSstProps) {
    const app = props.app;

    super(scope as any, id, {
      ...props,
      isPlaceholder: app.local,
      tempBuildDir: app.buildDir,
      defaults: {
        ...props.defaults,
        distribution: {
          ...props.defaults?.distribution,
          stageName: app.stage,
        },
      },

      // make path relative to the app root
      nextjsPath: path.isAbsolute(props.nextjsPath) ? path.relative(app.appPath, props.nextjsPath) : props.nextjsPath,
    });

    if (props.environment) this.registerSiteEnvironment(props);
  }

  protected registerSiteEnvironment(props: NextjsSstProps) {
    if (!props.environment) return;
    const environmentOutputs: Record<string, string> = {};
    for (const [key, value] of Object.entries(props.environment)) {
      const outputId = `SstSiteEnv_${key}`;
      const output = new CfnOutput(this, outputId, { value });
      environmentOutputs[key] = Stack.of(this).getLogicalId(output);
    }

    const app = this.node.root as App;
    app.registerSiteEnvironment({
      id: this.node.id,
      path: props.nextjsPath,
      stack: Stack.of(this).node.id,
      environmentOutputs,
    } as BaseSiteEnvironmentOutputsInfo);
  }
}
```

## Breaking changes

- v2.0.0: SST wrapper changed, lambda/assets/distribution defaults now are in the `defaults` prop, refactored distribution settings into the new NextjsDistribution construct. If you are upgrading, you must temporarily remove the `customDomain` on your existing 1.x.x app before upgrading to >=2.x.x because the CloudFront distribution will get recreated due to refactoring, and the custom domain must be globally unique across all CloudFront distributions. Prepare for downtime.
