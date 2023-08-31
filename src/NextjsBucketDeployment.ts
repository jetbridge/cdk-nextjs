import * as path from 'node:path';
import { CustomResource, Duration } from 'aws-cdk-lib';
import { Code, SingletonFunction } from 'aws-cdk-lib/aws-lambda';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { getCommonFunctionProps } from './utils/common-lambda-props';

export interface NextjsBucketDeploymentProps {
  /**
   * Input `Asset`
   */
  readonly asset: Asset;
  /**
   * Enable verbose output of Custom Resource Lambda
   * @default false
   */
  readonly debug?: boolean | undefined;
  /**
   * If `true`, then delete files in `destinationBucket`/`destinationKeyPrefix`
   * before uploading new objects
   * @default true
   */
  readonly prune?: boolean | undefined;
  /**
   * Mapping of files to PUT options for `PutObjectCommand`. Keys of
   * record must be a glob pattern (uses micromatch). Values of record are options
   * for PUT command for AWS SDK JS V3. See [here](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/Interface/PutObjectRequest/)
   * for options. If a file matches multiple globs, configuration will be
   * merged. Later entries override earlier entries.
   *
   * `Bucket`, `Key`, and `Body` PUT options cannot be set.
   */
  readonly putConfig?: Record<string, Record<string, string>>;
  /**
   * Destination S3 Bucket Name
   */
  readonly destinationBucketName: string;
  /**
   * Destination S3 Bucket Key Prefix
   */
  readonly destinationKeyPrefix?: string | undefined;
  /**
   * Replace placeholders in all files in `asset`. Placeholder targets are
   * defined by keys of record. Values to replace placeholders with are defined
   * by values of record.
   */
  readonly substitutionConfig?: Record<string, string>;
  /**
   * If `true` then files will be zipped before writing to destination bucket.
   *
   * Useful for Lambda functions.
   * @default false
   */
  readonly zip?: boolean | undefined;
}

/**
 * @internal
 */
export interface CustomResourceProperties {
  destinationBucketName: string;
  destinationKeyPrefix?: string;
  prune?: boolean | undefined;
  putConfig?: NextjsBucketDeploymentProps['putConfig'];
  substitutionConfig?: NextjsBucketDeploymentProps['substitutionConfig'];
  sourceBucketName: string;
  sourceKeyPrefix?: string | undefined;
  zip?: boolean | undefined;
}

/**
 * Similar to CDK's `BucketDeployment` construct, but with a focus on replacing
 * template placeholders (i.e. environment variables) and configuring PUT
 * options like cache control.
 */
export class NextjsBucketDeployment extends Construct {
  /**
   * Formats a string as a template value so custom resource knows to replace.
   */
  static getSubstitutionValue(v: string): string {
    return `{{ ${v} }}`;
  }

  constructor(scope: Construct, id: string, props: NextjsBucketDeploymentProps) {
    super(scope, id);
    const lambdasDir = path.resolve(__dirname, '../assets/lambdas');
    // singleton means same lambda function will be invoked for each use
    const fn = new SingletonFunction(this, 'Fn', {
      ...getCommonFunctionProps(this),
      code: Code.fromAsset(lambdasDir),
      handler: 'nextjs-bucket-deployment.handler',
      uuid: '0ae27ba9-d073-4bbb-ab46-9e1ba7461e45',
      timeout: Duration.minutes(5),
    });
    if (props.debug) {
      fn.addEnvironment('DEBUG', 'true');
    }
    const provider = new Provider(this, 'Provider', {
      onEventHandler: fn,
    });
    const properties: CustomResourceProperties = {
      sourceBucketName: props.asset.s3BucketName,
      sourceKeyPrefix: props.asset.s3ObjectKey,
      destinationBucketName: props.destinationBucketName,
      destinationKeyPrefix: props.destinationKeyPrefix,
      putConfig: props.putConfig,
      prune: props.prune,
      substitutionConfig: props.substitutionConfig,
      zip: false,
    };
    new CustomResource(this, 'CustomResource', {
      resourceType: 'Custom::NextjsBucketDeployment',
      serviceToken: provider.serviceToken,
      properties,
    });
  }
}
