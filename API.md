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
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.imageCachePolicyProps">imageCachePolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.CachePolicyProps</code> | The default CloudFront cache policy properties for images. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.imageOriginRequestPolicyProps">imageOriginRequestPolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.OriginRequestPolicyProps</code> | The default CloudFront image origin request policy properties for Next images. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.lambdaCachePolicyProps">lambdaCachePolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.CachePolicyProps</code> | The default CloudFront cache policy properties for the Lambda server handler. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.staticCachePolicyProps">staticCachePolicyProps</a></code> | <code>aws-cdk-lib.aws_cloudfront.CachePolicyProps</code> | The default CloudFront cache policy properties for static pages. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.bucketArn">bucketArn</a></code> | <code>string</code> | The ARN of the internally created S3 Bucket. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.bucketName">bucketName</a></code> | <code>string</code> | The name of the internally created S3 Bucket. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.distributionDomain">distributionDomain</a></code> | <code>string</code> | The domain name of the internally created CloudFront Distribution. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.distributionId">distributionId</a></code> | <code>string</code> | The ID of the internally created CloudFront Distribution. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.url">url</a></code> | <code>string</code> | The CloudFront URL of the website. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.customDomainUrl">customDomainUrl</a></code> | <code>string</code> | If the custom domain is enabled, this is the URL of the website with the custom domain. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.assetsDeployment">assetsDeployment</a></code> | <code><a href="#cdk-nextjs-standalone.NextJsAssetsDeployment">NextJsAssetsDeployment</a></code> | Asset deployment to S3. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Bucket containing NextJS static assets. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.Distribution</code> | The internally created CDK `Distribution` instance. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | Built NextJS project output. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.originAccessIdentity">originAccessIdentity</a></code> | <code>aws-cdk-lib.aws_cloudfront.IOriginAccessIdentity</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.serverFunction">serverFunction</a></code> | <code><a href="#cdk-nextjs-standalone.NextJsLambda">NextJsLambda</a></code> | The main NextJS server handler lambda function. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.certificate">certificate</a></code> | <code>aws-cdk-lib.aws_certificatemanager.ICertificate</code> | The AWS Certificate Manager certificate for the custom domain. |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.configBucket">configBucket</a></code> | <code>aws-cdk-lib.aws_s3.Bucket</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.Nextjs.property.hostedZone">hostedZone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | The Route 53 hosted zone for the custom domain. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.Nextjs.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `imageCachePolicyProps`<sup>Required</sup> <a name="imageCachePolicyProps" id="cdk-nextjs-standalone.Nextjs.property.imageCachePolicyProps"></a>

```typescript
public readonly imageCachePolicyProps: CachePolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.CachePolicyProps

The default CloudFront cache policy properties for images.

---

##### `imageOriginRequestPolicyProps`<sup>Required</sup> <a name="imageOriginRequestPolicyProps" id="cdk-nextjs-standalone.Nextjs.property.imageOriginRequestPolicyProps"></a>

```typescript
public readonly imageOriginRequestPolicyProps: OriginRequestPolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.OriginRequestPolicyProps

The default CloudFront image origin request policy properties for Next images.

---

##### `lambdaCachePolicyProps`<sup>Required</sup> <a name="lambdaCachePolicyProps" id="cdk-nextjs-standalone.Nextjs.property.lambdaCachePolicyProps"></a>

```typescript
public readonly lambdaCachePolicyProps: CachePolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.CachePolicyProps

The default CloudFront cache policy properties for the Lambda server handler.

---

##### `staticCachePolicyProps`<sup>Required</sup> <a name="staticCachePolicyProps" id="cdk-nextjs-standalone.Nextjs.property.staticCachePolicyProps"></a>

```typescript
public readonly staticCachePolicyProps: CachePolicyProps;
```

- *Type:* aws-cdk-lib.aws_cloudfront.CachePolicyProps

The default CloudFront cache policy properties for static pages.

---

##### `bucketArn`<sup>Required</sup> <a name="bucketArn" id="cdk-nextjs-standalone.Nextjs.property.bucketArn"></a>

```typescript
public readonly bucketArn: string;
```

- *Type:* string

The ARN of the internally created S3 Bucket.

---

##### `bucketName`<sup>Required</sup> <a name="bucketName" id="cdk-nextjs-standalone.Nextjs.property.bucketName"></a>

```typescript
public readonly bucketName: string;
```

- *Type:* string

The name of the internally created S3 Bucket.

---

##### `distributionDomain`<sup>Required</sup> <a name="distributionDomain" id="cdk-nextjs-standalone.Nextjs.property.distributionDomain"></a>

```typescript
public readonly distributionDomain: string;
```

- *Type:* string

The domain name of the internally created CloudFront Distribution.

---

##### `distributionId`<sup>Required</sup> <a name="distributionId" id="cdk-nextjs-standalone.Nextjs.property.distributionId"></a>

```typescript
public readonly distributionId: string;
```

- *Type:* string

The ID of the internally created CloudFront Distribution.

---

##### `url`<sup>Required</sup> <a name="url" id="cdk-nextjs-standalone.Nextjs.property.url"></a>

```typescript
public readonly url: string;
```

- *Type:* string

The CloudFront URL of the website.

---

##### `customDomainUrl`<sup>Optional</sup> <a name="customDomainUrl" id="cdk-nextjs-standalone.Nextjs.property.customDomainUrl"></a>

```typescript
public readonly customDomainUrl: string;
```

- *Type:* string

If the custom domain is enabled, this is the URL of the website with the custom domain.

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
public readonly distribution: Distribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.Distribution

The internally created CDK `Distribution` instance.

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.Nextjs.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

Built NextJS project output.

---

##### `originAccessIdentity`<sup>Required</sup> <a name="originAccessIdentity" id="cdk-nextjs-standalone.Nextjs.property.originAccessIdentity"></a>

```typescript
public readonly originAccessIdentity: IOriginAccessIdentity;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IOriginAccessIdentity

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

