# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### Nextjs <a name="Nextjs" id="cdk-nextjs-standalone.Nextjs"></a>

The `Nextjs` construct is a higher level CDK construct that makes it easy to create a NextJS app.

Your standalone server application will be bundled using output tracing and will be deployed to a Lambda function.
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
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.assetsDeployment">assetsDeployment</a></code> | <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment">NextJsAssetsDeployment</a></code> | Asset deployment to S3. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Bucket containing NextJS static assets. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.distribution">distribution</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsDistribution">NextjsDistribution</a></code> | CloudFront distribution. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.lambdaFunctionUrl">lambdaFunctionUrl</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionUrl</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | Built NextJS project output. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.serverFunction">serverFunction</a></code> | <code><a href="#cdk-nextjs-standalone.NextJsLambda">NextJsLambda</a></code> | The main NextJS server handler lambda function. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Where build-time assets for deployment are stored. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.configBucket">configBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.Nextjs.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `assetsDeployment`<sup>Required</sup> <a name="assetsDeployment" id="cdk-nextjs-standalone.Nextjs.property.assetsDeployment"></a>

```typescript
public readonly assetsDeployment: NextJsAssetsDeployment;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextJsAssetsDeployment">NextJsAssetsDeployment</a>

Asset deployment to S3.

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="cdk-nextjs-standalone.Nextjs.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Bucket containing NextJS static assets.

---

##### `distribution`<sup>Required</sup> <a name="distribution" id="cdk-nextjs-standalone.Nextjs.property.distribution"></a>

```typescript
public readonly distribution: NextjsDistribution;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsDistribution">NextjsDistribution</a>

CloudFront distribution.

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

##### `serverFunction`<sup>Required</sup> <a name="serverFunction" id="cdk-nextjs-standalone.Nextjs.property.serverFunction"></a>

```typescript
public readonly serverFunction: NextJsLambda;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextJsLambda">NextJsLambda</a>

The main NextJS server handler lambda function.

---

##### `tempBuildDir`<sup>Required</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.Nextjs.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Where build-time assets for deployment are stored.

---

##### `configBucket`<sup>Optional</sup> <a name="configBucket" id="cdk-nextjs-standalone.Nextjs.property.configBucket"></a>

```typescript
public readonly configBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---


### NextJsAssetsDeployment <a name="NextJsAssetsDeployment" id="cdk-nextjs-standalone.NextJsAssetsDeployment"></a>

Uploads NextJS-built static and public files to S3.

Will rewrite CloudFormation references with their resolved values after uploading.

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextJsAssetsDeployment.Initializer"></a>

```typescript
import { NextJsAssetsDeployment } from 'cdk-nextjs-standalone'

new NextJsAssetsDeployment(scope: Construct, id: string, props: NextjsAssetsDeploymentProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps">NextjsAssetsDeploymentProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextJsAssetsDeployment.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextJsAssetsDeployment.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextJsAssetsDeployment.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps">NextjsAssetsDeploymentProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextJsAssetsDeployment.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextJsAssetsDeployment.isConstruct"></a>

```typescript
import { NextJsAssetsDeployment } from 'cdk-nextjs-standalone'

NextJsAssetsDeployment.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextJsAssetsDeployment.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Bucket containing assets. |
| <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment.property.deployments">deployments</a></code> | <code>aws-cdk-lib.aws_s3_deployment.BucketDeployment[]</code> | Asset deployments to S3. |
| <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment.property.staticTempDir">staticTempDir</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextJsAssetsDeployment.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="cdk-nextjs-standalone.NextJsAssetsDeployment.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Bucket containing assets.

---

##### `deployments`<sup>Required</sup> <a name="deployments" id="cdk-nextjs-standalone.NextJsAssetsDeployment.property.deployments"></a>

```typescript
public readonly deployments: BucketDeployment[];
```

- *Type:* aws-cdk-lib.aws_s3_deployment.BucketDeployment[]

Asset deployments to S3.

---

##### `staticTempDir`<sup>Required</sup> <a name="staticTempDir" id="cdk-nextjs-standalone.NextJsAssetsDeployment.property.staticTempDir"></a>

```typescript
public readonly staticTempDir: string;
```

- *Type:* string

---


### NextjsBuild <a name="NextjsBuild" id="cdk-nextjs-standalone.NextjsBuild"></a>

Represents a built NextJS application.

This construct runs `npm build` in standalone output mode inside your `nextjsPath`.
This construct can be used by higher level constructs or used directly.

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
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.buildPath">buildPath</a></code> | <code>string</code> | The path to the directory where the server build artifacts are stored. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.nextPublicDir">nextPublicDir</a></code> | <code>string</code> | Public static files. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.nextStandaloneBuildDir">nextStandaloneBuildDir</a></code> | <code>string</code> | NextJS project inside of standalone build. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.nextStandaloneDir">nextStandaloneDir</a></code> | <code>string</code> | Entire NextJS build output directory. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.nextStaticDir">nextStaticDir</a></code> | <code>string</code> | Static files containing client-side code. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuildProps">NextjsBuildProps</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsBuild.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsBuild.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `buildPath`<sup>Required</sup> <a name="buildPath" id="cdk-nextjs-standalone.NextjsBuild.property.buildPath"></a>

