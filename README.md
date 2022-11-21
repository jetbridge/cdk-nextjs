# Deploy NextJS with CDK

[![View on Construct Hub](https://constructs.dev/badge?package=cdk-nextjs-standalone)](https://constructs.dev/packages/cdk-nextjs-standalone)

## What is this?

A CDK construct to deploy a NextJS 12.3.0+ app using AWS CDK.

Uses the [standalone output](https://nextjs.org/docs/advanced-features/output-file-tracing) build mode.

## Quickstart

```ts
import path from 'path';
import { Nextjs } from 'cdk-nextjs-standalone';

new Nextjs(this, 'Web', {
  path: './web', // relative path to nextjs project root
});
```

If using a **monorepo**, you will [need](https://nextjs.org/docs/advanced-features/output-file-tracing#caveats) to point your `next.config.js` at the project root:

```ts
const path = require("path");

const nextConfig = {
  ...
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '..'), // if your nextjs app lives one level deep
  },
}

module.exports = nextConfig;
```

## Documentation

Available on [Construct Hub](https://constructs.dev/packages/cdk-nextjs-standalone/).

### Discord Chat

We're in the #nextjs channel on the [Serverless Stack Discord](https://discord.gg/sst).

## About

Deploys a NextJs static site with server-side rendering and API support. Uses AWS lambda and CloudFront.

There is a new (since Next 12) [standalone output mode which uses output tracing](https://nextjs.org/docs/advanced-features/output-file-tracing) to generate a minimal server and static files.
This standalone server can be converted into a CloudFront distribution and a lambda handler that translates between a APIGatewayProxyV2 request/response and Next request/response.

The CloudFront default origin first checks S3 for static files and falls back to an HTTP origin using a lambda function URL.

## Benefits

This approach is most compatible with new NextJs features such as ESM configuration and [middleware](https://nextjs.org/docs/advanced-features/middleware).

The [@serverless-nextjs project](https://github.com/serverless-nextjs/serverless-next.js) uses the deprecated `serverless` NextJs build target which [prevents the use of new features](https://github.com/serverless-nextjs/serverless-next.js/pull/2478).
This construct was created to use the new `standalone` output build and newer AWS features like lambda function URLs and fallback origins.

## Status

This is _experimental_ and a work in progress. I hope others can benefit from it and contribute to make it more stable and featureful.

I have managed to get the server bundling working even under the most finicky of circumstances (pnpm monorepo). Server-side rendering works. Static files and public files work.

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

This module is largely made up of code from the above projects.

## Open questions

- Do we need to manually handle CloudFront invalidation? It looks like `BucketDeployment` takes care of that for us
- How is the `public` dir supposed to be handled? (Right now using an OriginGroup to look in the S3 origin first and if 403/404 then try lambda origin)
- Is there anything we should be doing with the various manifests nextjs spits out? (e.g., not sure what the purpose of [this](https://github.com/serverless-stack/sst/blob/master/packages/resources/src/NextjsSite.ts#L1357) is)
  - Do we need to create static routes? Or anything else?
- Do we need to handle ISR?
- How should images be handled?

## Serverless-stack (SST) wrapper

(TODO: will be moved to SST at some point)

```ts
import {
  BaseSiteEnvironmentOutputsInfo,
  Nextjs,
  NextjsProps,
} from "cdk-nextjs-standalone";
import { Construct } from "constructs";
import { App, Stack } from "@serverless-stack/resources";
import path from "path";
import { CfnOutput } from "aws-cdk-lib";

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

      // make path relative to the app root
      nextjsPath: path.isAbsolute(props.nextjsPath) ? path.relative(app.appPath, props.nextjsPath) : props.nextjsPath,
    });

    if (props.environment) this.registerSiteEnvironment(props.environment);
  }

  protected registerSiteEnvironment(environment: Record<string, string>) {
    const environmentOutputs: Record<string, string> = {};
    for (const [key, value] of Object.entries(environment)) {
      const outputId = `SstSiteEnv_${key}`;
      const output = new CfnOutput(this, outputId, { value });
      environmentOutputs[key] = Stack.of(this).getLogicalId(output);
    }

    const app = this.node.root as App;
    app.registerSiteEnvironment({
      id: this.node.id,
      path: this.props.nextjsPath,
      stack: Stack.of(this).node.id,
      environmentOutputs,
    } as BaseSiteEnvironmentOutputsInfo);
  }
}
```

## To-do

- [ ] Support deployment as a Lambda@Edge function if this is even desirable
- [ ] [Serverless stack integration](https://github.com/serverless-stack/sst/pull/2049)
