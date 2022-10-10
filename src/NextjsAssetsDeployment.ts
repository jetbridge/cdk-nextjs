import * as path from 'path';
import { CustomResource, RemovalPolicy, Token } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import * as fs from 'fs-extra';
import * as micromatch from 'micromatch';
import { NextjsBaseProps } from './NextjsBase';
import { createArchive, NextjsBuild, replaceTokenGlobs } from './NextjsBuild';

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

  protected props: NextjsAssetsDeploymentProps;

  constructor(scope: Construct, id: string, props: NextjsAssetsDeploymentProps) {
    super(scope, id);

    this.props = props;
    this.bucket = this.createAssetBucket();

    this.deployments = this.uploadS3Assets();
  }

  private uploadS3Assets() {
    const deployments: BucketDeployment[] = [];

    // path to public folder; root static assets
    const staticDir = this.props.nextBuild.nextStaticDir;
    let publicDir = this.props.isPlaceholder
      ? path.resolve(__dirname, '../assets/placeholder-site')
      : this.props.nextBuild.nextPublicDir;

    // static dir
    if (!this.props.isPlaceholder && fs.existsSync(staticDir)) {
      // upload static assets
      deployments.push(
        new BucketDeployment(this, 'StaticAssetsDeployment', {
          destinationBucket: this.bucket,
          destinationKeyPrefix: '_next/static',
          sources: [Source.asset(staticDir)],
          distribution: this.props.distribution, // invalidate Cloudfront distribution caches
          prune: this.props.prune,
        })
      );
    }

    // public dir
    if (fs.existsSync(publicDir)) {
      // zip up assets
      const zipFilePath = createArchive({
        directory: publicDir,
        zipFileName: 'public.zip',
        fileGlob: '*',
        zipOutDir: this.props.nextBuild.tempBuildDir,
      });

      // upload public files to root of S3 bucket
      deployments.push(
        new BucketDeployment(this, 'PublicFilesDeployment', {
          destinationBucket: this.bucket,
          destinationKeyPrefix: this.props.isPlaceholder ? '/placeholder' : '/',
          sources: [Source.asset(zipFilePath)],
          distribution: this.props.distribution,
          prune: this.props.prune,
        })
      );
    }

    // do rewrites of unresolved CDK tokens in static files
    const rewriter = this.createRewriteResource();
    rewriter?.node.addDependency(...deployments);

    return deployments;
  }

  private createRewriteResource() {
    const s3keys = this._getStaticFilesForRewrite();
    if (s3keys.length === 0) return;

    // create a custom resource to find and replace tokenized strings in static files
    // must happen after deployment when tokens can be resolved
    const rewriteFn = new lambda.Function(this, 'RewriteOnEventHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      memorySize: 1024,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
      const AWS = require('aws-sdk');

      // search and replace tokenized values of designated objects in s3
      exports.handler = async (event) => {
        const requestType = event.RequestType;
        if (requestType === 'Create' || requestType === 'Update') {
          // rewrite static files
          const s3 = new AWS.S3();
          const { s3keys, bucket, replacements } = event.ResourceProperties;
          if (!s3keys || !bucket || !replacements) {
            console.error("Missing required properties")
            return
          }
          const promises = s3keys.map(async (key) => {
            const params = { Bucket: bucket, Key: key };
            // console.info('Rewriting', key, 'in bucket', bucket);
            const data = await s3.getObject(params).promise();
            const bodyPre = data.Body.toString('utf-8');
            let bodyPost = bodyPre;

            // do replacements of tokens
            Object.entries(replacements).forEach(([key, value]) => {
              bodyPost = bodyPost.replace(key, value);
            });

            // didn't change?
            if (bodyPost === bodyPre)
              return;

            // upload
            console.info('Rewrote', key, 'in bucket', bucket);
            const putParams = {
              ...params,
              Body: bodyPost,
              ContentType: data.ContentType,
              ContentEncoding: data.ContentEncoding,
              CacheControl: data.CacheControl,
            }
            await s3.putObject(putParams).promise();
          });
          await Promise.all(promises);
        }

        return event;
      };
      `),
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
    const s3keys: string[] = [];

    // where to find static files
    const searchDirs = [
      { dir: this.props.nextBuild.nextStaticDir, prefix: '_next/static' },
      { dir: this.props.nextBuild.nextPublicDir, prefix: '' },
    ];

    // traverse static dirs
    searchDirs.forEach(({ dir, prefix }) => {
      if (!fs.existsSync(dir)) {
        return;
      }
      listDirectory(dir).forEach((file) => {
        const relativePath = path.relative(dir, file);

        // skip bogus system files
        if (relativePath.endsWith('.DS_Store')) return;

        // is this file a glob match?
        if (!micromatch.isMatch(relativePath, replaceTokenGlobs, { dot: true })) {
          return;
        }
        s3keys.push(`${prefix}/${relativePath}`);
      });
    });
    return s3keys;
  }

  /*
  private createLambdaCodeReplacer(name: string, asset: s3Assets.Asset): CustomResource {
    // Note: Source code for the Lambda functions have "{{ ENV_KEY }}" in them.
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
      .forEach(([key, value]) => {
        const token = `{{ ${key} }}`;
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