```typescript
public readonly buildPath: string;
```

- *Type:* string

The path to the directory where the server build artifacts are stored.

---

##### `nextPublicDir`<sup>Required</sup> <a name="nextPublicDir" id="cdk-nextjs-standalone.NextjsBuild.property.nextPublicDir"></a>

```typescript
public readonly nextPublicDir: string;
```

- *Type:* string

Public static files.

E.g. robots.txt, favicon.ico, etc.

---

##### `nextStandaloneBuildDir`<sup>Required</sup> <a name="nextStandaloneBuildDir" id="cdk-nextjs-standalone.NextjsBuild.property.nextStandaloneBuildDir"></a>

```typescript
public readonly nextStandaloneBuildDir: string;
```

- *Type:* string

NextJS project inside of standalone build.

Contains server code and manifests.

---

##### `nextStandaloneDir`<sup>Required</sup> <a name="nextStandaloneDir" id="cdk-nextjs-standalone.NextjsBuild.property.nextStandaloneDir"></a>

```typescript
public readonly nextStandaloneDir: string;
```

- *Type:* string

Entire NextJS build output directory.

Contains server and client code and manifests.

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

##### `tempBuildDir`<sup>Required</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsBuild.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

---


### NextjsDistribution <a name="NextjsDistribution" id="cdk-nextjs-standalone.NextjsDistribution"></a>

The `Nextjs` construct is a higher level CDK construct that makes it easy to create a NextJS app.

Your standalone server application will be bundled using output tracing and will be deployed to a Lambda function.
Static assets will be deployed to an S3 bucket and served via CloudFront.
You must use Next.js 10.3.0 or newer.

Please provide a `nextjsPath` to the Next.js app inside your project.

*Example*

```typescript
new Nextjs(this, "Web", {
  nextjsPath: path.resolve("packages/web"),
})
```


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
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.imageCachePolicyProps">imageCachePolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.CachePolicyProps</code> | The default CloudFront cache policy properties for images. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.lambdaCachePolicyProps">lambdaCachePolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.CachePolicyProps</code> | The default CloudFront cache policy properties for the Lambda server handler. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.lambdaOriginRequestPolicyProps">lambdaOriginRequestPolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.OriginRequestPolicyProps</code> | The default CloudFront lambda origin request policy. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.staticCachePolicyProps">staticCachePolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.CachePolicyProps</code> | The default CloudFront cache policy properties for static pages. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.bucketArn">bucketArn</a></code> | <code>string</code> | The ARN of the internally created S3 Bucket. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.bucketName">bucketName</a></code> | <code>string</code> | The name of the internally created S3 Bucket. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.distributionDomain">distributionDomain</a></code> | <code>string</code> | The domain name of the internally created CloudFront Distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.distributionId">distributionId</a></code> | <code>string</code> | The ID of the internally created CloudFront Distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.url">url</a></code> | <code>string</code> | The CloudFront URL of the website. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.customDomainUrl">customDomainUrl</a></code> | <code>string</code> | If the custom domain is enabled, this is the URL of the website with the custom domain. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.Distribution</code> | The internally created CloudFront `Distribution` instance. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.originAccessIdentity">originAccessIdentity</a></code> | <code>aws-cdk-lib.aws_cloudfront.IOriginAccessIdentity</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistribution.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | *No description.* |
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

The default CloudFront cache policy properties for images.

---

##### `lambdaCachePolicyProps`<sup>Required</sup> <a name="lambdaCachePolicyProps" id="cdk-nextjs-standalone.NextjsDistribution.property.lambdaCachePolicyProps"></a>

```typescript
public readonly lambdaCachePolicyProps: CachePolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.CachePolicyProps

The default CloudFront cache policy properties for the Lambda server handler.

---

##### `lambdaOriginRequestPolicyProps`<sup>Required</sup> <a name="lambdaOriginRequestPolicyProps" id="cdk-nextjs-standalone.NextjsDistribution.property.lambdaOriginRequestPolicyProps"></a>

```typescript
public readonly lambdaOriginRequestPolicyProps: OriginRequestPolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.OriginRequestPolicyProps

The default CloudFront lambda origin request policy.

---

##### `staticCachePolicyProps`<sup>Required</sup> <a name="staticCachePolicyProps" id="cdk-nextjs-standalone.NextjsDistribution.property.staticCachePolicyProps"></a>