---

##### `certificate`<sup>Optional</sup> <a name="certificate" id="cdk-nextjs-standalone.Nextjs.property.certificate"></a>

```typescript
public readonly certificate: ICertificate;
```

- *Type:* aws-cdk-lib.aws_certificatemanager.ICertificate

The AWS Certificate Manager certificate for the custom domain.

---

##### `configBucket`<sup>Optional</sup> <a name="configBucket" id="cdk-nextjs-standalone.Nextjs.property.configBucket"></a>

```typescript
public readonly configBucket: Bucket;
```

- *Type:* aws-cdk-lib.aws_s3.Bucket

---

##### `hostedZone`<sup>Optional</sup> <a name="hostedZone" id="cdk-nextjs-standalone.Nextjs.property.hostedZone"></a>

```typescript
public readonly hostedZone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

The Route 53 hosted zone for the custom domain.

---


### NextJsAssetsDeployment <a name="NextJsAssetsDeployment" id="cdk-nextjs-standalone.NextJsAssetsDeployment"></a>

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


### NextjsBuild <a name="NextjsBuild" id="cdk-nextjs-standalone.NextjsBuild"></a>

Represents a built NextJS application.

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
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.addEventSource">addEventSource</a></code> | Adds an event source to this function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.addEventSourceMapping">addEventSourceMapping</a></code> | Adds an event source that maps to this AWS Lambda function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.addFunctionUrl">addFunctionUrl</a></code> | Adds a url to this lambda function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.addPermission">addPermission</a></code> | Adds a permission to the Lambda resource policy. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.addToRolePolicy">addToRolePolicy</a></code> | Adds a statement to the IAM role assumed by the instance. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.configureAsyncInvoke">configureAsyncInvoke</a></code> | Configures options for asynchronous invocation. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.considerWarningOnInvokeFunctionPermissions">considerWarningOnInvokeFunctionPermissions</a></code> | A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.grantInvoke">grantInvoke</a></code> | Grant the given identity permissions to invoke this Lambda. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.grantInvokeUrl">grantInvokeUrl</a></code> | Grant the given identity permissions to invoke this Lambda Function URL. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metric">metric</a></code> | Return the given named metric for this Function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricDuration">metricDuration</a></code> | How long execution of this Lambda takes. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricErrors">metricErrors</a></code> | How many invocations of this Lambda fail. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricInvocations">metricInvocations</a></code> | How often this Lambda is invoked. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricThrottles">metricThrottles</a></code> | How often this Lambda is throttled. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.addAlias">addAlias</a></code> | Defines an alias for this function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.addEnvironment">addEnvironment</a></code> | Adds an environment variable to this Lambda function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.addLayers">addLayers</a></code> | Adds one or more Lambda Layers to this Lambda function. |

---

##### `toString` <a name="toString" id="cdk-nextjs-standalone.NextJsLambda.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="cdk-nextjs-standalone.NextJsLambda.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="cdk-nextjs-standalone.NextJsLambda.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addEventSource` <a name="addEventSource" id="cdk-nextjs-standalone.NextJsLambda.addEventSource"></a>

```typescript
public addEventSource(source: IEventSource): void
```

Adds an event source to this function.

Event sources are implemented in the @aws-cdk/aws-lambda-event-sources module.

The following example adds an SQS Queue as an event source:
```
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
myFunction.addEventSource(new SqsEventSource(myQueue));
```

###### `source`<sup>Required</sup> <a name="source" id="cdk-nextjs-standalone.NextJsLambda.addEventSource.parameter.source"></a>

- *Type:* aws-cdk-lib.aws_lambda.IEventSource

---

##### `addEventSourceMapping` <a name="addEventSourceMapping" id="cdk-nextjs-standalone.NextJsLambda.addEventSourceMapping"></a>

```typescript
public addEventSourceMapping(id: string, options: EventSourceMappingOptions): EventSourceMapping
```

Adds an event source that maps to this AWS Lambda function.

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextJsLambda.addEventSourceMapping.parameter.id"></a>

- *Type:* string

---

###### `options`<sup>Required</sup> <a name="options" id="cdk-nextjs-standalone.NextJsLambda.addEventSourceMapping.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventSourceMappingOptions

---

##### `addFunctionUrl` <a name="addFunctionUrl" id="cdk-nextjs-standalone.NextJsLambda.addFunctionUrl"></a>

```typescript
public addFunctionUrl(options?: FunctionUrlOptions): FunctionUrl
```

Adds a url to this lambda function.

###### `options`<sup>Optional</sup> <a name="options" id="cdk-nextjs-standalone.NextJsLambda.addFunctionUrl.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrlOptions

---

##### `addPermission` <a name="addPermission" id="cdk-nextjs-standalone.NextJsLambda.addPermission"></a>

```typescript
public addPermission(id: string, permission: Permission): void
```

Adds a permission to the Lambda resource policy.

