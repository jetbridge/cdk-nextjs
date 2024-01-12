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

## Examples

See example CDK apps [here](./examples) including:
- App Router
- Pages Router
- App/Pages Router
- High Security
- Multiple Sites
To deploy an example, make sure to read the [README.md](./examples/README.md)

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

See [Contribute](./docs/contribute.md).

## Breaking changes

See [Major Changes](./docs/major-changes.md).

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
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.url">url</a></code> | <code>string</code> | URL of Next.js App. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.distribution">distribution</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDistribution">NextjsDistribution</a></code> | CloudFront distribution. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.imageOptimizationFunction">imageOptimizationFunction</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsImage">NextjsImage</a></code> | The image optimization handler lambda function. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.imageOptimizationLambdaFunctionUrl">imageOptimizationLambdaFunctionUrl</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionUrl</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.lambdaFunctionUrl">lambdaFunctionUrl</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionUrl</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | Built NextJS project output. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.revalidation">revalidation</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsRevalidation">NextjsRevalidation</a></code> | Revalidation handler and queue. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.serverFunction">serverFunction</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsServer">NextjsServer</a></code> | The main NextJS server handler lambda function. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.staticAssets">staticAssets</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsStaticAssets">NextjsStaticAssets</a></code> | Asset deployment to S3. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.domain">domain</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDomain">NextjsDomain</a></code> | Optional Route53 Hosted Zone, ACM Certificate, and Route53 DNS Records. |

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

##### `domain`<sup>Optional</sup> <a name="domain" id="cdk-nextjs-standalone.Nextjs.property.domain"></a>

```typescript
public readonly domain: NextjsDomain;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDomain">NextjsDomain</a>

Optional Route53 Hosted Zone, ACM Certificate, and Route53 DNS Records.

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
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.nextRevalidateDynamoDBProviderFnDir">nextRevalidateDynamoDBProviderFnDir</a></code> | <code>string</code> | Contains function for inserting revalidation items into the table. |
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

##### `nextRevalidateDynamoDBProviderFnDir`<sup>Required</sup> <a name="nextRevalidateDynamoDBProviderFnDir" id="cdk-nextjs-standalone.NextjsBuild.property.nextRevalidateDynamoDBProviderFnDir"></a>

```typescript
public readonly nextRevalidateDynamoDBProviderFnDir: string;
```

- *Type:* string

Contains function for inserting revalidation items into the table.

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
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.distributionDomain">distributionDomain</a></code> | <code>string</code> | The domain name of the internally created CloudFront Distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.distributionId">distributionId</a></code> | <code>string</code> | The ID of the internally created CloudFront Distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.url">url</a></code> | <code>string</code> | The CloudFront URL of the website. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.Distribution</code> | The internally created CloudFront `Distribution` instance. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsDistribution.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

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

##### `distribution`<sup>Required</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsDistribution.property.distribution"></a>

```typescript
public readonly distribution: Distribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.Distribution

The internally created CloudFront `Distribution` instance.

---


### NextjsDomain <a name="NextjsDomain" id="cdk-nextjs-standalone.NextjsDomain"></a>

Use a custom domain with `Nextjs`.

Requires a Route53 hosted zone to have been
created within the same AWS account. For DNS setups where you cannot use a
Route53 hosted zone in the same AWS account, use the `overrides.nextjsDistribution.distributionProps`
prop of {@link NextjsProps}.

See {@link NextjsDomainProps} TS Doc comments for detailed docs on how to customize.
This construct is helpful to user to not have to worry about interdependencies
between Route53 Hosted Zone, CloudFront Distribution, and Route53 Hosted Zone Records.

