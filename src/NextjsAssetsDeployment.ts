import * as os from 'os';
import * as path from 'path';
import { CustomResource, Duration, RemovalPolicy, Token } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import * as fs from 'fs-extra';
import * as micromatch from 'micromatch';
import { bundleFunction } from './BundleFunction';
import { NextjsBaseProps } from './NextjsBase';
import { createArchive, makeTokenPlaceholder, NextjsBuild, replaceTokenGlobs } from './NextjsBuild';

export interface NextjsAssetsDeploymentProps extends NextjsBaseProps {
  /**
   * The `NextjsBuild` instance representing the built Nextjs application.
   */
  readonly nextBuild: NextjsBuild;

  /**
   * Properties for the S3 bucket containing the NextJS assets.
   * You can also supply your own bucket here.
   */
  readonly bucket?: s3.IBucket | s3.BucketProps;

  /**
   * Distribution to invalidate when assets change.
   */
  readonly distribution?: cloudfront.IDistribution;

  /**
   * Set to true to delete old assets (defaults to false).
   * Recommended to only set to true if you don't need the ability to roll back deployments.
   */
  readonly prune?: boolean;
}

// interface EnvReplaceValues {
//   files: string[]; // file globs
//   replacements: Record<string, string>;
// }

/**
 * Uploads NextJS-built static and public files to S3.
 *
 * Will rewrite CloudFormation references with their resolved values after uploading.
 */
export class NextJsAssetsDeployment extends Construct {
  /**
   * Bucket containing assets.
   */
  bucket: s3.IBucket;

  /**
   * Asset deployments to S3.
   */
  public deployments: BucketDeployment[];

  public staticTempDir: string;

  protected props: NextjsAssetsDeploymentProps;

  constructor(scope: Construct, id: string, props: NextjsAssetsDeploymentProps) {
    super(scope, id);

    this.props = props;

    this.bucket = this.createAssetBucket();
    this.staticTempDir = this.prepareArchiveDirectory();
    this.deployments = this.uploadS3Assets(this.staticTempDir);

    // do rewrites of unresolved CDK tokens in static files
    const rewriter = this.createRewriteResource();
    rewriter?.node.addDependency(...this.deployments.map((deployment) => deployment.deployedBucket));
  }

  // arrange directory structure for S3 asset deployments
  // should contain _next/static and ./ for public files
  protected prepareArchiveDirectory(): string {
    const archiveDir = this.props.tempBuildDir
      ? path.resolve(path.join(this.props.tempBuildDir, 'static'))
      : fs.mkdtempSync(path.join(os.tmpdir(), 'static-'));
    fs.mkdirpSync(archiveDir);

    // theoretically we could move the files instead of copy for speed...

    // path to public folder; root static assets
    const staticDir = this.props.nextBuild.nextStaticDir;
    let publicDir = this.props.isPlaceholder
      ? path.resolve(__dirname, '../assets/placeholder-site')
      : this.props.nextBuild.nextPublicDir;

    if (!this.props.isPlaceholder && fs.existsSync(staticDir)) {
      // copy static files
      const staticDestinationDir = path.join(archiveDir, '_next', 'static');
      fs.mkdirpSync(staticDestinationDir);
      fs.copySync(this.props.nextBuild.nextStaticDir, staticDestinationDir, {
        recursive: true,
        dereference: true,
        preserveTimestamps: true,
      });
    }

    // copy public files to root
    if (fs.existsSync(publicDir)) {
      fs.copySync(publicDir, archiveDir, {
        recursive: true,
        dereference: true,
        preserveTimestamps: true,
      });
    }

    return archiveDir;
  }

  private uploadS3Assets(archiveDir: string) {
    // zip up bucket contents and upload to bucket
    const archiveZipFilePath = createArchive({
      directory: archiveDir,
      zipFileName: 'assets.zip',
      zipOutDir: path.join(this.props.nextBuild.tempBuildDir, 'assets'),
      compressionLevel: this.props.compressionLevel,
      quiet: this.props.quiet,
    });

    const deployment = new BucketDeployment(this, 'NextStaticAssetsS3Deployment', {
      destinationBucket: this.bucket,
      destinationKeyPrefix: this.props.isPlaceholder ? '/placeholder' : '/',
      sources: [Source.asset(archiveZipFilePath)],
      distribution: this.props.distribution,
      prune: this.props.prune,
    });

    return [deployment];
  }

  private createRewriteResource() {
    const s3keys = this._getStaticFilesForRewrite();
    if (s3keys.length === 0) return;

    // create a custom resource to find and replace tokenized strings in static files
    // must happen after deployment when tokens can be resolved
    // compile function
    const inputPath = path.resolve(__dirname, '../assets/lambda/S3StaticEnvRewriter.ts');
    const outputPath = path.join(this.props.nextBuild.tempBuildDir, 'deployment-scripts', 'S3StaticEnvRewriter.cjs');
    const handlerDir = bundleFunction({
      inputPath,
      outputPath,
      bundleOptions: {
        bundle: true,
        sourcemap: true,
        external: ['aws-sdk'],
        target: 'node16',
        platform: 'node',
        format: 'cjs',
      },
    });

    const rewriteFn = new lambda.Function(this, 'RewriteOnEventHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      memorySize: 1024,
      timeout: Duration.minutes(5),
      handler: 'S3StaticEnvRewriter.handler',
      code: lambda.Code.fromAsset(handlerDir),
      initialPolicy: [
        new iam.PolicyStatement({
          actions: ['s3:GetObject', 's3:PutObject'],
          resources: [this.bucket.arnForObjects('*')],
        }),
      ],
    });