> [Permission for details.](Permission for details.)

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextJsLambda.addPermission.parameter.id"></a>

- *Type:* string

The id for the permission construct.

---

###### `permission`<sup>Required</sup> <a name="permission" id="cdk-nextjs-standalone.NextJsLambda.addPermission.parameter.permission"></a>

- *Type:* aws-cdk-lib.aws_lambda.Permission

The permission to grant to this Lambda function.

---

##### `addToRolePolicy` <a name="addToRolePolicy" id="cdk-nextjs-standalone.NextJsLambda.addToRolePolicy"></a>

```typescript
public addToRolePolicy(statement: PolicyStatement): void
```

Adds a statement to the IAM role assumed by the instance.

###### `statement`<sup>Required</sup> <a name="statement" id="cdk-nextjs-standalone.NextJsLambda.addToRolePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `configureAsyncInvoke` <a name="configureAsyncInvoke" id="cdk-nextjs-standalone.NextJsLambda.configureAsyncInvoke"></a>

```typescript
public configureAsyncInvoke(options: EventInvokeConfigOptions): void
```

Configures options for asynchronous invocation.

###### `options`<sup>Required</sup> <a name="options" id="cdk-nextjs-standalone.NextJsLambda.configureAsyncInvoke.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventInvokeConfigOptions

---

##### `considerWarningOnInvokeFunctionPermissions` <a name="considerWarningOnInvokeFunctionPermissions" id="cdk-nextjs-standalone.NextJsLambda.considerWarningOnInvokeFunctionPermissions"></a>

```typescript
public considerWarningOnInvokeFunctionPermissions(scope: Construct, action: string): void
```

A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function.

function.currentVersion is invoked before or after the permission is created.

This applies only to permissions on Lambda functions, not versions or aliases.
This function is overridden as a noOp for QualifiedFunctionBase.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextJsLambda.considerWarningOnInvokeFunctionPermissions.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `action`<sup>Required</sup> <a name="action" id="cdk-nextjs-standalone.NextJsLambda.considerWarningOnInvokeFunctionPermissions.parameter.action"></a>

- *Type:* string

---

##### `grantInvoke` <a name="grantInvoke" id="cdk-nextjs-standalone.NextJsLambda.grantInvoke"></a>

```typescript
public grantInvoke(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="cdk-nextjs-standalone.NextJsLambda.grantInvoke.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeUrl` <a name="grantInvokeUrl" id="cdk-nextjs-standalone.NextJsLambda.grantInvokeUrl"></a>

```typescript
public grantInvokeUrl(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda Function URL.

###### `grantee`<sup>Required</sup> <a name="grantee" id="cdk-nextjs-standalone.NextJsLambda.grantInvokeUrl.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `metric` <a name="metric" id="cdk-nextjs-standalone.NextJsLambda.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Function.

###### `metricName`<sup>Required</sup> <a name="metricName" id="cdk-nextjs-standalone.NextJsLambda.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricDuration` <a name="metricDuration" id="cdk-nextjs-standalone.NextJsLambda.metricDuration"></a>

```typescript
public metricDuration(props?: MetricOptions): Metric
```

How long execution of this Lambda takes.

Average over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricErrors` <a name="metricErrors" id="cdk-nextjs-standalone.NextJsLambda.metricErrors"></a>

```typescript
public metricErrors(props?: MetricOptions): Metric
```

How many invocations of this Lambda fail.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInvocations` <a name="metricInvocations" id="cdk-nextjs-standalone.NextJsLambda.metricInvocations"></a>

```typescript
public metricInvocations(props?: MetricOptions): Metric
```

How often this Lambda is invoked.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottles` <a name="metricThrottles" id="cdk-nextjs-standalone.NextJsLambda.metricThrottles"></a>

```typescript
public metricThrottles(props?: MetricOptions): Metric
```

How often this Lambda is throttled.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addAlias` <a name="addAlias" id="cdk-nextjs-standalone.NextJsLambda.addAlias"></a>

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

###### `aliasName`<sup>Required</sup> <a name="aliasName" id="cdk-nextjs-standalone.NextJsLambda.addAlias.parameter.aliasName"></a>

- *Type:* string

The name of the alias.

---

###### `options`<sup>Optional</sup> <a name="options" id="cdk-nextjs-standalone.NextJsLambda.addAlias.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.AliasOptions

Alias options.

---

##### `addEnvironment` <a name="addEnvironment" id="cdk-nextjs-standalone.NextJsLambda.addEnvironment"></a>

```typescript
public addEnvironment(key: string, value: string, options?: EnvironmentOptions): Function
```

Adds an environment variable to this Lambda function.

If this is a ref to a Lambda function, this operation results in a no-op.

###### `key`<sup>Required</sup> <a name="key" id="cdk-nextjs-standalone.NextJsLambda.addEnvironment.parameter.key"></a>

- *Type:* string

The environment variable key.

---

###### `value`<sup>Required</sup> <a name="value" id="cdk-nextjs-standalone.NextJsLambda.addEnvironment.parameter.value"></a>

- *Type:* string

The environment variable's value.

---

###### `options`<sup>Optional</sup> <a name="options" id="cdk-nextjs-standalone.NextJsLambda.addEnvironment.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EnvironmentOptions

Environment variable options.

---

##### `addLayers` <a name="addLayers" id="cdk-nextjs-standalone.NextJsLambda.addLayers"></a>

```typescript
public addLayers(layers: ILayerVersion): void
```