Note, if you're using another service for domain name registration, you can
still create a Route53 hosted zone. Please see [Configuring DNS Delegation from
CloudFlare to AWS Route53](https://veducate.co.uk/dns-delegation-route53/)
as an example.

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextjsDomain.Initializer"></a>

```typescript
import { NextjsDomain } from 'cdk-nextjs-standalone'

new NextjsDomain(scope: Construct, id: string, props: NextjsDomainProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDomain.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDomain.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDomain.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDomainProps">NextjsDomainProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsDomain.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsDomain.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsDomain.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDomainProps">NextjsDomainProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDomain.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomain.createDnsRecords">createDnsRecords</a></code> | Creates DNS records (A and AAAA) records for {@link NextjsDomainProps.domainName} and {@link NextjsDomainProps.alternateNames} if defined. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextjsDomain.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `createDnsRecords` <a name="createDnsRecords" id="cdk-nextjs-standalone.NextjsDomain.createDnsRecords"></a>

```typescript
public createDnsRecords(distribution: Distribution): void
```

Creates DNS records (A and AAAA) records for {@link NextjsDomainProps.domainName} and {@link NextjsDomainProps.alternateNames} if defined.

###### `distribution`<sup>Required</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsDomain.createDnsRecords.parameter.distribution"></a>

- *Type:* aws-cdk-lib.aws_cloudfront.Distribution

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDomain.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextjsDomain.isConstruct"></a>

```typescript
import { NextjsDomain } from 'cdk-nextjs-standalone'

NextjsDomain.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsDomain.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDomain.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomain.property.domainNames">domainNames</a></code> | <code>string[]</code> | Concatentation of {@link NextjsDomainProps.domainName} and {@link NextjsDomainProps.alternateNames}. Used in instantiation of CloudFront Distribution in NextjsDistribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomain.property.certificate">certificate</a></code> | <code>aws-cdk-lib.aws_certificatemanager.ICertificate</code> | ACM Certificate. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomain.property.hostedZone">hostedZone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | Route53 Hosted Zone. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsDomain.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `domainNames`<sup>Required</sup> <a name="domainNames" id="cdk-nextjs-standalone.NextjsDomain.property.domainNames"></a>

```typescript
public readonly domainNames: string[];
```

- *Type:* string[]

Concatentation of {@link NextjsDomainProps.domainName} and {@link NextjsDomainProps.alternateNames}. Used in instantiation of CloudFront Distribution in NextjsDistribution.

---

##### `certificate`<sup>Required</sup> <a name="certificate" id="cdk-nextjs-standalone.NextjsDomain.property.certificate"></a>

```typescript
public readonly certificate: ICertificate;
```

- *Type:* aws-cdk-lib.aws_certificatemanager.ICertificate

ACM Certificate.

---

##### `hostedZone`<sup>Required</sup> <a name="hostedZone" id="cdk-nextjs-standalone.NextjsDomain.property.hostedZone"></a>

```typescript
public readonly hostedZone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

Route53 Hosted Zone.

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
| <code><a href="#cdk-nextjs-standalone.NextjsImage.grantInvokeCompositePrincipal">grantInvokeCompositePrincipal</a></code> | Grant multiple principals the ability to invoke this Lambda via CompositePrincipal. |
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

##### `grantInvokeCompositePrincipal` <a name="grantInvokeCompositePrincipal" id="cdk-nextjs-standalone.NextjsImage.grantInvokeCompositePrincipal"></a>

```typescript
public grantInvokeCompositePrincipal(compositePrincipal: CompositePrincipal): Grant[]
```

Grant multiple principals the ability to invoke this Lambda via CompositePrincipal.

###### `compositePrincipal`<sup>Required</sup> <a name="compositePrincipal" id="cdk-nextjs-standalone.NextjsImage.grantInvokeCompositePrincipal.parameter.compositePrincipal"></a>

- *Type:* aws-cdk-lib.aws_iam.CompositePrincipal

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

Builds the system for revalidating Next.js resources. This includes a Lambda function handler and queue system as well as the DynamoDB table and provider function.

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
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.property.queue">queue</a></code> | <code>aws-cdk-lib.aws_sqs.Queue</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.property.queueFunction">queueFunction</a></code> | <code>aws-cdk-lib.aws_lambda.Function</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.property.table">table</a></code> | <code>aws-cdk-lib.aws_dynamodb.TableV2</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidation.property.tableFunction">tableFunction</a></code> | <code>aws-cdk-lib.aws_lambda.Function</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsRevalidation.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `queue`<sup>Required</sup> <a name="queue" id="cdk-nextjs-standalone.NextjsRevalidation.property.queue"></a>

```typescript
public readonly queue: Queue;
```

- *Type:* aws-cdk-lib.aws_sqs.Queue

---

##### `queueFunction`<sup>Required</sup> <a name="queueFunction" id="cdk-nextjs-standalone.NextjsRevalidation.property.queueFunction"></a>

```typescript
public readonly queueFunction: Function;
```

- *Type:* aws-cdk-lib.aws_lambda.Function

---

##### `table`<sup>Required</sup> <a name="table" id="cdk-nextjs-standalone.NextjsRevalidation.property.table"></a>

```typescript
public readonly table: TableV2;
```

- *Type:* aws-cdk-lib.aws_dynamodb.TableV2

---

##### `tableFunction`<sup>Optional</sup> <a name="tableFunction" id="cdk-nextjs-standalone.NextjsRevalidation.property.tableFunction"></a>

```typescript
public readonly tableFunction: Function;
```

- *Type:* aws-cdk-lib.aws_lambda.Function

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

### NextjsBucketDeploymentOverrides <a name="NextjsBucketDeploymentOverrides" id="cdk-nextjs-standalone.NextjsBucketDeploymentOverrides"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsBucketDeploymentOverrides.Initializer"></a>

```typescript
import { NextjsBucketDeploymentOverrides } from 'cdk-nextjs-standalone'

const nextjsBucketDeploymentOverrides: NextjsBucketDeploymentOverrides = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentOverrides.property.customResourceProps">customResourceProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalCustomResourceProps">OptionalCustomResourceProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentOverrides.property.functionProps">functionProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps">OptionalFunctionProps</a></code> | *No description.* |

---

##### `customResourceProps`<sup>Optional</sup> <a name="customResourceProps" id="cdk-nextjs-standalone.NextjsBucketDeploymentOverrides.property.customResourceProps"></a>

```typescript
public readonly customResourceProps: OptionalCustomResourceProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalCustomResourceProps">OptionalCustomResourceProps</a>

---

##### `functionProps`<sup>Optional</sup> <a name="functionProps" id="cdk-nextjs-standalone.NextjsBucketDeploymentOverrides.property.functionProps"></a>

```typescript
public readonly functionProps: OptionalFunctionProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalFunctionProps">OptionalFunctionProps</a>

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
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentOverrides">NextjsBucketDeploymentOverrides</a></code> | Override props for every construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.prune">prune</a></code> | <code>boolean</code> | If `true`, then delete old objects in `destinationBucket`/`destinationKeyPrefix` **after** uploading new objects. Only applies if `zip` is `false`. |
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

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsBucketDeploymentOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBucketDeploymentOverrides">NextjsBucketDeploymentOverrides</a>

Override props for every construct.

---

##### `prune`<sup>Optional</sup> <a name="prune" id="cdk-nextjs-standalone.NextjsBucketDeploymentProps.property.prune"></a>

```typescript
public readonly prune: boolean;
```

- *Type:* boolean
- *Default:* true

If `true`, then delete old objects in `destinationBucket`/`destinationKeyPrefix` **after** uploading new objects. Only applies if `zip` is `false`.

Old objects are determined by listing objects
in bucket before creating new objects and finding the objects that aren't in
the new objects.

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
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.buildCommand">buildCommand</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.buildPath">buildPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.quiet">quiet</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.skipBuild">skipBuild</a></code> | <code>boolean</code> | *No description.* |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsBuildProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

> [{@link NextjsProps.nextjsPath }]({@link NextjsProps.nextjsPath })

---

##### `buildCommand`<sup>Optional</sup> <a name="buildCommand" id="cdk-nextjs-standalone.NextjsBuildProps.property.buildCommand"></a>

```typescript
public readonly buildCommand: string;
```

- *Type:* string

> [{@link NextjsProps.buildCommand }]({@link NextjsProps.buildCommand })

---

##### `buildPath`<sup>Optional</sup> <a name="buildPath" id="cdk-nextjs-standalone.NextjsBuildProps.property.buildPath"></a>

```typescript
public readonly buildPath: string;
```

- *Type:* string

> [{@link NextjsProps.buildPath }]({@link NextjsProps.buildPath })

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsBuildProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

> [{@link NextjsProps.environment }]({@link NextjsProps.environment })

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsBuildProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

> [{@link NextjsProps.quiet }]({@link NextjsProps.quiet })

---

##### `skipBuild`<sup>Optional</sup> <a name="skipBuild" id="cdk-nextjs-standalone.NextjsBuildProps.property.skipBuild"></a>

```typescript
public readonly skipBuild: boolean;
```

- *Type:* boolean

> [{@link NextjsProps.skipBuild }]({@link NextjsProps.skipBuild })

---

### NextjsConstructOverrides <a name="NextjsConstructOverrides" id="cdk-nextjs-standalone.NextjsConstructOverrides"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsConstructOverrides.Initializer"></a>

```typescript
import { NextjsConstructOverrides } from 'cdk-nextjs-standalone'

const nextjsConstructOverrides: NextjsConstructOverrides = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsBuildProps">nextjsBuildProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalNextjsBuildProps">OptionalNextjsBuildProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsDistributionProps">nextjsDistributionProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps">OptionalNextjsDistributionProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsDomainProps">nextjsDomainProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalNextjsDomainProps">OptionalNextjsDomainProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsImageProps">nextjsImageProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalNextjsImageProps">OptionalNextjsImageProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsInvalidationProps">nextjsInvalidationProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalNextjsInvalidationProps">OptionalNextjsInvalidationProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsRevalidationProps">nextjsRevalidationProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalNextjsRevalidationProps">OptionalNextjsRevalidationProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsServerProps">nextjsServerProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalNextjsServerProps">OptionalNextjsServerProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsStaticAssetsProps">nextjsStaticAssetsProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps">OptionalNextjsStaticAssetsProps</a></code> | *No description.* |

---

##### `nextjsBuildProps`<sup>Optional</sup> <a name="nextjsBuildProps" id="cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsBuildProps"></a>

```typescript
public readonly nextjsBuildProps: OptionalNextjsBuildProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalNextjsBuildProps">OptionalNextjsBuildProps</a>

---

##### `nextjsDistributionProps`<sup>Optional</sup> <a name="nextjsDistributionProps" id="cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsDistributionProps"></a>

```typescript
public readonly nextjsDistributionProps: OptionalNextjsDistributionProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps">OptionalNextjsDistributionProps</a>

---

##### `nextjsDomainProps`<sup>Optional</sup> <a name="nextjsDomainProps" id="cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsDomainProps"></a>

```typescript
public readonly nextjsDomainProps: OptionalNextjsDomainProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalNextjsDomainProps">OptionalNextjsDomainProps</a>

---

##### `nextjsImageProps`<sup>Optional</sup> <a name="nextjsImageProps" id="cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsImageProps"></a>

```typescript
public readonly nextjsImageProps: OptionalNextjsImageProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalNextjsImageProps">OptionalNextjsImageProps</a>

---

##### `nextjsInvalidationProps`<sup>Optional</sup> <a name="nextjsInvalidationProps" id="cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsInvalidationProps"></a>

```typescript
public readonly nextjsInvalidationProps: OptionalNextjsInvalidationProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalNextjsInvalidationProps">OptionalNextjsInvalidationProps</a>

---

##### `nextjsRevalidationProps`<sup>Optional</sup> <a name="nextjsRevalidationProps" id="cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsRevalidationProps"></a>

```typescript
public readonly nextjsRevalidationProps: OptionalNextjsRevalidationProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalNextjsRevalidationProps">OptionalNextjsRevalidationProps</a>

---

##### `nextjsServerProps`<sup>Optional</sup> <a name="nextjsServerProps" id="cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsServerProps"></a>

```typescript
public readonly nextjsServerProps: OptionalNextjsServerProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalNextjsServerProps">OptionalNextjsServerProps</a>

---

##### `nextjsStaticAssetsProps`<sup>Optional</sup> <a name="nextjsStaticAssetsProps" id="cdk-nextjs-standalone.NextjsConstructOverrides.property.nextjsStaticAssetsProps"></a>

```typescript
public readonly nextjsStaticAssetsProps: OptionalNextjsStaticAssetsProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps">OptionalNextjsStaticAssetsProps</a>

---

### NextjsDistributionOverrides <a name="NextjsDistributionOverrides" id="cdk-nextjs-standalone.NextjsDistributionOverrides"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsDistributionOverrides.Initializer"></a>

```typescript
import { NextjsDistributionOverrides } from 'cdk-nextjs-standalone'

const nextjsDistributionOverrides: NextjsDistributionOverrides = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.cloudFrontFunctionProps">cloudFrontFunctionProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalCloudFrontFunctionProps">OptionalCloudFrontFunctionProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.distributionProps">distributionProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps">OptionalDistributionProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.edgeFunctionProps">edgeFunctionProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps">OptionalEdgeFunctionProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.imageBehaviorOptions">imageBehaviorOptions</a></code> | <code>aws-cdk-lib.aws_cloudfront.AddBehaviorOptions</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.imageCachePolicyProps">imageCachePolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.CachePolicyProps</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.imageHttpOriginProps">imageHttpOriginProps</a></code> | <code>aws-cdk-lib.aws_cloudfront_origins.HttpOriginProps</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.imageResponseHeadersPolicyProps">imageResponseHeadersPolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.ResponseHeadersPolicyProps</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.s3OriginProps">s3OriginProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalS3OriginProps">OptionalS3OriginProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.serverBehaviorOptions">serverBehaviorOptions</a></code> | <code>aws-cdk-lib.aws_cloudfront.AddBehaviorOptions</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.serverCachePolicyProps">serverCachePolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.CachePolicyProps</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.serverHttpOriginProps">serverHttpOriginProps</a></code> | <code>aws-cdk-lib.aws_cloudfront_origins.HttpOriginProps</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.serverResponseHeadersPolicyProps">serverResponseHeadersPolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.ResponseHeadersPolicyProps</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.staticBehaviorOptions">staticBehaviorOptions</a></code> | <code>aws-cdk-lib.aws_cloudfront.AddBehaviorOptions</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides.property.staticResponseHeadersPolicyProps">staticResponseHeadersPolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.ResponseHeadersPolicyProps</code> | *No description.* |

---

##### `cloudFrontFunctionProps`<sup>Optional</sup> <a name="cloudFrontFunctionProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.cloudFrontFunctionProps"></a>

```typescript
public readonly cloudFrontFunctionProps: OptionalCloudFrontFunctionProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalCloudFrontFunctionProps">OptionalCloudFrontFunctionProps</a>

---

##### `distributionProps`<sup>Optional</sup> <a name="distributionProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.distributionProps"></a>

```typescript
public readonly distributionProps: OptionalDistributionProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalDistributionProps">OptionalDistributionProps</a>

---

##### `edgeFunctionProps`<sup>Optional</sup> <a name="edgeFunctionProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.edgeFunctionProps"></a>

```typescript
public readonly edgeFunctionProps: OptionalEdgeFunctionProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps">OptionalEdgeFunctionProps</a>

---

##### `imageBehaviorOptions`<sup>Optional</sup> <a name="imageBehaviorOptions" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.imageBehaviorOptions"></a>

```typescript
public readonly imageBehaviorOptions: AddBehaviorOptions;
```

- *Type:* aws-cdk-lib.aws_cloudfront.AddBehaviorOptions

---

##### `imageCachePolicyProps`<sup>Optional</sup> <a name="imageCachePolicyProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.imageCachePolicyProps"></a>

```typescript
public readonly imageCachePolicyProps: CachePolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.CachePolicyProps

---

##### `imageHttpOriginProps`<sup>Optional</sup> <a name="imageHttpOriginProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.imageHttpOriginProps"></a>

```typescript
public readonly imageHttpOriginProps: HttpOriginProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront_origins.HttpOriginProps

---

##### `imageResponseHeadersPolicyProps`<sup>Optional</sup> <a name="imageResponseHeadersPolicyProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.imageResponseHeadersPolicyProps"></a>

```typescript
public readonly imageResponseHeadersPolicyProps: ResponseHeadersPolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.ResponseHeadersPolicyProps

---

##### `s3OriginProps`<sup>Optional</sup> <a name="s3OriginProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.s3OriginProps"></a>

```typescript
public readonly s3OriginProps: OptionalS3OriginProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalS3OriginProps">OptionalS3OriginProps</a>

---

##### `serverBehaviorOptions`<sup>Optional</sup> <a name="serverBehaviorOptions" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.serverBehaviorOptions"></a>

```typescript
public readonly serverBehaviorOptions: AddBehaviorOptions;
```

- *Type:* aws-cdk-lib.aws_cloudfront.AddBehaviorOptions

---

##### `serverCachePolicyProps`<sup>Optional</sup> <a name="serverCachePolicyProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.serverCachePolicyProps"></a>

```typescript
public readonly serverCachePolicyProps: CachePolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.CachePolicyProps

---

##### `serverHttpOriginProps`<sup>Optional</sup> <a name="serverHttpOriginProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.serverHttpOriginProps"></a>

```typescript
public readonly serverHttpOriginProps: HttpOriginProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront_origins.HttpOriginProps

---

##### `serverResponseHeadersPolicyProps`<sup>Optional</sup> <a name="serverResponseHeadersPolicyProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.serverResponseHeadersPolicyProps"></a>

```typescript
public readonly serverResponseHeadersPolicyProps: ResponseHeadersPolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.ResponseHeadersPolicyProps

---

##### `staticBehaviorOptions`<sup>Optional</sup> <a name="staticBehaviorOptions" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.staticBehaviorOptions"></a>

```typescript
public readonly staticBehaviorOptions: AddBehaviorOptions;
```

- *Type:* aws-cdk-lib.aws_cloudfront.AddBehaviorOptions

---

##### `staticResponseHeadersPolicyProps`<sup>Optional</sup> <a name="staticResponseHeadersPolicyProps" id="cdk-nextjs-standalone.NextjsDistributionOverrides.property.staticResponseHeadersPolicyProps"></a>

```typescript
public readonly staticResponseHeadersPolicyProps: ResponseHeadersPolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.ResponseHeadersPolicyProps

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
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.imageOptFunction">imageOptFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Lambda function to optimize images. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.serverFunction">serverFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Lambda function to route all non-static requests to. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.staticAssetsBucket">staticAssetsBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Bucket containing static assets. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.basePath">basePath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.Distribution</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.functionUrlAuthType">functionUrlAuthType</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionUrlAuthType</code> | Override lambda function url auth type. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.nextDomain">nextDomain</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDomain">NextjsDomain</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides">NextjsDistributionOverrides</a></code> | Override props for every construct. |

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

> [{@link NextjsBuild }]({@link NextjsBuild })

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsDistributionProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

> [{@link NextjsProps.nextjsPath }]({@link NextjsProps.nextjsPath })

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

##### `basePath`<sup>Optional</sup> <a name="basePath" id="cdk-nextjs-standalone.NextjsDistributionProps.property.basePath"></a>

```typescript
public readonly basePath: string;
```

- *Type:* string

> [{@link NextjsProps.basePath }]({@link NextjsProps.basePath })

---

##### `distribution`<sup>Optional</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsDistributionProps.property.distribution"></a>

```typescript
public readonly distribution: Distribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.Distribution

> [{@link NextjsProps.distribution }]({@link NextjsProps.distribution })

---

##### `functionUrlAuthType`<sup>Optional</sup> <a name="functionUrlAuthType" id="cdk-nextjs-standalone.NextjsDistributionProps.property.functionUrlAuthType"></a>

```typescript
public readonly functionUrlAuthType: FunctionUrlAuthType;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrlAuthType
- *Default:* "NONE"

Override lambda function url auth type.

---

##### `nextDomain`<sup>Optional</sup> <a name="nextDomain" id="cdk-nextjs-standalone.NextjsDistributionProps.property.nextDomain"></a>

```typescript
public readonly nextDomain: NextjsDomain;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDomain">NextjsDomain</a>

> [{@link NextjsDomain }]({@link NextjsDomain })

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.NextjsDistributionProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsDistributionOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDistributionOverrides">NextjsDistributionOverrides</a>

Override props for every construct.

---

### NextjsDomainOverrides <a name="NextjsDomainOverrides" id="cdk-nextjs-standalone.NextjsDomainOverrides"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsDomainOverrides.Initializer"></a>

```typescript
import { NextjsDomainOverrides } from 'cdk-nextjs-standalone'

const nextjsDomainOverrides: NextjsDomainOverrides = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainOverrides.property.aaaaRecordProps">aaaaRecordProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalAaaaRecordProps">OptionalAaaaRecordProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainOverrides.property.aRecordProps">aRecordProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalARecordProps">OptionalARecordProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainOverrides.property.certificateProps">certificateProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalCertificateProps">OptionalCertificateProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainOverrides.property.hostedZoneProviderProps">hostedZoneProviderProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalHostedZoneProviderProps">OptionalHostedZoneProviderProps</a></code> | *No description.* |

---

##### `aaaaRecordProps`<sup>Optional</sup> <a name="aaaaRecordProps" id="cdk-nextjs-standalone.NextjsDomainOverrides.property.aaaaRecordProps"></a>

```typescript
public readonly aaaaRecordProps: OptionalAaaaRecordProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalAaaaRecordProps">OptionalAaaaRecordProps</a>

---

##### `aRecordProps`<sup>Optional</sup> <a name="aRecordProps" id="cdk-nextjs-standalone.NextjsDomainOverrides.property.aRecordProps"></a>

```typescript
public readonly aRecordProps: OptionalARecordProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalARecordProps">OptionalARecordProps</a>

---

##### `certificateProps`<sup>Optional</sup> <a name="certificateProps" id="cdk-nextjs-standalone.NextjsDomainOverrides.property.certificateProps"></a>

```typescript
public readonly certificateProps: OptionalCertificateProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalCertificateProps">OptionalCertificateProps</a>

---

##### `hostedZoneProviderProps`<sup>Optional</sup> <a name="hostedZoneProviderProps" id="cdk-nextjs-standalone.NextjsDomainOverrides.property.hostedZoneProviderProps"></a>

```typescript
public readonly hostedZoneProviderProps: OptionalHostedZoneProviderProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalHostedZoneProviderProps">OptionalHostedZoneProviderProps</a>

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
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.domainName">domainName</a></code> | <code>string</code> | An easy to remember address of your website. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.alternateNames">alternateNames</a></code> | <code>string[]</code> | Alternate domain names that should route to the Cloudfront Distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.certificate">certificate</a></code> | <code>aws-cdk-lib.aws_certificatemanager.ICertificate</code> | If this prop is `undefined` then an ACM `Certificate` will be created based on {@link NextjsDomainProps.domainName} with DNS Validation. This prop allows you to control the TLS/SSL certificate created. The certificate you create must be in the `us-east-1` (N. Virginia) region as required by AWS CloudFront. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.certificateDomainName">certificateDomainName</a></code> | <code>string</code> | The domain name used in this construct when creating an ACM `Certificate`. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.hostedZone">hostedZone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | You must create the hosted zone out-of-band. |
| <code><a href="#cdk-nextjs-standalone.NextjsDomainProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDomainOverrides">NextjsDomainOverrides</a></code> | Override props for every construct. |

---

##### `domainName`<sup>Required</sup> <a name="domainName" id="cdk-nextjs-standalone.NextjsDomainProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

An easy to remember address of your website.

Only supports domains hosted
on [Route 53](https://aws.amazon.com/route53/). Used as `domainName` for
ACM `Certificate` if {@link NextjsDomainProps.certificate} and
{@link NextjsDomainProps.certificateDomainName} are `undefined`.

---

*Example*

```typescript
"example.com"
```


##### `alternateNames`<sup>Optional</sup> <a name="alternateNames" id="cdk-nextjs-standalone.NextjsDomainProps.property.alternateNames"></a>

```typescript
public readonly alternateNames: string[];
```

- *Type:* string[]

Alternate domain names that should route to the Cloudfront Distribution.

For example, if you specificied `"example.com"` as your {@link NextjsDomainProps.domainName},
you could specify `["www.example.com", "api.example.com"]`.
Learn more about the [requirements](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html#alternate-domain-names-requirements)
and [restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html#alternate-domain-names-restrictions)
for using alternate domain names with CloudFront.

Note, in order to use alternate domain names, they must be covered by your
certificate. By default, the certificate created in this construct only covers
the {@link NextjsDomainProps.domainName}. Therefore, you'll need to specify
a wildcard domain name like `"*.example.com"` with {@link NextjsDomainProps.certificateDomainName}
so that this construct will create the certificate the covers the alternate
domain names. Otherwise, you can use {@link NextjsDomainProps.certificate}
to create the certificate yourself where you'll need to ensure it has a
wildcard or uses subject alternative names including the
alternative names specified here.

---

*Example*

```typescript
["www.example.com", "api.example.com"]
```


##### `certificate`<sup>Optional</sup> <a name="certificate" id="cdk-nextjs-standalone.NextjsDomainProps.property.certificate"></a>

```typescript
public readonly certificate: ICertificate;
```

- *Type:* aws-cdk-lib.aws_certificatemanager.ICertificate

If this prop is `undefined` then an ACM `Certificate` will be created based on {@link NextjsDomainProps.domainName} with DNS Validation. This prop allows you to control the TLS/SSL certificate created. The certificate you create must be in the `us-east-1` (N. Virginia) region as required by AWS CloudFront.

Set this option if you have an existing certificate in the `us-east-1` region in AWS Certificate Manager you want to use.

---

##### `certificateDomainName`<sup>Optional</sup> <a name="certificateDomainName" id="cdk-nextjs-standalone.NextjsDomainProps.property.certificateDomainName"></a>

```typescript
public readonly certificateDomainName: string;
```

- *Type:* string

The domain name used in this construct when creating an ACM `Certificate`.

Useful
when passing {@link NextjsDomainProps.alternateNames} and you need to specify
a wildcard domain like "*.example.com". If `undefined`, then {@link NextjsDomainProps.domainName}
will be used.

If {@link NextjsDomainProps.certificate} is passed, then this prop is ignored.

---

##### `hostedZone`<sup>Optional</sup> <a name="hostedZone" id="cdk-nextjs-standalone.NextjsDomainProps.property.hostedZone"></a>

```typescript
public readonly hostedZone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

You must create the hosted zone out-of-band.

You can lookup the hosted zone outside this construct and pass it in via this prop.
Alternatively if this prop is `undefined`, then the hosted zone will be
**looked up** (not created) via `HostedZone.fromLookup` with {@link NextjsDomainProps.domainName}.

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.NextjsDomainProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsDomainOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDomainOverrides">NextjsDomainOverrides</a>

Override props for every construct.

---

### NextjsImageOverrides <a name="NextjsImageOverrides" id="cdk-nextjs-standalone.NextjsImageOverrides"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsImageOverrides.Initializer"></a>

```typescript
import { NextjsImageOverrides } from 'cdk-nextjs-standalone'

const nextjsImageOverrides: NextjsImageOverrides = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsImageOverrides.property.functionProps">functionProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps">OptionalFunctionProps</a></code> | *No description.* |

---

##### `functionProps`<sup>Optional</sup> <a name="functionProps" id="cdk-nextjs-standalone.NextjsImageOverrides.property.functionProps"></a>

```typescript
public readonly functionProps: OptionalFunctionProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalFunctionProps">OptionalFunctionProps</a>

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
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket holding application images. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.lambdaOptions">lambdaOptions</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override function properties. |
| <code><a href="#cdk-nextjs-standalone.NextjsImageProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsImageOverrides">NextjsImageOverrides</a></code> | Override props for every construct. |

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

> [{@link NextjsBuild }]({@link NextjsBuild })

---

##### `lambdaOptions`<sup>Optional</sup> <a name="lambdaOptions" id="cdk-nextjs-standalone.NextjsImageProps.property.lambdaOptions"></a>

```typescript
public readonly lambdaOptions: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override function properties.

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.NextjsImageProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsImageOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsImageOverrides">NextjsImageOverrides</a>

Override props for every construct.

---

### NextjsInvalidationOverrides <a name="NextjsInvalidationOverrides" id="cdk-nextjs-standalone.NextjsInvalidationOverrides"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsInvalidationOverrides.Initializer"></a>

```typescript
import { NextjsInvalidationOverrides } from 'cdk-nextjs-standalone'

const nextjsInvalidationOverrides: NextjsInvalidationOverrides = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsInvalidationOverrides.property.awsCustomResourceProps">awsCustomResourceProps</a></code> | <code>aws-cdk-lib.custom_resources.AwsCustomResourceProps</code> | *No description.* |

---

##### `awsCustomResourceProps`<sup>Optional</sup> <a name="awsCustomResourceProps" id="cdk-nextjs-standalone.NextjsInvalidationOverrides.property.awsCustomResourceProps"></a>

```typescript
public readonly awsCustomResourceProps: AwsCustomResourceProps;
```

- *Type:* aws-cdk-lib.custom_resources.AwsCustomResourceProps

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
| <code><a href="#cdk-nextjs-standalone.NextjsInvalidationProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsInvalidationOverrides">NextjsInvalidationOverrides</a></code> | Override props for every construct. |

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

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.NextjsInvalidationProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsInvalidationOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsInvalidationOverrides">NextjsInvalidationOverrides</a>

Override props for every construct.

---

### NextjsOverrides <a name="NextjsOverrides" id="cdk-nextjs-standalone.NextjsOverrides"></a>

Override props for every construct.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsOverrides.Initializer"></a>

```typescript
import { NextjsOverrides } from 'cdk-nextjs-standalone'

const nextjsOverrides: NextjsOverrides = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsOverrides.property.nextjs">nextjs</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsConstructOverrides">NextjsConstructOverrides</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsOverrides.property.nextjsBucketDeployment">nextjsBucketDeployment</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentOverrides">NextjsBucketDeploymentOverrides</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsOverrides.property.nextjsDistribution">nextjsDistribution</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides">NextjsDistributionOverrides</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsOverrides.property.nextjsDomain">nextjsDomain</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDomainOverrides">NextjsDomainOverrides</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsOverrides.property.nextjsImage">nextjsImage</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsImageOverrides">NextjsImageOverrides</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsOverrides.property.nextjsInvalidation">nextjsInvalidation</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsInvalidationOverrides">NextjsInvalidationOverrides</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsOverrides.property.nextjsRevalidation">nextjsRevalidation</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides">NextjsRevalidationOverrides</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsOverrides.property.nextjsServer">nextjsServer</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsServerOverrides">NextjsServerOverrides</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsOverrides.property.nextjsStaticAssets">nextjsStaticAssets</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetOverrides">NextjsStaticAssetOverrides</a></code> | *No description.* |

---

##### `nextjs`<sup>Optional</sup> <a name="nextjs" id="cdk-nextjs-standalone.NextjsOverrides.property.nextjs"></a>

```typescript
public readonly nextjs: NextjsConstructOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsConstructOverrides">NextjsConstructOverrides</a>

---

##### `nextjsBucketDeployment`<sup>Optional</sup> <a name="nextjsBucketDeployment" id="cdk-nextjs-standalone.NextjsOverrides.property.nextjsBucketDeployment"></a>

```typescript
public readonly nextjsBucketDeployment: NextjsBucketDeploymentOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBucketDeploymentOverrides">NextjsBucketDeploymentOverrides</a>

---

##### `nextjsDistribution`<sup>Optional</sup> <a name="nextjsDistribution" id="cdk-nextjs-standalone.NextjsOverrides.property.nextjsDistribution"></a>

```typescript
public readonly nextjsDistribution: NextjsDistributionOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDistributionOverrides">NextjsDistributionOverrides</a>

---

##### `nextjsDomain`<sup>Optional</sup> <a name="nextjsDomain" id="cdk-nextjs-standalone.NextjsOverrides.property.nextjsDomain"></a>

```typescript
public readonly nextjsDomain: NextjsDomainOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDomainOverrides">NextjsDomainOverrides</a>

---

##### `nextjsImage`<sup>Optional</sup> <a name="nextjsImage" id="cdk-nextjs-standalone.NextjsOverrides.property.nextjsImage"></a>

```typescript
public readonly nextjsImage: NextjsImageOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsImageOverrides">NextjsImageOverrides</a>

---

##### `nextjsInvalidation`<sup>Optional</sup> <a name="nextjsInvalidation" id="cdk-nextjs-standalone.NextjsOverrides.property.nextjsInvalidation"></a>

```typescript
public readonly nextjsInvalidation: NextjsInvalidationOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsInvalidationOverrides">NextjsInvalidationOverrides</a>

---

##### `nextjsRevalidation`<sup>Optional</sup> <a name="nextjsRevalidation" id="cdk-nextjs-standalone.NextjsOverrides.property.nextjsRevalidation"></a>

```typescript
public readonly nextjsRevalidation: NextjsRevalidationOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides">NextjsRevalidationOverrides</a>

---

##### `nextjsServer`<sup>Optional</sup> <a name="nextjsServer" id="cdk-nextjs-standalone.NextjsOverrides.property.nextjsServer"></a>

```typescript
public readonly nextjsServer: NextjsServerOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsServerOverrides">NextjsServerOverrides</a>

---

##### `nextjsStaticAssets`<sup>Optional</sup> <a name="nextjsStaticAssets" id="cdk-nextjs-standalone.NextjsOverrides.property.nextjsStaticAssets"></a>

```typescript
public readonly nextjsStaticAssets: NextjsStaticAssetOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsStaticAssetOverrides">NextjsStaticAssetOverrides</a>

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
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.basePath">basePath</a></code> | <code>string</code> | Optional value to prefix the Next.js site under a /prefix path on CloudFront. Usually used when you deploy multiple Next.js sites on same domain using /sub-path. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.buildCommand">buildCommand</a></code> | <code>string</code> | Optional value used to install NextJS node dependencies. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.buildPath">buildPath</a></code> | <code>string</code> | The directory to execute `npm run build` from. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.Distribution</code> | Optional CloudFront Distribution created outside of this construct that will be used to add Next.js behaviors and origins onto. Useful with `basePath`. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.domainProps">domainProps</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDomainProps">NextjsDomainProps</a></code> | Props to configure {@link NextjsDomain}. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build **and** runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.imageOptimizationBucket">imageOptimizationBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Optional S3 Bucket to use, defaults to assets bucket. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsOverrides">NextjsOverrides</a></code> | Override props for every construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.skipBuild">skipBuild</a></code> | <code>boolean</code> | Skips running Next.js build. Useful if you want to deploy `Nextjs` but haven't made any changes to Next.js app code. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.skipFullInvalidation">skipFullInvalidation</a></code> | <code>boolean</code> | By default all CloudFront cache will be invalidated on deployment. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `basePath`<sup>Optional</sup> <a name="basePath" id="cdk-nextjs-standalone.NextjsProps.property.basePath"></a>

```typescript
public readonly basePath: string;
```

- *Type:* string

Optional value to prefix the Next.js site under a /prefix path on CloudFront. Usually used when you deploy multiple Next.js sites on same domain using /sub-path.

Note, you'll need to set [basePath](https://nextjs.org/docs/app/api-reference/next-config-js/basePath)
in your `next.config.ts` to this value and ensure any files in `public`
folder have correct prefix.

---

*Example*

```typescript
"/my-base-path"
```


##### `buildCommand`<sup>Optional</sup> <a name="buildCommand" id="cdk-nextjs-standalone.NextjsProps.property.buildCommand"></a>

```typescript
public readonly buildCommand: string;
```

- *Type:* string
- *Default:* 'npx --yes open-next@^2 build'

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

##### `distribution`<sup>Optional</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsProps.property.distribution"></a>

```typescript
public readonly distribution: Distribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.Distribution

Optional CloudFront Distribution created outside of this construct that will be used to add Next.js behaviors and origins onto. Useful with `basePath`.

---

##### `domainProps`<sup>Optional</sup> <a name="domainProps" id="cdk-nextjs-standalone.NextjsProps.property.domainProps"></a>

```typescript
public readonly domainProps: NextjsDomainProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDomainProps">NextjsDomainProps</a>

Props to configure {@link NextjsDomain}.

See details on how to customize at
{@link NextjsDomainProps}

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build **and** runtime.

---

##### `imageOptimizationBucket`<sup>Optional</sup> <a name="imageOptimizationBucket" id="cdk-nextjs-standalone.NextjsProps.property.imageOptimizationBucket"></a>

```typescript
public readonly imageOptimizationBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Optional S3 Bucket to use, defaults to assets bucket.

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.NextjsProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsOverrides">NextjsOverrides</a>

Override props for every construct.

Enables deep customization. Use with caution as
you can override all props. Recommend reviewing source code to see props
you'll be overriding before using.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `skipBuild`<sup>Optional</sup> <a name="skipBuild" id="cdk-nextjs-standalone.NextjsProps.property.skipBuild"></a>

```typescript
public readonly skipBuild: boolean;
```

- *Type:* boolean
- *Default:* false

Skips running Next.js build. Useful if you want to deploy `Nextjs` but haven't made any changes to Next.js app code.

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

### NextjsRevalidationOverrides <a name="NextjsRevalidationOverrides" id="cdk-nextjs-standalone.NextjsRevalidationOverrides"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsRevalidationOverrides.Initializer"></a>

```typescript
import { NextjsRevalidationOverrides } from 'cdk-nextjs-standalone'

const nextjsRevalidationOverrides: NextjsRevalidationOverrides = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides.property.insertCustomResourceProps">insertCustomResourceProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalCustomResourceProps">OptionalCustomResourceProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides.property.insertFunctionProps">insertFunctionProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps">OptionalFunctionProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides.property.insertProviderProps">insertProviderProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalProviderProps">OptionalProviderProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides.property.queueFunctionProps">queueFunctionProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps">OptionalFunctionProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides.property.queueProps">queueProps</a></code> | <code>aws-cdk-lib.aws_sqs.QueueProps</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides.property.tableProps">tableProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2">OptionalTablePropsV2</a></code> | *No description.* |

---

##### `insertCustomResourceProps`<sup>Optional</sup> <a name="insertCustomResourceProps" id="cdk-nextjs-standalone.NextjsRevalidationOverrides.property.insertCustomResourceProps"></a>

```typescript
public readonly insertCustomResourceProps: OptionalCustomResourceProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalCustomResourceProps">OptionalCustomResourceProps</a>

---

##### `insertFunctionProps`<sup>Optional</sup> <a name="insertFunctionProps" id="cdk-nextjs-standalone.NextjsRevalidationOverrides.property.insertFunctionProps"></a>

```typescript
public readonly insertFunctionProps: OptionalFunctionProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalFunctionProps">OptionalFunctionProps</a>

---

##### `insertProviderProps`<sup>Optional</sup> <a name="insertProviderProps" id="cdk-nextjs-standalone.NextjsRevalidationOverrides.property.insertProviderProps"></a>

```typescript
public readonly insertProviderProps: OptionalProviderProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalProviderProps">OptionalProviderProps</a>

---

##### `queueFunctionProps`<sup>Optional</sup> <a name="queueFunctionProps" id="cdk-nextjs-standalone.NextjsRevalidationOverrides.property.queueFunctionProps"></a>

```typescript
public readonly queueFunctionProps: OptionalFunctionProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalFunctionProps">OptionalFunctionProps</a>

---

##### `queueProps`<sup>Optional</sup> <a name="queueProps" id="cdk-nextjs-standalone.NextjsRevalidationOverrides.property.queueProps"></a>

```typescript
public readonly queueProps: QueueProps;
```

- *Type:* aws-cdk-lib.aws_sqs.QueueProps

---

##### `tableProps`<sup>Optional</sup> <a name="tableProps" id="cdk-nextjs-standalone.NextjsRevalidationOverrides.property.tableProps"></a>

```typescript
public readonly tableProps: OptionalTablePropsV2;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalTablePropsV2">OptionalTablePropsV2</a>

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
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.serverFunction">serverFunction</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsServer">NextjsServer</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.lambdaOptions">lambdaOptions</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override function properties. |
| <code><a href="#cdk-nextjs-standalone.NextjsRevalidationProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides">NextjsRevalidationOverrides</a></code> | Override props for every construct. |

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

> [{@link NextjsBuild }]({@link NextjsBuild })

---

##### `serverFunction`<sup>Required</sup> <a name="serverFunction" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.serverFunction"></a>

```typescript
public readonly serverFunction: NextjsServer;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsServer">NextjsServer</a>

> [{@link NextjsServer }]({@link NextjsServer })

---

##### `lambdaOptions`<sup>Optional</sup> <a name="lambdaOptions" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.lambdaOptions"></a>

```typescript
public readonly lambdaOptions: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override function properties.

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.NextjsRevalidationProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsRevalidationOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides">NextjsRevalidationOverrides</a>

Override props for every construct.

---

### NextjsServerOverrides <a name="NextjsServerOverrides" id="cdk-nextjs-standalone.NextjsServerOverrides"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsServerOverrides.Initializer"></a>

```typescript
import { NextjsServerOverrides } from 'cdk-nextjs-standalone'

const nextjsServerOverrides: NextjsServerOverrides = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsServerOverrides.property.destinationCodeAssetProps">destinationCodeAssetProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalAssetProps">OptionalAssetProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsServerOverrides.property.functionProps">functionProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps">OptionalFunctionProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsServerOverrides.property.nextjsBucketDeploymentProps">nextjsBucketDeploymentProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps">OptionalNextjsBucketDeploymentProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsServerOverrides.property.sourceCodeAssetProps">sourceCodeAssetProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalAssetProps">OptionalAssetProps</a></code> | *No description.* |

---

##### `destinationCodeAssetProps`<sup>Optional</sup> <a name="destinationCodeAssetProps" id="cdk-nextjs-standalone.NextjsServerOverrides.property.destinationCodeAssetProps"></a>

```typescript
public readonly destinationCodeAssetProps: OptionalAssetProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalAssetProps">OptionalAssetProps</a>

---

##### `functionProps`<sup>Optional</sup> <a name="functionProps" id="cdk-nextjs-standalone.NextjsServerOverrides.property.functionProps"></a>

```typescript
public readonly functionProps: OptionalFunctionProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalFunctionProps">OptionalFunctionProps</a>

---

##### `nextjsBucketDeploymentProps`<sup>Optional</sup> <a name="nextjsBucketDeploymentProps" id="cdk-nextjs-standalone.NextjsServerOverrides.property.nextjsBucketDeploymentProps"></a>

```typescript
public readonly nextjsBucketDeploymentProps: OptionalNextjsBucketDeploymentProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps">OptionalNextjsBucketDeploymentProps</a>

---

##### `sourceCodeAssetProps`<sup>Optional</sup> <a name="sourceCodeAssetProps" id="cdk-nextjs-standalone.NextjsServerOverrides.property.sourceCodeAssetProps"></a>

```typescript
public readonly sourceCodeAssetProps: OptionalAssetProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalAssetProps">OptionalAssetProps</a>

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
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.staticAssetBucket">staticAssetBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Static asset bucket. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.lambda">lambda</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override function properties. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsServerOverrides">NextjsServerOverrides</a></code> | Override props for every construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsServerProps.property.quiet">quiet</a></code> | <code>boolean</code> | *No description.* |

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsServerProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

> [{@link NextjsBuild }]({@link NextjsBuild })

---

##### `staticAssetBucket`<sup>Required</sup> <a name="staticAssetBucket" id="cdk-nextjs-standalone.NextjsServerProps.property.staticAssetBucket"></a>

```typescript
public readonly staticAssetBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Static asset bucket.

Function needs bucket to read from cache.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsServerProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

> [{@link NextjsProps.environment }]({@link NextjsProps.environment })

---

##### `lambda`<sup>Optional</sup> <a name="lambda" id="cdk-nextjs-standalone.NextjsServerProps.property.lambda"></a>

```typescript
public readonly lambda: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override function properties.

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.NextjsServerProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsServerOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsServerOverrides">NextjsServerOverrides</a>

Override props for every construct.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsServerProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

> [{@link NextjsProps.quiet }]({@link NextjsProps.quiet })

---

### NextjsStaticAssetOverrides <a name="NextjsStaticAssetOverrides" id="cdk-nextjs-standalone.NextjsStaticAssetOverrides"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsStaticAssetOverrides.Initializer"></a>

```typescript
import { NextjsStaticAssetOverrides } from 'cdk-nextjs-standalone'

const nextjsStaticAssetOverrides: NextjsStaticAssetOverrides = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetOverrides.property.assetProps">assetProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalAssetProps">OptionalAssetProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetOverrides.property.bucketProps">bucketProps</a></code> | <code>aws-cdk-lib.aws_s3.BucketProps</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetOverrides.property.nextjsBucketDeploymentProps">nextjsBucketDeploymentProps</a></code> | <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps">OptionalNextjsBucketDeploymentProps</a></code> | *No description.* |

---

##### `assetProps`<sup>Optional</sup> <a name="assetProps" id="cdk-nextjs-standalone.NextjsStaticAssetOverrides.property.assetProps"></a>

```typescript
public readonly assetProps: OptionalAssetProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalAssetProps">OptionalAssetProps</a>

---

##### `bucketProps`<sup>Optional</sup> <a name="bucketProps" id="cdk-nextjs-standalone.NextjsStaticAssetOverrides.property.bucketProps"></a>

```typescript
public readonly bucketProps: BucketProps;
```

- *Type:* aws-cdk-lib.aws_s3.BucketProps

---

##### `nextjsBucketDeploymentProps`<sup>Optional</sup> <a name="nextjsBucketDeploymentProps" id="cdk-nextjs-standalone.NextjsStaticAssetOverrides.property.nextjsBucketDeploymentProps"></a>

```typescript
public readonly nextjsBucketDeploymentProps: OptionalNextjsBucketDeploymentProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps">OptionalNextjsBucketDeploymentProps</a>

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
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetsProps.property.basePath">basePath</a></code> | <code>string</code> | Optional value to prefix the Next.js site under a /prefix path on CloudFront. Usually used when you deploy multiple Next.js sites on same domain using /sub-path. |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetsProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Define your own bucket to store static assets. |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetsProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetsProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetOverrides">NextjsStaticAssetOverrides</a></code> | Override props for every construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetsProps.property.prune">prune</a></code> | <code>boolean</code> | If `true` (default), then removes old static assets after upload new static assets. |

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsStaticAssetsProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

The `NextjsBuild` instance representing the built Nextjs application.

---

##### `basePath`<sup>Optional</sup> <a name="basePath" id="cdk-nextjs-standalone.NextjsStaticAssetsProps.property.basePath"></a>

```typescript
public readonly basePath: string;
```

- *Type:* string

Optional value to prefix the Next.js site under a /prefix path on CloudFront. Usually used when you deploy multiple Next.js sites on same domain using /sub-path.

Note, you'll need to set [basePath](https://nextjs.org/docs/app/api-reference/next-config-js/basePath)
in your `next.config.ts` to this value and ensure any files in `public`
folder have correct prefix.

---

*Example*

```typescript
"/my-base-path"
```


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

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.NextjsStaticAssetsProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsStaticAssetOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsStaticAssetOverrides">NextjsStaticAssetOverrides</a>

Override props for every construct.

---

##### `prune`<sup>Optional</sup> <a name="prune" id="cdk-nextjs-standalone.NextjsStaticAssetsProps.property.prune"></a>

```typescript
public readonly prune: boolean;
```

- *Type:* boolean
- *Default:* true

If `true` (default), then removes old static assets after upload new static assets.

---

### OptionalAaaaRecordProps <a name="OptionalAaaaRecordProps" id="cdk-nextjs-standalone.OptionalAaaaRecordProps"></a>

OptionalAaaaRecordProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalAaaaRecordProps.Initializer"></a>

```typescript
import { OptionalAaaaRecordProps } from 'cdk-nextjs-standalone'

const optionalAaaaRecordProps: OptionalAaaaRecordProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalAaaaRecordProps.property.comment">comment</a></code> | <code>string</code> | A comment to add on the record. |
| <code><a href="#cdk-nextjs-standalone.OptionalAaaaRecordProps.property.deleteExisting">deleteExisting</a></code> | <code>boolean</code> | Whether to delete the same record set in the hosted zone if it already exists (dangerous!). This allows to deploy a new record set while minimizing the downtime because the new record set will be created immediately after the existing one is deleted. It also avoids "manual" actions to delete existing record sets. |
| <code><a href="#cdk-nextjs-standalone.OptionalAaaaRecordProps.property.geoLocation">geoLocation</a></code> | <code>aws-cdk-lib.aws_route53.GeoLocation</code> | The geographical origin for this record to return DNS records based on the user's location. |
| <code><a href="#cdk-nextjs-standalone.OptionalAaaaRecordProps.property.recordName">recordName</a></code> | <code>string</code> | The subdomain name for this record. |
| <code><a href="#cdk-nextjs-standalone.OptionalAaaaRecordProps.property.target">target</a></code> | <code>aws-cdk-lib.aws_route53.RecordTarget</code> | The target. |
| <code><a href="#cdk-nextjs-standalone.OptionalAaaaRecordProps.property.ttl">ttl</a></code> | <code>aws-cdk-lib.Duration</code> | The resource record cache time to live (TTL). |
| <code><a href="#cdk-nextjs-standalone.OptionalAaaaRecordProps.property.zone">zone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | The hosted zone in which to define the new record. |

---

##### `comment`<sup>Optional</sup> <a name="comment" id="cdk-nextjs-standalone.OptionalAaaaRecordProps.property.comment"></a>

```typescript
public readonly comment: string;
```

- *Type:* string
- *Default:* no comment

A comment to add on the record.

---

##### `deleteExisting`<sup>Optional</sup> <a name="deleteExisting" id="cdk-nextjs-standalone.OptionalAaaaRecordProps.property.deleteExisting"></a>

```typescript
public readonly deleteExisting: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to delete the same record set in the hosted zone if it already exists (dangerous!). This allows to deploy a new record set while minimizing the downtime because the new record set will be created immediately after the existing one is deleted. It also avoids "manual" actions to delete existing record sets.

> **N.B.:** this feature is dangerous, use with caution! It can only be used safely when
> `deleteExisting` is set to `true` as soon as the resource is added to the stack. Changing
> an existing Record Set's `deleteExisting` property from `false -> true` after deployment
> will delete the record!

---

##### `geoLocation`<sup>Optional</sup> <a name="geoLocation" id="cdk-nextjs-standalone.OptionalAaaaRecordProps.property.geoLocation"></a>

```typescript
public readonly geoLocation: GeoLocation;
```

- *Type:* aws-cdk-lib.aws_route53.GeoLocation

The geographical origin for this record to return DNS records based on the user's location.

---

##### `recordName`<sup>Optional</sup> <a name="recordName" id="cdk-nextjs-standalone.OptionalAaaaRecordProps.property.recordName"></a>

```typescript
public readonly recordName: string;
```

- *Type:* string
- *Default:* zone root

The subdomain name for this record.

This should be relative to the zone root name.
For example, if you want to create a record for acme.example.com, specify
"acme".

You can also specify the fully qualified domain name which terminates with a
".". For example, "acme.example.com.".

---

##### `target`<sup>Optional</sup> <a name="target" id="cdk-nextjs-standalone.OptionalAaaaRecordProps.property.target"></a>

```typescript
public readonly target: RecordTarget;
```

- *Type:* aws-cdk-lib.aws_route53.RecordTarget

The target.

---

##### `ttl`<sup>Optional</sup> <a name="ttl" id="cdk-nextjs-standalone.OptionalAaaaRecordProps.property.ttl"></a>

```typescript
public readonly ttl: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.minutes(30)

The resource record cache time to live (TTL).

---

##### `zone`<sup>Optional</sup> <a name="zone" id="cdk-nextjs-standalone.OptionalAaaaRecordProps.property.zone"></a>

```typescript
public readonly zone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

The hosted zone in which to define the new record.

---

### OptionalARecordProps <a name="OptionalARecordProps" id="cdk-nextjs-standalone.OptionalARecordProps"></a>

OptionalARecordProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalARecordProps.Initializer"></a>

```typescript
import { OptionalARecordProps } from 'cdk-nextjs-standalone'

const optionalARecordProps: OptionalARecordProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalARecordProps.property.comment">comment</a></code> | <code>string</code> | A comment to add on the record. |
| <code><a href="#cdk-nextjs-standalone.OptionalARecordProps.property.deleteExisting">deleteExisting</a></code> | <code>boolean</code> | Whether to delete the same record set in the hosted zone if it already exists (dangerous!). This allows to deploy a new record set while minimizing the downtime because the new record set will be created immediately after the existing one is deleted. It also avoids "manual" actions to delete existing record sets. |
| <code><a href="#cdk-nextjs-standalone.OptionalARecordProps.property.geoLocation">geoLocation</a></code> | <code>aws-cdk-lib.aws_route53.GeoLocation</code> | The geographical origin for this record to return DNS records based on the user's location. |
| <code><a href="#cdk-nextjs-standalone.OptionalARecordProps.property.recordName">recordName</a></code> | <code>string</code> | The subdomain name for this record. |
| <code><a href="#cdk-nextjs-standalone.OptionalARecordProps.property.target">target</a></code> | <code>aws-cdk-lib.aws_route53.RecordTarget</code> | The target. |
| <code><a href="#cdk-nextjs-standalone.OptionalARecordProps.property.ttl">ttl</a></code> | <code>aws-cdk-lib.Duration</code> | The resource record cache time to live (TTL). |
| <code><a href="#cdk-nextjs-standalone.OptionalARecordProps.property.zone">zone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | The hosted zone in which to define the new record. |

---

##### `comment`<sup>Optional</sup> <a name="comment" id="cdk-nextjs-standalone.OptionalARecordProps.property.comment"></a>

```typescript
public readonly comment: string;
```

- *Type:* string
- *Default:* no comment

A comment to add on the record.

---

##### `deleteExisting`<sup>Optional</sup> <a name="deleteExisting" id="cdk-nextjs-standalone.OptionalARecordProps.property.deleteExisting"></a>

```typescript
public readonly deleteExisting: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to delete the same record set in the hosted zone if it already exists (dangerous!). This allows to deploy a new record set while minimizing the downtime because the new record set will be created immediately after the existing one is deleted. It also avoids "manual" actions to delete existing record sets.

> **N.B.:** this feature is dangerous, use with caution! It can only be used safely when
> `deleteExisting` is set to `true` as soon as the resource is added to the stack. Changing
> an existing Record Set's `deleteExisting` property from `false -> true` after deployment
> will delete the record!

---

##### `geoLocation`<sup>Optional</sup> <a name="geoLocation" id="cdk-nextjs-standalone.OptionalARecordProps.property.geoLocation"></a>

```typescript
public readonly geoLocation: GeoLocation;
```

- *Type:* aws-cdk-lib.aws_route53.GeoLocation

The geographical origin for this record to return DNS records based on the user's location.

---

##### `recordName`<sup>Optional</sup> <a name="recordName" id="cdk-nextjs-standalone.OptionalARecordProps.property.recordName"></a>

```typescript
public readonly recordName: string;
```

- *Type:* string
- *Default:* zone root

The subdomain name for this record.

This should be relative to the zone root name.
For example, if you want to create a record for acme.example.com, specify
"acme".

You can also specify the fully qualified domain name which terminates with a
".". For example, "acme.example.com.".

---

##### `target`<sup>Optional</sup> <a name="target" id="cdk-nextjs-standalone.OptionalARecordProps.property.target"></a>

```typescript
public readonly target: RecordTarget;
```

- *Type:* aws-cdk-lib.aws_route53.RecordTarget

The target.

---

##### `ttl`<sup>Optional</sup> <a name="ttl" id="cdk-nextjs-standalone.OptionalARecordProps.property.ttl"></a>

```typescript
public readonly ttl: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.minutes(30)

The resource record cache time to live (TTL).

---

##### `zone`<sup>Optional</sup> <a name="zone" id="cdk-nextjs-standalone.OptionalARecordProps.property.zone"></a>

```typescript
public readonly zone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

The hosted zone in which to define the new record.

---

### OptionalAssetProps <a name="OptionalAssetProps" id="cdk-nextjs-standalone.OptionalAssetProps"></a>

OptionalAssetProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalAssetProps.Initializer"></a>

```typescript
import { OptionalAssetProps } from 'cdk-nextjs-standalone'

const optionalAssetProps: OptionalAssetProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalAssetProps.property.assetHash">assetHash</a></code> | <code>string</code> | Specify a custom hash for this asset. |
| <code><a href="#cdk-nextjs-standalone.OptionalAssetProps.property.assetHashType">assetHashType</a></code> | <code>aws-cdk-lib.AssetHashType</code> | Specifies the type of hash to calculate for this asset. |
| <code><a href="#cdk-nextjs-standalone.OptionalAssetProps.property.bundling">bundling</a></code> | <code>aws-cdk-lib.BundlingOptions</code> | Bundle the asset by executing a command in a Docker container or a custom bundling provider. |
| <code><a href="#cdk-nextjs-standalone.OptionalAssetProps.property.deployTime">deployTime</a></code> | <code>boolean</code> | Whether or not the asset needs to exist beyond deployment time; |
| <code><a href="#cdk-nextjs-standalone.OptionalAssetProps.property.exclude">exclude</a></code> | <code>string[]</code> | File paths matching the patterns will be excluded. |
| <code><a href="#cdk-nextjs-standalone.OptionalAssetProps.property.followSymlinks">followSymlinks</a></code> | <code>aws-cdk-lib.SymlinkFollowMode</code> | A strategy for how to handle symlinks. |
| <code><a href="#cdk-nextjs-standalone.OptionalAssetProps.property.ignoreMode">ignoreMode</a></code> | <code>aws-cdk-lib.IgnoreMode</code> | The ignore behavior to use for `exclude` patterns. |
| <code><a href="#cdk-nextjs-standalone.OptionalAssetProps.property.path">path</a></code> | <code>string</code> | The disk location of the asset. |
| <code><a href="#cdk-nextjs-standalone.OptionalAssetProps.property.readers">readers</a></code> | <code>aws-cdk-lib.aws_iam.IGrantable[]</code> | A list of principals that should be able to read this asset from S3. |

---

##### `assetHash`<sup>Optional</sup> <a name="assetHash" id="cdk-nextjs-standalone.OptionalAssetProps.property.assetHash"></a>

```typescript
public readonly assetHash: string;
```

- *Type:* string
- *Default:* based on `assetHashType`

Specify a custom hash for this asset.

If `assetHashType` is set it must
be set to `AssetHashType.CUSTOM`. For consistency, this custom hash will
be SHA256 hashed and encoded as hex. The resulting hash will be the asset
hash.

NOTE: the hash is used in order to identify a specific revision of the asset, and
used for optimizing and caching deployment activities related to this asset such as
packaging, uploading to Amazon S3, etc. If you chose to customize the hash, you will
need to make sure it is updated every time the asset changes, or otherwise it is
possible that some deployments will not be invalidated.

---

##### `assetHashType`<sup>Optional</sup> <a name="assetHashType" id="cdk-nextjs-standalone.OptionalAssetProps.property.assetHashType"></a>

```typescript
public readonly assetHashType: AssetHashType;
```

- *Type:* aws-cdk-lib.AssetHashType
- *Default:* the default is `AssetHashType.SOURCE`, but if `assetHash` is explicitly specified this value defaults to `AssetHashType.CUSTOM`.

Specifies the type of hash to calculate for this asset.

If `assetHash` is configured, this option must be `undefined` or
`AssetHashType.CUSTOM`.

---

##### `bundling`<sup>Optional</sup> <a name="bundling" id="cdk-nextjs-standalone.OptionalAssetProps.property.bundling"></a>

```typescript
public readonly bundling: BundlingOptions;
```

- *Type:* aws-cdk-lib.BundlingOptions
- *Default:* uploaded as-is to S3 if the asset is a regular file or a .zip file, archived into a .zip file and uploaded to S3 otherwise

Bundle the asset by executing a command in a Docker container or a custom bundling provider.

The asset path will be mounted at `/asset-input`. The Docker
container is responsible for putting content at `/asset-output`.
The content at `/asset-output` will be zipped and used as the
final asset.

---

##### `deployTime`<sup>Optional</sup> <a name="deployTime" id="cdk-nextjs-standalone.OptionalAssetProps.property.deployTime"></a>

```typescript
public readonly deployTime: boolean;
```

- *Type:* boolean
- *Default:* false

Whether or not the asset needs to exist beyond deployment time;

i.e.
are copied over to a different location and not needed afterwards.
Setting this property to true has an impact on the lifecycle of the asset,
because we will assume that it is safe to delete after the CloudFormation
deployment succeeds.

For example, Lambda Function assets are copied over to Lambda during
deployment. Therefore, it is not necessary to store the asset in S3, so
we consider those deployTime assets.

---

##### `exclude`<sup>Optional</sup> <a name="exclude" id="cdk-nextjs-standalone.OptionalAssetProps.property.exclude"></a>

```typescript
public readonly exclude: string[];
```

- *Type:* string[]
- *Default:* nothing is excluded

File paths matching the patterns will be excluded.

See `ignoreMode` to set the matching behavior.
Has no effect on Assets bundled using the `bundling` property.

---

##### `followSymlinks`<sup>Optional</sup> <a name="followSymlinks" id="cdk-nextjs-standalone.OptionalAssetProps.property.followSymlinks"></a>

```typescript
public readonly followSymlinks: SymlinkFollowMode;
```

- *Type:* aws-cdk-lib.SymlinkFollowMode
- *Default:* SymlinkFollowMode.NEVER

A strategy for how to handle symlinks.

---

##### `ignoreMode`<sup>Optional</sup> <a name="ignoreMode" id="cdk-nextjs-standalone.OptionalAssetProps.property.ignoreMode"></a>

```typescript
public readonly ignoreMode: IgnoreMode;
```

- *Type:* aws-cdk-lib.IgnoreMode
- *Default:* IgnoreMode.GLOB

The ignore behavior to use for `exclude` patterns.

---

##### `path`<sup>Optional</sup> <a name="path" id="cdk-nextjs-standalone.OptionalAssetProps.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

The disk location of the asset.

The path should refer to one of the following:
- A regular file or a .zip file, in which case the file will be uploaded as-is to S3.
- A directory, in which case it will be archived into a .zip file and uploaded to S3.

---

##### `readers`<sup>Optional</sup> <a name="readers" id="cdk-nextjs-standalone.OptionalAssetProps.property.readers"></a>

```typescript
public readonly readers: IGrantable[];
```

- *Type:* aws-cdk-lib.aws_iam.IGrantable[]
- *Default:* No principals that can read file asset.

A list of principals that should be able to read this asset from S3.

You can use `asset.grantRead(principal)` to grant read permissions later.

---

### OptionalCertificateProps <a name="OptionalCertificateProps" id="cdk-nextjs-standalone.OptionalCertificateProps"></a>

OptionalCertificateProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalCertificateProps.Initializer"></a>

```typescript
import { OptionalCertificateProps } from 'cdk-nextjs-standalone'

const optionalCertificateProps: OptionalCertificateProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalCertificateProps.property.certificateName">certificateName</a></code> | <code>string</code> | The Certificate name. |
| <code><a href="#cdk-nextjs-standalone.OptionalCertificateProps.property.domainName">domainName</a></code> | <code>string</code> | Fully-qualified domain name to request a certificate for. |
| <code><a href="#cdk-nextjs-standalone.OptionalCertificateProps.property.subjectAlternativeNames">subjectAlternativeNames</a></code> | <code>string[]</code> | Alternative domain names on your certificate. |
| <code><a href="#cdk-nextjs-standalone.OptionalCertificateProps.property.transparencyLoggingEnabled">transparencyLoggingEnabled</a></code> | <code>boolean</code> | Enable or disable transparency logging for this certificate. |
| <code><a href="#cdk-nextjs-standalone.OptionalCertificateProps.property.validation">validation</a></code> | <code>aws-cdk-lib.aws_certificatemanager.CertificateValidation</code> | How to validate this certificate. |

---

##### `certificateName`<sup>Optional</sup> <a name="certificateName" id="cdk-nextjs-standalone.OptionalCertificateProps.property.certificateName"></a>

```typescript
public readonly certificateName: string;
```

- *Type:* string
- *Default:* the full, absolute path of this construct

The Certificate name.

Since the Certificate resource doesn't support providing a physical name, the value provided here will be recorded in the `Name` tag

---

##### `domainName`<sup>Optional</sup> <a name="domainName" id="cdk-nextjs-standalone.OptionalCertificateProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

Fully-qualified domain name to request a certificate for.

May contain wildcards, such as ``*.domain.com``.

---

##### `subjectAlternativeNames`<sup>Optional</sup> <a name="subjectAlternativeNames" id="cdk-nextjs-standalone.OptionalCertificateProps.property.subjectAlternativeNames"></a>

```typescript
public readonly subjectAlternativeNames: string[];
```

- *Type:* string[]
- *Default:* No additional FQDNs will be included as alternative domain names.

Alternative domain names on your certificate.

Use this to register alternative domain names that represent the same site.

---

##### `transparencyLoggingEnabled`<sup>Optional</sup> <a name="transparencyLoggingEnabled" id="cdk-nextjs-standalone.OptionalCertificateProps.property.transparencyLoggingEnabled"></a>

```typescript
public readonly transparencyLoggingEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable or disable transparency logging for this certificate.

Once a certificate has been logged, it cannot be removed from the log.
Opting out at that point will have no effect. If you opt out of logging
when you request a certificate and then choose later to opt back in,
your certificate will not be logged until it is renewed.
If you want the certificate to be logged immediately, we recommend that you issue a new one.

---

##### `validation`<sup>Optional</sup> <a name="validation" id="cdk-nextjs-standalone.OptionalCertificateProps.property.validation"></a>

```typescript
public readonly validation: CertificateValidation;
```

- *Type:* aws-cdk-lib.aws_certificatemanager.CertificateValidation
- *Default:* CertificateValidation.fromEmail()

How to validate this certificate.

---

### OptionalCloudFrontFunctionProps <a name="OptionalCloudFrontFunctionProps" id="cdk-nextjs-standalone.OptionalCloudFrontFunctionProps"></a>

OptionalCloudFrontFunctionProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalCloudFrontFunctionProps.Initializer"></a>

```typescript
import { OptionalCloudFrontFunctionProps } from 'cdk-nextjs-standalone'

const optionalCloudFrontFunctionProps: OptionalCloudFrontFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalCloudFrontFunctionProps.property.code">code</a></code> | <code>aws-cdk-lib.aws_cloudfront.FunctionCode</code> | The source code of the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalCloudFrontFunctionProps.property.comment">comment</a></code> | <code>string</code> | A comment to describe the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalCloudFrontFunctionProps.property.functionName">functionName</a></code> | <code>string</code> | A name to identify the function. |

---

##### `code`<sup>Optional</sup> <a name="code" id="cdk-nextjs-standalone.OptionalCloudFrontFunctionProps.property.code"></a>

```typescript
public readonly code: FunctionCode;
```

- *Type:* aws-cdk-lib.aws_cloudfront.FunctionCode

The source code of the function.

---

##### `comment`<sup>Optional</sup> <a name="comment" id="cdk-nextjs-standalone.OptionalCloudFrontFunctionProps.property.comment"></a>

```typescript
public readonly comment: string;
```

- *Type:* string
- *Default:* same as `functionName`

A comment to describe the function.

---

##### `functionName`<sup>Optional</sup> <a name="functionName" id="cdk-nextjs-standalone.OptionalCloudFrontFunctionProps.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string
- *Default:* generated from the `id`

A name to identify the function.

---

### OptionalCustomResourceProps <a name="OptionalCustomResourceProps" id="cdk-nextjs-standalone.OptionalCustomResourceProps"></a>

OptionalCustomResourceProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalCustomResourceProps.Initializer"></a>

```typescript
import { OptionalCustomResourceProps } from 'cdk-nextjs-standalone'

const optionalCustomResourceProps: OptionalCustomResourceProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalCustomResourceProps.property.pascalCaseProperties">pascalCaseProperties</a></code> | <code>boolean</code> | Convert all property keys to pascal case. |
| <code><a href="#cdk-nextjs-standalone.OptionalCustomResourceProps.property.properties">properties</a></code> | <code>{[ key: string ]: any}</code> | Properties to pass to the Lambda. |
| <code><a href="#cdk-nextjs-standalone.OptionalCustomResourceProps.property.removalPolicy">removalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | The policy to apply when this resource is removed from the application. |
| <code><a href="#cdk-nextjs-standalone.OptionalCustomResourceProps.property.resourceType">resourceType</a></code> | <code>string</code> | For custom resources, you can specify AWS::CloudFormation::CustomResource (the default) as the resource type, or you can specify your own resource type name. |
| <code><a href="#cdk-nextjs-standalone.OptionalCustomResourceProps.property.serviceToken">serviceToken</a></code> | <code>string</code> | The ARN of the provider which implements this custom resource type. |

---

##### `pascalCaseProperties`<sup>Optional</sup> <a name="pascalCaseProperties" id="cdk-nextjs-standalone.OptionalCustomResourceProps.property.pascalCaseProperties"></a>

```typescript
public readonly pascalCaseProperties: boolean;
```

- *Type:* boolean
- *Default:* false

Convert all property keys to pascal case.

---

##### `properties`<sup>Optional</sup> <a name="properties" id="cdk-nextjs-standalone.OptionalCustomResourceProps.property.properties"></a>

```typescript
public readonly properties: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}
- *Default:* No properties.

Properties to pass to the Lambda.

---

##### `removalPolicy`<sup>Optional</sup> <a name="removalPolicy" id="cdk-nextjs-standalone.OptionalCustomResourceProps.property.removalPolicy"></a>

```typescript
public readonly removalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* cdk.RemovalPolicy.Destroy

The policy to apply when this resource is removed from the application.

---

##### `resourceType`<sup>Optional</sup> <a name="resourceType" id="cdk-nextjs-standalone.OptionalCustomResourceProps.property.resourceType"></a>

```typescript
public readonly resourceType: string;
```

- *Type:* string
- *Default:* AWS::CloudFormation::CustomResource

For custom resources, you can specify AWS::CloudFormation::CustomResource (the default) as the resource type, or you can specify your own resource type name.

For example, you can use "Custom::MyCustomResourceTypeName".

Custom resource type names must begin with "Custom::" and can include
alphanumeric characters and the following characters: _@-. You can specify
a custom resource type name up to a maximum length of 60 characters. You
cannot change the type during an update.

Using your own resource type names helps you quickly differentiate the
types of custom resources in your stack. For example, if you had two custom
resources that conduct two different ping tests, you could name their type
as Custom::PingTester to make them easily identifiable as ping testers
(instead of using AWS::CloudFormation::CustomResource).

---

##### `serviceToken`<sup>Optional</sup> <a name="serviceToken" id="cdk-nextjs-standalone.OptionalCustomResourceProps.property.serviceToken"></a>

```typescript
public readonly serviceToken: string;
```

- *Type:* string

The ARN of the provider which implements this custom resource type.

You can implement a provider by listening to raw AWS CloudFormation events
and specify the ARN of an SNS topic (`topic.topicArn`) or the ARN of an AWS
Lambda function (`lambda.functionArn`) or use the CDK's custom [resource
provider framework] which makes it easier to implement robust providers.