```typescript
public readonly staticCachePolicyProps: CachePolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.CachePolicyProps

The default CloudFront cache policy properties for static pages.

---

##### `bucketArn`<sup>Required</sup> <a name="bucketArn" id="cdk-nextjs-standalone.NextjsDistribution.property.bucketArn"></a>

```typescript
public readonly bucketArn: string;
```

- *Type:* string

The ARN of the internally created S3 Bucket.

---

##### `bucketName`<sup>Required</sup> <a name="bucketName" id="cdk-nextjs-standalone.NextjsDistribution.property.bucketName"></a>

```typescript
public readonly bucketName: string;
```

- *Type:* string

The name of the internally created S3 Bucket.

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

##### `customDomainUrl`<sup>Optional</sup> <a name="customDomainUrl" id="cdk-nextjs-standalone.NextjsDistribution.property.customDomainUrl"></a>

```typescript
public readonly customDomainUrl: string;
```

- *Type:* string

If the custom domain is enabled, this is the URL of the website with the custom domain.

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="cdk-nextjs-standalone.NextjsDistribution.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

---

##### `distribution`<sup>Required</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsDistribution.property.distribution"></a>

```typescript
public readonly distribution: Distribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.Distribution

The internally created CloudFront `Distribution` instance.

---

##### `originAccessIdentity`<sup>Required</sup> <a name="originAccessIdentity" id="cdk-nextjs-standalone.NextjsDistribution.property.originAccessIdentity"></a>

```typescript
public readonly originAccessIdentity: IOriginAccessIdentity;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IOriginAccessIdentity

---

##### `tempBuildDir`<sup>Required</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsDistribution.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

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


### NextJsLambda <a name="NextJsLambda" id="cdk-nextjs-standalone.NextJsLambda"></a>

Build a lambda function from a NextJS application to handle server-side rendering, API routes, and image optimization.

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextJsLambda.Initializer"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

new NextJsLambda(scope: Construct, id: string, props: NextjsLambdaProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps">NextjsLambdaProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextJsLambda.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextJsLambda.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsLambdaProps">NextjsLambdaProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextJsLambda.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextJsLambda.isConstruct"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextJsLambda.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.lambdaFunction">lambdaFunction</a></code> | <code>aws-cdk-lib.aws_lambda.Function</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.configBucket">configBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextJsLambda.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `lambdaFunction`<sup>Required</sup> <a name="lambdaFunction" id="cdk-nextjs-standalone.NextJsLambda.property.lambdaFunction"></a>

```typescript
public readonly lambdaFunction: Function;
```

- *Type:* aws-cdk-lib.aws_lambda.Function

---

##### `configBucket`<sup>Optional</sup> <a name="configBucket" id="cdk-nextjs-standalone.NextJsLambda.property.configBucket"></a>

```typescript
public readonly configBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---


### NextjsLayer <a name="NextjsLayer" id="cdk-nextjs-standalone.NextjsLayer"></a>

Lambda layer for Next.js. Contains Sharp 0.30.0.

#### Initializers <a name="Initializers" id="cdk-nextjs-standalone.NextjsLayer.Initializer"></a>

```typescript
import { NextjsLayer } from 'cdk-nextjs-standalone'

new NextjsLayer(scope: Construct, id: string, props: NextjsLayerProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsLayerProps">NextjsLayerProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsLayer.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsLayer.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-nextjs-standalone.NextjsLayer.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-nextjs-standalone.NextjsLayerProps">NextjsLayerProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.addPermission">addPermission</a></code> | Add permission for this layer version to specific entities. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextjsLayer.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="cdk-nextjs-standalone.NextjsLayer.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="cdk-nextjs-standalone.NextjsLayer.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addPermission` <a name="addPermission" id="cdk-nextjs-standalone.NextjsLayer.addPermission"></a>

```typescript
public addPermission(id: string, permission: LayerVersionPermission): void
```

Add permission for this layer version to specific entities.

Usage within
the same account where the layer is defined is always allowed and does not
require calling this method. Note that the principal that creates the
Lambda function using the layer (for example, a CloudFormation changeset
execution role) also needs to have the ``lambda:GetLayerVersion``
permission on the layer version.

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsLayer.addPermission.parameter.id"></a>

- *Type:* string

---

###### `permission`<sup>Required</sup> <a name="permission" id="cdk-nextjs-standalone.NextjsLayer.addPermission.parameter.permission"></a>

- *Type:* aws-cdk-lib.aws_lambda.LayerVersionPermission

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.fromLayerVersionArn">fromLayerVersionArn</a></code> | Imports a layer version by ARN. |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.fromLayerVersionAttributes">fromLayerVersionAttributes</a></code> | Imports a Layer that has been defined externally. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-nextjs-standalone.NextjsLayer.isConstruct"></a>

```typescript
import { NextjsLayer } from 'cdk-nextjs-standalone'

NextjsLayer.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-nextjs-standalone.NextjsLayer.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="cdk-nextjs-standalone.NextjsLayer.isOwnedResource"></a>

```typescript
import { NextjsLayer } from 'cdk-nextjs-standalone'