Adds one or more Lambda Layers to this Lambda function.

###### `layers`<sup>Required</sup> <a name="layers" id="cdk-nextjs-standalone.NextJsLambda.addLayers.parameter.layers"></a>

- *Type:* aws-cdk-lib.aws_lambda.ILayerVersion

the layers to be added.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.classifyVersionProperty">classifyVersionProperty</a></code> | Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.fromFunctionArn">fromFunctionArn</a></code> | Import a lambda function into the CDK using its ARN. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.fromFunctionAttributes">fromFunctionAttributes</a></code> | Creates a Lambda function object which represents a function not defined within this stack. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.fromFunctionName">fromFunctionName</a></code> | Import a lambda function into the CDK using its name. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricAll">metricAll</a></code> | Return the given named metric for this Lambda. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricAllConcurrentExecutions">metricAllConcurrentExecutions</a></code> | Metric for the number of concurrent executions across all Lambdas. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricAllDuration">metricAllDuration</a></code> | Metric for the Duration executing all Lambdas. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricAllErrors">metricAllErrors</a></code> | Metric for the number of Errors executing all Lambdas. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricAllInvocations">metricAllInvocations</a></code> | Metric for the number of invocations of all Lambdas. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricAllThrottles">metricAllThrottles</a></code> | Metric for the number of throttled invocations of all Lambdas. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.metricAllUnreservedConcurrentExecutions">metricAllUnreservedConcurrentExecutions</a></code> | Metric for the number of unreserved concurrent executions across all Lambdas. |

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

##### `isOwnedResource` <a name="isOwnedResource" id="cdk-nextjs-standalone.NextJsLambda.isOwnedResource"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="cdk-nextjs-standalone.NextJsLambda.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="cdk-nextjs-standalone.NextJsLambda.isResource"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="cdk-nextjs-standalone.NextJsLambda.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `classifyVersionProperty` <a name="classifyVersionProperty" id="cdk-nextjs-standalone.NextJsLambda.classifyVersionProperty"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.classifyVersionProperty(propertyName: string, locked: boolean)
```

Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource.

See 'currentVersion' section in the module README for more details.

###### `propertyName`<sup>Required</sup> <a name="propertyName" id="cdk-nextjs-standalone.NextJsLambda.classifyVersionProperty.parameter.propertyName"></a>

- *Type:* string

The property to classify.

---

###### `locked`<sup>Required</sup> <a name="locked" id="cdk-nextjs-standalone.NextJsLambda.classifyVersionProperty.parameter.locked"></a>

- *Type:* boolean

whether the property should be associated to the version or not.

---

##### `fromFunctionArn` <a name="fromFunctionArn" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionArn"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.fromFunctionArn(scope: Construct, id: string, functionArn: string)
```

Import a lambda function into the CDK using its ARN.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionArn.parameter.id"></a>

- *Type:* string

---

###### `functionArn`<sup>Required</sup> <a name="functionArn" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionArn.parameter.functionArn"></a>

- *Type:* string

---

##### `fromFunctionAttributes` <a name="fromFunctionAttributes" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionAttributes"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.fromFunctionAttributes(scope: Construct, id: string, attrs: FunctionAttributes)
```

Creates a Lambda function object which represents a function not defined within this stack.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent construct.

---

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionAttributes.parameter.id"></a>

- *Type:* string

The name of the lambda construct.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionAttributes

the attributes of the function to import.

---

##### `fromFunctionName` <a name="fromFunctionName" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionName"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.fromFunctionName(scope: Construct, id: string, functionName: string)
```

Import a lambda function into the CDK using its name.

###### `scope`<sup>Required</sup> <a name="scope" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionName.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionName.parameter.id"></a>

- *Type:* string

---

###### `functionName`<sup>Required</sup> <a name="functionName" id="cdk-nextjs-standalone.NextJsLambda.fromFunctionName.parameter.functionName"></a>

- *Type:* string

---

##### `metricAll` <a name="metricAll" id="cdk-nextjs-standalone.NextJsLambda.metricAll"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.metricAll(metricName: string, props?: MetricOptions)
```

Return the given named metric for this Lambda.

###### `metricName`<sup>Required</sup> <a name="metricName" id="cdk-nextjs-standalone.NextJsLambda.metricAll.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricAll.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllConcurrentExecutions` <a name="metricAllConcurrentExecutions" id="cdk-nextjs-standalone.NextJsLambda.metricAllConcurrentExecutions"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.metricAllConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricAllConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllDuration` <a name="metricAllDuration" id="cdk-nextjs-standalone.NextJsLambda.metricAllDuration"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.metricAllDuration(props?: MetricOptions)
```

Metric for the Duration executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricAllDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllErrors` <a name="metricAllErrors" id="cdk-nextjs-standalone.NextJsLambda.metricAllErrors"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.metricAllErrors(props?: MetricOptions)
```

Metric for the number of Errors executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricAllErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllInvocations` <a name="metricAllInvocations" id="cdk-nextjs-standalone.NextJsLambda.metricAllInvocations"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.metricAllInvocations(props?: MetricOptions)
```

Metric for the number of invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricAllInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllThrottles` <a name="metricAllThrottles" id="cdk-nextjs-standalone.NextJsLambda.metricAllThrottles"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.metricAllThrottles(props?: MetricOptions)
```

