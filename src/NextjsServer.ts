import { Stack } from 'aws-cdk-lib';
import { Code, Function, FunctionOptions, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

import { CACHE_BUCKET_KEY_PREFIX, MAX_INLINE_ZIP_SIZE } from './constants';
import { OptionalAssetProps, OptionalFunctionProps, OptionalNextjsBucketDeploymentProps } from './generated-structs';
import { NextjsProps } from './Nextjs';
import { NextjsBucketDeployment } from './NextjsBucketDeployment';
import { NextjsBuild } from './NextjsBuild';
import { getCommonFunctionProps } from './utils/common-lambda-props';
import { createArchive } from './utils/create-archive';

export interface NextjsServerOverrides {
  readonly sourceCodeAssetProps?: OptionalAssetProps;
  readonly destinationCodeAssetProps?: OptionalAssetProps;
  readonly functionProps?: OptionalFunctionProps;
  readonly nextjsBucketDeploymentProps?: OptionalNextjsBucketDeploymentProps;
}

export type EnvironmentVars = Record<string, string>;

export interface NextjsServerProps {
  /**
   * @see {@link NextjsProps.environment}
   */
  readonly environment?: NextjsProps['environment'];
  /**
   * Override function properties.
   */
  readonly lambda?: FunctionOptions;
  /**
   * @see {@link NextjsBuild}
   */
  readonly nextBuild: NextjsBuild;
  /**
   * Override props for every construct.
   */
  readonly overrides?: NextjsServerOverrides;
  /**
   * @see {@link NextjsProps.quiet}
   */
  readonly quiet?: NextjsProps['quiet'];
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

    // 1) Create local archive once
    const archivePath = createArchive({
      directory: this.props.nextBuild.nextServerFnDir,
      quiet: this.props.quiet,
      zipFileName: 'server-fn.zip',
    });

    const zipSize = fs.statSync(archivePath).size;
    const useDirect = zipSize <= MAX_INLINE_ZIP_SIZE;

    if (useDirect) {
      // Build lambda directly from local asset
      const commonProps = getCommonFunctionProps(this, 'server');
      const { runtime, ...otherProps } = commonProps;

      this.lambdaFunction = new Function(this, 'Fn', {
        ...otherProps,
        runtime: runtime || Runtime.NODEJS_20_X,
        code: Code.fromAsset(archivePath),
        handler: 'index.handler',
        description: 'Next.js Server Handler (direct asset)',
        ...this.props.lambda,
        environment: {
          ...this.environment,
          ...this.props.lambda?.environment,
        },
        ...this.props.overrides?.functionProps,
      });

      this.props.staticAssetBucket.grantReadWrite(this.lambdaFunction);

      // cleanup local archive
      rmSync(archivePath, { recursive: true });
      return;
    }

    // 2) Fallback to existing BucketDeployment path for large archives
    const sourceAsset = new Asset(this, 'SourceCodeAsset', {
      path: archivePath,
      ...this.props.overrides?.sourceCodeAssetProps,
    });

    const destinationAsset = this.createDestinationCodeAsset();
    const bucketDeployment = this.createBucketDeployment(sourceAsset, destinationAsset);

    this.lambdaFunction = this.createFunction(destinationAsset);
    this.lambdaFunction.node.addDependency(bucketDeployment);

    // cleanup local archive after asset copy
    rmSync(archivePath, { recursive: true });
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
      ...this.props.overrides?.destinationCodeAssetProps,
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
      prune: false, // not applicable b/c zip: true
      // this.props.environment is for build time, not this.environment which is for runtime
      substitutionConfig: NextjsBucketDeployment.getSubstitutionConfig(this.props.environment || {}),
      zip: true,
      ...this.props.overrides?.nextjsBucketDeploymentProps,
    });
    return bucketDeployment;
  }

  private createFunction(asset: Asset) {
    const commonProps = getCommonFunctionProps(this, 'server');
    const { runtime, ...otherProps } = commonProps;

    // until after the build time env vars in code zip asset are substituted
    const fn = new Function(this, 'Fn', {
      ...otherProps,
      runtime: runtime || Runtime.NODEJS_20_X, // Provide default runtime
      code: Code.fromBucket(asset.bucket, asset.s3ObjectKey),
      handler: 'index.handler',
      description: 'Next.js Server Handler',
      ...this.props.lambda,
      // `environment` needs to go after `this.props.lambda` b/c if
      // `this.props.lambda.environment` is defined, it will override
      // CACHE_* environment variables which are required
      environment: { ...this.environment, ...this.props.lambda?.environment },
      ...this.props.overrides?.functionProps,
    });
    this.props.staticAssetBucket.grantReadWrite(fn);

    return fn;
  }
}