NextjsLayer.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="cdk-nextjs-standalone.NextjsLayer.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="cdk-nextjs-standalone.NextjsLayer.isResource"></a>

```typescript
import { NextjsLayer } from 'cdk-nextjs-standalone'

NextjsLayer.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="cdk-nextjs-standalone.NextjsLayer.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromLayerVersionArn` <a name="fromLayerVersionArn" id="cdk-nextjs-standalone.NextjsLayer.fromLayerVersionArn"></a>

```typescript
import { NextjsLayer } from 'cdk-nextjs-standalone'

NextjsLayer.fromLayerVersionArn(scope: Construct, id: string, layerVersionArn: string)
```

Imports a layer version by ARN.

Assumes it is compatible with all Lambda runtimes.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsLayer.fromLayerVersionArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsLayer.fromLayerVersionArn.parameter.id"></a>

- *Type:* string

---

###### `layerVersionArn`<sup>Required</sup> <a name="layerVersionArn" id="cdk-nextjs-standalone.NextjsLayer.fromLayerVersionArn.parameter.layerVersionArn"></a>

- *Type:* string

---

##### `fromLayerVersionAttributes` <a name="fromLayerVersionAttributes" id="cdk-nextjs-standalone.NextjsLayer.fromLayerVersionAttributes"></a>

```typescript
import { NextjsLayer } from 'cdk-nextjs-standalone'

NextjsLayer.fromLayerVersionAttributes(scope: Construct, id: string, attrs: LayerVersionAttributes)
```

Imports a Layer that has been defined externally.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextjsLayer.fromLayerVersionAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

the parent Construct that will use the imported layer.

---

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextjsLayer.fromLayerVersionAttributes.parameter.id"></a>

- *Type:* string

the id of the imported layer in the construct tree.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="cdk-nextjs-standalone.NextjsLayer.fromLayerVersionAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_lambda.LayerVersionAttributes

the properties of the imported layer.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.property.layerVersionArn">layerVersionArn</a></code> | <code>string</code> | The ARN of the Lambda Layer version that this Layer defines. |
| <code><a href="#cdk-nextjs-standalone.NextjsLayer.property.compatibleRuntimes">compatibleRuntimes</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime[]</code> | The runtimes compatible with this Layer. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextjsLayer.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="cdk-nextjs-standalone.NextjsLayer.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="cdk-nextjs-standalone.NextjsLayer.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `layerVersionArn`<sup>Required</sup> <a name="layerVersionArn" id="cdk-nextjs-standalone.NextjsLayer.property.layerVersionArn"></a>

```typescript
public readonly layerVersionArn: string;
```

- *Type:* string

The ARN of the Lambda Layer version that this Layer defines.

---

##### `compatibleRuntimes`<sup>Optional</sup> <a name="compatibleRuntimes" id="cdk-nextjs-standalone.NextjsLayer.property.compatibleRuntimes"></a>

```typescript
public readonly compatibleRuntimes: Runtime[];
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime[]

The runtimes compatible with this Layer.

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

### BaseSiteEnvironmentOutputsInfo <a name="BaseSiteEnvironmentOutputsInfo" id="cdk-nextjs-standalone.BaseSiteEnvironmentOutputsInfo"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.BaseSiteEnvironmentOutputsInfo.Initializer"></a>

```typescript
import { BaseSiteEnvironmentOutputsInfo } from 'cdk-nextjs-standalone'

const baseSiteEnvironmentOutputsInfo: BaseSiteEnvironmentOutputsInfo = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.BaseSiteEnvironmentOutputsInfo.property.environmentOutputs">environmentOutputs</a></code> | <code>{[ key: string ]: string}</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.BaseSiteEnvironmentOutputsInfo.property.path">path</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.BaseSiteEnvironmentOutputsInfo.property.stack">stack</a></code> | <code>string</code> | *No description.* |

---

##### `environmentOutputs`<sup>Required</sup> <a name="environmentOutputs" id="cdk-nextjs-standalone.BaseSiteEnvironmentOutputsInfo.property.environmentOutputs"></a>

```typescript
public readonly environmentOutputs: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

---

##### `path`<sup>Required</sup> <a name="path" id="cdk-nextjs-standalone.BaseSiteEnvironmentOutputsInfo.property.path"></a>

```typescript
public readonly path: string;
```

- *Type:* string

---

##### `stack`<sup>Required</sup> <a name="stack" id="cdk-nextjs-standalone.BaseSiteEnvironmentOutputsInfo.property.stack"></a>

```typescript
public readonly stack: string;
```

- *Type:* string

---

### BaseSiteReplaceProps <a name="BaseSiteReplaceProps" id="cdk-nextjs-standalone.BaseSiteReplaceProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.BaseSiteReplaceProps.Initializer"></a>

```typescript
import { BaseSiteReplaceProps } from 'cdk-nextjs-standalone'