Metric for the number of throttled invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricAllThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllUnreservedConcurrentExecutions` <a name="metricAllUnreservedConcurrentExecutions" id="cdk-nextjs-standalone.NextJsLambda.metricAllUnreservedConcurrentExecutions"></a>

```typescript
import { NextJsLambda } from 'cdk-nextjs-standalone'

NextJsLambda.metricAllUnreservedConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of unreserved concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="cdk-nextjs-standalone.NextJsLambda.metricAllUnreservedConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64). |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | Access the Connections object. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.functionArn">functionArn</a></code> | <code>string</code> | ARN of this function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.functionName">functionName</a></code> | <code>string</code> | Name of this function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal this Lambda Function is running as. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.isBoundToVpc">isBoundToVpc</a></code> | <code>boolean</code> | Whether or not this Lambda function was bound to a VPC. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.latestVersion">latestVersion</a></code> | <code>aws-cdk-lib.aws_lambda.IVersion</code> | The `$LATEST` version of this function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.permissionsNode">permissionsNode</a></code> | <code>constructs.Node</code> | The construct node where permissions are attached. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.resourceArnsForGrantInvoke">resourceArnsForGrantInvoke</a></code> | <code>string[]</code> | The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke(). |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Execution role associated with this function. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.currentVersion">currentVersion</a></code> | <code>aws-cdk-lib.aws_lambda.Version</code> | Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The LogGroup where the Lambda function's logs are made available. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime configured for this lambda. |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The DLQ (as queue) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The DLQ (as topic) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#cdk-nextjs-standalone.NextJsLambda.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The timeout configured for this lambda. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-nextjs-standalone.NextJsLambda.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="cdk-nextjs-standalone.NextJsLambda.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="cdk-nextjs-standalone.NextJsLambda.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `architecture`<sup>Required</sup> <a name="architecture" id="cdk-nextjs-standalone.NextJsLambda.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture

The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64).

---

##### `connections`<sup>Required</sup> <a name="connections" id="cdk-nextjs-standalone.NextJsLambda.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

Access the Connections object.

Will fail if not a VPC-enabled Lambda Function

---

##### `functionArn`<sup>Required</sup> <a name="functionArn" id="cdk-nextjs-standalone.NextJsLambda.property.functionArn"></a>

```typescript
public readonly functionArn: string;
```

- *Type:* string

ARN of this function.

---

##### `functionName`<sup>Required</sup> <a name="functionName" id="cdk-nextjs-standalone.NextJsLambda.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string

Name of this function.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="cdk-nextjs-standalone.NextJsLambda.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal this Lambda Function is running as.

---

##### `isBoundToVpc`<sup>Required</sup> <a name="isBoundToVpc" id="cdk-nextjs-standalone.NextJsLambda.property.isBoundToVpc"></a>

```typescript
public readonly isBoundToVpc: boolean;
```

- *Type:* boolean

Whether or not this Lambda function was bound to a VPC.

If this is is `false`, trying to access the `connections` object will fail.

---

##### `latestVersion`<sup>Required</sup> <a name="latestVersion" id="cdk-nextjs-standalone.NextJsLambda.property.latestVersion"></a>

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

##### `permissionsNode`<sup>Required</sup> <a name="permissionsNode" id="cdk-nextjs-standalone.NextJsLambda.property.permissionsNode"></a>

```typescript
public readonly permissionsNode: Node;
```

- *Type:* constructs.Node

The construct node where permissions are attached.

---

##### `resourceArnsForGrantInvoke`<sup>Required</sup> <a name="resourceArnsForGrantInvoke" id="cdk-nextjs-standalone.NextJsLambda.property.resourceArnsForGrantInvoke"></a>

```typescript
public readonly resourceArnsForGrantInvoke: string[];
```

- *Type:* string[]

The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke().

---

##### `role`<sup>Optional</sup> <a name="role" id="cdk-nextjs-standalone.NextJsLambda.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

Execution role associated with this function.

---

##### `currentVersion`<sup>Required</sup> <a name="currentVersion" id="cdk-nextjs-standalone.NextJsLambda.property.currentVersion"></a>

```typescript
public readonly currentVersion: Version;
```

- *Type:* aws-cdk-lib.aws_lambda.Version

Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes.

You can specify options for this version using the `currentVersionOptions`
prop when initializing the `lambda.Function`.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="cdk-nextjs-standalone.NextJsLambda.property.logGroup"></a>

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

##### `runtime`<sup>Required</sup> <a name="runtime" id="cdk-nextjs-standalone.NextJsLambda.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

The runtime configured for this lambda.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="cdk-nextjs-standalone.NextJsLambda.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

The DLQ (as queue) associated with this Lambda Function (this is an optional attribute).

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="cdk-nextjs-standalone.NextJsLambda.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic

The DLQ (as topic) associated with this Lambda Function (this is an optional attribute).

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="cdk-nextjs-standalone.NextJsLambda.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

The timeout configured for this lambda.

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
| <code><a href="#cdk-nextjs-standalone.CreateArchiveArgs.property.fileGlob">fileGlob</a></code> | <code>string</code> | *No description.* |

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

##### `fileGlob`<sup>Optional</sup> <a name="fileGlob" id="cdk-nextjs-standalone.CreateArchiveArgs.property.fileGlob"></a>

```typescript
public readonly fileGlob: string;
```