    // custom resource to run the rewriter after files are copied and we can resolve token values
    const provider = new cr.Provider(this, 'RewriteStaticProvider', {
      onEventHandler: rewriteFn,
    });
    const replacements = this._getS3ContentReplaceValues();
    return new CustomResource(this, 'RewriteStatic', {
      serviceToken: provider.serviceToken,
      properties: {
        bucket: this.bucket.bucketName,
        s3keys,
        replacements,
      },
    });
  }

  private _getStaticFilesForRewrite() {
    const staticDir = this.staticTempDir;
    const s3keys: string[] = [];
    if (!fs.existsSync(staticDir)) {
      return [];
    }
    listDirectory(staticDir).forEach((file) => {
      const relativePath = path.relative(staticDir, file);

      // skip bogus system files
      if (relativePath.endsWith('.DS_Store')) return;

      // is this file a glob match?
      if (!micromatch.isMatch(relativePath, replaceTokenGlobs, { dot: true })) {
        return;
      }
      s3keys.push(relativePath);
    });
    return s3keys;
  }

  /*
  private createLambdaCodeReplacer(name: string, asset: s3Assets.Asset): CustomResource {
    // Note: Source code for the Lambda functions have "{{! ENV_KEY !}}" in them.
    //       They need to be replaced with real values before the Lambda
    //       functions get deployed.

    const providerId = 'LambdaCodeReplacerProvider';
    const resId = `${name}LambdaCodeReplacer`;
    const stack = Stack.of(this);
    let provider = stack.node.tryFindChild(providerId) as lambda.Function;

    // Create provider if not already created
    if (!provider) {
      provider = new lambda.Function(stack, providerId, {
        code: lambda.Code.fromAsset(path.join(__dirname, '../assets/NextjsSite/custom-resource')),
        layers: [this.awsCliLayer],
        runtime: lambda.Runtime.PYTHON_3_7,
        handler: 'lambda-code-updater.handler',
        timeout: Duration.minutes(15),
        memorySize: 1024,
      });
    }

    // Allow provider to perform search/replace on the asset
    provider.role?.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:*'],
        resources: [`arn:aws:s3:::${asset.s3BucketName}/${asset.s3ObjectKey}`],
      })
    );

    // Create custom resource
    const resource = new CustomResource(this, resId, {
      serviceToken: provider.functionArn,
      resourceType: 'Custom::SSTLambdaCodeUpdater',
      properties: {
        Source: {
          BucketName: asset.s3BucketName,
          ObjectKey: asset.s3ObjectKey,
        },
        ReplaceValues: this._getLambdaContentReplaceValues(),
      },
    });

    return resource;
  }*/

  private createAssetBucket(): s3.Bucket {
    const { bucket } = this.props;

    // cdk.bucket is an imported construct
    if (bucket && isCDKConstruct(bucket)) {
      return bucket as s3.Bucket;
    }
    // cdk.bucket is a prop
    else {
      const bucketProps = bucket as s3.BucketProps;
      return new s3.Bucket(this, 'S3Bucket', {
        publicReadAccess: true,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
        ...bucketProps,
      });
    }
  }

  // inline env vars for client code
  private _getS3ContentReplaceValues(): Record<string, string> {
    const replacements: Record<string, string> = {};

    Object.entries(this.props.environment || {})
      .filter(([, value]) => Token.isUnresolved(value))
      .filter(([key]) => key.startsWith('NEXT_PUBLIC_')) // don't replace server-only env vars
      .forEach(([key, value]) => {
        const token = makeTokenPlaceholder(key);
        replacements[token] = value.toString();
      });

    return replacements;
  }
}

// taken from https://github.com/serverless-stack/sst/blob/8d377e941467ced81d8cc31ee67d5a06550f04d4/packages/resources/src/Construct.ts
const JSII_RTTI_SYMBOL_1 = Symbol.for('jsii.rtti');
function isCDKConstruct(construct: any): construct is Construct {
  const fqn = construct?.constructor?.[JSII_RTTI_SYMBOL_1]?.fqn;
  return typeof fqn === 'string' && (fqn.startsWith('@aws-cdk/') || fqn.startsWith('aws-cdk-lib'));
}

export function listDirectory(dir: string) {
  const fileList: string[] = [];
  const publicFiles = fs.readdirSync(dir);
  for (const filename of publicFiles) {
    const filepath = path.join(dir, filename);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      fileList.push(...listDirectory(filepath));
    } else {
      fileList.push(filepath);
    }
  }

  return fileList;
}