[resource provider framework]:
https://docs.aws.amazon.com/cdk/api/latest/docs/custom-resources-readme.html

Provider framework:

```ts
// use the provider framework from aws-cdk/custom-resources:
const provider = new customresources.Provider(this, 'ResourceProvider', {
  onEventHandler,
  isCompleteHandler, // optional
});

new CustomResource(this, 'MyResource', {
  serviceToken: provider.serviceToken,
});
```

AWS Lambda function (not recommended to use AWS Lambda Functions directly,
see the module README):

```ts
// invoke an AWS Lambda function when a lifecycle event occurs:
new CustomResource(this, 'MyResource', {
  serviceToken: myFunction.functionArn,
});
```

SNS topic (not recommended to use AWS Lambda Functions directly, see the
module README):

```ts
// publish lifecycle events to an SNS topic:
new CustomResource(this, 'MyResource', {
  serviceToken: myTopic.topicArn,
});
```

---

### OptionalDistributionProps <a name="OptionalDistributionProps" id="cdk-nextjs-standalone.OptionalDistributionProps"></a>

OptionalDistributionProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalDistributionProps.Initializer"></a>

```typescript
import { OptionalDistributionProps } from 'cdk-nextjs-standalone'

const optionalDistributionProps: OptionalDistributionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.additionalBehaviors">additionalBehaviors</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_cloudfront.BehaviorOptions}</code> | Additional behaviors for the distribution, mapped by the pathPattern that specifies which requests to apply the behavior to. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.certificate">certificate</a></code> | <code>aws-cdk-lib.aws_certificatemanager.ICertificate</code> | A certificate to associate with the distribution. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.comment">comment</a></code> | <code>string</code> | Any comments you want to include about the distribution. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.defaultBehavior">defaultBehavior</a></code> | <code>aws-cdk-lib.aws_cloudfront.BehaviorOptions</code> | The default behavior for the distribution. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.defaultRootObject">defaultRootObject</a></code> | <code>string</code> | The object that you want CloudFront to request from your origin (for example, index.html) when a viewer requests the root URL for your distribution. If no default object is set, the request goes to the origin's root (e.g., example.com/). |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.domainNames">domainNames</a></code> | <code>string[]</code> | Alternative domain names for this distribution. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.enabled">enabled</a></code> | <code>boolean</code> | Enable or disable the distribution. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.enableIpv6">enableIpv6</a></code> | <code>boolean</code> | Whether CloudFront will respond to IPv6 DNS requests with an IPv6 address. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.enableLogging">enableLogging</a></code> | <code>boolean</code> | Enable access logging for the distribution. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.errorResponses">errorResponses</a></code> | <code>aws-cdk-lib.aws_cloudfront.ErrorResponse[]</code> | How CloudFront should handle requests that are not successful (e.g., PageNotFound). |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.geoRestriction">geoRestriction</a></code> | <code>aws-cdk-lib.aws_cloudfront.GeoRestriction</code> | Controls the countries in which your content is distributed. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.httpVersion">httpVersion</a></code> | <code>aws-cdk-lib.aws_cloudfront.HttpVersion</code> | Specify the maximum HTTP version that you want viewers to use to communicate with CloudFront. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.logBucket">logBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The Amazon S3 bucket to store the access logs in. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.logFilePrefix">logFilePrefix</a></code> | <code>string</code> | An optional string that you want CloudFront to prefix to the access log filenames for this distribution. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.logIncludesCookies">logIncludesCookies</a></code> | <code>boolean</code> | Specifies whether you want CloudFront to include cookies in access logs. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.minimumProtocolVersion">minimumProtocolVersion</a></code> | <code>aws-cdk-lib.aws_cloudfront.SecurityPolicyProtocol</code> | The minimum version of the SSL protocol that you want CloudFront to use for HTTPS connections. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.priceClass">priceClass</a></code> | <code>aws-cdk-lib.aws_cloudfront.PriceClass</code> | The price class that corresponds with the maximum price that you want to pay for CloudFront service. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.sslSupportMethod">sslSupportMethod</a></code> | <code>aws-cdk-lib.aws_cloudfront.SSLMethod</code> | The SSL method CloudFront will use for your distribution. |
| <code><a href="#cdk-nextjs-standalone.OptionalDistributionProps.property.webAclId">webAclId</a></code> | <code>string</code> | Unique identifier that specifies the AWS WAF web ACL to associate with this CloudFront distribution. |

---

##### `additionalBehaviors`<sup>Optional</sup> <a name="additionalBehaviors" id="cdk-nextjs-standalone.OptionalDistributionProps.property.additionalBehaviors"></a>

```typescript
public readonly additionalBehaviors: {[ key: string ]: BehaviorOptions};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_cloudfront.BehaviorOptions}
- *Default:* no additional behaviors are added.