- *Type:* string

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
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket \| aws-cdk-lib.aws_s3.BucketProps</code> | Properties for the S3 bucket containing the NextJS assets. |
| <code><a href="#cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.IDistribution</code> | Distribution to invalidate when assets change. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

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

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.mkdtempSync().

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsAssetsDeploymentProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

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
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsBaseProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
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

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsBaseProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.mkdtempSync().

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
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsBuildProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
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

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsBuildProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.mkdtempSync().

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

### NextjsCdkDistributionProps <a name="NextjsCdkDistributionProps" id="cdk-nextjs-standalone.NextjsCdkDistributionProps"></a>

#### Initializer <a name="Initializer" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.Initializer"></a>

```typescript
import { NextjsCdkDistributionProps } from 'cdk-nextjs-standalone'

const nextjsCdkDistributionProps: NextjsCdkDistributionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.defaultBehavior">defaultBehavior</a></code> | <code>aws-cdk-lib.aws_cloudfront.BehaviorOptions</code> | The default behavior for the distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.additionalBehaviors">additionalBehaviors</a></code> | <code>{[ key: string ]: aws-cdk-lib.aws_cloudfront.BehaviorOptions}</code> | Additional behaviors for the distribution, mapped by the pathPattern that specifies which requests to apply the behavior to. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.certificate">certificate</a></code> | <code>aws-cdk-lib.aws_certificatemanager.ICertificate</code> | A certificate to associate with the distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.comment">comment</a></code> | <code>string</code> | Any comments you want to include about the distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.defaultRootObject">defaultRootObject</a></code> | <code>string</code> | The object that you want CloudFront to request from your origin (for example, index.html) when a viewer requests the root URL for your distribution. If no default object is set, the request goes to the origin's root (e.g., example.com/). |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.domainNames">domainNames</a></code> | <code>string[]</code> | Alternative domain names for this distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.enabled">enabled</a></code> | <code>boolean</code> | Enable or disable the distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.enableIpv6">enableIpv6</a></code> | <code>boolean</code> | Whether CloudFront will respond to IPv6 DNS requests with an IPv6 address. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.enableLogging">enableLogging</a></code> | <code>boolean</code> | Enable access logging for the distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.errorResponses">errorResponses</a></code> | <code>aws-cdk-lib.aws_cloudfront.ErrorResponse[]</code> | How CloudFront should handle requests that are not successful (e.g., PageNotFound). |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.geoRestriction">geoRestriction</a></code> | <code>aws-cdk-lib.aws_cloudfront.GeoRestriction</code> | Controls the countries in which your content is distributed. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.httpVersion">httpVersion</a></code> | <code>aws-cdk-lib.aws_cloudfront.HttpVersion</code> | Specify the maximum HTTP version that you want viewers to use to communicate with CloudFront. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.logBucket">logBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The Amazon S3 bucket to store the access logs in. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.logFilePrefix">logFilePrefix</a></code> | <code>string</code> | An optional string that you want CloudFront to prefix to the access log filenames for this distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.logIncludesCookies">logIncludesCookies</a></code> | <code>boolean</code> | Specifies whether you want CloudFront to include cookies in access logs. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.minimumProtocolVersion">minimumProtocolVersion</a></code> | <code>aws-cdk-lib.aws_cloudfront.SecurityPolicyProtocol</code> | The minimum version of the SSL protocol that you want CloudFront to use for HTTPS connections. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.priceClass">priceClass</a></code> | <code>aws-cdk-lib.aws_cloudfront.PriceClass</code> | The price class that corresponds with the maximum price that you want to pay for CloudFront service. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.sslSupportMethod">sslSupportMethod</a></code> | <code>aws-cdk-lib.aws_cloudfront.SSLMethod</code> | The SSL method CloudFront will use for your distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps.property.webAclId">webAclId</a></code> | <code>string</code> | Unique identifier that specifies the AWS WAF web ACL to associate with this CloudFront distribution. |

---

##### `defaultBehavior`<sup>Required</sup> <a name="defaultBehavior" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.defaultBehavior"></a>

```typescript
public readonly defaultBehavior: BehaviorOptions;
```

- *Type:* aws-cdk-lib.aws_cloudfront.BehaviorOptions

The default behavior for the distribution.

---

##### `additionalBehaviors`<sup>Optional</sup> <a name="additionalBehaviors" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.additionalBehaviors"></a>

```typescript
public readonly additionalBehaviors: {[ key: string ]: BehaviorOptions};
```

- *Type:* {[ key: string ]: aws-cdk-lib.aws_cloudfront.BehaviorOptions}
- *Default:* no additional behaviors are added.

Additional behaviors for the distribution, mapped by the pathPattern that specifies which requests to apply the behavior to.

---

##### `certificate`<sup>Optional</sup> <a name="certificate" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.certificate"></a>

```typescript
public readonly certificate: ICertificate;
```

- *Type:* aws-cdk-lib.aws_certificatemanager.ICertificate
- *Default:* the CloudFront wildcard certificate (*.cloudfront.net) will be used.

A certificate to associate with the distribution.

The certificate must be located in N. Virginia (us-east-1).

---

##### `comment`<sup>Optional</sup> <a name="comment" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.comment"></a>

```typescript
public readonly comment: string;
```

- *Type:* string
- *Default:* no comment

Any comments you want to include about the distribution.

---

##### `defaultRootObject`<sup>Optional</sup> <a name="defaultRootObject" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.defaultRootObject"></a>

```typescript
public readonly defaultRootObject: string;
```

- *Type:* string
- *Default:* no default root object

The object that you want CloudFront to request from your origin (for example, index.html) when a viewer requests the root URL for your distribution. If no default object is set, the request goes to the origin's root (e.g., example.com/).

---

##### `domainNames`<sup>Optional</sup> <a name="domainNames" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.domainNames"></a>

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

##### `enabled`<sup>Optional</sup> <a name="enabled" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.enabled"></a>

```typescript
public readonly enabled: boolean;
```

- *Type:* boolean
- *Default:* true

Enable or disable the distribution.

---

##### `enableIpv6`<sup>Optional</sup> <a name="enableIpv6" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.enableIpv6"></a>

```typescript
public readonly enableIpv6: boolean;
```

- *Type:* boolean
- *Default:* true

Whether CloudFront will respond to IPv6 DNS requests with an IPv6 address.

If you specify false, CloudFront responds to IPv6 DNS requests with the DNS response code NOERROR and with no IP addresses.
This allows viewers to submit a second request, for an IPv4 address for your distribution.

---

##### `enableLogging`<sup>Optional</sup> <a name="enableLogging" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.enableLogging"></a>

```typescript
public readonly enableLogging: boolean;
```

- *Type:* boolean
- *Default:* false, unless `logBucket` is specified.

Enable access logging for the distribution.

---

##### `errorResponses`<sup>Optional</sup> <a name="errorResponses" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.errorResponses"></a>

```typescript
public readonly errorResponses: ErrorResponse[];
```

- *Type:* aws-cdk-lib.aws_cloudfront.ErrorResponse[]
- *Default:* No custom error responses.

How CloudFront should handle requests that are not successful (e.g., PageNotFound).

---

##### `geoRestriction`<sup>Optional</sup> <a name="geoRestriction" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.geoRestriction"></a>

```typescript
public readonly geoRestriction: GeoRestriction;
```

- *Type:* aws-cdk-lib.aws_cloudfront.GeoRestriction
- *Default:* No geographic restrictions

Controls the countries in which your content is distributed.

---

##### `httpVersion`<sup>Optional</sup> <a name="httpVersion" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.httpVersion"></a>

```typescript
public readonly httpVersion: HttpVersion;
```

- *Type:* aws-cdk-lib.aws_cloudfront.HttpVersion
- *Default:* HttpVersion.HTTP2

Specify the maximum HTTP version that you want viewers to use to communicate with CloudFront.

For viewers and CloudFront to use HTTP/2, viewers must support TLS 1.2 or later, and must support server name identification (SNI).

---

##### `logBucket`<sup>Optional</sup> <a name="logBucket" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.logBucket"></a>

```typescript
public readonly logBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket
- *Default:* A bucket is created if `enableLogging` is true