const baseSiteReplaceProps: BaseSiteReplaceProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.BaseSiteReplaceProps.property.files">files</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.BaseSiteReplaceProps.property.replace">replace</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.BaseSiteReplaceProps.property.search">search</a></code> | <code>string</code> | *No description.* |

---

##### `files`<sup>Required</sup> <a name="files" id="cdk-nextjs-standalone.BaseSiteReplaceProps.property.files"></a>

```typescript
public readonly files: string;
```

- *Type:* string

---

##### `replace`<sup>Required</sup> <a name="replace" id="cdk-nextjs-standalone.BaseSiteReplaceProps.property.replace"></a>

```typescript
public readonly replace: string;
```

- *Type:* string

---

##### `search`<sup>Required</sup> <a name="search" id="cdk-nextjs-standalone.BaseSiteReplaceProps.property.search"></a>

```typescript
public readonly search: string;
```

- *Type:* string

---

### CreateArchiveArgs <a name="CreateArchiveArgs" id="cdk-nextjs-standalone.CreateArchiveArgs"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.CreateArchiveArgs.Initializer"></a>

```typescript
import { CreateArchiveArgs } from 'cdk-nextjs-standalone'

const createArchiveArgs: CreateArchiveArgs = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.CreateArchiveArgs.property.directory">directory</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.CreateArchiveArgs.property.zipFileName">zipFileName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.CreateArchiveArgs.property.zipOutDir">zipOutDir</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.CreateArchiveArgs.property.compressionLevel">compressionLevel</a></code> | <code>number</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.CreateArchiveArgs.property.fileGlob">fileGlob</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.CreateArchiveArgs.property.quiet">quiet</a></code> | <code>boolean</code> | *No description.* |

---

##### `directory`<sup>Required</sup> <a name="directory" id="cdk-nextjs-standalone.CreateArchiveArgs.property.directory"></a>

```typescript
public readonly directory: string;
```

- *Type:* string

---

##### `zipFileName`<sup>Required</sup> <a name="zipFileName" id="cdk-nextjs-standalone.CreateArchiveArgs.property.zipFileName"></a>

```typescript
public readonly zipFileName: string;
```

- *Type:* string

---

##### `zipOutDir`<sup>Required</sup> <a name="zipOutDir" id="cdk-nextjs-standalone.CreateArchiveArgs.property.zipOutDir"></a>

```typescript
public readonly zipOutDir: string;
```

- *Type:* string

---

##### `compressionLevel`<sup>Optional</sup> <a name="compressionLevel" id="cdk-nextjs-standalone.CreateArchiveArgs.property.compressionLevel"></a>

```typescript
public readonly compressionLevel: number;
```

- *Type:* number

---

##### `fileGlob`<sup>Optional</sup> <a name="fileGlob" id="cdk-nextjs-standalone.CreateArchiveArgs.property.fileGlob"></a>

```typescript
public readonly fileGlob: string;
```

- *Type:* string

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.CreateArchiveArgs.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

---

### NextjsAssetsDeploymentProps <a name="NextjsAssetsDeploymentProps" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.Initializer"></a>

```typescript
import { NextjsAssetsDeploymentProps } from 'cdk-nextjs-standalone'

const nextjsAssetsDeploymentProps: NextjsAssetsDeploymentProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | Relative path to the directory where the NextJS project is located. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.compressionLevel">compressionLevel</a></code> | <code>number</code> | 0 - no compression, fatest 9 - maximum compression, slowest. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | The `NextjsBuild` instance representing the built Nextjs application. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket \| aws-cdk-lib.aws_s3.BucketProps</code> | Properties for the S3 bucket containing the NextJS assets. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.IDistribution</code> | Distribution to invalidate when assets change. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.prune">prune</a></code> | <code>boolean</code> | Set to true to delete old assets (defaults to false). |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `compressionLevel`<sup>Optional</sup> <a name="compressionLevel" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.compressionLevel"></a>

```typescript
public readonly compressionLevel: number;
```

- *Type:* number
- *Default:* 1

0 - no compression, fatest 9 - maximum compression, slowest.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `isPlaceholder`<sup>Optional</sup> <a name="isPlaceholder" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.isPlaceholder"></a>

```typescript
public readonly isPlaceholder: boolean;
```

- *Type:* boolean

Skip building app and deploy a placeholder.

Useful when using `next dev` for local development.

---

##### `nodeEnv`<sup>Optional</sup> <a name="nodeEnv" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.nodeEnv"></a>

```typescript
public readonly nodeEnv: string;
```

- *Type:* string

Optional value for NODE_ENV during build and runtime.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

The `NextjsBuild` instance representing the built Nextjs application.

---

##### `bucket`<sup>Optional</sup> <a name="bucket" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.bucket"></a>

```typescript
public readonly bucket: IBucket | BucketProps;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket | aws-cdk-lib.aws_s3.BucketProps

Properties for the S3 bucket containing the NextJS assets.

You can also supply your own bucket here.

---

##### `distribution`<sup>Optional</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.distribution"></a>

```typescript
public readonly distribution: IDistribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IDistribution