Additional behaviors for the distribution, mapped by the pathPattern that specifies which requests to apply the behavior to.

---

##### `certificate`<sup>Optional</sup> <a name="certificate" id="cdk-nextjs-standalone.OptionalDistributionProps.property.certificate"></a>

```typescript
public readonly certificate: ICertificate;
```

- *Type:* aws-cdk-lib.aws_certificatemanager.ICertificate
- *Default:* the CloudFront wildcard certificate (*.cloudfront.net) will be used.

A certificate to associate with the distribution.

The certificate must be located in N. Virginia (us-east-1).

---

##### `comment`<sup>Optional</sup> <a name="comment" id="cdk-nextjs-standalone.OptionalDistributionProps.property.comment"></a>

```typescript
public readonly comment: string;
```

- *Type:* string
- *Default:* no comment

Any comments you want to include about the distribution.

---

##### `defaultBehavior`<sup>Optional</sup> <a name="defaultBehavior" id="cdk-nextjs-standalone.OptionalDistributionProps.property.defaultBehavior"></a>

```typescript
public readonly defaultBehavior: BehaviorOptions;
```

- *Type:* aws-cdk-lib.aws_cloudfront.BehaviorOptions

The default behavior for the distribution.

---

##### `defaultRootObject`<sup>Optional</sup> <a name="defaultRootObject" id="cdk-nextjs-standalone.OptionalDistributionProps.property.defaultRootObject"></a>

```typescript
public readonly defaultRootObject: string;
```

- *Type:* string
- *Default:* no default root object

The object that you want CloudFront to request from your origin (for example, index.html) when a viewer requests the root URL for your distribution. If no default object is set, the request goes to the origin's root (e.g., example.com/).

---

##### `domainNames`<sup>Optional</sup> <a name="domainNames" id="cdk-nextjs-standalone.OptionalDistributionProps.property.domainNames"></a>

```typescript
public readonly domainNames: string[];
```

- *Type:* string[]
- *Default:* The distribution will only support the default generated name (e.g., d111111abcdef8.cloudfront.net)

Alternative domain names for this distribution.

If you want to use your own domain name, such as www.example.com, instead of the cloudfront.net domain name,
you can add an alternate domain name to your distribution. If you attach a certificate to the distribution,
you must add (at least one of) the domain names of the certificate to this list.

---

##### `enabled`<sup>Optional</sup> <a name="enabled" id="cdk-nextjs-standalone.OptionalDistributionProps.property.enabled"></a>

```typescript
public readonly enabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable or disable the distribution.

---

##### `enableIpv6`<sup>Optional</sup> <a name="enableIpv6" id="cdk-nextjs-standalone.OptionalDistributionProps.property.enableIpv6"></a>

```typescript
public readonly enableIpv6: boolean;
```

- *Type:* boolean
- *Default:* true

Whether CloudFront will respond to IPv6 DNS requests with an IPv6 address.

If you specify false, CloudFront responds to IPv6 DNS requests with the DNS response code NOERROR and with no IP addresses.
This allows viewers to submit a second request, for an IPv4 address for your distribution.

---

##### `enableLogging`<sup>Optional</sup> <a name="enableLogging" id="cdk-nextjs-standalone.OptionalDistributionProps.property.enableLogging"></a>

```typescript
public readonly enableLogging: boolean;
```

- *Type:* boolean
- *Default:* false, unless `logBucket` is specified.

Enable access logging for the distribution.

---

##### `errorResponses`<sup>Optional</sup> <a name="errorResponses" id="cdk-nextjs-standalone.OptionalDistributionProps.property.errorResponses"></a>

```typescript
public readonly errorResponses: ErrorResponse[];
```

- *Type:* aws-cdk-lib.aws_cloudfront.ErrorResponse[]
- *Default:* No custom error responses.

How CloudFront should handle requests that are not successful (e.g., PageNotFound).

---

##### `geoRestriction`<sup>Optional</sup> <a name="geoRestriction" id="cdk-nextjs-standalone.OptionalDistributionProps.property.geoRestriction"></a>

```typescript
public readonly geoRestriction: GeoRestriction;
```

- *Type:* aws-cdk-lib.aws_cloudfront.GeoRestriction
- *Default:* No geographic restrictions

Controls the countries in which your content is distributed.

---

##### `httpVersion`<sup>Optional</sup> <a name="httpVersion" id="cdk-nextjs-standalone.OptionalDistributionProps.property.httpVersion"></a>

```typescript
public readonly httpVersion: HttpVersion;
```

- *Type:* aws-cdk-lib.aws_cloudfront.HttpVersion
- *Default:* HttpVersion.HTTP2

Specify the maximum HTTP version that you want viewers to use to communicate with CloudFront.

For viewers and CloudFront to use HTTP/2, viewers must support TLS 1.2 or later, and must support server name identification (SNI).

---

##### `logBucket`<sup>Optional</sup> <a name="logBucket" id="cdk-nextjs-standalone.OptionalDistributionProps.property.logBucket"></a>

```typescript
public readonly logBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket
- *Default:* A bucket is created if `enableLogging` is true

The Amazon S3 bucket to store the access logs in.

Make sure to set `objectOwnership` to `s3.ObjectOwnership.OBJECT_WRITER` in your custom bucket.

---

##### `logFilePrefix`<sup>Optional</sup> <a name="logFilePrefix" id="cdk-nextjs-standalone.OptionalDistributionProps.property.logFilePrefix"></a>

