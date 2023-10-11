import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { Stack } from 'aws-cdk-lib';
import { Code, Function, FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import { CACHE_BUCKET_KEY_PREFIX } from './constants';
import { NextjsBaseProps } from './NextjsBase';
import { NextjsBucketDeployment } from './NextjsBucketDeployment';
import { NextjsBuild } from './NextjsBuild';
import { getCommonFunctionProps } from './utils/common-lambda-props';
import { createArchive } from './utils/create-archive';

export type EnvironmentVars = Record<string, string>;

export interface NextjsServerProps extends NextjsBaseProps {
  /**
   * Built nextJS application.
   */
  readonly nextBuild: NextjsBuild;

  /**
   * Override function properties.
   */
  readonly lambda?: FunctionOptions;

  /**
   * Static asset bucket. Function needs bucket to read from cache.
   */
  readonly staticAssetBucket: IBucket;
}

/**
 * Build a lambda function from a NextJS application to handle server-side rendering, API routes, and image optimization.
 */
export class NextjsServer extends Construct {
  configBucket?: Bucket;
  lambdaFunction: Function;

  private props: NextjsServerProps;
  private get environment(): Record<string, string> {
    return {
      ...this.props.environment,
      ...this.props.lambda?.environment,
      CACHE_BUCKET_NAME: this.props.staticAssetBucket.bucketName,
      CACHE_BUCKET_REGION: Stack.of(this.props.staticAssetBucket).region,
      CACHE_BUCKET_KEY_PREFIX,
    };
  }

  constructor(scope: Construct, id: string, props: NextjsServerProps) {
    super(scope, id);
    this.props = props;

    // must create code asset separately (typically it is implicitly created in
    //`Function` construct) b/c we need to substitute unresolve env vars
    const sourceAsset = this.createSourceCodeAsset();
    // source and destination assets are defined separately so that source
    // assets are immutable (easier debugging). Technically we could overwrite
    // source asset
    const destinationAsset = this.createDestinationCodeAsset();
    const bucketDeployment = this.createBucketDeployment(sourceAsset, destinationAsset);
    this.lambdaFunction = this.createFunction(destinationAsset);
    // don't update lambda function until bucket deployment is complete
    this.lambdaFunction.node.addDependency(bucketDeployment);
  }

  private createSourceCodeAsset() {
    const archivePath = createArchive({
      directory: this.props.nextBuild.nextServerFnDir,
      quiet: this.props.quiet,
      zipFileName: 'server-fn.zip',
    });
    const asset = new Asset(this, 'SourceCodeAsset', {
      path: archivePath,
    });
    // new Asset() creates copy of zip into cdk.out/. This cleans up tmp folder
    rmSync(archivePath, { recursive: true });
    return asset;
  }

  private createDestinationCodeAsset() {
    // create dummy directory to upload with random values so it's uploaded each time
    // TODO: look into caching?
    const assetsTmpDir = mkdtempSync(resolve(tmpdir(), 'bucket-deployment-dest-asset-'));
    // this code will never run b/c we explicitly declare dependency between
    // lambda function and bucket deployment.
    writeFileSync(resolve(assetsTmpDir, 'index.mjs'), `export function handler() { return '${randomUUID()}' }`);
    const destinationAsset = new Asset(this, 'DestinationCodeAsset', {
      path: assetsTmpDir,
    });
    rmSync(assetsTmpDir, { recursive: true });
    return destinationAsset;
  }

  private createBucketDeployment(sourceAsset: Asset, destinationAsset: Asset) {
    const bucketDeployment = new NextjsBucketDeployment(this, 'BucketDeployment', {
      asset: sourceAsset,
      debug: true,
      destinationBucket: destinationAsset.bucket,
      destinationKeyPrefix: destinationAsset.s3ObjectKey,
      prune: true,
      // this.props.environment is for build time, not this.environment which is for runtime
      substitutionConfig: NextjsBucketDeployment.getSubstitutionConfig(this.props.environment || {}),
      zip: true,
    });
    return bucketDeployment;
  }

  private createFunction(asset: Asset) {
    // until after the build time env vars in code zip asset are substituted
    const fn = new Function(this, 'Fn', {
      ...getCommonFunctionProps(this),
      code: Code.fromBucket(asset.bucket, asset.s3ObjectKey),
      handler: 'index.handler',
      description: 'Next.js server handler',
      ...this.props.lambda,
      // `environment` needs to go after `this.props.lambda` b/c if
      // `this.props.lambda.environment` is defined, it will override
      // CACHE_* environment variables which are required
      environment: { ...this.environment, ...this.props.lambda?.environment },
    });
    this.props.staticAssetBucket.grantReadWrite(fn);

    return fn;
  }
}
