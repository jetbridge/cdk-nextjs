import { Stack, Token } from 'aws-cdk-lib';
import { Code, Function, FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import { CACHE_BUCKET_KEY_PREFIX } from './constants';
import { NextjsBaseProps } from './NextjsBase';
import { NextjsBucketDeployment } from './NextjsBucketDeployment';
import { NextjsBuild } from './NextjsBuild';
import { getCommonFunctionProps } from './utils/common-lambda-props';

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
export class NextJsLambda extends Construct {
  configBucket?: Bucket;
  lambdaFunction: Function;

  private props: NextjsServerProps;
  private get environment(): Record<string, string> {
    return {
      ...this.props.environment,
      ...this.props.lambda?.environment,
      ...(this.props.nodeEnv ? { NODE_ENV: this.props.nodeEnv } : {}),
      CACHE_BUCKET_NAME: this.props.staticAssetBucket.bucketName,
      CACHE_BUCKET_REGION: Stack.of(this.props.staticAssetBucket).region,
      CACHE_BUCKET_KEY_PREFIX,
    };
  }

  constructor(scope: Construct, id: string, props: NextjsServerProps) {
    super(scope, id);
    this.props = props;

    const asset = this.createAsset();
    const bucketDeployment = this.createBucketDeployment(asset);
    this.lambdaFunction = this.createFunction(asset);
    // don't update lambda function until buck deployment is complete
    this.lambdaFunction.node.addDependency(bucketDeployment);
  }

  private createAsset() {
    return new Asset(this, 'Asset', {
      path: this.props.nextBuild.nextServerFnDir,
    });
  }

  private createBucketDeployment(asset: Asset) {
    return new NextjsBucketDeployment(this, 'BucketDeployment', {
      asset,
      destinationBucketName: asset.s3BucketName,
      destinationKeyPrefix: asset.s3ObjectKey,
      // this.props.environment is for build time, not this.environment which is for runtime
      substitutionConfig: this.getSubstitutionConfig(this.props.environment || {}),
      zip: true,
    });
  }

  private getSubstitutionConfig(env: Record<string, string>): Record<string, string> {
    const substitutionConfig: Record<string, string> = {};
    for (const [k, v] of Object.entries(env)) {
      if (Token.isUnresolved(v)) {
        substitutionConfig[NextjsBucketDeployment.getSubstitutionValue(k)] = v;
      }
    }
    return substitutionConfig;
  }

  private createFunction(asset: Asset) {
    const fn = new Function(this, 'ServerFn', {
      ...getCommonFunctionProps(this),
      code: Code.fromBucket(asset.bucket, asset.s3ObjectKey),
      handler: 'nextjs-bucket-deployment.handler',
      ...this.props.lambda,
      // `environment` needs to go after `functionOptions` b/c if
      // `functionOptions.environment` is defined, it will override
      // CACHE_* environment variables which are required
      environment: this.environment,
    });

    this.props.staticAssetBucket.grantReadWrite(fn);

    return fn;
  }
}