```typescript
public readonly logFilePrefix: string;
```

- *Type:* string
- *Default:* no prefix

An optional string that you want CloudFront to prefix to the access log filenames for this distribution.

---

##### `logIncludesCookies`<sup>Optional</sup> <a name="logIncludesCookies" id="cdk-nextjs-standalone.OptionalDistributionProps.property.logIncludesCookies"></a>

```typescript
public readonly logIncludesCookies: boolean;
```

- *Type:* boolean
- *Default:* false

Specifies whether you want CloudFront to include cookies in access logs.

---

##### `minimumProtocolVersion`<sup>Optional</sup> <a name="minimumProtocolVersion" id="cdk-nextjs-standalone.OptionalDistributionProps.property.minimumProtocolVersion"></a>

```typescript
public readonly minimumProtocolVersion: SecurityPolicyProtocol;
```

- *Type:* aws-cdk-lib.aws_cloudfront.SecurityPolicyProtocol
- *Default:* SecurityPolicyProtocol.TLS_V1_2_2021 if the '@aws-cdk/aws-cloudfront:defaultSecurityPolicyTLSv1.2_2021' feature flag is set; otherwise, SecurityPolicyProtocol.TLS_V1_2_2019.

The minimum version of the SSL protocol that you want CloudFront to use for HTTPS connections.

CloudFront serves your objects only to browsers or devices that support at
least the SSL version that you specify.

---

##### `priceClass`<sup>Optional</sup> <a name="priceClass" id="cdk-nextjs-standalone.OptionalDistributionProps.property.priceClass"></a>

```typescript
public readonly priceClass: PriceClass;
```

- *Type:* aws-cdk-lib.aws_cloudfront.PriceClass
- *Default:* PriceClass.PRICE_CLASS_ALL

The price class that corresponds with the maximum price that you want to pay for CloudFront service.

If you specify PriceClass_All, CloudFront responds to requests for your objects from all CloudFront edge locations.
If you specify a price class other than PriceClass_All, CloudFront serves your objects from the CloudFront edge location
that has the lowest latency among the edge locations in your price class.

---

##### `sslSupportMethod`<sup>Optional</sup> <a name="sslSupportMethod" id="cdk-nextjs-standalone.OptionalDistributionProps.property.sslSupportMethod"></a>

```typescript
public readonly sslSupportMethod: SSLMethod;
```

- *Type:* aws-cdk-lib.aws_cloudfront.SSLMethod
- *Default:* SSLMethod.SNI

The SSL method CloudFront will use for your distribution.

Server Name Indication (SNI) - is an extension to the TLS computer networking protocol by which a client indicates
which hostname it is attempting to connect to at the start of the handshaking process. This allows a server to present
multiple certificates on the same IP address and TCP port number and hence allows multiple secure (HTTPS) websites
(or any other service over TLS) to be served by the same IP address without requiring all those sites to use the same certificate.

CloudFront can use SNI to host multiple distributions on the same IP - which a large majority of clients will support.

If your clients cannot support SNI however - CloudFront can use dedicated IPs for your distribution - but there is a prorated monthly charge for
using this feature. By default, we use SNI - but you can optionally enable dedicated IPs (VIP).

See the CloudFront SSL for more details about pricing : https://aws.amazon.com/cloudfront/custom-ssl-domains/

---

##### `webAclId`<sup>Optional</sup> <a name="webAclId" id="cdk-nextjs-standalone.OptionalDistributionProps.property.webAclId"></a>

```typescript
public readonly webAclId: string;
```

- *Type:* string
- *Default:* No AWS Web Application Firewall web access control list (web ACL).

Unique identifier that specifies the AWS WAF web ACL to associate with this CloudFront distribution.

To specify a web ACL created using the latest version of AWS WAF, use the ACL ARN, for example
`arn:aws:wafv2:us-east-1:123456789012:global/webacl/ExampleWebACL/473e64fd-f30b-4765-81a0-62ad96dd167a`.
To specify a web ACL created using AWS WAF Classic, use the ACL ID, for example `473e64fd-f30b-4765-81a0-62ad96dd167a`.

---

### OptionalEdgeFunctionProps <a name="OptionalEdgeFunctionProps" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps"></a>

OptionalEdgeFunctionProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.Initializer"></a>

```typescript
import { OptionalEdgeFunctionProps } from 'cdk-nextjs-standalone'

const optionalEdgeFunctionProps: OptionalEdgeFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.adotInstrumentation">adotInstrumentation</a></code> | <code>aws-cdk-lib.aws_lambda.AdotInstrumentationConfig</code> | Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.allowAllOutbound">allowAllOutbound</a></code> | <code>boolean</code> | Whether to allow the Lambda to send all network traffic. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.allowPublicSubnet">allowPublicSubnet</a></code> | <code>boolean</code> | Lambda Functions in a public subnet can NOT access the internet. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.applicationLogLevel">applicationLogLevel</a></code> | <code>string</code> | Sets the application log level for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The system architectures compatible with this lambda function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.code">code</a></code> | <code>aws-cdk-lib.aws_lambda.Code</code> | The source code of your Lambda function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.codeSigningConfig">codeSigningConfig</a></code> | <code>aws-cdk-lib.aws_lambda.ICodeSigningConfig</code> | Code signing config associated with this function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.currentVersionOptions">currentVersionOptions</a></code> | <code>aws-cdk-lib.aws_lambda.VersionOptions</code> | Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The SQS queue to use if DLQ is enabled. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.deadLetterQueueEnabled">deadLetterQueueEnabled</a></code> | <code>boolean</code> | Enabled DLQ. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The SNS topic to use as a DLQ. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.description">description</a></code> | <code>string</code> | A description of the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Key-value pairs that Lambda caches and makes available for your Lambda functions. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.environmentEncryption">environmentEncryption</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The AWS KMS key that's used to encrypt your function's environment variables. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.ephemeralStorageSize">ephemeralStorageSize</a></code> | <code>aws-cdk-lib.Size</code> | The size of the function’s /tmp directory in MiB. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.events">events</a></code> | <code>aws-cdk-lib.aws_lambda.IEventSource[]</code> | Event sources for this function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.filesystem">filesystem</a></code> | <code>aws-cdk-lib.aws_lambda.FileSystem</code> | The filesystem configuration for the lambda function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.functionName">functionName</a></code> | <code>string</code> | A name for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.handler">handler</a></code> | <code>string</code> | The name of the method within your code that Lambda calls to execute your function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.initialPolicy">initialPolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Initial policy statements to add to the created Lambda Role. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.insightsVersion">insightsVersion</a></code> | <code>aws-cdk-lib.aws_lambda.LambdaInsightsVersion</code> | Specify the version of CloudWatch Lambda insights to use for monitoring. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.layers">layers</a></code> | <code>aws-cdk-lib.aws_lambda.ILayerVersion[]</code> | A list of layers to add to the function's execution environment. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.logFormat">logFormat</a></code> | <code>string</code> | Sets the logFormat for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | Sets the log group name for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in CloudWatch Logs. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.logRetentionRetryOptions">logRetentionRetryOptions</a></code> | <code>aws-cdk-lib.aws_lambda.LogRetentionRetryOptions</code> | When log retention is specified, a custom resource attempts to create the CloudWatch log group. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.logRetentionRole">logRetentionRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role for the Lambda function associated with the custom resource that sets the retention policy. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.maxEventAge">maxEventAge</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum age of a request that Lambda sends to a function for processing. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.memorySize">memorySize</a></code> | <code>number</code> | The amount of memory, in MB, that is allocated to your Lambda function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.onFailure">onFailure</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for failed invocations. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.onSuccess">onSuccess</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for successful invocations. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.paramsAndSecrets">paramsAndSecrets</a></code> | <code>aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion</code> | Specify the configuration of Parameters and Secrets Extension. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.profiling">profiling</a></code> | <code>boolean</code> | Enable profiling. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.profilingGroup">profilingGroup</a></code> | <code>aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup</code> | Profiling Group. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.reservedConcurrentExecutions">reservedConcurrentExecutions</a></code> | <code>number</code> | The maximum of concurrent executions you want to reserve for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.retryAttempts">retryAttempts</a></code> | <code>number</code> | The maximum number of times to retry when the function returns an error. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Lambda execution role. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime environment for the Lambda function that you are uploading. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.runtimeManagementMode">runtimeManagementMode</a></code> | <code>aws-cdk-lib.aws_lambda.RuntimeManagementMode</code> | Sets the runtime management configuration for a function's version. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The list of security groups to associate with the Lambda's network interfaces. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.snapStart">snapStart</a></code> | <code>aws-cdk-lib.aws_lambda.SnapStartConf</code> | Enable SnapStart for Lambda Function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.stackId">stackId</a></code> | <code>string</code> | The stack ID of Lambda@Edge function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.systemLogLevel">systemLogLevel</a></code> | <code>string</code> | Sets the system log level for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The function execution time (in seconds) after which Lambda terminates the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.tracing">tracing</a></code> | <code>aws-cdk-lib.aws_lambda.Tracing</code> | Enable AWS X-Ray Tracing for Lambda Function. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC network to place Lambda network interfaces. |
| <code><a href="#cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Where to place the network interfaces within the VPC. |

---

##### `adotInstrumentation`<sup>Optional</sup> <a name="adotInstrumentation" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.adotInstrumentation"></a>

```typescript
public readonly adotInstrumentation: AdotInstrumentationConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.AdotInstrumentationConfig
- *Default:* No ADOT instrumentation

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

---

##### `allowAllOutbound`<sup>Optional</sup> <a name="allowAllOutbound" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.allowAllOutbound"></a>

```typescript
public readonly allowAllOutbound: boolean;
```

- *Type:* boolean
- *Default:* true

Whether to allow the Lambda to send all network traffic.

If set to false, you must individually add traffic rules to allow the
Lambda to connect to network targets.

---

##### `allowPublicSubnet`<sup>Optional</sup> <a name="allowPublicSubnet" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.allowPublicSubnet"></a>

```typescript
public readonly allowPublicSubnet: boolean;
```

- *Type:* boolean
- *Default:* false

Lambda Functions in a public subnet can NOT access the internet.

Use this property to acknowledge this limitation and still place the function in a public subnet.

---

##### `applicationLogLevel`<sup>Optional</sup> <a name="applicationLogLevel" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.applicationLogLevel"></a>

```typescript
public readonly applicationLogLevel: string;
```

- *Type:* string
- *Default:* INFO

Sets the application log level for the function.

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture
- *Default:* Architecture.X86_64

The system architectures compatible with this lambda function.

---

##### `code`<sup>Optional</sup> <a name="code" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.code"></a>

```typescript
public readonly code: Code;
```

- *Type:* aws-cdk-lib.aws_lambda.Code

The source code of your Lambda function.

You can point to a file in an
Amazon Simple Storage Service (Amazon S3) bucket or specify your source
code as inline text.

---

##### `codeSigningConfig`<sup>Optional</sup> <a name="codeSigningConfig" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.codeSigningConfig"></a>

```typescript
public readonly codeSigningConfig: ICodeSigningConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.ICodeSigningConfig
- *Default:* Not Sign the Code

Code signing config associated with this function.

---

##### `currentVersionOptions`<sup>Optional</sup> <a name="currentVersionOptions" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.currentVersionOptions"></a>

```typescript
public readonly currentVersionOptions: VersionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.VersionOptions
- *Default:* default options as described in `VersionOptions`

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue
- *Default:* SQS queue with 14 day retention period if `deadLetterQueueEnabled` is `true`

The SQS queue to use if DLQ is enabled.

If SNS topic is desired, specify `deadLetterTopic` property instead.

---

##### `deadLetterQueueEnabled`<sup>Optional</sup> <a name="deadLetterQueueEnabled" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.deadLetterQueueEnabled"></a>

```typescript
public readonly deadLetterQueueEnabled: boolean;
```

- *Type:* boolean
- *Default:* false unless `deadLetterQueue` is set, which implies DLQ is enabled.

Enabled DLQ.

If `deadLetterQueue` is undefined,
an SQS queue with default options will be defined for your Function.

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic
- *Default:* no SNS topic

The SNS topic to use as a DLQ.

Note that if `deadLetterQueueEnabled` is set to `true`, an SQS queue will be created
rather than an SNS topic. Using an SNS topic as a DLQ requires this property to be set explicitly.

---

##### `description`<sup>Optional</sup> <a name="description" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the function.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No environment variables.

Key-value pairs that Lambda caches and makes available for your Lambda functions.

Use environment variables to apply configuration changes, such
as test and production environment configurations, without changing your
Lambda function source code.

---

##### `environmentEncryption`<sup>Optional</sup> <a name="environmentEncryption" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.environmentEncryption"></a>

```typescript
public readonly environmentEncryption: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* AWS Lambda creates and uses an AWS managed customer master key (CMK).

The AWS KMS key that's used to encrypt your function's environment variables.

---

##### `ephemeralStorageSize`<sup>Optional</sup> <a name="ephemeralStorageSize" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.ephemeralStorageSize"></a>

```typescript
public readonly ephemeralStorageSize: Size;
```

- *Type:* aws-cdk-lib.Size
- *Default:* 512 MiB

The size of the function’s /tmp directory in MiB.

---

##### `events`<sup>Optional</sup> <a name="events" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.events"></a>

```typescript
public readonly events: IEventSource[];
```

- *Type:* aws-cdk-lib.aws_lambda.IEventSource[]
- *Default:* No event sources.

Event sources for this function.

You can also add event sources using `addEventSource`.

---

##### `filesystem`<sup>Optional</sup> <a name="filesystem" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.filesystem"></a>

```typescript
public readonly filesystem: FileSystem;
```

- *Type:* aws-cdk-lib.aws_lambda.FileSystem
- *Default:* will not mount any filesystem

The filesystem configuration for the lambda function.

---

##### `functionName`<sup>Optional</sup> <a name="functionName" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string
- *Default:* AWS CloudFormation generates a unique physical ID and uses that ID for the function's name. For more information, see Name Type.

A name for the function.

---

##### `handler`<sup>Optional</sup> <a name="handler" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.handler"></a>

```typescript
public readonly handler: string;
```

- *Type:* string

The name of the method within your code that Lambda calls to execute your function.

The format includes the file name. It can also include
namespaces and other qualifiers, depending on the runtime.
For more information, see https://docs.aws.amazon.com/lambda/latest/dg/foundation-progmodel.html.

Use `Handler.FROM_IMAGE` when defining a function from a Docker image.

NOTE: If you specify your source code as inline text by specifying the
ZipFile property within the Code property, specify index.function_name as
the handler.

---

##### `initialPolicy`<sup>Optional</sup> <a name="initialPolicy" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.initialPolicy"></a>

```typescript
public readonly initialPolicy: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]
- *Default:* No policy statements are added to the created Lambda role.

Initial policy statements to add to the created Lambda Role.

You can call `addToRolePolicy` to the created lambda to add statements post creation.

---

##### `insightsVersion`<sup>Optional</sup> <a name="insightsVersion" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.insightsVersion"></a>

```typescript
public readonly insightsVersion: LambdaInsightsVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.LambdaInsightsVersion
- *Default:* No Lambda Insights

Specify the version of CloudWatch Lambda insights to use for monitoring.

---

##### `layers`<sup>Optional</sup> <a name="layers" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.layers"></a>

```typescript
public readonly layers: ILayerVersion[];
```

- *Type:* aws-cdk-lib.aws_lambda.ILayerVersion[]
- *Default:* No layers.

A list of layers to add to the function's execution environment.

You can configure your Lambda function to pull in
additional code during initialization in the form of layers. Layers are packages of libraries or other dependencies
that can be used by multiple functions.

---

##### `logFormat`<sup>Optional</sup> <a name="logFormat" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.logFormat"></a>

```typescript
public readonly logFormat: string;
```

- *Type:* string
- *Default:* Text format

Sets the logFormat for the function.

---

##### `logGroup`<sup>Optional</sup> <a name="logGroup" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* `/aws/lambda/${this.functionName}` default log group name created by Lambda

Sets the log group name for the function.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.INFINITE

The number of days log events are kept in CloudWatch Logs.

When updating
this property, unsetting it doesn't remove the log retention policy. To
remove the retention policy, set the value to `INFINITE`.

---

##### `logRetentionRetryOptions`<sup>Optional</sup> <a name="logRetentionRetryOptions" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.logRetentionRetryOptions"></a>

```typescript
public readonly logRetentionRetryOptions: LogRetentionRetryOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.LogRetentionRetryOptions
- *Default:* Default AWS SDK retry options.

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

These options control the retry policy when interacting with CloudWatch APIs.

---

##### `logRetentionRole`<sup>Optional</sup> <a name="logRetentionRole" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.logRetentionRole"></a>

```typescript
public readonly logRetentionRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A new role is created.

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

---

##### `maxEventAge`<sup>Optional</sup> <a name="maxEventAge" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.maxEventAge"></a>

```typescript
public readonly maxEventAge: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(6)

The maximum age of a request that Lambda sends to a function for processing.

Minimum: 60 seconds
Maximum: 6 hours

---

##### `memorySize`<sup>Optional</sup> <a name="memorySize" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.memorySize"></a>

```typescript
public readonly memorySize: number;
```

- *Type:* number
- *Default:* 128

The amount of memory, in MB, that is allocated to your Lambda function.

Lambda uses this value to proportionally allocate the amount of CPU
power. For more information, see Resource Model in the AWS Lambda
Developer Guide.

---

##### `onFailure`<sup>Optional</sup> <a name="onFailure" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.onFailure"></a>

```typescript
public readonly onFailure: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for failed invocations.

---

##### `onSuccess`<sup>Optional</sup> <a name="onSuccess" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.onSuccess"></a>

```typescript
public readonly onSuccess: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for successful invocations.

---

##### `paramsAndSecrets`<sup>Optional</sup> <a name="paramsAndSecrets" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.paramsAndSecrets"></a>

```typescript
public readonly paramsAndSecrets: ParamsAndSecretsLayerVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion
- *Default:* No Parameters and Secrets Extension

Specify the configuration of Parameters and Secrets Extension.

---

##### `profiling`<sup>Optional</sup> <a name="profiling" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.profiling"></a>

```typescript
public readonly profiling: boolean;
```

- *Type:* boolean
- *Default:* No profiling.

Enable profiling.

---

##### `profilingGroup`<sup>Optional</sup> <a name="profilingGroup" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.profilingGroup"></a>

```typescript
public readonly profilingGroup: IProfilingGroup;
```

- *Type:* aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup
- *Default:* A new profiling group will be created if `profiling` is set.

Profiling Group.

---

##### `reservedConcurrentExecutions`<sup>Optional</sup> <a name="reservedConcurrentExecutions" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.reservedConcurrentExecutions"></a>

```typescript
public readonly reservedConcurrentExecutions: number;
```

- *Type:* number
- *Default:* No specific limit - account limit.

The maximum of concurrent executions you want to reserve for the function.

---

##### `retryAttempts`<sup>Optional</sup> <a name="retryAttempts" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.retryAttempts"></a>

```typescript
public readonly retryAttempts: number;
```

- *Type:* number
- *Default:* 2

The maximum number of times to retry when the function returns an error.

Minimum: 0
Maximum: 2

---

##### `role`<sup>Optional</sup> <a name="role" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A unique role will be generated for this lambda function. Both supplied and generated roles can always be changed by calling `addToRolePolicy`.

Lambda execution role.

This is the role that will be assumed by the function upon execution.
It controls the permissions that the function will have. The Role must
be assumable by the 'lambda.amazonaws.com' service principal.

The default Role automatically has permissions granted for Lambda execution. If you
provide a Role, you must add the relevant AWS managed policies yourself.

The relevant managed policies are "service-role/AWSLambdaBasicExecutionRole" and
"service-role/AWSLambdaVPCAccessExecutionRole".

---

##### `runtime`<sup>Optional</sup> <a name="runtime" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

The runtime environment for the Lambda function that you are uploading.

For valid values, see the Runtime property in the AWS Lambda Developer
Guide.

Use `Runtime.FROM_IMAGE` when defining a function from a Docker image.

---

##### `runtimeManagementMode`<sup>Optional</sup> <a name="runtimeManagementMode" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.runtimeManagementMode"></a>

```typescript
public readonly runtimeManagementMode: RuntimeManagementMode;
```

- *Type:* aws-cdk-lib.aws_lambda.RuntimeManagementMode
- *Default:* Auto

Sets the runtime management configuration for a function's version.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* If the function is placed within a VPC and a security group is not specified, either by this or securityGroup prop, a dedicated security group will be created for this function.

The list of security groups to associate with the Lambda's network interfaces.

Only used if 'vpc' is supplied.

---

##### `snapStart`<sup>Optional</sup> <a name="snapStart" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.snapStart"></a>

```typescript
public readonly snapStart: SnapStartConf;
```

- *Type:* aws-cdk-lib.aws_lambda.SnapStartConf
- *Default:* No snapstart

Enable SnapStart for Lambda Function.

SnapStart is currently supported only for Java 11, 17 runtime

---

##### `stackId`<sup>Optional</sup> <a name="stackId" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.stackId"></a>

```typescript
public readonly stackId: string;
```

- *Type:* string
- *Default:* `edge-lambda-stack-${region}`

The stack ID of Lambda@Edge function.

---

##### `systemLogLevel`<sup>Optional</sup> <a name="systemLogLevel" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.systemLogLevel"></a>

```typescript
public readonly systemLogLevel: string;
```

- *Type:* string
- *Default:* INFO

Sets the system log level for the function.

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.seconds(3)

The function execution time (in seconds) after which Lambda terminates the function.

Because the execution time affects cost, set this value
based on the function's expected execution time.

---

##### `tracing`<sup>Optional</sup> <a name="tracing" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.tracing"></a>

```typescript
public readonly tracing: Tracing;
```

- *Type:* aws-cdk-lib.aws_lambda.Tracing
- *Default:* Tracing.Disabled

Enable AWS X-Ray Tracing for Lambda Function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* Function is not placed within a VPC.

VPC network to place Lambda network interfaces.

Specify this if the Lambda function needs to access resources in a VPC.
This is required when `vpcSubnets` is specified.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="cdk-nextjs-standalone.OptionalEdgeFunctionProps.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Where to place the network interfaces within the VPC.

This requires `vpc` to be specified in order for interfaces to actually be
placed in the subnets. If `vpc` is not specify, this will raise an error.

Note: Internet access for Lambda Functions requires a NAT Gateway, so picking
public subnets is not allowed (unless `allowPublicSubnet` is set to `true`).

---

### OptionalFunctionProps <a name="OptionalFunctionProps" id="cdk-nextjs-standalone.OptionalFunctionProps"></a>

OptionalFunctionProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalFunctionProps.Initializer"></a>

```typescript
import { OptionalFunctionProps } from 'cdk-nextjs-standalone'