The Amazon S3 bucket to store the access logs in.

---

##### `logFilePrefix`<sup>Optional</sup> <a name="logFilePrefix" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.logFilePrefix"></a>

```typescript
public readonly logFilePrefix: string;
```

- *Type:* string
- *Default:* no prefix

An optional string that you want CloudFront to prefix to the access log filenames for this distribution.

---

##### `logIncludesCookies`<sup>Optional</sup> <a name="logIncludesCookies" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.logIncludesCookies"></a>

```typescript
public readonly logIncludesCookies: boolean;
```

- *Type:* boolean
- *Default:* false

Specifies whether you want CloudFront to include cookies in access logs.

---

##### `minimumProtocolVersion`<sup>Optional</sup> <a name="minimumProtocolVersion" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.minimumProtocolVersion"></a>

```typescript
public readonly minimumProtocolVersion: SecurityPolicyProtocol;
```

- *Type:* aws-cdk-lib.aws_cloudfront.SecurityPolicyProtocol
- *Default:* SecurityPolicyProtocol.TLS_V1_2_2021 if the '

The minimum version of the SSL protocol that you want CloudFront to use for HTTPS connections.

CloudFront serves your objects only to browsers or devices that support at
least the SSL version that you specify.

---

##### `priceClass`<sup>Optional</sup> <a name="priceClass" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.priceClass"></a>

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

##### `sslSupportMethod`<sup>Optional</sup> <a name="sslSupportMethod" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.sslSupportMethod"></a>

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

##### `webAclId`<sup>Optional</sup> <a name="webAclId" id="cdk-nextjs-standalone.NextjsCdkDistributionProps.property.webAclId"></a>

```typescript
public readonly webAclId: string;
```

- *Type:* string
- *Default:* No AWS Web Application Firewall web access control list (web ACL).

Unique identifier that specifies the AWS WAF web ACL to associate with this CloudFront distribution.

To specify a web ACL created using the latest version of AWS WAF, use the ACL ARN, for example
`arn:aws:wafv2:us-east-1:123456789012:global/webacl/ExampleWebACL/473e64fd-f30b-4765-81a0-62ad96dd167a`.
To specify a web ACL created using AWS WAF Classic, use the ACL ID, for example `473e64fd-f30b-4765-81a0-62ad96dd167a`.