Distribution to invalidate when assets change.

---

##### `prune`<sup>Optional</sup> <a name="prune" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.prune"></a>

```typescript
public readonly prune: boolean;
```

- *Type:* boolean

Set to true to delete old assets (defaults to false).

Recommended to only set to true if you don't need the ability to roll back deployments.

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
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.compressionLevel">compressionLevel</a></code> | <code>number</code> | 0 - no compression, fatest 9 - maximum compression, slowest. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
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

##### `compressionLevel`<sup>Optional</sup> <a name="compressionLevel" id="cdk-nextjs-standalone.NextjsBaseProps.property.compressionLevel"></a>

```typescript
public readonly compressionLevel: number;
```

- *Type:* number
- *Default:* 1

0 - no compression, fatest 9 - maximum compression, slowest.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsBaseProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `isPlaceholder`<sup>Optional</sup> <a name="isPlaceholder" id="cdk-nextjs-standalone.NextjsBaseProps.property.isPlaceholder"></a>

```typescript
public readonly isPlaceholder: boolean;
```

- *Type:* boolean

Skip building app and deploy a placeholder.

Useful when using `next dev` for local development.

---

##### `nodeEnv`<sup>Optional</sup> <a name="nodeEnv" id="cdk-nextjs-standalone.NextjsBaseProps.property.nodeEnv"></a>

```typescript
public readonly nodeEnv: string;
```

- *Type:* string

Optional value for NODE_ENV during build and runtime.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsBaseProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsBaseProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

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
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.compressionLevel">compressionLevel</a></code> | <code>number</code> | 0 - no compression, fatest 9 - maximum compression, slowest. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsBuildProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `compressionLevel`<sup>Optional</sup> <a name="compressionLevel" id="cdk-nextjs-standalone.NextjsBuildProps.property.compressionLevel"></a>

```typescript
public readonly compressionLevel: number;
```

- *Type:* number
- *Default:* 1

0 - no compression, fatest 9 - maximum compression, slowest.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsBuildProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `isPlaceholder`<sup>Optional</sup> <a name="isPlaceholder" id="cdk-nextjs-standalone.NextjsBuildProps.property.isPlaceholder"></a>

```typescript
public readonly isPlaceholder: boolean;
```

- *Type:* boolean

Skip building app and deploy a placeholder.

Useful when using `next dev` for local development.

---

##### `nodeEnv`<sup>Optional</sup> <a name="nodeEnv" id="cdk-nextjs-standalone.NextjsBuildProps.property.nodeEnv"></a>

```typescript
public readonly nodeEnv: string;
```

- *Type:* string