const optionalFunctionProps: OptionalFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.adotInstrumentation">adotInstrumentation</a></code> | <code>aws-cdk-lib.aws_lambda.AdotInstrumentationConfig</code> | Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.allowAllOutbound">allowAllOutbound</a></code> | <code>boolean</code> | Whether to allow the Lambda to send all network traffic. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.allowPublicSubnet">allowPublicSubnet</a></code> | <code>boolean</code> | Lambda Functions in a public subnet can NOT access the internet. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.applicationLogLevel">applicationLogLevel</a></code> | <code>string</code> | Sets the application log level for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The system architectures compatible with this lambda function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.code">code</a></code> | <code>aws-cdk-lib.aws_lambda.Code</code> | The source code of your Lambda function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.codeSigningConfig">codeSigningConfig</a></code> | <code>aws-cdk-lib.aws_lambda.ICodeSigningConfig</code> | Code signing config associated with this function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.currentVersionOptions">currentVersionOptions</a></code> | <code>aws-cdk-lib.aws_lambda.VersionOptions</code> | Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The SQS queue to use if DLQ is enabled. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.deadLetterQueueEnabled">deadLetterQueueEnabled</a></code> | <code>boolean</code> | Enabled DLQ. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The SNS topic to use as a DLQ. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.description">description</a></code> | <code>string</code> | A description of the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Key-value pairs that Lambda caches and makes available for your Lambda functions. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.environmentEncryption">environmentEncryption</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The AWS KMS key that's used to encrypt your function's environment variables. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.ephemeralStorageSize">ephemeralStorageSize</a></code> | <code>aws-cdk-lib.Size</code> | The size of the function’s /tmp directory in MiB. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.events">events</a></code> | <code>aws-cdk-lib.aws_lambda.IEventSource[]</code> | Event sources for this function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.filesystem">filesystem</a></code> | <code>aws-cdk-lib.aws_lambda.FileSystem</code> | The filesystem configuration for the lambda function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.functionName">functionName</a></code> | <code>string</code> | A name for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.handler">handler</a></code> | <code>string</code> | The name of the method within your code that Lambda calls to execute your function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.initialPolicy">initialPolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Initial policy statements to add to the created Lambda Role. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.insightsVersion">insightsVersion</a></code> | <code>aws-cdk-lib.aws_lambda.LambdaInsightsVersion</code> | Specify the version of CloudWatch Lambda insights to use for monitoring. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.layers">layers</a></code> | <code>aws-cdk-lib.aws_lambda.ILayerVersion[]</code> | A list of layers to add to the function's execution environment. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.logFormat">logFormat</a></code> | <code>string</code> | Sets the logFormat for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | Sets the log group name for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in CloudWatch Logs. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.logRetentionRetryOptions">logRetentionRetryOptions</a></code> | <code>aws-cdk-lib.aws_lambda.LogRetentionRetryOptions</code> | When log retention is specified, a custom resource attempts to create the CloudWatch log group. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.logRetentionRole">logRetentionRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role for the Lambda function associated with the custom resource that sets the retention policy. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.maxEventAge">maxEventAge</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum age of a request that Lambda sends to a function for processing. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.memorySize">memorySize</a></code> | <code>number</code> | The amount of memory, in MB, that is allocated to your Lambda function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.onFailure">onFailure</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for failed invocations. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.onSuccess">onSuccess</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for successful invocations. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.paramsAndSecrets">paramsAndSecrets</a></code> | <code>aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion</code> | Specify the configuration of Parameters and Secrets Extension. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.profiling">profiling</a></code> | <code>boolean</code> | Enable profiling. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.profilingGroup">profilingGroup</a></code> | <code>aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup</code> | Profiling Group. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.reservedConcurrentExecutions">reservedConcurrentExecutions</a></code> | <code>number</code> | The maximum of concurrent executions you want to reserve for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.retryAttempts">retryAttempts</a></code> | <code>number</code> | The maximum number of times to retry when the function returns an error. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Lambda execution role. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime environment for the Lambda function that you are uploading. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.runtimeManagementMode">runtimeManagementMode</a></code> | <code>aws-cdk-lib.aws_lambda.RuntimeManagementMode</code> | Sets the runtime management configuration for a function's version. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The list of security groups to associate with the Lambda's network interfaces. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.snapStart">snapStart</a></code> | <code>aws-cdk-lib.aws_lambda.SnapStartConf</code> | Enable SnapStart for Lambda Function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.systemLogLevel">systemLogLevel</a></code> | <code>string</code> | Sets the system log level for the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The function execution time (in seconds) after which Lambda terminates the function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.tracing">tracing</a></code> | <code>aws-cdk-lib.aws_lambda.Tracing</code> | Enable AWS X-Ray Tracing for Lambda Function. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC network to place Lambda network interfaces. |
| <code><a href="#cdk-nextjs-standalone.OptionalFunctionProps.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Where to place the network interfaces within the VPC. |

---

##### `adotInstrumentation`<sup>Optional</sup> <a name="adotInstrumentation" id="cdk-nextjs-standalone.OptionalFunctionProps.property.adotInstrumentation"></a>

```typescript
public readonly adotInstrumentation: AdotInstrumentationConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.AdotInstrumentationConfig
- *Default:* No ADOT instrumentation

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

---

##### `allowAllOutbound`<sup>Optional</sup> <a name="allowAllOutbound" id="cdk-nextjs-standalone.OptionalFunctionProps.property.allowAllOutbound"></a>

```typescript
public readonly allowAllOutbound: boolean;
```

- *Type:* boolean
- *Default:* true

Whether to allow the Lambda to send all network traffic.

If set to false, you must individually add traffic rules to allow the
Lambda to connect to network targets.

---

##### `allowPublicSubnet`<sup>Optional</sup> <a name="allowPublicSubnet" id="cdk-nextjs-standalone.OptionalFunctionProps.property.allowPublicSubnet"></a>

```typescript
public readonly allowPublicSubnet: boolean;
```

- *Type:* boolean
- *Default:* false

Lambda Functions in a public subnet can NOT access the internet.

Use this property to acknowledge this limitation and still place the function in a public subnet.

---

##### `applicationLogLevel`<sup>Optional</sup> <a name="applicationLogLevel" id="cdk-nextjs-standalone.OptionalFunctionProps.property.applicationLogLevel"></a>

```typescript
public readonly applicationLogLevel: string;
```

- *Type:* string
- *Default:* INFO

Sets the application log level for the function.

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="cdk-nextjs-standalone.OptionalFunctionProps.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture
- *Default:* Architecture.X86_64

The system architectures compatible with this lambda function.

---

##### `code`<sup>Optional</sup> <a name="code" id="cdk-nextjs-standalone.OptionalFunctionProps.property.code"></a>

```typescript
public readonly code: Code;
```

- *Type:* aws-cdk-lib.aws_lambda.Code

The source code of your Lambda function.

You can point to a file in an
Amazon Simple Storage Service (Amazon S3) bucket or specify your source
code as inline text.

---

##### `codeSigningConfig`<sup>Optional</sup> <a name="codeSigningConfig" id="cdk-nextjs-standalone.OptionalFunctionProps.property.codeSigningConfig"></a>

```typescript
public readonly codeSigningConfig: ICodeSigningConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.ICodeSigningConfig
- *Default:* Not Sign the Code

Code signing config associated with this function.

---

##### `currentVersionOptions`<sup>Optional</sup> <a name="currentVersionOptions" id="cdk-nextjs-standalone.OptionalFunctionProps.property.currentVersionOptions"></a>

```typescript
public readonly currentVersionOptions: VersionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.VersionOptions
- *Default:* default options as described in `VersionOptions`

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="cdk-nextjs-standalone.OptionalFunctionProps.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue
- *Default:* SQS queue with 14 day retention period if `deadLetterQueueEnabled` is `true`

The SQS queue to use if DLQ is enabled.

If SNS topic is desired, specify `deadLetterTopic` property instead.

---

##### `deadLetterQueueEnabled`<sup>Optional</sup> <a name="deadLetterQueueEnabled" id="cdk-nextjs-standalone.OptionalFunctionProps.property.deadLetterQueueEnabled"></a>

```typescript
public readonly deadLetterQueueEnabled: boolean;
```

- *Type:* boolean
- *Default:* false unless `deadLetterQueue` is set, which implies DLQ is enabled.

Enabled DLQ.

If `deadLetterQueue` is undefined,
an SQS queue with default options will be defined for your Function.

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="cdk-nextjs-standalone.OptionalFunctionProps.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic
- *Default:* no SNS topic

The SNS topic to use as a DLQ.

Note that if `deadLetterQueueEnabled` is set to `true`, an SQS queue will be created
rather than an SNS topic. Using an SNS topic as a DLQ requires this property to be set explicitly.

---

##### `description`<sup>Optional</sup> <a name="description" id="cdk-nextjs-standalone.OptionalFunctionProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the function.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.OptionalFunctionProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No environment variables.

Key-value pairs that Lambda caches and makes available for your Lambda functions.

Use environment variables to apply configuration changes, such
as test and production environment configurations, without changing your
Lambda function source code.

---

##### `environmentEncryption`<sup>Optional</sup> <a name="environmentEncryption" id="cdk-nextjs-standalone.OptionalFunctionProps.property.environmentEncryption"></a>

```typescript
public readonly environmentEncryption: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* AWS Lambda creates and uses an AWS managed customer master key (CMK).

The AWS KMS key that's used to encrypt your function's environment variables.

---

##### `ephemeralStorageSize`<sup>Optional</sup> <a name="ephemeralStorageSize" id="cdk-nextjs-standalone.OptionalFunctionProps.property.ephemeralStorageSize"></a>

```typescript
public readonly ephemeralStorageSize: Size;
```

- *Type:* aws-cdk-lib.Size
- *Default:* 512 MiB

The size of the function’s /tmp directory in MiB.

---

##### `events`<sup>Optional</sup> <a name="events" id="cdk-nextjs-standalone.OptionalFunctionProps.property.events"></a>

```typescript
public readonly events: IEventSource[];
```

- *Type:* aws-cdk-lib.aws_lambda.IEventSource[]
- *Default:* No event sources.

Event sources for this function.

You can also add event sources using `addEventSource`.

---

##### `filesystem`<sup>Optional</sup> <a name="filesystem" id="cdk-nextjs-standalone.OptionalFunctionProps.property.filesystem"></a>

```typescript
public readonly filesystem: FileSystem;
```

- *Type:* aws-cdk-lib.aws_lambda.FileSystem
- *Default:* will not mount any filesystem

The filesystem configuration for the lambda function.

---

##### `functionName`<sup>Optional</sup> <a name="functionName" id="cdk-nextjs-standalone.OptionalFunctionProps.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string
- *Default:* AWS CloudFormation generates a unique physical ID and uses that ID for the function's name. For more information, see Name Type.

A name for the function.

---

##### `handler`<sup>Optional</sup> <a name="handler" id="cdk-nextjs-standalone.OptionalFunctionProps.property.handler"></a>

```typescript
public readonly handler: string;
```

- *Type:* string

The name of the method within your code that Lambda calls to execute your function.

The format includes the file name. It can also include
namespaces and other qualifiers, depending on the runtime.
For more information, see https://docs.aws.amazon.com/lambda/latest/dg/foundation-progmodel.html.

Use `Handler.FROM_IMAGE` when defining a function from a Docker image.

NOTE: If you specify your source code as inline text by specifying the
ZipFile property within the Code property, specify index.function_name as
the handler.

---

##### `initialPolicy`<sup>Optional</sup> <a name="initialPolicy" id="cdk-nextjs-standalone.OptionalFunctionProps.property.initialPolicy"></a>

```typescript
public readonly initialPolicy: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]
- *Default:* No policy statements are added to the created Lambda role.

Initial policy statements to add to the created Lambda Role.

You can call `addToRolePolicy` to the created lambda to add statements post creation.

---

##### `insightsVersion`<sup>Optional</sup> <a name="insightsVersion" id="cdk-nextjs-standalone.OptionalFunctionProps.property.insightsVersion"></a>

```typescript
public readonly insightsVersion: LambdaInsightsVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.LambdaInsightsVersion
- *Default:* No Lambda Insights

Specify the version of CloudWatch Lambda insights to use for monitoring.

---

##### `layers`<sup>Optional</sup> <a name="layers" id="cdk-nextjs-standalone.OptionalFunctionProps.property.layers"></a>

```typescript
public readonly layers: ILayerVersion[];
```

- *Type:* aws-cdk-lib.aws_lambda.ILayerVersion[]
- *Default:* No layers.

A list of layers to add to the function's execution environment.

You can configure your Lambda function to pull in
additional code during initialization in the form of layers. Layers are packages of libraries or other dependencies
that can be used by multiple functions.

---

##### `logFormat`<sup>Optional</sup> <a name="logFormat" id="cdk-nextjs-standalone.OptionalFunctionProps.property.logFormat"></a>

```typescript
public readonly logFormat: string;
```

- *Type:* string
- *Default:* Text format

Sets the logFormat for the function.

---

##### `logGroup`<sup>Optional</sup> <a name="logGroup" id="cdk-nextjs-standalone.OptionalFunctionProps.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* `/aws/lambda/${this.functionName}` default log group name created by Lambda

Sets the log group name for the function.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="cdk-nextjs-standalone.OptionalFunctionProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.INFINITE

The number of days log events are kept in CloudWatch Logs.

When updating
this property, unsetting it doesn't remove the log retention policy. To
remove the retention policy, set the value to `INFINITE`.

---

##### `logRetentionRetryOptions`<sup>Optional</sup> <a name="logRetentionRetryOptions" id="cdk-nextjs-standalone.OptionalFunctionProps.property.logRetentionRetryOptions"></a>

```typescript
public readonly logRetentionRetryOptions: LogRetentionRetryOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.LogRetentionRetryOptions
- *Default:* Default AWS SDK retry options.

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

These options control the retry policy when interacting with CloudWatch APIs.

---

##### `logRetentionRole`<sup>Optional</sup> <a name="logRetentionRole" id="cdk-nextjs-standalone.OptionalFunctionProps.property.logRetentionRole"></a>

```typescript
public readonly logRetentionRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A new role is created.

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

---

##### `maxEventAge`<sup>Optional</sup> <a name="maxEventAge" id="cdk-nextjs-standalone.OptionalFunctionProps.property.maxEventAge"></a>

```typescript
public readonly maxEventAge: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(6)

The maximum age of a request that Lambda sends to a function for processing.

Minimum: 60 seconds
Maximum: 6 hours

---

##### `memorySize`<sup>Optional</sup> <a name="memorySize" id="cdk-nextjs-standalone.OptionalFunctionProps.property.memorySize"></a>

```typescript
public readonly memorySize: number;
```

- *Type:* number
- *Default:* 128

The amount of memory, in MB, that is allocated to your Lambda function.

Lambda uses this value to proportionally allocate the amount of CPU
power. For more information, see Resource Model in the AWS Lambda
Developer Guide.

---

##### `onFailure`<sup>Optional</sup> <a name="onFailure" id="cdk-nextjs-standalone.OptionalFunctionProps.property.onFailure"></a>

```typescript
public readonly onFailure: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for failed invocations.

---

##### `onSuccess`<sup>Optional</sup> <a name="onSuccess" id="cdk-nextjs-standalone.OptionalFunctionProps.property.onSuccess"></a>

```typescript
public readonly onSuccess: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for successful invocations.

---

##### `paramsAndSecrets`<sup>Optional</sup> <a name="paramsAndSecrets" id="cdk-nextjs-standalone.OptionalFunctionProps.property.paramsAndSecrets"></a>

```typescript
public readonly paramsAndSecrets: ParamsAndSecretsLayerVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion
- *Default:* No Parameters and Secrets Extension

Specify the configuration of Parameters and Secrets Extension.

---

##### `profiling`<sup>Optional</sup> <a name="profiling" id="cdk-nextjs-standalone.OptionalFunctionProps.property.profiling"></a>

```typescript
public readonly profiling: boolean;
```

- *Type:* boolean
- *Default:* No profiling.

Enable profiling.

---

##### `profilingGroup`<sup>Optional</sup> <a name="profilingGroup" id="cdk-nextjs-standalone.OptionalFunctionProps.property.profilingGroup"></a>

```typescript
public readonly profilingGroup: IProfilingGroup;
```

- *Type:* aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup
- *Default:* A new profiling group will be created if `profiling` is set.

Profiling Group.

---

##### `reservedConcurrentExecutions`<sup>Optional</sup> <a name="reservedConcurrentExecutions" id="cdk-nextjs-standalone.OptionalFunctionProps.property.reservedConcurrentExecutions"></a>

```typescript
public readonly reservedConcurrentExecutions: number;
```

- *Type:* number
- *Default:* No specific limit - account limit.

The maximum of concurrent executions you want to reserve for the function.

---

##### `retryAttempts`<sup>Optional</sup> <a name="retryAttempts" id="cdk-nextjs-standalone.OptionalFunctionProps.property.retryAttempts"></a>

```typescript
public readonly retryAttempts: number;
```

- *Type:* number
- *Default:* 2

The maximum number of times to retry when the function returns an error.

Minimum: 0
Maximum: 2

---

##### `role`<sup>Optional</sup> <a name="role" id="cdk-nextjs-standalone.OptionalFunctionProps.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A unique role will be generated for this lambda function. Both supplied and generated roles can always be changed by calling `addToRolePolicy`.

Lambda execution role.

This is the role that will be assumed by the function upon execution.
It controls the permissions that the function will have. The Role must
be assumable by the 'lambda.amazonaws.com' service principal.

The default Role automatically has permissions granted for Lambda execution. If you
provide a Role, you must add the relevant AWS managed policies yourself.

The relevant managed policies are "service-role/AWSLambdaBasicExecutionRole" and
"service-role/AWSLambdaVPCAccessExecutionRole".

---

##### `runtime`<sup>Optional</sup> <a name="runtime" id="cdk-nextjs-standalone.OptionalFunctionProps.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

The runtime environment for the Lambda function that you are uploading.

For valid values, see the Runtime property in the AWS Lambda Developer
Guide.

Use `Runtime.FROM_IMAGE` when defining a function from a Docker image.

---

##### `runtimeManagementMode`<sup>Optional</sup> <a name="runtimeManagementMode" id="cdk-nextjs-standalone.OptionalFunctionProps.property.runtimeManagementMode"></a>

```typescript
public readonly runtimeManagementMode: RuntimeManagementMode;
```

- *Type:* aws-cdk-lib.aws_lambda.RuntimeManagementMode
- *Default:* Auto

Sets the runtime management configuration for a function's version.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="cdk-nextjs-standalone.OptionalFunctionProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* If the function is placed within a VPC and a security group is not specified, either by this or securityGroup prop, a dedicated security group will be created for this function.

The list of security groups to associate with the Lambda's network interfaces.

Only used if 'vpc' is supplied.

---

##### `snapStart`<sup>Optional</sup> <a name="snapStart" id="cdk-nextjs-standalone.OptionalFunctionProps.property.snapStart"></a>

```typescript
public readonly snapStart: SnapStartConf;
```

- *Type:* aws-cdk-lib.aws_lambda.SnapStartConf
- *Default:* No snapstart

Enable SnapStart for Lambda Function.

SnapStart is currently supported only for Java 11, 17 runtime

---

##### `systemLogLevel`<sup>Optional</sup> <a name="systemLogLevel" id="cdk-nextjs-standalone.OptionalFunctionProps.property.systemLogLevel"></a>

```typescript
public readonly systemLogLevel: string;
```

- *Type:* string
- *Default:* INFO

Sets the system log level for the function.

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="cdk-nextjs-standalone.OptionalFunctionProps.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.seconds(3)

The function execution time (in seconds) after which Lambda terminates the function.

Because the execution time affects cost, set this value
based on the function's expected execution time.

---

##### `tracing`<sup>Optional</sup> <a name="tracing" id="cdk-nextjs-standalone.OptionalFunctionProps.property.tracing"></a>

```typescript
public readonly tracing: Tracing;
```