> [https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_CreateDistribution.html#API_CreateDistribution_RequestParameters.](https://docs.aws.amazon.com/cloudfront/latest/APIReference/API_CreateDistribution.html#API_CreateDistribution_RequestParameters.)

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
| <code><a href="#cdk-nextjs-standalone.NextjsCdkProps.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket \| aws-cdk-lib.aws_s3.BucketProps</code> | *No description.* |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkProps.property.cachePolicies">cachePolicies</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsCachePolicyProps">NextjsCachePolicyProps</a></code> | Override the default CloudFront cache policies created internally. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkProps.property.distribution">distribution</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps">NextjsCdkDistributionProps</a></code> | Pass in a value to override the default settings this construct uses to create the CDK `Distribution` internally. |
| <code><a href="#cdk-nextjs-standalone.NextjsCdkProps.property.imageOriginRequestPolicy">imageOriginRequestPolicy</a></code> | <code>aws-cdk-lib.aws_cloudfront.IOriginRequestPolicy</code> | Override the default CloudFront image origin request policy created internally. |

---

##### `bucket`<sup>Optional</sup> <a name="bucket" id="cdk-nextjs-standalone.NextjsCdkProps.property.bucket"></a>

```typescript
public readonly bucket: IBucket | BucketProps;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket | aws-cdk-lib.aws_s3.BucketProps

---

##### `cachePolicies`<sup>Optional</sup> <a name="cachePolicies" id="cdk-nextjs-standalone.NextjsCdkProps.property.cachePolicies"></a>

```typescript
public readonly cachePolicies: NextjsCachePolicyProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsCachePolicyProps">NextjsCachePolicyProps</a>

Override the default CloudFront cache policies created internally.

---

##### `distribution`<sup>Optional</sup> <a name="distribution" id="cdk-nextjs-standalone.NextjsCdkProps.property.distribution"></a>

```typescript
public readonly distribution: NextjsCdkDistributionProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsCdkDistributionProps">NextjsCdkDistributionProps</a>

Pass in a value to override the default settings this construct uses to create the CDK `Distribution` internally.

---

##### `imageOriginRequestPolicy`<sup>Optional</sup> <a name="imageOriginRequestPolicy" id="cdk-nextjs-standalone.NextjsCdkProps.property.imageOriginRequestPolicy"></a>

```typescript
public readonly imageOriginRequestPolicy: IOriginRequestPolicy;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IOriginRequestPolicy

Override the default CloudFront image origin request policy created internally.

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
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsLambdaProps.property.nextBuild">nextBuild</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a></code> | *No description.* |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsLambdaProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

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

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsLambdaProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.mkdtempSync().

---

##### `nextBuild`<sup>Required</sup> <a name="nextBuild" id="cdk-nextjs-standalone.NextjsLambdaProps.property.nextBuild"></a>

```typescript
public readonly nextBuild: NextjsBuild;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsBuild">NextjsBuild</a>

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
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.environment">environment</a></code> | <code>{[ key: string ]: string}</code> | Custom environment variables to pass to the NextJS build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.isPlaceholder">isPlaceholder</a></code> | <code>boolean</code> | Skip building app and deploy a placeholder. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.nodeEnv">nodeEnv</a></code> | <code>string</code> | Optional value for NODE_ENV during build and runtime. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.tempBuildDir">tempBuildDir</a></code> | <code>string</code> | Directory to store temporary build files in. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.cdk">cdk</a></code> | <code><a href="#cdk-nextjs-standalone.NextjsCdkProps">NextjsCdkProps</a></code> | Allows you to override default settings this construct uses internally to create the cloudfront distribution. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.customDomain">customDomain</a></code> | <code>string \| <a href="#cdk-nextjs-standalone.NextjsDomainProps">NextjsDomainProps</a></code> | The customDomain for this website. Supports domains that are hosted either on [Route 53](https://aws.amazon.com/route53/) or externally. |
| <code><a href="#cdk-nextjs-standalone.NextjsProps.property.waitForInvalidation">waitForInvalidation</a></code> | <code>boolean</code> | While deploying, waits for the CloudFront cache invalidation process to finish. |

---

##### `nextjsPath`<sup>Required</sup> <a name="nextjsPath" id="cdk-nextjs-standalone.NextjsProps.property.nextjsPath"></a>

```typescript
public readonly nextjsPath: string;
```

- *Type:* string

Relative path to the directory where the NextJS project is located.

Can be the root of your project (`.`) or a subdirectory (`packages/web`).

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

##### `tempBuildDir`<sup>Optional</sup> <a name="tempBuildDir" id="cdk-nextjs-standalone.NextjsProps.property.tempBuildDir"></a>

```typescript
public readonly tempBuildDir: string;
```

- *Type:* string

Directory to store temporary build files in.

Defaults to os.mkdtempSync().

---

##### `cdk`<sup>Optional</sup> <a name="cdk" id="cdk-nextjs-standalone.NextjsProps.property.cdk"></a>

```typescript
public readonly cdk: NextjsCdkProps;
```

- *Type:* <a href="#cdk-nextjs-standalone.NextjsCdkProps">NextjsCdkProps</a>

Allows you to override default settings this construct uses internally to create the cloudfront distribution.

---

##### `customDomain`<sup>Optional</sup> <a name="customDomain" id="cdk-nextjs-standalone.NextjsProps.property.customDomain"></a>

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


##### `waitForInvalidation`<sup>Optional</sup> <a name="waitForInvalidation" id="cdk-nextjs-standalone.NextjsProps.property.waitForInvalidation"></a>

```typescript
public readonly waitForInvalidation: boolean;
```

- *Type:* boolean

While deploying, waits for the CloudFront cache invalidation process to finish.

This ensures that the new content will be served once the deploy command finishes. However, this process can sometimes take more than 5 mins. For non-prod environments it might make sense to pass in `false`. That'll skip waiting for the cache to invalidate and speed up the deploy process.

---



