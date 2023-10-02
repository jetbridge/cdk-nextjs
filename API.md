# Deploy NextJS with CDK

[![View on Construct Hub](https://constructs.dev/badge?package=cdk-nextjs-standalone)](https://constructs.dev/packages/cdk-nextjs-standalone)

## What is this?

A CDK construct to deploy a NextJS app using AWS CDK.
Supported NextJs versions: >=12.3.0+ (includes 13.0.0+)

Uses the [standalone output](https://nextjs.org/docs/advanced-features/output-file-tracing) build mode.

## Quickstart
```ts
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Nextjs } from 'cdk-nextjs-standalone';

class WebStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const nextjs = new Nextjs(this, 'Nextjs', {
      nextjsPath: './web', // relative path from your project root to NextJS
    });
    new CfnOutput(this, "CloudFrontDistributionDomain", {
      value: nextjs.distribution.distributionDomain,
    });
  }
}

const app = new App();
new WebStack(app, 'web');
```

## Important Notes
- Due to CloudFront's Distribution Cache Behavior pattern matching limitations, a cache behavior will be created for each top level file or directory in your `public/` folder. CloudFront has a soft limit of [25 cache behaviors per distribution](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html#limits-web-distributions). Therefore, it's recommended to include all assets that can be under a top level folder like `public/static/`. Learn more in open-next docs [here](https://github.com/sst/open-next/blob/main/README.md#workaround-create-one-cache-behavior-per-top-level-file-and-folder-in-public-aws-specific).

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

See [here](./docs/major-changes.md).

# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### Nextjs <a name="Nextjs" id="cdk-nextjs-standalone.Nextjs"></a>

The `Nextjs` construct is a higher level construct that makes it easy to create a NextJS app.

Your standalone server application will be bundled using o(utput tracing and will be deployed to a Lambda function.
Static assets will be deployed to an S3 bucket and served via CloudFront.
You must use Next.js 10.3.0 or newer.

Please provide a `nextjsPath` to the Next.js app inside your project.

*Example*

```typescript
new Nextjs(this, "Web", {
  nextjsPath: path.resolve("packages/web"),
})
```


#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.Nextjs.Initializer"></a>

```typescript
import { Nextjs } from 'cdk-nextjs-standalone'

new Nextjs(scope: Construct, id: string, props: NextjsProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.Nextjs.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.Nextjs.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.Nextjs.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsProps">NextjsProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.Nextjs.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.Nextjs.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.Nextjs.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsProps">NextjsProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.Nextjs.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.Nextjs.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.Nextjs.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.Nextjs.isConstruct"></a>

```typescript
import { Nextjs } from 'cdk-nextjs-standalone'

Nextjs.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.Nextjs.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Convenience method to access `Nextjs.staticAssets.bucket`. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Where build-time assets for deployment are stored. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.url">url</a></code> | <code>string</code> | URL of Next.js App. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.distribution">distribution</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDistribution">NextjsDistribution</a></code> | CloudFront distribution. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.imageOptimizationFunction">imageOptimizationFunction</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsImage">NextjsImage</a></code> | The image optimization handler lambda function. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.imageOptimizationLambdaFunctionUrl">imageOptimizationLambdaFunctionUrl</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionUrl</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.lambdaFunctionUrl">lambdaFunctionUrl</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionUrl</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | Built NextJS project output. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.revalidation">revalidation</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsRevalidation">NextjsRevalidation</a></code> | Revalidation handler and queue. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.serverFunction">serverFunction</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsServer">NextjsServer</a></code> | The main NextJS server handler lambda function. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.staticAssets">staticAssets</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsStaticAssets">NextjsStaticAssets</a></code> | Asset deployment to S3. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.Nextjs.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="cdk-nextjs-standalone.Nextjs.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Convenience method to access `Nextjs.staticAssets.bucket`.

---

##### `tempBuildDir`<sup>Required</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.Nextjs.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Where build-time assets for deployment are stored.

---

##### `url`<sup>Required</sup> <a name="url" id="cdk-nextjs-standalone.Nextjs.property.url"></a>

```typescript
public readonly url: string;
```

- *Type:* string

URL of Next.js App.

---

##### `distribution`<sup>Required</sup> <a name="distribution" id="cdk-nextjs-standalone.Nextjs.property.distribution"></a>

```typescript
public readonly distribution: NextjsDistribution;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDistribution">NextjsDistribution</a>

CloudFront distribution.

---

##### `imageOptimizationFunction`<sup>Required</sup> <a name="imageOptimizationFunction" id="cdk-nextjs-standalone.Nextjs.property.imageOptimizationFunction"></a>

```typescript
public readonly imageOptimizationFunction: NextjsImage;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsImage">NextjsImage</a>

The image optimization handler lambda function.

---

##### `imageOptimizationLambdaFunctionUrl`<sup>Required</sup> <a name="imageOptimizationLambdaFunctionUrl" id="cdk-nextjs-standalone.Nextjs.property.imageOptimizationLambdaFunctionUrl"></a>

```typescript
public readonly imageOptimizationLambdaFunctionUrl: FunctionUrl;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrl

---

##### `lambdaFunctionUrl`<sup>Required</sup> <a name="lambdaFunctionUrl" id="cdk-nextjs-standalone.Nextjs.property.lambdaFunctionUrl"></a>

```typescript
public readonly lambdaFunctionUrl: FunctionUrl;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrl

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.Nextjs.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

Built NextJS project output.

---

##### `revalidation`<sup>Required</sup> <a name="revalidation" id="cdk-nextjs-standalone.Nextjs.property.revalidation"></a>

```typescript
public readonly revalidation: NextjsRevalidation;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsRevalidation">NextjsRevalidation</a>

Revalidation handler and queue.

---

##### `serverFunction`<sup>Required</sup> <a name="serverFunction" id="cdk-nextjs-standalone.Nextjs.property.serverFunction"></a>

```typescript
public readonly serverFunction: NextjsServer;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsServer">NextjsServer</a>

The main NextJS server handler lambda function.

---

##### `staticAssets`<sup>Required</sup> <a name="staticAssets" id="cdk-nextjs-standalone.Nextjs.property.staticAssets"></a>

```typescript
public readonly staticAssets: NextjsStaticAssets;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsStaticAssets">NextjsStaticAssets</a>

Asset deployment to S3.

---


### NextjsBucketDeployment <a name="NextjsBucketDeployment" id="cdk-nextjs-standalone.NextjsBucketDeployment"></a>

Similar to CDK's `BucketDeployment` construct, but with a focus on replacing template placeholders (i.e. environment variables) and configuring PUT options like cache control.

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextjsBucketDeployment.Initializer"></a>

```typescript
import { NextjsBucketDeployment } from 'cdk-nextjs-standalone'

new NextjsBucketDeployment(scope: Construct, id: string, props: NextjsBucketDeploymentProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeployment.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeployment.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeployment.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps">NextjsBucketDeploymentProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsBucketDeployment.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsBucketDeployment.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsBucketDeployment.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps">NextjsBucketDeploymentProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeployment.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextjsBucketDeployment.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeployment.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeployment.getSubstitutionConfig">getSubstitutionConfig</a></code> | Creates `substitutionConfig` an object by extracting unresolved tokens. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeployment.getSubstitutionValue">getSubstitutionValue</a></code> | Formats a string as a template value so custom resource knows to replace. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextjsBucketDeployment.isConstruct"></a>

```typescript
import { NextjsBucketDeployment } from 'cdk-nextjs-standalone'

NextjsBucketDeployment.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsBucketDeployment.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `getSubstitutionConfig` <a name="getSubstitutionConfig" id="cdk-nextjs-standalone.NextjsBucketDeployment.getSubstitutionConfig"></a>

```typescript
import { NextjsBucketDeployment } from 'cdk-nextjs-standalone'

NextjsBucketDeployment.getSubstitutionConfig(env: {[ key: string ]: string})
```

Creates `substitutionConfig` an object by extracting unresolved tokens.

###### `env`<sup>Required</sup> <a name="env" id="cdk-nextjs-standalone.NextjsBucketDeployment.getSubstitutionConfig.parameter.env"></a>

- *Type:* {[ key: string ]: string}

---

##### `getSubstitutionValue` <a name="getSubstitutionValue" id="cdk-nextjs-standalone.NextjsBucketDeployment.getSubstitutionValue"></a>

```typescript
import { NextjsBucketDeployment } from 'cdk-nextjs-standalone'

NextjsBucketDeployment.getSubstitutionValue(v: string)
```

Formats a string as a template value so custom resource knows to replace.

###### `v`<sup>Required</sup> <a name="v" id="cdk-nextjs-standalone.NextjsBucketDeployment.getSubstitutionValue.parameter.v"></a>

- *Type:* string

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeployment.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeployment.property.function">function</a></code> | <code>aws-cdk-lib.aws_lambda.Function</code> | Lambda Function Provider for Custom Resource. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsBucketDeployment.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `function`<sup>Required</sup> <a name="function" id="cdk-nextjs-standalone.NextjsBucketDeployment.property.function"></a>

```typescript
public readonly function: Function;
```

- *Type:* aws-cdk-lib.aws_lambda.Function

Lambda Function Provider for Custom Resource.

---


### NextjsBuild <a name="NextjsBuild" id="cdk-nextjs-standalone.NextjsBuild"></a>

Build Next.js app.

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextjsBuild.Initializer"></a>

```typescript
import { NextjsBuild } from 'cdk-nextjs-standalone'

new NextjsBuild(scope: Construct, id: string, props: NextjsBuildProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuildProps">NextjsBuildProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsBuild.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsBuild.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsBuild.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuildProps">NextjsBuildProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.readPublicFileList">readPublicFileList</a></code> | *No description.* |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextjsBuild.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `readPublicFileList` <a name="readPublicFileList" id="cdk-nextjs-standalone.NextjsBuild.readPublicFileList"></a>

```typescript
public readPublicFileList(): string[]
```

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextjsBuild.isConstruct"></a>

```typescript
import { NextjsBuild } from 'cdk-nextjs-standalone'

NextjsBuild.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsBuild.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.nextCacheDir">nextCacheDir</a></code> | <code>string</code> | Cache directory for generated data. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.nextImageFnDir">nextImageFnDir</a></code> | <code>string</code> | Contains function for processessing image requests. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.nextRevalidateFnDir">nextRevalidateFnDir</a></code> | <code>string</code> | Contains function for processing items from revalidation queue. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.nextServerFnDir">nextServerFnDir</a></code> | <code>string</code> | Contains server code and dependencies. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.nextStaticDir">nextStaticDir</a></code> | <code>string</code> | Static files containing client-side code. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuildProps">NextjsBuildProps</a></code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsBuild.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `nextCacheDir`<sup>Required</sup> <a name="nextCacheDir" id="cdk-nextjs-standalone.NextjsBuild.property.nextCacheDir"></a>

```typescript
public readonly nextCacheDir: string;
```

- *Type:* string

Cache directory for generated data.

---

##### `nextImageFnDir`<sup>Required</sup> <a name="nextImageFnDir" id="cdk-nextjs-standalone.NextjsBuild.property.nextImageFnDir"></a>

```typescript
public readonly nextImageFnDir: string;
```

- *Type:* string

Contains function for processessing image requests.

Should be arm64.

---

##### `nextRevalidateFnDir`<sup>Required</sup> <a name="nextRevalidateFnDir" id="cdk-nextjs-standalone.NextjsBuild.property.nextRevalidateFnDir"></a>

```typescript
public readonly nextRevalidateFnDir: string;
```

- *Type:* string

Contains function for processing items from revalidation queue.

---

##### `nextServerFnDir`<sup>Required</sup> <a name="nextServerFnDir" id="cdk-nextjs-standalone.NextjsBuild.property.nextServerFnDir"></a>

```typescript
public readonly nextServerFnDir: string;
```

- *Type:* string

Contains server code and dependencies.

---

##### `nextStaticDir`<sup>Required</sup> <a name="nextStaticDir" id="cdk-nextjs-standalone.NextjsBuild.property.nextStaticDir"></a>

```typescript
public readonly nextStaticDir: string;
```

- *Type:* string

Static files containing client-side code.

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsBuild.property.props"></a>

```typescript
public readonly props: NextjsBuildProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuildProps">NextjsBuildProps</a>

---


### NextjsDistribution <a name="NextjsDistribution" id="cdk-nextjs-standalone.NextjsDistribution"></a>

Create a CloudFront distribution to serve a Next.js application.

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextjsDistribution.Initializer"></a>

```typescript
import { NextjsDistribution } from 'cdk-nextjs-standalone'

new NextjsDistribution(scope: Construct, id: string, props: NextjsDistributionProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps">NextjsDistributionProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsDistribution.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsDistribution.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsDistribution.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDistributionProps">NextjsDistributionProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextjsDistribution.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextjsDistribution.isConstruct"></a>

```typescript
import { NextjsDistribution } from 'cdk-nextjs-standalone'

NextjsDistribution.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsDistribution.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.imageCachePolicyProps">imageCachePolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.CachePolicyProps</code> | The default CloudFront Cache Policy properties for images. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.serverCachePolicyProps">serverCachePolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.CachePolicyProps</code> | The default CloudFront cache policy properties for dynamic requests to server handler. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.distributionDomain">distributionDomain</a></code> | <code>string</code> | The domain name of the internally created CloudFront Distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.distributionId">distributionId</a></code> | <code>string</code> | The ID of the internally created CloudFront Distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.url">url</a></code> | <code>string</code> | The CloudFront URL of the website. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.customDomainName">customDomainName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.customDomainUrl">customDomainUrl</a></code> | <code>string</code> | If the custom domain is enabled, this is the URL of the website with the custom domain. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.Distribution</code> | The internally created CloudFront `Distribution` instance. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.certificate">certificate</a></code> | <code>aws-cdk-lib.aws_certificatemanager.ICertificate</code> | The AWS Certificate Manager certificate for the custom domain. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.hostedZone">hostedZone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | The Route 53 hosted zone for the custom domain. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsDistribution.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `imageCachePolicyProps`<sup>Required</sup> <a name="imageCachePolicyProps" id="cdk-nextjs-standalone.NextjsDistribution.property.imageCachePolicyProps"></a>

```typescript
public readonly imageCachePolicyProps: CachePolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.CachePolicyProps

The default CloudFront Cache Policy properties for images.

---

##### `serverCachePolicyProps`<sup>Required</sup> <a name="serverCachePolicyProps" id="cdk-nextjs-standalone.NextjsDistribution.property.serverCachePolicyProps"></a>

```typescript
public readonly serverCachePolicyProps: CachePolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.CachePolicyProps

The default CloudFront cache policy properties for dynamic requests to server handler.

---

##### `distributionDomain`<sup>Required</sup> <a name="distributionDomain" id="cdk-nextjs-standalone.NextjsDistribution.property.distributionDomain"></a>

```typescript
public readonly distributionDomain: string;
```

- *Type:* string

The domain name of the internally created CloudFront Distribution.

---

##### `distributionId`<sup>Required</sup> <a name="distributionId" id="cdk-nextjs-standalone.NextjsDistribution.property.distributionId"></a>

```typescript
public readonly distributionId: string;
```

- *Type:* string

The ID of the internally created CloudFront Distribution.

---

##### `url`<sup>Required</sup> <a name="url" id="cdk-nextjs-standalone.NextjsDistribution.property.url"></a>

```typescript
public readonly url: string;
```

- *Type:* string

The CloudFront URL of the website.

---

##### `customDomainName`<sup>Optional</sup> <a name="customDomainName" id="cdk-nextjs-standalone.NextjsDistribution.property.customDomainName"></a>

```typescript
public readonly customDomainName: string;
```

- *Type:* string

---

##### `customDomainUrl`<sup>Optional</sup> <a name="customDomainUrl" id="cdk-nextjs-standalone.NextjsDistribution.property.customDomainUrl"></a>

```typescript
public readonly customDomainUrl: string;
```

- *Type:* string

If the custom domain is enabled, this is the URL of the website with the custom domain.

---

##### `distribution`<sup>Required</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsDistribution.property.distribution"></a>

```typescript
public readonly distribution: Distribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.Distribution

The internally created CloudFront `Distribution` instance.

---

##### `certificate`<sup>Optional</sup> <a name="certificate" id="cdk-nextjs-standalone.NextjsDistribution.property.certificate"></a>

```typescript
public readonly certificate: ICertificate;
```

- *Type:* aws-cdk-lib.aws_certificatemanager.ICertificate

The AWS Certificate Manager certificate for the custom domain.

---

##### `hostedZone`<sup>Optional</sup> <a name="hostedZone" id="cdk-nextjs-standalone.NextjsDistribution.property.hostedZone"></a>

```typescript
public readonly hostedZone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

The Route 53 hosted zone for the custom domain.

---


### NextjsImage <a name="NextjsImage" id="cdk-nextjs-standalone.NextjsImage"></a>

This lambda handles image optimization.

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextjsImage.Initializer"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

new NextjsImage(scope: Construct, id: string, props: NextjsImageProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsImageProps">NextjsImageProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsImage.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsImage.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsImageProps">NextjsImageProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.addEventSource">addEventSource</a></code> | Adds an event source to this function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.addEventSourceMapping">addEventSourceMapping</a></code> | Adds an event source that maps to this AWS Lambda function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.addFunctionUrl">addFunctionUrl</a></code> | Adds a url to this lambda function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.addPermission">addPermission</a></code> | Adds a permission to the Lambda resource policy. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.addToRolePolicy">addToRolePolicy</a></code> | Adds a statement to the IAM role assumed by the instance. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.configureAsyncInvoke">configureAsyncInvoke</a></code> | Configures options for asynchronous invocation. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.considerWarningOnInvokeFunctionPermissions">considerWarningOnInvokeFunctionPermissions</a></code> | A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.grantInvoke">grantInvoke</a></code> | Grant the given identity permissions to invoke this Lambda. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.grantInvokeUrl">grantInvokeUrl</a></code> | Grant the given identity permissions to invoke this Lambda Function URL. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metric">metric</a></code> | Return the given named metric for this Function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricDuration">metricDuration</a></code> | How long execution of this Lambda takes. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricErrors">metricErrors</a></code> | How many invocations of this Lambda fail. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricInvocations">metricInvocations</a></code> | How often this Lambda is invoked. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricThrottles">metricThrottles</a></code> | How often this Lambda is throttled. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.addAlias">addAlias</a></code> | Defines an alias for this function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.addEnvironment">addEnvironment</a></code> | Adds an environment variable to this Lambda function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.addLayers">addLayers</a></code> | Adds one or more Lambda Layers to this Lambda function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.invalidateVersionBasedOn">invalidateVersionBasedOn</a></code> | Mix additional information into the hash of the Version object. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextjsImage.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="cdk-nextjs-standalone.NextjsImage.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="cdk-nextjs-standalone.NextjsImage.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addEventSource` <a name="addEventSource" id="cdk-nextjs-standalone.NextjsImage.addEventSource"></a>

```typescript
public addEventSource(source: IEventSource): void
```

Adds an event source to this function.

Event sources are implemented in the aws-cdk-lib/aws-lambda-event-sources module.

The following example adds an SQS Queue as an event source:
```
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
myFunction.addEventSource(new SqsEventSource(myQueue));
```

###### `source`<sup>Required</sup> <a name="source" id="cdk-nextjs-standalone.NextjsImage.addEventSource.parameter.source"></a>

- *Type:* aws-cdk-lib.aws_lambda.IEventSource

---

##### `addEventSourceMapping` <a name="addEventSourceMapping" id="cdk-nextjs-standalone.NextjsImage.addEventSourceMapping"></a>

```typescript
public addEventSourceMapping(id: string, options: EventSourceMappingOptions): EventSourceMapping
```

Adds an event source that maps to this AWS Lambda function.

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsImage.addEventSourceMapping.parameter.id"></a>

- *Type:* string

---

###### `options`<sup>Required</sup> <a name="options" id="cdk-nextjs-standalone.NextjsImage.addEventSourceMapping.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventSourceMappingOptions

---

##### `addFunctionUrl` <a name="addFunctionUrl" id="cdk-nextjs-standalone.NextjsImage.addFunctionUrl"></a>

```typescript
public addFunctionUrl(options?: FunctionUrlOptions): FunctionUrl
```

Adds a url to this lambda function.

###### `options`<sup>Optional</sup> <a name="options" id="cdk-nextjs-standalone.NextjsImage.addFunctionUrl.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrlOptions

---

##### `addPermission` <a name="addPermission" id="cdk-nextjs-standalone.NextjsImage.addPermission"></a>

```typescript
public addPermission(id: string, permission: Permission): void
```

Adds a permission to the Lambda resource policy.

> [Permission for details.](Permission for details.)

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsImage.addPermission.parameter.id"></a>

- *Type:* string

The id for the permission construct.

---

###### `permission`<sup>Required</sup> <a name="permission" id="cdk-nextjs-standalone.NextjsImage.addPermission.parameter.permission"></a>

- *Type:* aws-cdk-lib.aws_lambda.Permission

The permission to grant to this Lambda function.

---

##### `addToRolePolicy` <a name="addToRolePolicy" id="cdk-nextjs-standalone.NextjsImage.addToRolePolicy"></a>

```typescript
public addToRolePolicy(statement: PolicyStatement): void
```

Adds a statement to the IAM role assumed by the instance.

###### `statement`<sup>Required</sup> <a name="statement" id="cdk-nextjs-standalone.NextjsImage.addToRolePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `configureAsyncInvoke` <a name="configureAsyncInvoke" id="cdk-nextjs-standalone.NextjsImage.configureAsyncInvoke"></a>

```typescript
public configureAsyncInvoke(options: EventInvokeConfigOptions): void
```

Configures options for asynchronous invocation.

###### `options`<sup>Required</sup> <a name="options" id="cdk-nextjs-standalone.NextjsImage.configureAsyncInvoke.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventInvokeConfigOptions

---

##### `considerWarningOnInvokeFunctionPermissions` <a name="considerWarningOnInvokeFunctionPermissions" id="cdk-nextjs-standalone.NextjsImage.considerWarningOnInvokeFunctionPermissions"></a>

```typescript
public considerWarningOnInvokeFunctionPermissions(scope: Construct, action: string): void
```

A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function.

function.currentVersion is invoked before or after the permission is created.

This applies only to permissions on Lambda functions, not versions or aliases.
This function is overridden as a noOp for QualifiedFunctionBase.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsImage.considerWarningOnInvokeFunctionPermissions.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `action`<sup>Required</sup> <a name="action" id="cdk-nextjs-standalone.NextjsImage.considerWarningOnInvokeFunctionPermissions.parameter.action"></a>

- *Type:* string

---

##### `grantInvoke` <a name="grantInvoke" id="cdk-nextjs-standalone.NextjsImage.grantInvoke"></a>

```typescript
public grantInvoke(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="cdk-nextjs-standalone.NextjsImage.grantInvoke.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeUrl` <a name="grantInvokeUrl" id="cdk-nextjs-standalone.NextjsImage.grantInvokeUrl"></a>

```typescript
public grantInvokeUrl(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda Function URL.

###### `grantee`<sup>Required</sup> <a name="grantee" id="cdk-nextjs-standalone.NextjsImage.grantInvokeUrl.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `metric` <a name="metric" id="cdk-nextjs-standalone.NextjsImage.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Function.

###### `metricName`<sup>Required</sup> <a name="metricName" id="cdk-nextjs-standalone.NextjsImage.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricDuration` <a name="metricDuration" id="cdk-nextjs-standalone.NextjsImage.metricDuration"></a>

```typescript
public metricDuration(props?: MetricOptions): Metric
```

How long execution of this Lambda takes.

Average over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricErrors` <a name="metricErrors" id="cdk-nextjs-standalone.NextjsImage.metricErrors"></a>

```typescript
public metricErrors(props?: MetricOptions): Metric
```

How many invocations of this Lambda fail.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInvocations` <a name="metricInvocations" id="cdk-nextjs-standalone.NextjsImage.metricInvocations"></a>

```typescript
public metricInvocations(props?: MetricOptions): Metric
```

How often this Lambda is invoked.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottles` <a name="metricThrottles" id="cdk-nextjs-standalone.NextjsImage.metricThrottles"></a>

```typescript
public metricThrottles(props?: MetricOptions): Metric
```

How often this Lambda is throttled.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addAlias` <a name="addAlias" id="cdk-nextjs-standalone.NextjsImage.addAlias"></a>

```typescript
public addAlias(aliasName: string, options?: AliasOptions): Alias
```

Defines an alias for this function.

The alias will automatically be updated to point to the latest version of
the function as it is being updated during a deployment.

```ts
declare const fn: lambda.Function;

fn.addAlias('Live');

// Is equivalent to

new lambda.Alias(this, 'AliasLive', {
  aliasName: 'Live',
  version: fn.currentVersion,
});
```

###### `aliasName`<sup>Required</sup> <a name="aliasName" id="cdk-nextjs-standalone.NextjsImage.addAlias.parameter.aliasName"></a>

- *Type:* string

The name of the alias.

---

###### `options`<sup>Optional</sup> <a name="options" id="cdk-nextjs-standalone.NextjsImage.addAlias.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.AliasOptions

Alias options.

---

##### `addEnvironment` <a name="addEnvironment" id="cdk-nextjs-standalone.NextjsImage.addEnvironment"></a>

```typescript
public addEnvironment(key: string, value: string, options?: EnvironmentOptions): Function
```

Adds an environment variable to this Lambda function.

If this is a ref to a Lambda function, this operation results in a no-op.

###### `key`<sup>Required</sup> <a name="key" id="cdk-nextjs-standalone.NextjsImage.addEnvironment.parameter.key"></a>

- *Type:* string

The environment variable key.

---

###### `value`<sup>Required</sup> <a name="value" id="cdk-nextjs-standalone.NextjsImage.addEnvironment.parameter.value"></a>

- *Type:* string

The environment variable's value.

---

###### `options`<sup>Optional</sup> <a name="options" id="cdk-nextjs-standalone.NextjsImage.addEnvironment.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EnvironmentOptions

Environment variable options.

---

##### `addLayers` <a name="addLayers" id="cdk-nextjs-standalone.NextjsImage.addLayers"></a>

```typescript
public addLayers(layers: ILayerVersion): void
```

Adds one or more Lambda Layers to this Lambda function.

###### `layers`<sup>Required</sup> <a name="layers" id="cdk-nextjs-standalone.NextjsImage.addLayers.parameter.layers"></a>

- *Type:* aws-cdk-lib.aws_lambda.ILayerVersion

the layers to be added.

---

##### `invalidateVersionBasedOn` <a name="invalidateVersionBasedOn" id="cdk-nextjs-standalone.NextjsImage.invalidateVersionBasedOn"></a>

```typescript
public invalidateVersionBasedOn(x: string): void
```

Mix additional information into the hash of the Version object.

The Lambda Function construct does its best to automatically create a new
Version when anything about the Function changes (its code, its layers,
any of the other properties).

However, you can sometimes source information from places that the CDK cannot
look into, like the deploy-time values of SSM parameters. In those cases,
the CDK would not force the creation of a new Version object when it actually
should.

This method can be used to invalidate the current Version object. Pass in
any string into this method, and make sure the string changes when you know
a new Version needs to be created.

This method may be called more than once.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsImage.invalidateVersionBasedOn.parameter.x"></a>

- *Type:* string

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.classifyVersionProperty">classifyVersionProperty</a></code> | Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.fromFunctionArn">fromFunctionArn</a></code> | Import a lambda function into the CDK using its ARN. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.fromFunctionAttributes">fromFunctionAttributes</a></code> | Creates a Lambda function object which represents a function not defined within this stack. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.fromFunctionName">fromFunctionName</a></code> | Import a lambda function into the CDK using its name. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricAll">metricAll</a></code> | Return the given named metric for this Lambda. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricAllConcurrentExecutions">metricAllConcurrentExecutions</a></code> | Metric for the number of concurrent executions across all Lambdas. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricAllDuration">metricAllDuration</a></code> | Metric for the Duration executing all Lambdas. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricAllErrors">metricAllErrors</a></code> | Metric for the number of Errors executing all Lambdas. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricAllInvocations">metricAllInvocations</a></code> | Metric for the number of invocations of all Lambdas. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricAllThrottles">metricAllThrottles</a></code> | Metric for the number of throttled invocations of all Lambdas. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.metricAllUnreservedConcurrentExecutions">metricAllUnreservedConcurrentExecutions</a></code> | Metric for the number of unreserved concurrent executions across all Lambdas. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextjsImage.isConstruct"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsImage.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="cdk-nextjs-standalone.NextjsImage.isOwnedResource"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="cdk-nextjs-standalone.NextjsImage.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="cdk-nextjs-standalone.NextjsImage.isResource"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="cdk-nextjs-standalone.NextjsImage.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `classifyVersionProperty` <a name="classifyVersionProperty" id="cdk-nextjs-standalone.NextjsImage.classifyVersionProperty"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.classifyVersionProperty(propertyName: string, locked: boolean)
```

Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource.

See 'currentVersion' section in the module README for more details.

###### `propertyName`<sup>Required</sup> <a name="propertyName" id="cdk-nextjs-standalone.NextjsImage.classifyVersionProperty.parameter.propertyName"></a>

- *Type:* string

The property to classify.

---

###### `locked`<sup>Required</sup> <a name="locked" id="cdk-nextjs-standalone.NextjsImage.classifyVersionProperty.parameter.locked"></a>

- *Type:* boolean

whether the property should be associated to the version or not.

---

##### `fromFunctionArn` <a name="fromFunctionArn" id="cdk-nextjs-standalone.NextjsImage.fromFunctionArn"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.fromFunctionArn(scope: Construct, id: string, functionArn: string)
```

Import a lambda function into the CDK using its ARN.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsImage.fromFunctionArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsImage.fromFunctionArn.parameter.id"></a>

- *Type:* string

---

###### `functionArn`<sup>Required</sup> <a name="functionArn" id="cdk-nextjs-standalone.NextjsImage.fromFunctionArn.parameter.functionArn"></a>

- *Type:* string

---

##### `fromFunctionAttributes` <a name="fromFunctionAttributes" id="cdk-nextjs-standalone.NextjsImage.fromFunctionAttributes"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.fromFunctionAttributes(scope: Construct, id: string, attrs: FunctionAttributes)
```

Creates a Lambda function object which represents a function not defined within this stack.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsImage.fromFunctionAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent construct.

---

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsImage.fromFunctionAttributes.parameter.id"></a>

- *Type:* string

The name of the lambda construct.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="cdk-nextjs-standalone.NextjsImage.fromFunctionAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionAttributes

the attributes of the function to import.

---

##### `fromFunctionName` <a name="fromFunctionName" id="cdk-nextjs-standalone.NextjsImage.fromFunctionName"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.fromFunctionName(scope: Construct, id: string, functionName: string)
```

Import a lambda function into the CDK using its name.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsImage.fromFunctionName.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsImage.fromFunctionName.parameter.id"></a>

- *Type:* string

---

###### `functionName`<sup>Required</sup> <a name="functionName" id="cdk-nextjs-standalone.NextjsImage.fromFunctionName.parameter.functionName"></a>

- *Type:* string

---

##### `metricAll` <a name="metricAll" id="cdk-nextjs-standalone.NextjsImage.metricAll"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.metricAll(metricName: string, props?: MetricOptions)
```

Return the given named metric for this Lambda.

###### `metricName`<sup>Required</sup> <a name="metricName" id="cdk-nextjs-standalone.NextjsImage.metricAll.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricAll.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllConcurrentExecutions` <a name="metricAllConcurrentExecutions" id="cdk-nextjs-standalone.NextjsImage.metricAllConcurrentExecutions"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.metricAllConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricAllConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllDuration` <a name="metricAllDuration" id="cdk-nextjs-standalone.NextjsImage.metricAllDuration"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.metricAllDuration(props?: MetricOptions)
```

Metric for the Duration executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricAllDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllErrors` <a name="metricAllErrors" id="cdk-nextjs-standalone.NextjsImage.metricAllErrors"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.metricAllErrors(props?: MetricOptions)
```

Metric for the number of Errors executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricAllErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllInvocations` <a name="metricAllInvocations" id="cdk-nextjs-standalone.NextjsImage.metricAllInvocations"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.metricAllInvocations(props?: MetricOptions)
```

Metric for the number of invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricAllInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllThrottles` <a name="metricAllThrottles" id="cdk-nextjs-standalone.NextjsImage.metricAllThrottles"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.metricAllThrottles(props?: MetricOptions)
```

Metric for the number of throttled invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricAllThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllUnreservedConcurrentExecutions` <a name="metricAllUnreservedConcurrentExecutions" id="cdk-nextjs-standalone.NextjsImage.metricAllUnreservedConcurrentExecutions"></a>

```typescript
import { NextjsImage } from 'cdk-nextjs-standalone'

NextjsImage.metricAllUnreservedConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of unreserved concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextjsImage.metricAllUnreservedConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64). |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | Access the Connections object. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.functionArn">functionArn</a></code> | <code>string</code> | ARN of this function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.functionName">functionName</a></code> | <code>string</code> | Name of this function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal this Lambda Function is running as. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.isBoundToVpc">isBoundToVpc</a></code> | <code>boolean</code> | Whether or not this Lambda function was bound to a VPC. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.latestVersion">latestVersion</a></code> | <code>aws-cdk-lib.aws_lambda.IVersion</code> | The `$LATEST` version of this function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.permissionsNode">permissionsNode</a></code> | <code>constructs.Node</code> | The construct node where permissions are attached. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.resourceArnsForGrantInvoke">resourceArnsForGrantInvoke</a></code> | <code>string[]</code> | The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke(). |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Execution role associated with this function. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.currentVersion">currentVersion</a></code> | <code>aws-cdk-lib.aws_lambda.Version</code> | Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The LogGroup where the Lambda function's logs are made available. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime configured for this lambda. |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The DLQ (as queue) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The DLQ (as topic) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#cdk-nextjs-standalone.NextjsImage.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The timeout configured for this lambda. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsImage.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="cdk-nextjs-standalone.NextjsImage.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="cdk-nextjs-standalone.NextjsImage.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `architecture`<sup>Required</sup> <a name="architecture" id="cdk-nextjs-standalone.NextjsImage.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture

The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64).

---

##### `connections`<sup>Required</sup> <a name="connections" id="cdk-nextjs-standalone.NextjsImage.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

Access the Connections object.

Will fail if not a VPC-enabled Lambda Function

---

##### `functionArn`<sup>Required</sup> <a name="functionArn" id="cdk-nextjs-standalone.NextjsImage.property.functionArn"></a>

```typescript
public readonly functionArn: string;
```

- *Type:* string

ARN of this function.

---

##### `functionName`<sup>Required</sup> <a name="functionName" id="cdk-nextjs-standalone.NextjsImage.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string

Name of this function.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="cdk-nextjs-standalone.NextjsImage.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal this Lambda Function is running as.

---

##### `isBoundToVpc`<sup>Required</sup> <a name="isBoundToVpc" id="cdk-nextjs-standalone.NextjsImage.property.isBoundToVpc"></a>

```typescript
public readonly isBoundToVpc: boolean;
```

- *Type:* boolean

Whether or not this Lambda function was bound to a VPC.

If this is is `false`, trying to access the `connections` object will fail.

---

##### `latestVersion`<sup>Required</sup> <a name="latestVersion" id="cdk-nextjs-standalone.NextjsImage.property.latestVersion"></a>

```typescript
public readonly latestVersion: IVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.IVersion

The `$LATEST` version of this function.

Note that this is reference to a non-specific AWS Lambda version, which
means the function this version refers to can return different results in
different invocations.

To obtain a reference to an explicit version which references the current
function configuration, use `lambdaFunction.currentVersion` instead.

---

##### `permissionsNode`<sup>Required</sup> <a name="permissionsNode" id="cdk-nextjs-standalone.NextjsImage.property.permissionsNode"></a>

```typescript
public readonly permissionsNode: Node;
```

- *Type:* constructs.Node

The construct node where permissions are attached.

---

##### `resourceArnsForGrantInvoke`<sup>Required</sup> <a name="resourceArnsForGrantInvoke" id="cdk-nextjs-standalone.NextjsImage.property.resourceArnsForGrantInvoke"></a>

```typescript
public readonly resourceArnsForGrantInvoke: string[];
```

- *Type:* string[]

The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke().

---

##### `role`<sup>Optional</sup> <a name="role" id="cdk-nextjs-standalone.NextjsImage.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

Execution role associated with this function.

---

##### `currentVersion`<sup>Required</sup> <a name="currentVersion" id="cdk-nextjs-standalone.NextjsImage.property.currentVersion"></a>

```typescript
public readonly currentVersion: Version;
```

- *Type:* aws-cdk-lib.aws_lambda.Version

Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes.

You can specify options for this version using the `currentVersionOptions`
prop when initializing the `lambda.Function`.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="cdk-nextjs-standalone.NextjsImage.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The LogGroup where the Lambda function's logs are made available.

If either `logRetention` is set or this property is called, a CloudFormation custom resource is added to the stack that
pre-creates the log group as part of the stack deployment, if it already doesn't exist, and sets the correct log retention
period (never expire, by default).

Further, if the log group already exists and the `logRetention` is not set, the custom resource will reset the log retention
to never expire even if it was configured with a different value.

---

##### `runtime`<sup>Required</sup> <a name="runtime" id="cdk-nextjs-standalone.NextjsImage.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

The runtime configured for this lambda.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="cdk-nextjs-standalone.NextjsImage.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

The DLQ (as queue) associated with this Lambda Function (this is an optional attribute).

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="cdk-nextjs-standalone.NextjsImage.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic

The DLQ (as topic) associated with this Lambda Function (this is an optional attribute).

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="cdk-nextjs-standalone.NextjsImage.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

The timeout configured for this lambda.

---


### NextjsInvalidation <a name="NextjsInvalidation" id="cdk-nextjs-standalone.NextjsInvalidation"></a>

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextjsInvalidation.Initializer"></a>

```typescript
import { NextjsInvalidation } from 'cdk-nextjs-standalone'

new NextjsInvalidation(scope: Construct, id: string, props: NextjsInvalidationProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsInvalidation.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsInvalidation.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsInvalidation.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsInvalidationProps">NextjsInvalidationProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsInvalidation.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsInvalidation.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsInvalidation.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsInvalidationProps">NextjsInvalidationProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsInvalidation.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextjsInvalidation.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsInvalidation.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextjsInvalidation.isConstruct"></a>

```typescript
import { NextjsInvalidation } from 'cdk-nextjs-standalone'

NextjsInvalidation.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsInvalidation.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsInvalidation.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsInvalidation.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### NextjsRevalidation <a name="NextjsRevalidation" id="cdk-nextjs-standalone.NextjsRevalidation"></a>

Builds the system for revalidating Next.js resources. This includes a Lambda function handler and queue system.

> [{@link https://github.com/serverless-stack/open-next/blob/main/README.md?plain=1#L65}]({@link https://github.com/serverless-stack/open-next/blob/main/README.md?plain=1#L65})

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextjsRevalidation.Initializer"></a>

```typescript
import { NextjsRevalidation } from 'cdk-nextjs-standalone'

new NextjsRevalidation(scope: Construct, id: string, props: NextjsRevalidationProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps">NextjsRevalidationProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsRevalidation.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsRevalidation.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsRevalidation.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsRevalidationProps">NextjsRevalidationProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextjsRevalidation.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextjsRevalidation.isConstruct"></a>

```typescript
import { NextjsRevalidation } from 'cdk-nextjs-standalone'

NextjsRevalidation.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsRevalidation.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.property.function">function</a></code> | <code>aws-cdk-lib.aws_lambda_nodejs.NodejsFunction</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.property.queue">queue</a></code> | <code>aws-cdk-lib.aws_sqs.Queue</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsRevalidation.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `function`<sup>Required</sup> <a name="function" id="cdk-nextjs-standalone.NextjsRevalidation.property.function"></a>

```typescript
public readonly function: NodejsFunction;
```

- *Type:* aws-cdk-lib.aws_lambda_nodejs.NodejsFunction

---

##### `queue`<sup>Required</sup> <a name="queue" id="cdk-nextjs-standalone.NextjsRevalidation.property.queue"></a>

```typescript
public readonly queue: Queue;
```

- *Type:* aws-cdk-lib.aws_sqs.Queue

---


### NextjsServer <a name="NextjsServer" id="cdk-nextjs-standalone.NextjsServer"></a>

Build a lambda function from a NextJS application to handle server-side rendering, API routes, and image optimization.

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextjsServer.Initializer"></a>

```typescript
import { NextjsServer } from 'cdk-nextjs-standalone'

new NextjsServer(scope: Construct, id: string, props: NextjsServerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsServer.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsServer.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsServer.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsServerProps">NextjsServerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsServer.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsServer.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsServer.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsServerProps">NextjsServerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsServer.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextjsServer.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsServer.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextjsServer.isConstruct"></a>

```typescript
import { NextjsServer } from 'cdk-nextjs-standalone'

NextjsServer.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsServer.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsServer.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextjsServer.property.lambdaFunction">lambdaFunction</a></code> | <code>aws-cdk-lib.aws_lambda.Function</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsServer.property.configBucket">configBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsServer.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `lambdaFunction`<sup>Required</sup> <a name="lambdaFunction" id="cdk-nextjs-standalone.NextjsServer.property.lambdaFunction"></a>

```typescript
public readonly lambdaFunction: Function;
```

- *Type:* aws-cdk-lib.aws_lambda.Function

---

##### `configBucket`<sup>Optional</sup> <a name="configBucket" id="cdk-nextjs-standalone.NextjsServer.property.configBucket"></a>

```typescript
public readonly configBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---


### NextjsStaticAssets <a name="NextjsStaticAssets" id="cdk-nextjs-standalone.NextjsStaticAssets"></a>

Uploads Nextjs built static and public files to S3.

Will inject resolved environment variables that are unresolved at synthesis
in CloudFormation Custom Resource.

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextjsStaticAssets.Initializer"></a>

```typescript
import { NextjsStaticAssets } from 'cdk-nextjs-standalone'

new NextjsStaticAssets(scope: Construct, id: string, props: NextjsStaticAssetsProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssets.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssets.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssets.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetsProps">NextjsStaticAssetsProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsStaticAssets.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsStaticAssets.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsStaticAssets.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsStaticAssetsProps">NextjsStaticAssetsProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssets.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextjsStaticAssets.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssets.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextjsStaticAssets.isConstruct"></a>

```typescript
import { NextjsStaticAssets } from 'cdk-nextjs-standalone'

NextjsStaticAssets.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsStaticAssets.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssets.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssets.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Bucket containing assets. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsStaticAssets.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="cdk-nextjs-standalone.NextjsStaticAssets.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Bucket containing assets.

---


## Structs <a name="Structs" id="Structs"></a>

### BaseSiteDomainProps <a name="BaseSiteDomainProps" id="cdk-nextjs-standalone.BaseSiteDomainProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.BaseSiteDomainProps.Initializer"></a>

```typescript
import { BaseSiteDomainProps } from 'cdk-nextjs-standalone'

const baseSiteDomainProps: BaseSiteDomainProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.BaseSiteDomainProps.property.domainName">domainName</a></code> | <code>string</code> | The domain to be assigned to the website URL (ie. domain.com). |
| <code><a href="#cdk-nextjs-standalone.BaseSiteDomainProps.property.alternateNames">alternateNames</a></code> | <code>string[]</code> | Specify additional names that should route to the Cloudfront Distribution. |
| <code><a href="#cdk-nextjs-standalone.BaseSiteDomainProps.property.certificate">certificate</a></code> | <code>aws-cdk-lib.aws_certificatemanager.ICertificate</code> | Import the certificate for the domain. |
| <code><a href="#cdk-nextjs-standalone.BaseSiteDomainProps.property.domainAlias">domainAlias</a></code> | <code>string</code> | An alternative domain to be assigned to the website URL. |
| <code><a href="#cdk-nextjs-standalone.BaseSiteDomainProps.property.hostedZone">hostedZone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | Import the underlying Route 53 hosted zone. |
| <code><a href="#cdk-nextjs-standalone.BaseSiteDomainProps.property.isExternalDomain">isExternalDomain</a></code> | <code>boolean</code> | Set this option if the domain is not hosted on Amazon Route 53. |

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-nextjs-standalone.BaseSiteDomainProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

The domain to be assigned to the website URL (ie. domain.com).

Supports domains that are hosted either on [Route 53](https://aws.amazon.com/route53/) or externally.

---

##### `alternateNames`<sup>Optional</sup> <a name="alternateNames" id="cdk-nextjs-standalone.BaseSiteDomainProps.property.alternateNames"></a>

```typescript
public readonly alternateNames: string[];
```

- *Type:* string[]

Specify additional names that should route to the Cloudfront Distribution.

Note, certificates for these names will not be automatically generated so the `certificate` option must be specified.

---

##### `certificate`<sup>Optional</sup> <a name="certificate" id="cdk-nextjs-standalone.BaseSiteDomainProps.property.certificate"></a>

```typescript
public readonly certificate: ICertificate;
```

- *Type:* aws-cdk-lib.aws_certificatemanager.ICertificate

Import the certificate for the domain.

By default, SST will create a certificate with the domain name. The certificate will be created in the `us-east-1`(N. Virginia) region as required by AWS CloudFront.

Set this option if you have an existing certificate in the `us-east-1` region in AWS Certificate Manager you want to use.

---

##### `domainAlias`<sup>Optional</sup> <a name="domainAlias" id="cdk-nextjs-standalone.BaseSiteDomainProps.property.domainAlias"></a>

```typescript
public readonly domainAlias: string;
```

- *Type:* string

An alternative domain to be assigned to the website URL.

Visitors to the alias will be redirected to the main domain. (ie. `www.domain.com`).

Use this to create a `www.` version of your domain and redirect visitors to the root domain.

---

##### `hostedZone`<sup>Optional</sup> <a name="hostedZone" id="cdk-nextjs-standalone.BaseSiteDomainProps.property.hostedZone"></a>

```typescript
public readonly hostedZone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

Import the underlying Route 53 hosted zone.

---

##### `isExternalDomain`<sup>Optional</sup> <a name="isExternalDomain" id="cdk-nextjs-standalone.BaseSiteDomainProps.property.isExternalDomain"></a>

```typescript
public readonly isExternalDomain: boolean;
```

- *Type:* boolean

Set this option if the domain is not hosted on Amazon Route 53.

---

### NextjsBaseProps <a name="NextjsBaseProps" id="cdk-nextjs-standalone.NextjsBaseProps"></a>

Common props shared across NextJS-related CDK constructs.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsBaseProps.Initializer"></a>

```typescript
import { NextjsBaseProps } from 'cdk-nextjs-standalone'

const nextjsBaseProps: NextjsBaseProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | Relative path to the directory where the NextJS project is located. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.buildCommand">buildCommand</a></code> | <code>string</code> | Optional value used to install NextJS node dependencies. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.buildPath">buildPath</a></code> | <code>string</code> | The directory to execute `npm run build` from. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.projectRoot">projectRoot</a></code> | <code>string</code> | Root of your project, if different from `nextjsPath`. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.sharpLayerArn">sharpLayerArn</a></code> | <code>string</code> | Optional arn for the sharp lambda layer. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.skipFullInvalidation">skipFullInvalidation</a></code> | <code>boolean</code> | By default all CloudFront cache will be invalidated on deployment. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsBaseProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `buildCommand`<sup>Optional</sup> <a name="buildCommand" id="cdk-nextjs-standalone.NextjsBaseProps.property.buildCommand"></a>

```typescript
public readonly buildCommand: string;
```

- *Type:* string
- *Default:* 'npx --yes open-next@2 build'

Optional value used to install NextJS node dependencies.

---

##### `buildPath`<sup>Optional</sup> <a name="buildPath" id="cdk-nextjs-standalone.NextjsBaseProps.property.buildPath"></a>

```typescript
public readonly buildPath: string;
```

- *Type:* string

The directory to execute `npm run build` from.

By default, it is `nextjsPath`.
Can be overridden, particularly useful for monorepos where `build` is expected to run
at the root of the project.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsBaseProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `projectRoot`<sup>Optional</sup> <a name="projectRoot" id="cdk-nextjs-standalone.NextjsBaseProps.property.projectRoot"></a>

```typescript
public readonly projectRoot: string;
```

- *Type:* string

Root of your project, if different from `nextjsPath`.

Defaults to current working directory.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsBaseProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `sharpLayerArn`<sup>Optional</sup> <a name="sharpLayerArn" id="cdk-nextjs-standalone.NextjsBaseProps.property.sharpLayerArn"></a>

```typescript
public readonly sharpLayerArn: string;
```

- *Type:* string

Optional arn for the sharp lambda layer.

If omitted, the layer will be created.

---

##### `skipFullInvalidation`<sup>Optional</sup> <a name="skipFullInvalidation" id="cdk-nextjs-standalone.NextjsBaseProps.property.skipFullInvalidation"></a>

```typescript
public readonly skipFullInvalidation: boolean;
```

- *Type:* boolean

By default all CloudFront cache will be invalidated on deployment.

This can be set to true to skip the full cache invalidation, which
could be important for some users.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsBaseProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

### NextjsBucketDeploymentProps <a name="NextjsBucketDeploymentProps" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.Initializer"></a>

```typescript
import { NextjsBucketDeploymentProps } from 'cdk-nextjs-standalone'

const nextjsBucketDeploymentProps: NextjsBucketDeploymentProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.asset">asset</a></code> | <code>aws-cdk-lib.aws_s3_assets.Asset</code> | Source `Asset`. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.destinationBucket">destinationBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Destination S3 Bucket. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.debug">debug</a></code> | <code>boolean</code> | Enable verbose output of Custom Resource Lambda. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.destinationKeyPrefix">destinationKeyPrefix</a></code> | <code>string</code> | Destination S3 Bucket Key Prefix. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.prune">prune</a></code> | <code>boolean</code> | If `true`, then delete files in `destinationBucket`/`destinationKeyPrefix` before uploading new objects. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.putConfig">putConfig</a></code> | <code>{[ key: string ]: {[ key: string ]: string}}</code> | Mapping of files to PUT options for `PutObjectCommand`. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.substitutionConfig">substitutionConfig</a></code> | <code>{[ key: string ]: string}</code> | Replace placeholders in all files in `asset`. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.zip">zip</a></code> | <code>boolean</code> | If `true` then files will be zipped before writing to destination bucket. |

---

##### `asset`<sup>Required</sup> <a name="asset" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.asset"></a>

```typescript
public readonly asset: Asset;
```

- *Type:* aws-cdk-lib.aws_s3_assets.Asset

Source `Asset`.

---

##### `destinationBucket`<sup>Required</sup> <a name="destinationBucket" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.destinationBucket"></a>

```typescript
public readonly destinationBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Destination S3 Bucket.

---

##### `debug`<sup>Optional</sup> <a name="debug" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.debug"></a>

```typescript
public readonly debug: boolean;
```

- *Type:* boolean
- *Default:* false

Enable verbose output of Custom Resource Lambda.

---

##### `destinationKeyPrefix`<sup>Optional</sup> <a name="destinationKeyPrefix" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.destinationKeyPrefix"></a>

```typescript
public readonly destinationKeyPrefix: string;
```

- *Type:* string

Destination S3 Bucket Key Prefix.

---

##### `prune`<sup>Optional</sup> <a name="prune" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.prune"></a>

```typescript
public readonly prune: boolean;
```

- *Type:* boolean
- *Default:* true

If `true`, then delete files in `destinationBucket`/`destinationKeyPrefix` before uploading new objects.

---

##### `putConfig`<sup>Optional</sup> <a name="putConfig" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.putConfig"></a>

```typescript
public readonly putConfig: {[ key: string ]: {[ key: string ]: string}};
```

- *Type:* {[ key: string ]: {[ key: string ]: string}}

Mapping of files to PUT options for `PutObjectCommand`.

Keys of
record must be a glob pattern (uses micromatch). Values of record are options
for PUT command for AWS SDK JS V3. See [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/Interface/PutObjectRequest/)
for options. If a file matches multiple globs, configuration will be
merged. Later entries override earlier entries.

`Bucket`, `Key`, and `Body` PUT options cannot be set.

---

##### `substitutionConfig`<sup>Optional</sup> <a name="substitutionConfig" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.substitutionConfig"></a>

```typescript
public readonly substitutionConfig: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Replace placeholders in all files in `asset`.

Placeholder targets are
defined by keys of record. Values to replace placeholders with are defined
by values of record.

---

##### `zip`<sup>Optional</sup> <a name="zip" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.zip"></a>

```typescript
public readonly zip: boolean;
```

- *Type:* boolean
- *Default:* false

If `true` then files will be zipped before writing to destination bucket.

Useful for Lambda functions.

---

### NextjsBuildProps <a name="NextjsBuildProps" id="cdk-nextjs-standalone.NextjsBuildProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsBuildProps.Initializer"></a>

```typescript
import { NextjsBuildProps } from 'cdk-nextjs-standalone'

const nextjsBuildProps: NextjsBuildProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | Relative path to the directory where the NextJS project is located. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.buildCommand">buildCommand</a></code> | <code>string</code> | Optional value used to install NextJS node dependencies. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.buildPath">buildPath</a></code> | <code>string</code> | The directory to execute `npm run build` from. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.projectRoot">projectRoot</a></code> | <code>string</code> | Root of your project, if different from `nextjsPath`. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.sharpLayerArn">sharpLayerArn</a></code> | <code>string</code> | Optional arn for the sharp lambda layer. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.skipFullInvalidation">skipFullInvalidation</a></code> | <code>boolean</code> | By default all CloudFront cache will be invalidated on deployment. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.skipBuild">skipBuild</a></code> | <code>boolean</code> | *No description.* |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsBuildProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `buildCommand`<sup>Optional</sup> <a name="buildCommand" id="cdk-nextjs-standalone.NextjsBuildProps.property.buildCommand"></a>

```typescript
public readonly buildCommand: string;
```

- *Type:* string
- *Default:* 'npx --yes open-next@2 build'

Optional value used to install NextJS node dependencies.

---

##### `buildPath`<sup>Optional</sup> <a name="buildPath" id="cdk-nextjs-standalone.NextjsBuildProps.property.buildPath"></a>

```typescript
public readonly buildPath: string;
```

- *Type:* string

The directory to execute `npm run build` from.

By default, it is `nextjsPath`.
Can be overridden, particularly useful for monorepos where `build` is expected to run
at the root of the project.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsBuildProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `projectRoot`<sup>Optional</sup> <a name="projectRoot" id="cdk-nextjs-standalone.NextjsBuildProps.property.projectRoot"></a>

```typescript
public readonly projectRoot: string;
```

- *Type:* string

Root of your project, if different from `nextjsPath`.

Defaults to current working directory.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsBuildProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `sharpLayerArn`<sup>Optional</sup> <a name="sharpLayerArn" id="cdk-nextjs-standalone.NextjsBuildProps.property.sharpLayerArn"></a>

```typescript
public readonly sharpLayerArn: string;
```

- *Type:* string

Optional arn for the sharp lambda layer.

If omitted, the layer will be created.

---

##### `skipFullInvalidation`<sup>Optional</sup> <a name="skipFullInvalidation" id="cdk-nextjs-standalone.NextjsBuildProps.property.skipFullInvalidation"></a>

```typescript
public readonly skipFullInvalidation: boolean;
```

- *Type:* boolean

By default all CloudFront cache will be invalidated on deployment.

This can be set to true to skip the full cache invalidation, which
could be important for some users.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsBuildProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

##### `skipBuild`<sup>Optional</sup> <a name="skipBuild" id="cdk-nextjs-standalone.NextjsBuildProps.property.skipBuild"></a>

```typescript
public readonly skipBuild: boolean;
```

- *Type:* boolean

> [ `NextjsProps.skipBuild`]( `NextjsProps.skipBuild`)

---

### NextjsCachePolicyProps <a name="NextjsCachePolicyProps" id="cdk-nextjs-standalone.NextjsCachePolicyProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsCachePolicyProps.Initializer"></a>

```typescript
import { NextjsCachePolicyProps } from 'cdk-nextjs-standalone'

const nextjsCachePolicyProps: NextjsCachePolicyProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsCachePolicyProps.property.imageCachePolicy">imageCachePolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.ICachePolicy</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsCachePolicyProps.property.serverCachePolicy">serverCachePolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.ICachePolicy</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsCachePolicyProps.property.staticCachePolicy">staticCachePolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.ICachePolicy</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsCachePolicyProps.property.staticClientMaxAgeDefault">staticClientMaxAgeDefault</a></code> | <code>aws-cdk-lib.Duration</code> | Cache-control max-age default for static assets (/_next/*). |

---

##### `imageCachePolicy`<sup>Optional</sup> <a name="imageCachePolicy" id="cdk-nextjs-standalone.NextjsCachePolicyProps.property.imageCachePolicy"></a>

```typescript
public readonly imageCachePolicy: ICachePolicy;
```

- *Type:* aws-cdk-lib.aws_cloudfront.ICachePolicy

---

##### `serverCachePolicy`<sup>Optional</sup> <a name="serverCachePolicy" id="cdk-nextjs-standalone.NextjsCachePolicyProps.property.serverCachePolicy"></a>

```typescript
public readonly serverCachePolicy: ICachePolicy;
```

- *Type:* aws-cdk-lib.aws_cloudfront.ICachePolicy

---

##### `staticCachePolicy`<sup>Optional</sup> <a name="staticCachePolicy" id="cdk-nextjs-standalone.NextjsCachePolicyProps.property.staticCachePolicy"></a>

```typescript
public readonly staticCachePolicy: ICachePolicy;
```

- *Type:* aws-cdk-lib.aws_cloudfront.ICachePolicy

---

##### `staticClientMaxAgeDefault`<sup>Optional</sup> <a name="staticClientMaxAgeDefault" id="cdk-nextjs-standalone.NextjsCachePolicyProps.property.staticClientMaxAgeDefault"></a>

```typescript
public readonly staticClientMaxAgeDefault: Duration;
```

- *Type:* aws-cdk-lib.Duration

Cache-control max-age default for static assets (/_next/*).

Default: 30 days.

---

### NextjsDefaultsProps <a name="NextjsDefaultsProps" id="cdk-nextjs-standalone.NextjsDefaultsProps"></a>

Defaults for created resources.

Why `any`? see https://github.com/aws/jsii/issues/2901

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsDefaultsProps.Initializer"></a>

```typescript
import { NextjsDefaultsProps } from 'cdk-nextjs-standalone'

const nextjsDefaultsProps: NextjsDefaultsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDefaultsProps.property.assetDeployment">assetDeployment</a></code> | <code>any</code> | Override static file deployment settings. |
| <code><a href="#cdk-nextjs-standalone.NextjsDefaultsProps.property.distribution">distribution</a></code> | <code>any</code> | Override CloudFront distribution settings. |
| <code><a href="#cdk-nextjs-standalone.NextjsDefaultsProps.property.lambda">lambda</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override server lambda function settings. |

---

##### `assetDeployment`<sup>Optional</sup> <a name="assetDeployment" id="cdk-nextjs-standalone.NextjsDefaultsProps.property.assetDeployment"></a>

```typescript
public readonly assetDeployment: any;
```

- *Type:* any

Override static file deployment settings.

---

##### `distribution`<sup>Optional</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsDefaultsProps.property.distribution"></a>

```typescript
public readonly distribution: any;
```

- *Type:* any

Override CloudFront distribution settings.

These properties should all be optional but cannot be due to a limitation in jsii.

---

##### `lambda`<sup>Optional</sup> <a name="lambda" id="cdk-nextjs-standalone.NextjsDefaultsProps.property.lambda"></a>

```typescript
public readonly lambda: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override server lambda function settings.

---

### NextjsDistributionCdkProps <a name="NextjsDistributionCdkProps" id="cdk-nextjs-standalone.NextjsDistributionCdkProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsDistributionCdkProps.Initializer"></a>

```typescript
import { NextjsDistributionCdkProps } from 'cdk-nextjs-standalone'

const nextjsDistributionCdkProps: NextjsDistributionCdkProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionCdkProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.DistributionProps</code> | Pass in a value to override the default settings this construct uses to create the CloudFront `Distribution` internally. |

---

##### `distribution`<sup>Optional</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsDistributionCdkProps.property.distribution"></a>

```typescript
public readonly distribution: DistributionProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.DistributionProps

Pass in a value to override the default settings this construct uses to create the CloudFront `Distribution` internally.

---

### NextjsDistributionProps <a name="NextjsDistributionProps" id="cdk-nextjs-standalone.NextjsDistributionProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsDistributionProps.Initializer"></a>

```typescript
import { NextjsDistributionProps } from 'cdk-nextjs-standalone'

const nextjsDistributionProps: NextjsDistributionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | Relative path to the directory where the NextJS project is located. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.buildCommand">buildCommand</a></code> | <code>string</code> | Optional value used to install NextJS node dependencies. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.buildPath">buildPath</a></code> | <code>string</code> | The directory to execute `npm run build` from. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.projectRoot">projectRoot</a></code> | <code>string</code> | Root of your project, if different from `nextjsPath`. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.sharpLayerArn">sharpLayerArn</a></code> | <code>string</code> | Optional arn for the sharp lambda layer. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.skipFullInvalidation">skipFullInvalidation</a></code> | <code>boolean</code> | By default all CloudFront cache will be invalidated on deployment. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.imageOptFunction">imageOptFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Lambda function to optimize images. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | Built NextJS app. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.serverFunction">serverFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Lambda function to route all non-static requests to. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.staticAssetsBucket">staticAssetsBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Bucket containing static assets. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.cachePolicies">cachePolicies</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsCachePolicyProps">NextjsCachePolicyProps</a></code> | Override the default CloudFront cache policies created internally. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.cdk">cdk</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDistributionCdkProps">NextjsDistributionCdkProps</a></code> | Overrides for created CDK resources. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.customDomain">customDomain</a></code> | <code>string \| <a href="#cdk-nextjs-standalone.NextjsDomainProps">NextjsDomainProps</a></code> | The customDomain for this website. Supports domains that are hosted either on [Route 53](https://aws.amazon.com/route53/) or externally. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.functionUrlAuthType">functionUrlAuthType</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionUrlAuthType</code> | Override lambda function url auth type. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.originRequestPolicies">originRequestPolicies</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsOriginRequestPolicyProps">NextjsOriginRequestPolicyProps</a></code> | Override the default CloudFront origin request policies created internally. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.stackPrefix">stackPrefix</a></code> | <code>string</code> | Optional value to prefix the edge function stack It defaults to "Nextjs". |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.stageName">stageName</a></code> | <code>string</code> | Include the name of your deployment stage if present. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsDistributionProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `buildCommand`<sup>Optional</sup> <a name="buildCommand" id="cdk-nextjs-standalone.NextjsDistributionProps.property.buildCommand"></a>

```typescript
public readonly buildCommand: string;
```

- *Type:* string
- *Default:* 'npx --yes open-next@2 build'

Optional value used to install NextJS node dependencies.

---

##### `buildPath`<sup>Optional</sup> <a name="buildPath" id="cdk-nextjs-standalone.NextjsDistributionProps.property.buildPath"></a>

```typescript
public readonly buildPath: string;
```

- *Type:* string

The directory to execute `npm run build` from.

By default, it is `nextjsPath`.
Can be overridden, particularly useful for monorepos where `build` is expected to run
at the root of the project.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsDistributionProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `projectRoot`<sup>Optional</sup> <a name="projectRoot" id="cdk-nextjs-standalone.NextjsDistributionProps.property.projectRoot"></a>

```typescript
public readonly projectRoot: string;
```

- *Type:* string

Root of your project, if different from `nextjsPath`.

Defaults to current working directory.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsDistributionProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `sharpLayerArn`<sup>Optional</sup> <a name="sharpLayerArn" id="cdk-nextjs-standalone.NextjsDistributionProps.property.sharpLayerArn"></a>

```typescript
public readonly sharpLayerArn: string;
```

- *Type:* string

Optional arn for the sharp lambda layer.

If omitted, the layer will be created.

---

##### `skipFullInvalidation`<sup>Optional</sup> <a name="skipFullInvalidation" id="cdk-nextjs-standalone.NextjsDistributionProps.property.skipFullInvalidation"></a>

```typescript
public readonly skipFullInvalidation: boolean;
```

- *Type:* boolean

By default all CloudFront cache will be invalidated on deployment.

This can be set to true to skip the full cache invalidation, which
could be important for some users.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsDistributionProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

##### `imageOptFunction`<sup>Required</sup> <a name="imageOptFunction" id="cdk-nextjs-standalone.NextjsDistributionProps.property.imageOptFunction"></a>

```typescript
public readonly imageOptFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Lambda function to optimize images.

Must be provided if you want to serve dynamic requests.

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsDistributionProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

Built NextJS app.

---

##### `serverFunction`<sup>Required</sup> <a name="serverFunction" id="cdk-nextjs-standalone.NextjsDistributionProps.property.serverFunction"></a>

```typescript
public readonly serverFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Lambda function to route all non-static requests to.

Must be provided if you want to serve dynamic requests.

---

##### `staticAssetsBucket`<sup>Required</sup> <a name="staticAssetsBucket" id="cdk-nextjs-standalone.NextjsDistributionProps.property.staticAssetsBucket"></a>

```typescript
public readonly staticAssetsBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Bucket containing static assets.

Must be provided if you want to serve static files.

---

##### `cachePolicies`<sup>Optional</sup> <a name="cachePolicies" id="cdk-nextjs-standalone.NextjsDistributionProps.property.cachePolicies"></a>

```typescript
public readonly cachePolicies: NextjsCachePolicyProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsCachePolicyProps">NextjsCachePolicyProps</a>

Override the default CloudFront cache policies created internally.

---

##### `cdk`<sup>Optional</sup> <a name="cdk" id="cdk-nextjs-standalone.NextjsDistributionProps.property.cdk"></a>

```typescript
public readonly cdk: NextjsDistributionCdkProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDistributionCdkProps">NextjsDistributionCdkProps</a>

Overrides for created CDK resources.

---

##### `customDomain`<sup>Optional</sup> <a name="customDomain" id="cdk-nextjs-standalone.NextjsDistributionProps.property.customDomain"></a>

```typescript
public readonly customDomain: string | NextjsDomainProps;
```

- *Type:* string | <a href="#cdk-nextjs-standalone.NextjsDomainProps">NextjsDomainProps</a>

The customDomain for this website. Supports domains that are hosted either on [Route 53](https://aws.amazon.com/route53/) or externally.

Note that you can also migrate externally hosted domains to Route 53 by
[following this guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html).

---

*Example*

```typescript
new NextjsDistribution(this, "Dist", {
  customDomain: "domain.com",
});

new NextjsDistribution(this, "Dist", {
  customDomain: {
    domainName: "domain.com",
    domainAlias: "www.domain.com",
    hostedZone: "domain.com"
  },
});
```


##### `functionUrlAuthType`<sup>Optional</sup> <a name="functionUrlAuthType" id="cdk-nextjs-standalone.NextjsDistributionProps.property.functionUrlAuthType"></a>

```typescript
public readonly functionUrlAuthType: FunctionUrlAuthType;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrlAuthType
- *Default:* "NONE"

Override lambda function url auth type.

---

##### `originRequestPolicies`<sup>Optional</sup> <a name="originRequestPolicies" id="cdk-nextjs-standalone.NextjsDistributionProps.property.originRequestPolicies"></a>

```typescript
public readonly originRequestPolicies: NextjsOriginRequestPolicyProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsOriginRequestPolicyProps">NextjsOriginRequestPolicyProps</a>

Override the default CloudFront origin request policies created internally.

---

##### `stackPrefix`<sup>Optional</sup> <a name="stackPrefix" id="cdk-nextjs-standalone.NextjsDistributionProps.property.stackPrefix"></a>

```typescript
public readonly stackPrefix: string;
```

- *Type:* string

Optional value to prefix the edge function stack It defaults to "Nextjs".

---

##### `stageName`<sup>Optional</sup> <a name="stageName" id="cdk-nextjs-standalone.NextjsDistributionProps.property.stageName"></a>

```typescript
public readonly stageName: string;
```

- *Type:* string

Include the name of your deployment stage if present.

Used to name the edge functions stack.
Required if using SST.

---

### NextjsDomainProps <a name="NextjsDomainProps" id="cdk-nextjs-standalone.NextjsDomainProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsDomainProps.Initializer"></a>

```typescript
import { NextjsDomainProps } from 'cdk-nextjs-standalone'

const nextjsDomainProps: NextjsDomainProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.domainName">domainName</a></code> | <code>string</code> | The domain to be assigned to the website URL (ie. domain.com). |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.alternateNames">alternateNames</a></code> | <code>string[]</code> | Specify additional names that should route to the Cloudfront Distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.certificate">certificate</a></code> | <code>aws-cdk-lib.aws_certificatemanager.ICertificate</code> | Import the certificate for the domain. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.domainAlias">domainAlias</a></code> | <code>string</code> | An alternative domain to be assigned to the website URL. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.hostedZone">hostedZone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | Import the underlying Route 53 hosted zone. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.isExternalDomain">isExternalDomain</a></code> | <code>boolean</code> | Set this option if the domain is not hosted on Amazon Route 53. |

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-nextjs-standalone.NextjsDomainProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

The domain to be assigned to the website URL (ie. domain.com).

Supports domains that are hosted either on [Route 53](https://aws.amazon.com/route53/) or externally.

---

##### `alternateNames`<sup>Optional</sup> <a name="alternateNames" id="cdk-nextjs-standalone.NextjsDomainProps.property.alternateNames"></a>

```typescript
public readonly alternateNames: string[];
```

- *Type:* string[]

Specify additional names that should route to the Cloudfront Distribution.

Note, certificates for these names will not be automatically generated so the `certificate` option must be specified.

---

##### `certificate`<sup>Optional</sup> <a name="certificate" id="cdk-nextjs-standalone.NextjsDomainProps.property.certificate"></a>

```typescript
public readonly certificate: ICertificate;
```

- *Type:* aws-cdk-lib.aws_certificatemanager.ICertificate

Import the certificate for the domain.

By default, SST will create a certificate with the domain name. The certificate will be created in the `us-east-1`(N. Virginia) region as required by AWS CloudFront.

Set this option if you have an existing certificate in the `us-east-1` region in AWS Certificate Manager you want to use.

---

##### `domainAlias`<sup>Optional</sup> <a name="domainAlias" id="cdk-nextjs-standalone.NextjsDomainProps.property.domainAlias"></a>

```typescript
public readonly domainAlias: string;
```

- *Type:* string

An alternative domain to be assigned to the website URL.

Visitors to the alias will be redirected to the main domain. (ie. `www.domain.com`).

Use this to create a `www.` version of your domain and redirect visitors to the root domain.

---

##### `hostedZone`<sup>Optional</sup> <a name="hostedZone" id="cdk-nextjs-standalone.NextjsDomainProps.property.hostedZone"></a>

```typescript
public readonly hostedZone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

Import the underlying Route 53 hosted zone.

---

##### `isExternalDomain`<sup>Optional</sup> <a name="isExternalDomain" id="cdk-nextjs-standalone.NextjsDomainProps.property.isExternalDomain"></a>

```typescript
public readonly isExternalDomain: boolean;
```

- *Type:* boolean

Set this option if the domain is not hosted on Amazon Route 53.

---

### NextjsImageProps <a name="NextjsImageProps" id="cdk-nextjs-standalone.NextjsImageProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsImageProps.Initializer"></a>

```typescript
import { NextjsImageProps } from 'cdk-nextjs-standalone'

const nextjsImageProps: NextjsImageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | Relative path to the directory where the NextJS project is located. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.buildCommand">buildCommand</a></code> | <code>string</code> | Optional value used to install NextJS node dependencies. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.buildPath">buildPath</a></code> | <code>string</code> | The directory to execute `npm run build` from. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.projectRoot">projectRoot</a></code> | <code>string</code> | Root of your project, if different from `nextjsPath`. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.sharpLayerArn">sharpLayerArn</a></code> | <code>string</code> | Optional arn for the sharp lambda layer. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.skipFullInvalidation">skipFullInvalidation</a></code> | <code>boolean</code> | By default all CloudFront cache will be invalidated on deployment. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket holding application images. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | The `NextjsBuild` instance representing the built Nextjs application. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.lambdaOptions">lambdaOptions</a></code> | <code>aws-cdk-lib.aws_lambda_nodejs.NodejsFunctionProps</code> | Override function properties. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsImageProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `buildCommand`<sup>Optional</sup> <a name="buildCommand" id="cdk-nextjs-standalone.NextjsImageProps.property.buildCommand"></a>

```typescript
public readonly buildCommand: string;
```

- *Type:* string
- *Default:* 'npx --yes open-next@2 build'

Optional value used to install NextJS node dependencies.

---

##### `buildPath`<sup>Optional</sup> <a name="buildPath" id="cdk-nextjs-standalone.NextjsImageProps.property.buildPath"></a>

```typescript
public readonly buildPath: string;
```

- *Type:* string

The directory to execute `npm run build` from.

By default, it is `nextjsPath`.
Can be overridden, particularly useful for monorepos where `build` is expected to run
at the root of the project.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsImageProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `projectRoot`<sup>Optional</sup> <a name="projectRoot" id="cdk-nextjs-standalone.NextjsImageProps.property.projectRoot"></a>

```typescript
public readonly projectRoot: string;
```

- *Type:* string

Root of your project, if different from `nextjsPath`.

Defaults to current working directory.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsImageProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `sharpLayerArn`<sup>Optional</sup> <a name="sharpLayerArn" id="cdk-nextjs-standalone.NextjsImageProps.property.sharpLayerArn"></a>

```typescript
public readonly sharpLayerArn: string;
```

- *Type:* string

Optional arn for the sharp lambda layer.

If omitted, the layer will be created.

---

##### `skipFullInvalidation`<sup>Optional</sup> <a name="skipFullInvalidation" id="cdk-nextjs-standalone.NextjsImageProps.property.skipFullInvalidation"></a>

```typescript
public readonly skipFullInvalidation: boolean;
```

- *Type:* boolean

By default all CloudFront cache will be invalidated on deployment.

This can be set to true to skip the full cache invalidation, which
could be important for some users.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsImageProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="cdk-nextjs-standalone.NextjsImageProps.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket holding application images.

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsImageProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

The `NextjsBuild` instance representing the built Nextjs application.

---

##### `lambdaOptions`<sup>Optional</sup> <a name="lambdaOptions" id="cdk-nextjs-standalone.NextjsImageProps.property.lambdaOptions"></a>

```typescript
public readonly lambdaOptions: NodejsFunctionProps;
```

- *Type:* aws-cdk-lib.aws_lambda_nodejs.NodejsFunctionProps

Override function properties.

---

### NextjsInvalidationProps <a name="NextjsInvalidationProps" id="cdk-nextjs-standalone.NextjsInvalidationProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsInvalidationProps.Initializer"></a>

```typescript
import { NextjsInvalidationProps } from 'cdk-nextjs-standalone'

const nextjsInvalidationProps: NextjsInvalidationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsInvalidationProps.property.dependencies">dependencies</a></code> | <code>constructs.Construct[]</code> | Constructs that should complete before invalidating CloudFront Distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsInvalidationProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.IDistribution</code> | CloudFront Distribution to invalidate. |

---

##### `dependencies`<sup>Required</sup> <a name="dependencies" id="cdk-nextjs-standalone.NextjsInvalidationProps.property.dependencies"></a>

```typescript
public readonly dependencies: Construct[];
```

- *Type:* constructs.Construct[]

Constructs that should complete before invalidating CloudFront Distribution.

Useful for assets that must be deployed/updated before invalidating.

---

##### `distribution`<sup>Required</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsInvalidationProps.property.distribution"></a>

```typescript
public readonly distribution: IDistribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IDistribution

CloudFront Distribution to invalidate.

---

### NextjsOriginRequestPolicyProps <a name="NextjsOriginRequestPolicyProps" id="cdk-nextjs-standalone.NextjsOriginRequestPolicyProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsOriginRequestPolicyProps.Initializer"></a>

```typescript
import { NextjsOriginRequestPolicyProps } from 'cdk-nextjs-standalone'

const nextjsOriginRequestPolicyProps: NextjsOriginRequestPolicyProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsOriginRequestPolicyProps.property.imageOptimizationOriginRequestPolicy">imageOptimizationOriginRequestPolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.IOriginRequestPolicy</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsOriginRequestPolicyProps.property.serverOriginRequestPolicy">serverOriginRequestPolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.IOriginRequestPolicy</code> | *No description.* |

---

##### `imageOptimizationOriginRequestPolicy`<sup>Optional</sup> <a name="imageOptimizationOriginRequestPolicy" id="cdk-nextjs-standalone.NextjsOriginRequestPolicyProps.property.imageOptimizationOriginRequestPolicy"></a>

```typescript
public readonly imageOptimizationOriginRequestPolicy: IOriginRequestPolicy;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IOriginRequestPolicy

---

##### `serverOriginRequestPolicy`<sup>Optional</sup> <a name="serverOriginRequestPolicy" id="cdk-nextjs-standalone.NextjsOriginRequestPolicyProps.property.serverOriginRequestPolicy"></a>

```typescript
public readonly serverOriginRequestPolicy: IOriginRequestPolicy;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IOriginRequestPolicy

---

### NextjsProps <a name="NextjsProps" id="cdk-nextjs-standalone.NextjsProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsProps.Initializer"></a>

```typescript
import { NextjsProps } from 'cdk-nextjs-standalone'

const nextjsProps: NextjsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | Relative path to the directory where the NextJS project is located. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.buildCommand">buildCommand</a></code> | <code>string</code> | Optional value used to install NextJS node dependencies. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.buildPath">buildPath</a></code> | <code>string</code> | The directory to execute `npm run build` from. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.projectRoot">projectRoot</a></code> | <code>string</code> | Root of your project, if different from `nextjsPath`. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.sharpLayerArn">sharpLayerArn</a></code> | <code>string</code> | Optional arn for the sharp lambda layer. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.skipFullInvalidation">skipFullInvalidation</a></code> | <code>boolean</code> | By default all CloudFront cache will be invalidated on deployment. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.defaults">defaults</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDefaultsProps">NextjsDefaultsProps</a></code> | Allows you to override defaults for the resources created by this construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.imageOptimizationBucket">imageOptimizationBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Optional S3 Bucket to use, defaults to assets bucket. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.skipBuild">skipBuild</a></code> | <code>boolean</code> | Skips running Next.js build. Useful if you want to deploy `Nextjs` but haven't made any changes to Next.js app code. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `buildCommand`<sup>Optional</sup> <a name="buildCommand" id="cdk-nextjs-standalone.NextjsProps.property.buildCommand"></a>

```typescript
public readonly buildCommand: string;
```

- *Type:* string
- *Default:* 'npx --yes open-next@2 build'

Optional value used to install NextJS node dependencies.

---

##### `buildPath`<sup>Optional</sup> <a name="buildPath" id="cdk-nextjs-standalone.NextjsProps.property.buildPath"></a>

```typescript
public readonly buildPath: string;
```

- *Type:* string

The directory to execute `npm run build` from.

By default, it is `nextjsPath`.
Can be overridden, particularly useful for monorepos where `build` is expected to run
at the root of the project.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `projectRoot`<sup>Optional</sup> <a name="projectRoot" id="cdk-nextjs-standalone.NextjsProps.property.projectRoot"></a>

```typescript
public readonly projectRoot: string;
```

- *Type:* string

Root of your project, if different from `nextjsPath`.

Defaults to current working directory.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `sharpLayerArn`<sup>Optional</sup> <a name="sharpLayerArn" id="cdk-nextjs-standalone.NextjsProps.property.sharpLayerArn"></a>

```typescript
public readonly sharpLayerArn: string;
```

- *Type:* string

Optional arn for the sharp lambda layer.

If omitted, the layer will be created.

---

##### `skipFullInvalidation`<sup>Optional</sup> <a name="skipFullInvalidation" id="cdk-nextjs-standalone.NextjsProps.property.skipFullInvalidation"></a>

```typescript
public readonly skipFullInvalidation: boolean;
```

- *Type:* boolean

By default all CloudFront cache will be invalidated on deployment.

This can be set to true to skip the full cache invalidation, which
could be important for some users.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

##### `defaults`<sup>Optional</sup> <a name="defaults" id="cdk-nextjs-standalone.NextjsProps.property.defaults"></a>

```typescript
public readonly defaults: NextjsDefaultsProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDefaultsProps">NextjsDefaultsProps</a>

Allows you to override defaults for the resources created by this construct.

---

##### `imageOptimizationBucket`<sup>Optional</sup> <a name="imageOptimizationBucket" id="cdk-nextjs-standalone.NextjsProps.property.imageOptimizationBucket"></a>

```typescript
public readonly imageOptimizationBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Optional S3 Bucket to use, defaults to assets bucket.

---

##### `skipBuild`<sup>Optional</sup> <a name="skipBuild" id="cdk-nextjs-standalone.NextjsProps.property.skipBuild"></a>

```typescript
public readonly skipBuild: boolean;
```

- *Type:* boolean
- *Default:* false

Skips running Next.js build. Useful if you want to deploy `Nextjs` but haven't made any changes to Next.js app code.

---

### NextjsRevalidationProps <a name="NextjsRevalidationProps" id="cdk-nextjs-standalone.NextjsRevalidationProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsRevalidationProps.Initializer"></a>

```typescript
import { NextjsRevalidationProps } from 'cdk-nextjs-standalone'

const nextjsRevalidationProps: NextjsRevalidationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | Relative path to the directory where the NextJS project is located. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.buildCommand">buildCommand</a></code> | <code>string</code> | Optional value used to install NextJS node dependencies. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.buildPath">buildPath</a></code> | <code>string</code> | The directory to execute `npm run build` from. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.projectRoot">projectRoot</a></code> | <code>string</code> | Root of your project, if different from `nextjsPath`. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.sharpLayerArn">sharpLayerArn</a></code> | <code>string</code> | Optional arn for the sharp lambda layer. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.skipFullInvalidation">skipFullInvalidation</a></code> | <code>boolean</code> | By default all CloudFront cache will be invalidated on deployment. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | The `NextjsBuild` instance representing the built Nextjs application. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.serverFunction">serverFunction</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsServer">NextjsServer</a></code> | The main NextJS server handler lambda function. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.lambdaOptions">lambdaOptions</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override function properties. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `buildCommand`<sup>Optional</sup> <a name="buildCommand" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.buildCommand"></a>

```typescript
public readonly buildCommand: string;
```

- *Type:* string
- *Default:* 'npx --yes open-next@2 build'

Optional value used to install NextJS node dependencies.

---

##### `buildPath`<sup>Optional</sup> <a name="buildPath" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.buildPath"></a>

```typescript
public readonly buildPath: string;
```

- *Type:* string

The directory to execute `npm run build` from.

By default, it is `nextjsPath`.
Can be overridden, particularly useful for monorepos where `build` is expected to run
at the root of the project.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `projectRoot`<sup>Optional</sup> <a name="projectRoot" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.projectRoot"></a>

```typescript
public readonly projectRoot: string;
```

- *Type:* string

Root of your project, if different from `nextjsPath`.

Defaults to current working directory.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `sharpLayerArn`<sup>Optional</sup> <a name="sharpLayerArn" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.sharpLayerArn"></a>

```typescript
public readonly sharpLayerArn: string;
```

- *Type:* string

Optional arn for the sharp lambda layer.

If omitted, the layer will be created.

---

##### `skipFullInvalidation`<sup>Optional</sup> <a name="skipFullInvalidation" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.skipFullInvalidation"></a>

```typescript
public readonly skipFullInvalidation: boolean;
```

- *Type:* boolean

By default all CloudFront cache will be invalidated on deployment.

This can be set to true to skip the full cache invalidation, which
could be important for some users.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

The `NextjsBuild` instance representing the built Nextjs application.

---

##### `serverFunction`<sup>Required</sup> <a name="serverFunction" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.serverFunction"></a>

```typescript
public readonly serverFunction: NextjsServer;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsServer">NextjsServer</a>

The main NextJS server handler lambda function.

---

##### `lambdaOptions`<sup>Optional</sup> <a name="lambdaOptions" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.lambdaOptions"></a>

```typescript
public readonly lambdaOptions: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override function properties.

---

### NextjsServerProps <a name="NextjsServerProps" id="cdk-nextjs-standalone.NextjsServerProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsServerProps.Initializer"></a>

```typescript
import { NextjsServerProps } from 'cdk-nextjs-standalone'

const nextjsServerProps: NextjsServerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | Relative path to the directory where the NextJS project is located. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.buildCommand">buildCommand</a></code> | <code>string</code> | Optional value used to install NextJS node dependencies. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.buildPath">buildPath</a></code> | <code>string</code> | The directory to execute `npm run build` from. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.projectRoot">projectRoot</a></code> | <code>string</code> | Root of your project, if different from `nextjsPath`. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.sharpLayerArn">sharpLayerArn</a></code> | <code>string</code> | Optional arn for the sharp lambda layer. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.skipFullInvalidation">skipFullInvalidation</a></code> | <code>boolean</code> | By default all CloudFront cache will be invalidated on deployment. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | Built nextJS application. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.staticAssetBucket">staticAssetBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Static asset bucket. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.lambda">lambda</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override function properties. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsServerProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `buildCommand`<sup>Optional</sup> <a name="buildCommand" id="cdk-nextjs-standalone.NextjsServerProps.property.buildCommand"></a>

```typescript
public readonly buildCommand: string;
```

- *Type:* string
- *Default:* 'npx --yes open-next@2 build'

Optional value used to install NextJS node dependencies.

---

##### `buildPath`<sup>Optional</sup> <a name="buildPath" id="cdk-nextjs-standalone.NextjsServerProps.property.buildPath"></a>

```typescript
public readonly buildPath: string;
```

- *Type:* string

The directory to execute `npm run build` from.

By default, it is `nextjsPath`.
Can be overridden, particularly useful for monorepos where `build` is expected to run
at the root of the project.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsServerProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `projectRoot`<sup>Optional</sup> <a name="projectRoot" id="cdk-nextjs-standalone.NextjsServerProps.property.projectRoot"></a>

```typescript
public readonly projectRoot: string;
```

- *Type:* string

Root of your project, if different from `nextjsPath`.

Defaults to current working directory.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsServerProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `sharpLayerArn`<sup>Optional</sup> <a name="sharpLayerArn" id="cdk-nextjs-standalone.NextjsServerProps.property.sharpLayerArn"></a>

```typescript
public readonly sharpLayerArn: string;
```

- *Type:* string

Optional arn for the sharp lambda layer.

If omitted, the layer will be created.

---

##### `skipFullInvalidation`<sup>Optional</sup> <a name="skipFullInvalidation" id="cdk-nextjs-standalone.NextjsServerProps.property.skipFullInvalidation"></a>

```typescript
public readonly skipFullInvalidation: boolean;
```

- *Type:* boolean

By default all CloudFront cache will be invalidated on deployment.

This can be set to true to skip the full cache invalidation, which
could be important for some users.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsServerProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsServerProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

Built nextJS application.

---

##### `staticAssetBucket`<sup>Required</sup> <a name="staticAssetBucket" id="cdk-nextjs-standalone.NextjsServerProps.property.staticAssetBucket"></a>

```typescript
public readonly staticAssetBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Static asset bucket.

Function needs bucket to read from cache.

---

##### `lambda`<sup>Optional</sup> <a name="lambda" id="cdk-nextjs-standalone.NextjsServerProps.property.lambda"></a>

```typescript
public readonly lambda: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override function properties.

---

### NextjsStaticAssetsProps <a name="NextjsStaticAssetsProps" id="cdk-nextjs-standalone.NextjsStaticAssetsProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsStaticAssetsProps.Initializer"></a>

```typescript
import { NextjsStaticAssetsProps } from 'cdk-nextjs-standalone'

const nextjsStaticAssetsProps: NextjsStaticAssetsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetsProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | The `NextjsBuild` instance representing the built Nextjs application. |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetsProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Define your own bucket to store static assets. |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetsProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsStaticAssetsProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

The `NextjsBuild` instance representing the built Nextjs application.

---

##### `bucket`<sup>Optional</sup> <a name="bucket" id="cdk-nextjs-standalone.NextjsStaticAssetsProps.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Define your own bucket to store static assets.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsStaticAssetsProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---