- *Type:* aws-cdk-lib.aws_lambda.Tracing
- *Default:* Tracing.Disabled

Enable AWS X-Ray Tracing for Lambda Function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="cdk-nextjs-standalone.OptionalFunctionProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* Function is not placed within a VPC.

VPC network to place Lambda network interfaces.

Specify this if the Lambda function needs to access resources in a VPC.
This is required when `vpcSubnets` is specified.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="cdk-nextjs-standalone.OptionalFunctionProps.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Where to place the network interfaces within the VPC.

This requires `vpc` to be specified in order for interfaces to actually be
placed in the subnets. If `vpc` is not specify, this will raise an error.

Note: Internet access for Lambda Functions requires a NAT Gateway, so picking
public subnets is not allowed (unless `allowPublicSubnet` is set to `true`).

---

### OptionalHostedZoneProviderProps <a name="OptionalHostedZoneProviderProps" id="cdk-nextjs-standalone.OptionalHostedZoneProviderProps"></a>

OptionalHostedZoneProviderProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalHostedZoneProviderProps.Initializer"></a>

```typescript
import { OptionalHostedZoneProviderProps } from 'cdk-nextjs-standalone'

const optionalHostedZoneProviderProps: OptionalHostedZoneProviderProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalHostedZoneProviderProps.property.domainName">domainName</a></code> | <code>string</code> | The zone domain e.g. example.com. |
| <code><a href="#cdk-nextjs-standalone.OptionalHostedZoneProviderProps.property.privateZone">privateZone</a></code> | <code>boolean</code> | Whether the zone that is being looked up is a private hosted zone. |
| <code><a href="#cdk-nextjs-standalone.OptionalHostedZoneProviderProps.property.vpcId">vpcId</a></code> | <code>string</code> | Specifies the ID of the VPC associated with a private hosted zone. |

---

##### `domainName`<sup>Optional</sup> <a name="domainName" id="cdk-nextjs-standalone.OptionalHostedZoneProviderProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

The zone domain e.g. example.com.

---

##### `privateZone`<sup>Optional</sup> <a name="privateZone" id="cdk-nextjs-standalone.OptionalHostedZoneProviderProps.property.privateZone"></a>

```typescript
public readonly privateZone: boolean;
```

- *Type:* boolean
- *Default:* false

Whether the zone that is being looked up is a private hosted zone.

---

##### `vpcId`<sup>Optional</sup> <a name="vpcId" id="cdk-nextjs-standalone.OptionalHostedZoneProviderProps.property.vpcId"></a>

```typescript
public readonly vpcId: string;
```

- *Type:* string
- *Default:* No VPC ID

Specifies the ID of the VPC associated with a private hosted zone.

If a VPC ID is provided and privateZone is false, no results will be returned
and an error will be raised

---

### OptionalNextjsBucketDeploymentProps <a name="OptionalNextjsBucketDeploymentProps" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps"></a>

OptionalNextjsBucketDeploymentProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.Initializer"></a>

```typescript
import { OptionalNextjsBucketDeploymentProps } from 'cdk-nextjs-standalone'

const optionalNextjsBucketDeploymentProps: OptionalNextjsBucketDeploymentProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.asset">asset</a></code> | <code>aws-cdk-lib.aws_s3_assets.Asset</code> | Source `Asset`. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.debug">debug</a></code> | <code>boolean</code> | Enable verbose output of Custom Resource Lambda. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.destinationBucket">destinationBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Destination S3 Bucket. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.destinationKeyPrefix">destinationKeyPrefix</a></code> | <code>string</code> | Destination S3 Bucket Key Prefix. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBucketDeploymentOverrides">NextjsBucketDeploymentOverrides</a></code> | Override props for every construct. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.prune">prune</a></code> | <code>boolean</code> | If `true`, then delete old objects in `destinationBucket`/`destinationKeyPrefix` **after** uploading new objects. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.putConfig">putConfig</a></code> | <code>{[ key: string ]: {[ key: string ]: string}}</code> | Mapping of files to PUT options for `PutObjectCommand`. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.substitutionConfig">substitutionConfig</a></code> | <code>{[ key: string ]: string}</code> | Replace placeholders in all files in `asset`. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.zip">zip</a></code> | <code>boolean</code> | If `true` then files will be zipped before writing to destination bucket. |

---

##### `asset`<sup>Optional</sup> <a name="asset" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.asset"></a>

```typescript
public readonly asset: Asset;
```

- *Type:* aws-cdk-lib.aws_s3_assets.Asset

Source `Asset`.

---

##### `debug`<sup>Optional</sup> <a name="debug" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.debug"></a>

```typescript
public readonly debug: boolean;
```

- *Type:* boolean
- *Default:* false

Enable verbose output of Custom Resource Lambda.

---

##### `destinationBucket`<sup>Optional</sup> <a name="destinationBucket" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.destinationBucket"></a>

```typescript
public readonly destinationBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Destination S3 Bucket.

---

##### `destinationKeyPrefix`<sup>Optional</sup> <a name="destinationKeyPrefix" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.destinationKeyPrefix"></a>

```typescript
public readonly destinationKeyPrefix: string;
```

- *Type:* string

Destination S3 Bucket Key Prefix.

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsBucketDeploymentOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBucketDeploymentOverrides">NextjsBucketDeploymentOverrides</a>

Override props for every construct.

---

##### `prune`<sup>Optional</sup> <a name="prune" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.prune"></a>

```typescript
public readonly prune: boolean;
```

- *Type:* boolean
- *Default:* true

If `true`, then delete old objects in `destinationBucket`/`destinationKeyPrefix` **after** uploading new objects.

Only applies if `zip` is `false`.
Old objects are determined by listing objects
in bucket before creating new objects and finding the objects that aren't in
the new objects.

---

##### `putConfig`<sup>Optional</sup> <a name="putConfig" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.putConfig"></a>

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

##### `substitutionConfig`<sup>Optional</sup> <a name="substitutionConfig" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.substitutionConfig"></a>

```typescript
public readonly substitutionConfig: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Replace placeholders in all files in `asset`.

Placeholder targets are
defined by keys of record. Values to replace placeholders with are defined
by values of record.

---

##### `zip`<sup>Optional</sup> <a name="zip" id="cdk-nextjs-standalone.OptionalNextjsBucketDeploymentProps.property.zip"></a>

```typescript
public readonly zip: boolean;
```

- *Type:* boolean
- *Default:* false

If `true` then files will be zipped before writing to destination bucket.

Useful for Lambda functions.

---

### OptionalNextjsBuildProps <a name="OptionalNextjsBuildProps" id="cdk-nextjs-standalone.OptionalNextjsBuildProps"></a>

OptionalNextjsBuildProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalNextjsBuildProps.Initializer"></a>

```typescript
import { OptionalNextjsBuildProps } from 'cdk-nextjs-standalone'

const optionalNextjsBuildProps: OptionalNextjsBuildProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBuildProps.property.buildCommand">buildCommand</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBuildProps.property.buildPath">buildPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBuildProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBuildProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBuildProps.property.quiet">quiet</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsBuildProps.property.skipBuild">skipBuild</a></code> | <code>boolean</code> | *No description.* |

---

##### `buildCommand`<sup>Optional</sup> <a name="buildCommand" id="cdk-nextjs-standalone.OptionalNextjsBuildProps.property.buildCommand"></a>

```typescript
public readonly buildCommand: string;
```

- *Type:* string

---

##### `buildPath`<sup>Optional</sup> <a name="buildPath" id="cdk-nextjs-standalone.OptionalNextjsBuildProps.property.buildPath"></a>

```typescript
public readonly buildPath: string;
```

- *Type:* string

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.OptionalNextjsBuildProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `nextjsPath`<sup>Optional</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.OptionalNextjsBuildProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.OptionalNextjsBuildProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

---

##### `skipBuild`<sup>Optional</sup> <a name="skipBuild" id="cdk-nextjs-standalone.OptionalNextjsBuildProps.property.skipBuild"></a>

```typescript
public readonly skipBuild: boolean;
```

- *Type:* boolean

---

### OptionalNextjsDistributionProps <a name="OptionalNextjsDistributionProps" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps"></a>

OptionalNextjsDistributionProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.Initializer"></a>

```typescript
import { OptionalNextjsDistributionProps } from 'cdk-nextjs-standalone'

const optionalNextjsDistributionProps: OptionalNextjsDistributionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.basePath">basePath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.Distribution</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.functionUrlAuthType">functionUrlAuthType</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionUrlAuthType</code> | Override lambda function url auth type. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.imageOptFunction">imageOptFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Lambda function to optimize images. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.nextDomain">nextDomain</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDomain">NextjsDomain</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDistributionOverrides">NextjsDistributionOverrides</a></code> | Override props for every construct. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.serverFunction">serverFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Lambda function to route all non-static requests to. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.staticAssetsBucket">staticAssetsBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Bucket containing static assets. |

---

##### `basePath`<sup>Optional</sup> <a name="basePath" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.basePath"></a>

```typescript
public readonly basePath: string;
```

- *Type:* string

---

##### `distribution`<sup>Optional</sup> <a name="distribution" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.distribution"></a>

```typescript
public readonly distribution: Distribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.Distribution

---

##### `functionUrlAuthType`<sup>Optional</sup> <a name="functionUrlAuthType" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.functionUrlAuthType"></a>

```typescript
public readonly functionUrlAuthType: FunctionUrlAuthType;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrlAuthType
- *Default:* "NONE"

Override lambda function url auth type.

---

##### `imageOptFunction`<sup>Optional</sup> <a name="imageOptFunction" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.imageOptFunction"></a>

```typescript
public readonly imageOptFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Lambda function to optimize images.

Must be provided if you want to serve dynamic requests.

---

##### `nextBuild`<sup>Optional</sup> <a name="nextBuild" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

---

##### `nextDomain`<sup>Optional</sup> <a name="nextDomain" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.nextDomain"></a>

```typescript
public readonly nextDomain: NextjsDomain;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDomain">NextjsDomain</a>

---

##### `nextjsPath`<sup>Optional</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsDistributionOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDistributionOverrides">NextjsDistributionOverrides</a>

Override props for every construct.

---

##### `serverFunction`<sup>Optional</sup> <a name="serverFunction" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.serverFunction"></a>

```typescript
public readonly serverFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Lambda function to route all non-static requests to.

Must be provided if you want to serve dynamic requests.

---

##### `staticAssetsBucket`<sup>Optional</sup> <a name="staticAssetsBucket" id="cdk-nextjs-standalone.OptionalNextjsDistributionProps.property.staticAssetsBucket"></a>

```typescript
public readonly staticAssetsBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Bucket containing static assets.

Must be provided if you want to serve static files.

---

### OptionalNextjsDomainProps <a name="OptionalNextjsDomainProps" id="cdk-nextjs-standalone.OptionalNextjsDomainProps"></a>

OptionalNextjsDomainProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalNextjsDomainProps.Initializer"></a>

```typescript
import { OptionalNextjsDomainProps } from 'cdk-nextjs-standalone'

const optionalNextjsDomainProps: OptionalNextjsDomainProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDomainProps.property.alternateNames">alternateNames</a></code> | <code>string[]</code> | Alternate domain names that should route to the Cloudfront Distribution. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDomainProps.property.certificate">certificate</a></code> | <code>aws-cdk-lib.aws_certificatemanager.ICertificate</code> | If this prop is `undefined` then an ACM `Certificate` will be created based on {@link NextjsDomainProps.domainName } with DNS Validation. This prop allows you to control the TLS/SSL certificate created. The certificate you create must be in the `us-east-1` (N. Virginia) region as required by AWS CloudFront. Set this option if you have an existing certificate in the `us-east-1` region in AWS Certificate Manager you want to use. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDomainProps.property.certificateDomainName">certificateDomainName</a></code> | <code>string</code> | The domain name used in this construct when creating an ACM `Certificate`. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDomainProps.property.domainName">domainName</a></code> | <code>string</code> | An easy to remember address of your website. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDomainProps.property.hostedZone">hostedZone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | You must create the hosted zone out-of-band. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsDomainProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDomainOverrides">NextjsDomainOverrides</a></code> | Override props for every construct. |

---

##### `alternateNames`<sup>Optional</sup> <a name="alternateNames" id="cdk-nextjs-standalone.OptionalNextjsDomainProps.property.alternateNames"></a>

```typescript
public readonly alternateNames: string[];
```

- *Type:* string[]

Alternate domain names that should route to the Cloudfront Distribution.

For example, if you specificied `"example.com"` as your {@link NextjsDomainProps.domainName },
you could specify `["www.example.com", "api.example.com"]`.
Learn more about the [requirements](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html#alternate-domain-names-requirements)
and [restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html#alternate-domain-names-restrictions)
for using alternate domain names with CloudFront.

Note, in order to use alternate domain names, they must be covered by your
certificate. By default, the certificate created in this construct only covers
the {@link NextjsDomainProps.domainName }. Therefore, you'll need to specify
a wildcard domain name like `"*.example.com"` with {@link NextjsDomainProps.certificateDomainName }
so that this construct will create the certificate the covers the alternate
domain names. Otherwise, you can use {@link NextjsDomainProps.certificate }
to create the certificate yourself where you'll need to ensure it has a
wildcard or uses subject alternative names including the
alternative names specified here.

---

##### `certificate`<sup>Optional</sup> <a name="certificate" id="cdk-nextjs-standalone.OptionalNextjsDomainProps.property.certificate"></a>

```typescript
public readonly certificate: ICertificate;
```

- *Type:* aws-cdk-lib.aws_certificatemanager.ICertificate

If this prop is `undefined` then an ACM `Certificate` will be created based on {@link NextjsDomainProps.domainName } with DNS Validation. This prop allows you to control the TLS/SSL certificate created. The certificate you create must be in the `us-east-1` (N. Virginia) region as required by AWS CloudFront. Set this option if you have an existing certificate in the `us-east-1` region in AWS Certificate Manager you want to use.

---

##### `certificateDomainName`<sup>Optional</sup> <a name="certificateDomainName" id="cdk-nextjs-standalone.OptionalNextjsDomainProps.property.certificateDomainName"></a>

```typescript
public readonly certificateDomainName: string;
```

- *Type:* string

The domain name used in this construct when creating an ACM `Certificate`.

Useful
when passing {@link NextjsDomainProps.alternateNames } and you need to specify
a wildcard domain like "*.example.com". If `undefined`, then {@link NextjsDomainProps.domainName }
will be used.

If {@link NextjsDomainProps.certificate } is passed, then this prop is ignored.

---

##### `domainName`<sup>Optional</sup> <a name="domainName" id="cdk-nextjs-standalone.OptionalNextjsDomainProps.property.domainName"></a>

```typescript
public readonly domainName: string;
```

- *Type:* string

An easy to remember address of your website.

Only supports domains hosted
on [Route 53](https://aws.amazon.com/route53/). Used as `domainName` for
ACM `Certificate` if {@link NextjsDomainProps.certificate } and
{@link NextjsDomainProps.certificateDomainName } are `undefined`.

---

##### `hostedZone`<sup>Optional</sup> <a name="hostedZone" id="cdk-nextjs-standalone.OptionalNextjsDomainProps.property.hostedZone"></a>

```typescript
public readonly hostedZone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

You must create the hosted zone out-of-band.

You can lookup the hosted zone outside this construct and pass it in via this prop.
Alternatively if this prop is `undefined`, then the hosted zone will be
**looked up** (not created) via `HostedZone.fromLookup` with {@link NextjsDomainProps.domainName }.

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.OptionalNextjsDomainProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsDomainOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDomainOverrides">NextjsDomainOverrides</a>

Override props for every construct.

---

### OptionalNextjsImageProps <a name="OptionalNextjsImageProps" id="cdk-nextjs-standalone.OptionalNextjsImageProps"></a>

OptionalNextjsImageProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalNextjsImageProps.Initializer"></a>

```typescript
import { OptionalNextjsImageProps } from 'cdk-nextjs-standalone'

const optionalNextjsImageProps: OptionalNextjsImageProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsImageProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket holding application images. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsImageProps.property.lambdaOptions">lambdaOptions</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override function properties. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsImageProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsImageProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsImageOverrides">NextjsImageOverrides</a></code> | Override props for every construct. |

---

##### `bucket`<sup>Optional</sup> <a name="bucket" id="cdk-nextjs-standalone.OptionalNextjsImageProps.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket holding application images.

---

##### `lambdaOptions`<sup>Optional</sup> <a name="lambdaOptions" id="cdk-nextjs-standalone.OptionalNextjsImageProps.property.lambdaOptions"></a>

```typescript
public readonly lambdaOptions: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override function properties.

---

##### `nextBuild`<sup>Optional</sup> <a name="nextBuild" id="cdk-nextjs-standalone.OptionalNextjsImageProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.OptionalNextjsImageProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsImageOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsImageOverrides">NextjsImageOverrides</a>

Override props for every construct.

---

### OptionalNextjsInvalidationProps <a name="OptionalNextjsInvalidationProps" id="cdk-nextjs-standalone.OptionalNextjsInvalidationProps"></a>

OptionalNextjsInvalidationProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalNextjsInvalidationProps.Initializer"></a>

```typescript
import { OptionalNextjsInvalidationProps } from 'cdk-nextjs-standalone'

const optionalNextjsInvalidationProps: OptionalNextjsInvalidationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsInvalidationProps.property.dependencies">dependencies</a></code> | <code>constructs.Construct[]</code> | Constructs that should complete before invalidating CloudFront Distribution. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsInvalidationProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.IDistribution</code> | CloudFront Distribution to invalidate. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsInvalidationProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsInvalidationOverrides">NextjsInvalidationOverrides</a></code> | Override props for every construct. |

---

##### `dependencies`<sup>Optional</sup> <a name="dependencies" id="cdk-nextjs-standalone.OptionalNextjsInvalidationProps.property.dependencies"></a>

```typescript
public readonly dependencies: Construct[];
```

- *Type:* constructs.Construct[]

Constructs that should complete before invalidating CloudFront Distribution.

Useful for assets that must be deployed/updated before invalidating.

---

##### `distribution`<sup>Optional</sup> <a name="distribution" id="cdk-nextjs-standalone.OptionalNextjsInvalidationProps.property.distribution"></a>

```typescript
public readonly distribution: IDistribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IDistribution

CloudFront Distribution to invalidate.

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.OptionalNextjsInvalidationProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsInvalidationOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsInvalidationOverrides">NextjsInvalidationOverrides</a>

Override props for every construct.

---

### OptionalNextjsRevalidationProps <a name="OptionalNextjsRevalidationProps" id="cdk-nextjs-standalone.OptionalNextjsRevalidationProps"></a>

OptionalNextjsRevalidationProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalNextjsRevalidationProps.Initializer"></a>

```typescript
import { OptionalNextjsRevalidationProps } from 'cdk-nextjs-standalone'

const optionalNextjsRevalidationProps: OptionalNextjsRevalidationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsRevalidationProps.property.lambdaOptions">lambdaOptions</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override function properties. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsRevalidationProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsRevalidationProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides">NextjsRevalidationOverrides</a></code> | Override props for every construct. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsRevalidationProps.property.serverFunction">serverFunction</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsServer">NextjsServer</a></code> | *No description.* |

---

##### `lambdaOptions`<sup>Optional</sup> <a name="lambdaOptions" id="cdk-nextjs-standalone.OptionalNextjsRevalidationProps.property.lambdaOptions"></a>

```typescript
public readonly lambdaOptions: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override function properties.

---

##### `nextBuild`<sup>Optional</sup> <a name="nextBuild" id="cdk-nextjs-standalone.OptionalNextjsRevalidationProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.OptionalNextjsRevalidationProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsRevalidationOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsRevalidationOverrides">NextjsRevalidationOverrides</a>

Override props for every construct.

---

##### `serverFunction`<sup>Optional</sup> <a name="serverFunction" id="cdk-nextjs-standalone.OptionalNextjsRevalidationProps.property.serverFunction"></a>

```typescript
public readonly serverFunction: NextjsServer;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsServer">NextjsServer</a>

---

### OptionalNextjsServerProps <a name="OptionalNextjsServerProps" id="cdk-nextjs-standalone.OptionalNextjsServerProps"></a>

OptionalNextjsServerProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalNextjsServerProps.Initializer"></a>

```typescript
import { OptionalNextjsServerProps } from 'cdk-nextjs-standalone'

const optionalNextjsServerProps: OptionalNextjsServerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsServerProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsServerProps.property.lambda">lambda</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override function properties. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsServerProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsServerProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsServerOverrides">NextjsServerOverrides</a></code> | Override props for every construct. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsServerProps.property.quiet">quiet</a></code> | <code>boolean</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsServerProps.property.staticAssetBucket">staticAssetBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Static asset bucket. |

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.OptionalNextjsServerProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `lambda`<sup>Optional</sup> <a name="lambda" id="cdk-nextjs-standalone.OptionalNextjsServerProps.property.lambda"></a>

```typescript
public readonly lambda: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override function properties.

---

##### `nextBuild`<sup>Optional</sup> <a name="nextBuild" id="cdk-nextjs-standalone.OptionalNextjsServerProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.OptionalNextjsServerProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsServerOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsServerOverrides">NextjsServerOverrides</a>

Override props for every construct.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.OptionalNextjsServerProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

---

##### `staticAssetBucket`<sup>Optional</sup> <a name="staticAssetBucket" id="cdk-nextjs-standalone.OptionalNextjsServerProps.property.staticAssetBucket"></a>

```typescript
public readonly staticAssetBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Static asset bucket.