Optional value for NODE_ENV during build and runtime.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsBuildProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsBuildProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

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
| <code><a href="#cdk-nextjs-standalone.NextjsCachePolicyProps.property.lambdaCachePolicy">lambdaCachePolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.ICachePolicy</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsCachePolicyProps.property.staticCachePolicy">staticCachePolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.ICachePolicy</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsCachePolicyProps.property.staticClientMaxAgeDefault">staticClientMaxAgeDefault</a></code> | <code>number</code> | Cache-control max-age default for static assets (/_next/*) in seconds. |

---

##### `imageCachePolicy`<sup>Optional</sup> <a name="imageCachePolicy" id="cdk-nextjs-standalone.NextjsCachePolicyProps.property.imageCachePolicy"></a>

```typescript
public readonly imageCachePolicy: ICachePolicy;
```

- *Type:* aws-cdk-lib.aws_cloudfront.ICachePolicy

---

##### `lambdaCachePolicy`<sup>Optional</sup> <a name="lambdaCachePolicy" id="cdk-nextjs-standalone.NextjsCachePolicyProps.property.lambdaCachePolicy"></a>

```typescript
public readonly lambdaCachePolicy: ICachePolicy;
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
public readonly staticClientMaxAgeDefault: number;
```

- *Type:* number

Cache-control max-age default for static assets (/_next/*) in seconds.

---

### NextjsCdkProps <a name="NextjsCdkProps" id="cdk-nextjs-standalone.NextjsCdkProps"></a>

Resources that will be created automatically if not supplied.

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsCdkProps.Initializer"></a>

```typescript
import { NextjsCdkProps } from 'cdk-nextjs-standalone'

const nextjsCdkProps: NextjsCdkProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkProps.property.assetDeployment">assetDeployment</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps">NextjsAssetsDeploymentProps</a></code> | Override static file deployment settings. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.DistributionProps</code> | Override CloudFront distribution settings. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkProps.property.lambda">lambda</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override server lambda function settings. |

---

##### `assetDeployment`<sup>Optional</sup> <a name="assetDeployment" id="cdk-nextjs-standalone.NextjsCdkProps.property.assetDeployment"></a>

```typescript
public readonly assetDeployment: NextjsAssetsDeploymentProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps">NextjsAssetsDeploymentProps</a>

Override static file deployment settings.

---

##### `distribution`<sup>Optional</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsCdkProps.property.distribution"></a>

```typescript
public readonly distribution: DistributionProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.DistributionProps

Override CloudFront distribution settings.

These properties should all be optional but cannot be due to a limitation in jsii.

---

##### `lambda`<sup>Optional</sup> <a name="lambda" id="cdk-nextjs-standalone.NextjsCdkProps.property.lambda"></a>

```typescript
public readonly lambda: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override server lambda function settings.

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
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.compressionLevel">compressionLevel</a></code> | <code>number</code> | 0 - no compression, fatest 9 - maximum compression, slowest. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.serverFunction">serverFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Lambda function to route all non-static requests to. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.cachePolicies">cachePolicies</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsCachePolicyProps">NextjsCachePolicyProps</a></code> | Override the default CloudFront cache policies created internally. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.customDomain">customDomain</a></code> | <code>string \| <a href="#cdk-nextjs-standalone.NextjsDomainProps">NextjsDomainProps</a></code> | The customDomain for this website. Supports domains that are hosted either on [Route 53](https://aws.amazon.com/route53/) or externally. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.IDistribution \| aws-cdk-lib.aws_cloudfront.DistributionProps</code> | Pass in a value to override the default settings this construct uses to create the CloudFront `Distribution` internally. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.lambdaOriginRequestPolicy">lambdaOriginRequestPolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.IOriginRequestPolicy</code> | Override the default CloudFront lambda origin request policy created internally. |
| <code><a href="#cdk-nextjs-standalone.NextjsDistributionProps.property.stageName">stageName</a></code> | <code>string</code> | While deploying, waits for the CloudFront cache invalidation process to finish. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsDistributionProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `compressionLevel`<sup>Optional</sup> <a name="compressionLevel" id="cdk-nextjs-standalone.NextjsDistributionProps.property.compressionLevel"></a>

```typescript
public readonly compressionLevel: number;
```

- *Type:* number
- *Default:* 1

0 - no compression, fatest 9 - maximum compression, slowest.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsDistributionProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `isPlaceholder`<sup>Optional</sup> <a name="isPlaceholder" id="cdk-nextjs-standalone.NextjsDistributionProps.property.isPlaceholder"></a>

```typescript
public readonly isPlaceholder: boolean;
```

- *Type:* boolean

Skip building app and deploy a placeholder.

Useful when using `next dev` for local development.

---

##### `nodeEnv`<sup>Optional</sup> <a name="nodeEnv" id="cdk-nextjs-standalone.NextjsDistributionProps.property.nodeEnv"></a>

```typescript
public readonly nodeEnv: string;
```

- *Type:* string

Optional value for NODE_ENV during build and runtime.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsDistributionProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsDistributionProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsDistributionProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

---

##### `serverFunction`<sup>Required</sup> <a name="serverFunction" id="cdk-nextjs-standalone.NextjsDistributionProps.property.serverFunction"></a>

```typescript
public readonly serverFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Lambda function to route all non-static requests to.

---

##### `bucket`<sup>Optional</sup> <a name="bucket" id="cdk-nextjs-standalone.NextjsDistributionProps.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

---

##### `cachePolicies`<sup>Optional</sup> <a name="cachePolicies" id="cdk-nextjs-standalone.NextjsDistributionProps.property.cachePolicies"></a>

```typescript
public readonly cachePolicies: NextjsCachePolicyProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsCachePolicyProps">NextjsCachePolicyProps</a>

Override the default CloudFront cache policies created internally.

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
new Nextjs(this, "Web", {
  nextjsPath: ".",
  customDomain: "domain.com",
});

new Nextjs(this, "Web", {
  nextjsPath: "packages/web", // monorepo: relative to the root of the CDK project
  customDomain: {
    domainName: "domain.com",
    domainAlias: "www.domain.com",
    hostedZone: "domain.com"
  },
});
```


##### `distribution`<sup>Optional</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsDistributionProps.property.distribution"></a>

```typescript
public readonly distribution: IDistribution | DistributionProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IDistribution | aws-cdk-lib.aws_cloudfront.DistributionProps

Pass in a value to override the default settings this construct uses to create the CloudFront `Distribution` internally.

---

##### `lambdaOriginRequestPolicy`<sup>Optional</sup> <a name="lambdaOriginRequestPolicy" id="cdk-nextjs-standalone.NextjsDistributionProps.property.lambdaOriginRequestPolicy"></a>

```typescript
public readonly lambdaOriginRequestPolicy: IOriginRequestPolicy;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IOriginRequestPolicy

Override the default CloudFront lambda origin request policy created internally.

---

##### `stageName`<sup>Optional</sup> <a name="stageName" id="cdk-nextjs-standalone.NextjsDistributionProps.property.stageName"></a>

```typescript
public readonly stageName: string;
```

- *Type:* string

While deploying, waits for the CloudFront cache invalidation process to finish.

This ensures that the new content will be served once the deploy command finishes. However, this process can sometimes take more than 5 mins. For non-prod environments it might make sense to pass in `false`. That'll skip waiting for the cache to invalidate and speed up the deploy process.

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

### NextjsLambdaProps <a name="NextjsLambdaProps" id="cdk-nextjs-standalone.NextjsLambdaProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsLambdaProps.Initializer"></a>

```typescript
import { NextjsLambdaProps } from 'cdk-nextjs-standalone'

const nextjsLambdaProps: NextjsLambdaProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.nextjsPath">nextjsPath</a></code> | <code>string</code> | Relative path to the directory where the NextJS project is located. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.compressionLevel">compressionLevel</a></code> | <code>number</code> | 0 - no compression, fatest 9 - maximum compression, slowest. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | Built nextJS application. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.function">function</a></code> | <code>aws-cdk-lib.aws_lambda.FunctionOptions</code> | Override function properties. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsLambdaProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `compressionLevel`<sup>Optional</sup> <a name="compressionLevel" id="cdk-nextjs-standalone.NextjsLambdaProps.property.compressionLevel"></a>

```typescript
public readonly compressionLevel: number;
```

- *Type:* number
- *Default:* 1

0 - no compression, fatest 9 - maximum compression, slowest.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsLambdaProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `isPlaceholder`<sup>Optional</sup> <a name="isPlaceholder" id="cdk-nextjs-standalone.NextjsLambdaProps.property.isPlaceholder"></a>

```typescript
public readonly isPlaceholder: boolean;
```

- *Type:* boolean

Skip building app and deploy a placeholder.

Useful when using `next dev` for local development.

---

##### `nodeEnv`<sup>Optional</sup> <a name="nodeEnv" id="cdk-nextjs-standalone.NextjsLambdaProps.property.nodeEnv"></a>

```typescript
public readonly nodeEnv: string;
```

- *Type:* string

Optional value for NODE_ENV during build and runtime.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsLambdaProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsLambdaProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsLambdaProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

Built nextJS application.

---

##### `function`<sup>Optional</sup> <a name="function" id="cdk-nextjs-standalone.NextjsLambdaProps.property.function"></a>

```typescript
public readonly function: FunctionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.FunctionOptions

Override function properties.

---

### NextjsLayerProps <a name="NextjsLayerProps" id="cdk-nextjs-standalone.NextjsLayerProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsLayerProps.Initializer"></a>

```typescript
import { NextjsLayerProps } from 'cdk-nextjs-standalone'

const nextjsLayerProps: NextjsLayerProps = { ... }
```


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
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.compressionLevel">compressionLevel</a></code> | <code>number</code> | 0 - no compression, fatest 9 - maximum compression, slowest. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.quiet">quiet</a></code> | <code>boolean</code> | Less build output. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.cdk">cdk</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsCdkProps">NextjsCdkProps</a></code> | Allows you to override defaults for the CDK resources created by this construct. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

---

##### `compressionLevel`<sup>Optional</sup> <a name="compressionLevel" id="cdk-nextjs-standalone.NextjsProps.property.compressionLevel"></a>

```typescript
public readonly compressionLevel: number;
```

- *Type:* number
- *Default:* 1

0 - no compression, fatest 9 - maximum compression, slowest.

---

##### `environment`<sup>Optional</sup> <a name="environment" id="cdk-nextjs-standalone.NextjsProps.property.environment"></a>

```typescript
public readonly environment: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Custom environment variables to pass to the NextJS build and runtime.

---

##### `isPlaceholder`<sup>Optional</sup> <a name="isPlaceholder" id="cdk-nextjs-standalone.NextjsProps.property.isPlaceholder"></a>

```typescript
public readonly isPlaceholder: boolean;
```

- *Type:* boolean

Skip building app and deploy a placeholder.

Useful when using `next dev` for local development.

---

##### `nodeEnv`<sup>Optional</sup> <a name="nodeEnv" id="cdk-nextjs-standalone.NextjsProps.property.nodeEnv"></a>

```typescript
public readonly nodeEnv: string;
```

- *Type:* string

Optional value for NODE_ENV during build and runtime.

---

##### `quiet`<sup>Optional</sup> <a name="quiet" id="cdk-nextjs-standalone.NextjsProps.property.quiet"></a>

```typescript
public readonly quiet: boolean;
```

- *Type:* boolean

Less build output.

---

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.tmpdir().

---

##### `cdk`<sup>Optional</sup> <a name="cdk" id="cdk-nextjs-standalone.NextjsProps.property.cdk"></a>

```typescript
public readonly cdk: NextjsCdkProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsCdkProps">NextjsCdkProps</a>

Allows you to override defaults for the CDK resources created by this construct.

---