Function needs bucket to read from cache.

---

### OptionalNextjsStaticAssetsProps <a name="OptionalNextjsStaticAssetsProps" id="cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps"></a>

OptionalNextjsStaticAssetsProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.Initializer"></a>

```typescript
import { OptionalNextjsStaticAssetsProps } from 'cdk-nextjs-standalone'

const optionalNextjsStaticAssetsProps: OptionalNextjsStaticAssetsProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.basePath">basePath</a></code> | <code>string</code> | Optional value to prefix the Next.js site under a /prefix path on CloudFront. Usually used when you deploy multiple Next.js sites on same domain using /sub-path. Note, you'll need to set [basePath](https://nextjs.org/docs/app/api-reference/next-config-js/basePath) in your `next.config.ts` to this value and ensure any files in `public` folder have correct prefix. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Define your own bucket to store static assets. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | The `NextjsBuild` instance representing the built Nextjs application. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.overrides">overrides</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsStaticAssetOverrides">NextjsStaticAssetOverrides</a></code> | Override props for every construct. |
| <code><a href="#cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.prune">prune</a></code> | <code>boolean</code> | If `true` (default), then removes old static assets after upload new static assets. |

---

##### `basePath`<sup>Optional</sup> <a name="basePath" id="cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.basePath"></a>

```typescript
public readonly basePath: string;
```

- *Type:* string

Optional value to prefix the Next.js site under a /prefix path on CloudFront. Usually used when you deploy multiple Next.js sites on same domain using /sub-path. Note, you'll need to set [basePath](https://nextjs.org/docs/app/api-reference/next-config-js/basePath) in your `next.config.ts` to this value and ensure any files in `public` folder have correct prefix.

---

##### `bucket`<sup>Optional</sup> <a name="bucket" id="cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Define your own bucket to store static assets.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `nextBuild`<sup>Optional</sup> <a name="nextBuild" id="cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

The `NextjsBuild` instance representing the built Nextjs application.

---

##### `overrides`<sup>Optional</sup> <a name="overrides" id="cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.overrides"></a>

```typescript
public readonly overrides: NextjsStaticAssetOverrides;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsStaticAssetOverrides">NextjsStaticAssetOverrides</a>

Override props for every construct.

---

##### `prune`<sup>Optional</sup> <a name="prune" id="cdk-nextjs-standalone.OptionalNextjsStaticAssetsProps.property.prune"></a>

```typescript
public readonly prune: boolean;
```

- *Type:* boolean
- *Default:* true

If `true` (default), then removes old static assets after upload new static assets.

---

### OptionalProviderProps <a name="OptionalProviderProps" id="cdk-nextjs-standalone.OptionalProviderProps"></a>

OptionalProviderProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalProviderProps.Initializer"></a>

```typescript
import { OptionalProviderProps } from 'cdk-nextjs-standalone'

const optionalProviderProps: OptionalProviderProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.isCompleteHandler">isCompleteHandler</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | The AWS Lambda function to invoke in order to determine if the operation is complete. |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days framework log events are kept in CloudWatch Logs. |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.onEventHandler">onEventHandler</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | The AWS Lambda function to invoke for all resource lifecycle operations (CREATE/UPDATE/DELETE). |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.providerFunctionEnvEncryption">providerFunctionEnvEncryption</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | AWS KMS key used to encrypt provider lambda's environment variables. |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.providerFunctionName">providerFunctionName</a></code> | <code>string</code> | Provider Lambda name. |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.queryInterval">queryInterval</a></code> | <code>aws-cdk-lib.Duration</code> | Time between calls to the `isComplete` handler which determines if the resource has been stabilized. |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | AWS Lambda execution role. |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | Security groups to attach to the provider functions. |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.totalTimeout">totalTimeout</a></code> | <code>aws-cdk-lib.Duration</code> | Total timeout for the entire operation. |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | The vpc to provision the lambda functions in. |
| <code><a href="#cdk-nextjs-standalone.OptionalProviderProps.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Which subnets from the VPC to place the lambda functions in. |

---

##### `isCompleteHandler`<sup>Optional</sup> <a name="isCompleteHandler" id="cdk-nextjs-standalone.OptionalProviderProps.property.isCompleteHandler"></a>

```typescript
public readonly isCompleteHandler: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction
- *Default:* provider is synchronous. This means that the `onEvent` handler is expected to finish all lifecycle operations within the initial invocation.

The AWS Lambda function to invoke in order to determine if the operation is complete.

This function will be called immediately after `onEvent` and then
periodically based on the configured query interval as long as it returns
`false`. If the function still returns `false` and the alloted timeout has
passed, the operation will fail.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="cdk-nextjs-standalone.OptionalProviderProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.INFINITE

The number of days framework log events are kept in CloudWatch Logs.

When
updating this property, unsetting it doesn't remove the log retention policy.
To remove the retention policy, set the value to `INFINITE`.

---

##### `onEventHandler`<sup>Optional</sup> <a name="onEventHandler" id="cdk-nextjs-standalone.OptionalProviderProps.property.onEventHandler"></a>

```typescript
public readonly onEventHandler: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

The AWS Lambda function to invoke for all resource lifecycle operations (CREATE/UPDATE/DELETE).

This function is responsible to begin the requested resource operation
(CREATE/UPDATE/DELETE) and return any additional properties to add to the
event, which will later be passed to `isComplete`. The `PhysicalResourceId`
property must be included in the response.

---

##### `providerFunctionEnvEncryption`<sup>Optional</sup> <a name="providerFunctionEnvEncryption" id="cdk-nextjs-standalone.OptionalProviderProps.property.providerFunctionEnvEncryption"></a>

```typescript
public readonly providerFunctionEnvEncryption: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* AWS Lambda creates and uses an AWS managed customer master key (CMK)

AWS KMS key used to encrypt provider lambda's environment variables.

---

##### `providerFunctionName`<sup>Optional</sup> <a name="providerFunctionName" id="cdk-nextjs-standalone.OptionalProviderProps.property.providerFunctionName"></a>

```typescript
public readonly providerFunctionName: string;
```

- *Type:* string
- *Default:* CloudFormation default name from unique physical ID

Provider Lambda name.

The provider lambda function name.

---

##### `queryInterval`<sup>Optional</sup> <a name="queryInterval" id="cdk-nextjs-standalone.OptionalProviderProps.property.queryInterval"></a>

```typescript
public readonly queryInterval: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.seconds(5)

Time between calls to the `isComplete` handler which determines if the resource has been stabilized.

The first `isComplete` will be called immediately after `handler` and then
every `queryInterval` seconds, and until `timeout` has been reached or until
`isComplete` returns `true`.

---

##### `role`<sup>Optional</sup> <a name="role" id="cdk-nextjs-standalone.OptionalProviderProps.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A default role will be created.

AWS Lambda execution role.

The role that will be assumed by the AWS Lambda.
Must be assumable by the 'lambda.amazonaws.com' service principal.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="cdk-nextjs-standalone.OptionalProviderProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* If `vpc` is not supplied, no security groups are attached. Otherwise, a dedicated security group is created for each function.

Security groups to attach to the provider functions.

Only used if 'vpc' is supplied

---

##### `totalTimeout`<sup>Optional</sup> <a name="totalTimeout" id="cdk-nextjs-standalone.OptionalProviderProps.property.totalTimeout"></a>

```typescript
public readonly totalTimeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.minutes(30)

Total timeout for the entire operation.

The maximum timeout is 1 hour (yes, it can exceed the AWS Lambda 15 minutes)

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="cdk-nextjs-standalone.OptionalProviderProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* functions are not provisioned inside a vpc.

The vpc to provision the lambda functions in.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="cdk-nextjs-standalone.OptionalProviderProps.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Which subnets from the VPC to place the lambda functions in.

Only used if 'vpc' is supplied. Note: internet access for Lambdas
requires a NAT gateway, so picking Public subnets is not allowed.

---

### OptionalS3OriginProps <a name="OptionalS3OriginProps" id="cdk-nextjs-standalone.OptionalS3OriginProps"></a>

OptionalS3OriginProps.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalS3OriginProps.Initializer"></a>

```typescript
import { OptionalS3OriginProps } from 'cdk-nextjs-standalone'

const optionalS3OriginProps: OptionalS3OriginProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalS3OriginProps.property.connectionAttempts">connectionAttempts</a></code> | <code>number</code> | The number of times that CloudFront attempts to connect to the origin; |
| <code><a href="#cdk-nextjs-standalone.OptionalS3OriginProps.property.connectionTimeout">connectionTimeout</a></code> | <code>aws-cdk-lib.Duration</code> | The number of seconds that CloudFront waits when trying to establish a connection to the origin. |
| <code><a href="#cdk-nextjs-standalone.OptionalS3OriginProps.property.customHeaders">customHeaders</a></code> | <code>{[ key: string ]: string}</code> | A list of HTTP header names and values that CloudFront adds to requests it sends to the origin. |
| <code><a href="#cdk-nextjs-standalone.OptionalS3OriginProps.property.originAccessIdentity">originAccessIdentity</a></code> | <code>aws-cdk-lib.aws_cloudfront.IOriginAccessIdentity</code> | An optional Origin Access Identity of the origin identity cloudfront will use when calling your s3 bucket. |
| <code><a href="#cdk-nextjs-standalone.OptionalS3OriginProps.property.originId">originId</a></code> | <code>string</code> | A unique identifier for the origin. |
| <code><a href="#cdk-nextjs-standalone.OptionalS3OriginProps.property.originPath">originPath</a></code> | <code>string</code> | An optional path that CloudFront appends to the origin domain name when CloudFront requests content from the origin. |
| <code><a href="#cdk-nextjs-standalone.OptionalS3OriginProps.property.originShieldEnabled">originShieldEnabled</a></code> | <code>boolean</code> | Origin Shield is enabled by setting originShieldRegion to a valid region, after this to disable Origin Shield again you must set this flag to false. |
| <code><a href="#cdk-nextjs-standalone.OptionalS3OriginProps.property.originShieldRegion">originShieldRegion</a></code> | <code>string</code> | When you enable Origin Shield in the AWS Region that has the lowest latency to your origin, you can get better network performance. |

---

##### `connectionAttempts`<sup>Optional</sup> <a name="connectionAttempts" id="cdk-nextjs-standalone.OptionalS3OriginProps.property.connectionAttempts"></a>

```typescript
public readonly connectionAttempts: number;
```

- *Type:* number
- *Default:* 3

The number of times that CloudFront attempts to connect to the origin;

valid values are 1, 2, or 3 attempts.

---

##### `connectionTimeout`<sup>Optional</sup> <a name="connectionTimeout" id="cdk-nextjs-standalone.OptionalS3OriginProps.property.connectionTimeout"></a>

```typescript
public readonly connectionTimeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.seconds(10)

The number of seconds that CloudFront waits when trying to establish a connection to the origin.

Valid values are 1-10 seconds, inclusive.

---

##### `customHeaders`<sup>Optional</sup> <a name="customHeaders" id="cdk-nextjs-standalone.OptionalS3OriginProps.property.customHeaders"></a>

```typescript
public readonly customHeaders: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* {}

A list of HTTP header names and values that CloudFront adds to requests it sends to the origin.

---

##### `originAccessIdentity`<sup>Optional</sup> <a name="originAccessIdentity" id="cdk-nextjs-standalone.OptionalS3OriginProps.property.originAccessIdentity"></a>

```typescript
public readonly originAccessIdentity: IOriginAccessIdentity;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IOriginAccessIdentity
- *Default:* An Origin Access Identity will be created.

An optional Origin Access Identity of the origin identity cloudfront will use when calling your s3 bucket.

---

##### `originId`<sup>Optional</sup> <a name="originId" id="cdk-nextjs-standalone.OptionalS3OriginProps.property.originId"></a>

```typescript
public readonly originId: string;
```

- *Type:* string
- *Default:* an originid will be generated for you

A unique identifier for the origin.

This value must be unique within the distribution.

---

##### `originPath`<sup>Optional</sup> <a name="originPath" id="cdk-nextjs-standalone.OptionalS3OriginProps.property.originPath"></a>

```typescript
public readonly originPath: string;
```

- *Type:* string
- *Default:* '/'

An optional path that CloudFront appends to the origin domain name when CloudFront requests content from the origin.

Must begin, but not end, with '/' (e.g., '/production/images').

---

##### `originShieldEnabled`<sup>Optional</sup> <a name="originShieldEnabled" id="cdk-nextjs-standalone.OptionalS3OriginProps.property.originShieldEnabled"></a>

```typescript
public readonly originShieldEnabled: boolean;
```

- *Type:* boolean
- *Default:* true

Origin Shield is enabled by setting originShieldRegion to a valid region, after this to disable Origin Shield again you must set this flag to false.

---

##### `originShieldRegion`<sup>Optional</sup> <a name="originShieldRegion" id="cdk-nextjs-standalone.OptionalS3OriginProps.property.originShieldRegion"></a>

```typescript
public readonly originShieldRegion: string;
```

- *Type:* string
- *Default:* origin shield not enabled

When you enable Origin Shield in the AWS Region that has the lowest latency to your origin, you can get better network performance.

---

### OptionalTablePropsV2 <a name="OptionalTablePropsV2" id="cdk-nextjs-standalone.OptionalTablePropsV2"></a>

OptionalTablePropsV2.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.OptionalTablePropsV2.Initializer"></a>

```typescript
import { OptionalTablePropsV2 } from 'cdk-nextjs-standalone'

const optionalTablePropsV2: OptionalTablePropsV2 = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.billing">billing</a></code> | <code>aws-cdk-lib.aws_dynamodb.Billing</code> | The billing mode and capacity settings to apply to the table. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.contributorInsights">contributorInsights</a></code> | <code>boolean</code> | Whether CloudWatch contributor insights is enabled. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.deletionProtection">deletionProtection</a></code> | <code>boolean</code> | Whether deletion protection is enabled. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.dynamoStream">dynamoStream</a></code> | <code>aws-cdk-lib.aws_dynamodb.StreamViewType</code> | When an item in the table is modified, StreamViewType determines what information is written to the stream. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.encryption">encryption</a></code> | <code>aws-cdk-lib.aws_dynamodb.TableEncryptionV2</code> | The server-side encryption. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.globalSecondaryIndexes">globalSecondaryIndexes</a></code> | <code>aws-cdk-lib.aws_dynamodb.GlobalSecondaryIndexPropsV2[]</code> | Global secondary indexes. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.kinesisStream">kinesisStream</a></code> | <code>aws-cdk-lib.aws_kinesis.IStream</code> | Kinesis Data Stream to capture item level changes. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.localSecondaryIndexes">localSecondaryIndexes</a></code> | <code>aws-cdk-lib.aws_dynamodb.LocalSecondaryIndexProps[]</code> | Local secondary indexes. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.partitionKey">partitionKey</a></code> | <code>aws-cdk-lib.aws_dynamodb.Attribute</code> | Partition key attribute definition. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.pointInTimeRecovery">pointInTimeRecovery</a></code> | <code>boolean</code> | Whether point-in-time recovery is enabled. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.removalPolicy">removalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | The removal policy applied to the table. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.replicas">replicas</a></code> | <code>aws-cdk-lib.aws_dynamodb.ReplicaTableProps[]</code> | Replica tables to deploy with the primary table. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.sortKey">sortKey</a></code> | <code>aws-cdk-lib.aws_dynamodb.Attribute</code> | Sort key attribute definition. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.tableClass">tableClass</a></code> | <code>aws-cdk-lib.aws_dynamodb.TableClass</code> | The table class. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.tableName">tableName</a></code> | <code>string</code> | The name of the table. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.tags">tags</a></code> | <code>aws-cdk-lib.CfnTag[]</code> | Tags to be applied to the table or replica table. |
| <code><a href="#cdk-nextjs-standalone.OptionalTablePropsV2.property.timeToLiveAttribute">timeToLiveAttribute</a></code> | <code>string</code> | The name of the TTL attribute. |

---

##### `billing`<sup>Optional</sup> <a name="billing" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.billing"></a>

```typescript
public readonly billing: Billing;
```

- *Type:* aws-cdk-lib.aws_dynamodb.Billing
- *Default:* Billing.onDemand()

The billing mode and capacity settings to apply to the table.

---

##### `contributorInsights`<sup>Optional</sup> <a name="contributorInsights" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.contributorInsights"></a>

```typescript
public readonly contributorInsights: boolean;
```

- *Type:* boolean
- *Default:* false

Whether CloudWatch contributor insights is enabled.

---

##### `deletionProtection`<sup>Optional</sup> <a name="deletionProtection" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.deletionProtection"></a>

```typescript
public readonly deletionProtection: boolean;
```

- *Type:* boolean
- *Default:* false

Whether deletion protection is enabled.

---

##### `dynamoStream`<sup>Optional</sup> <a name="dynamoStream" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.dynamoStream"></a>

```typescript
public readonly dynamoStream: StreamViewType;
```

- *Type:* aws-cdk-lib.aws_dynamodb.StreamViewType
- *Default:* streams are disabled if replicas are not configured and this property is not specified. If this property is not specified when replicas are configured, then NEW_AND_OLD_IMAGES will be the StreamViewType for all replicas

When an item in the table is modified, StreamViewType determines what information is written to the stream.

---

##### `encryption`<sup>Optional</sup> <a name="encryption" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.encryption"></a>

```typescript
public readonly encryption: TableEncryptionV2;
```

- *Type:* aws-cdk-lib.aws_dynamodb.TableEncryptionV2
- *Default:* TableEncryptionV2.dynamoOwnedKey()

The server-side encryption.

---

##### `globalSecondaryIndexes`<sup>Optional</sup> <a name="globalSecondaryIndexes" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.globalSecondaryIndexes"></a>

```typescript
public readonly globalSecondaryIndexes: GlobalSecondaryIndexPropsV2[];
```

- *Type:* aws-cdk-lib.aws_dynamodb.GlobalSecondaryIndexPropsV2[]
- *Default:* no global secondary indexes

Global secondary indexes.

Note: You can provide a maximum of 20 global secondary indexes.

---

##### `kinesisStream`<sup>Optional</sup> <a name="kinesisStream" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.kinesisStream"></a>

```typescript
public readonly kinesisStream: IStream;
```

- *Type:* aws-cdk-lib.aws_kinesis.IStream
- *Default:* no Kinesis Data Stream

Kinesis Data Stream to capture item level changes.

---

##### `localSecondaryIndexes`<sup>Optional</sup> <a name="localSecondaryIndexes" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.localSecondaryIndexes"></a>

```typescript
public readonly localSecondaryIndexes: LocalSecondaryIndexProps[];
```

- *Type:* aws-cdk-lib.aws_dynamodb.LocalSecondaryIndexProps[]
- *Default:* no local secondary indexes

Local secondary indexes.

Note: You can only provide a maximum of 5 local secondary indexes.

---

##### `partitionKey`<sup>Optional</sup> <a name="partitionKey" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.partitionKey"></a>

```typescript
public readonly partitionKey: Attribute;
```

- *Type:* aws-cdk-lib.aws_dynamodb.Attribute

Partition key attribute definition.

---

##### `pointInTimeRecovery`<sup>Optional</sup> <a name="pointInTimeRecovery" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.pointInTimeRecovery"></a>

```typescript
public readonly pointInTimeRecovery: boolean;
```

- *Type:* boolean
- *Default:* false

Whether point-in-time recovery is enabled.

---

##### `removalPolicy`<sup>Optional</sup> <a name="removalPolicy" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.removalPolicy"></a>

```typescript
public readonly removalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.RETAIN

The removal policy applied to the table.

---

##### `replicas`<sup>Optional</sup> <a name="replicas" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.replicas"></a>

```typescript
public readonly replicas: ReplicaTableProps[];
```

- *Type:* aws-cdk-lib.aws_dynamodb.ReplicaTableProps[]
- *Default:* no replica tables

Replica tables to deploy with the primary table.

Note: Adding replica tables allows you to use your table as a global table. You
cannot specify a replica table in the region that the primary table will be deployed
to. Replica tables will only be supported if the stack deployment region is defined.

---

##### `sortKey`<sup>Optional</sup> <a name="sortKey" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.sortKey"></a>

```typescript
public readonly sortKey: Attribute;
```

- *Type:* aws-cdk-lib.aws_dynamodb.Attribute
- *Default:* no sort key

Sort key attribute definition.

---

##### `tableClass`<sup>Optional</sup> <a name="tableClass" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.tableClass"></a>

```typescript
public readonly tableClass: TableClass;
```

- *Type:* aws-cdk-lib.aws_dynamodb.TableClass
- *Default:* TableClass.STANDARD

The table class.

---

##### `tableName`<sup>Optional</sup> <a name="tableName" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string
- *Default:* generated by CloudFormation

The name of the table.

---

##### `tags`<sup>Optional</sup> <a name="tags" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.tags"></a>

```typescript
public readonly tags: CfnTag[];
```

- *Type:* aws-cdk-lib.CfnTag[]
- *Default:* no tags

Tags to be applied to the table or replica table.

---

##### `timeToLiveAttribute`<sup>Optional</sup> <a name="timeToLiveAttribute" id="cdk-nextjs-standalone.OptionalTablePropsV2.property.timeToLiveAttribute"></a>

```typescript
public readonly timeToLiveAttribute: string;
```

- *Type:* string
- *Default:* TTL is disabled

The name of the TTL attribute.

---



