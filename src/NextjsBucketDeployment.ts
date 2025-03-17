import * as path from 'node:path';
import { CustomResource, Duration, Token } from 'aws-cdk-lib';
import { Code, Function } from 'aws-cdk-lib/aws-lambda';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import { OptionalCustomResourceProps, OptionalFunctionProps } from './generated-structs';
import { getCommonFunctionProps } from './utils/common-lambda-props';

export interface NextjsBucketDeploymentOverrides {
  readonly functionProps?: OptionalFunctionProps;
  readonly customResourceProps?: OptionalCustomResourceProps;
}

export interface NextjsBucketDeploymentProps {
  /**
   * Source `Asset`
   */
  readonly asset: Asset;
  /**
   * Enable verbose output of Custom Resource Lambda
   * @default false
   */
  readonly debug?: boolean | undefined;
  /**
   * If `true`, then delete old objects in `destinationBucket`/`destinationKeyPrefix`
   * **after** uploading new objects. Only applies if `zip` is `false`.
   *
   * Old objects are determined by listing objects
   * in bucket before creating new objects and finding the objects that aren't in
   * the new objects.
   *
   * Note, if this is set to true then clients who have old HTML files (browser tabs opened before deployment)
   * will reference JS, CSS files that do not exist in S3 reslting in 404s.
   * @default false
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
   * Destination S3 Bucket
   */
  readonly destinationBucket: IBucket;
  /**
   * Destination S3 Bucket Key Prefix
   */
  readonly destinationKeyPrefix?: string | undefined;
  /**
   * Override props for every construct.
   */
  readonly overrides?: NextjsBucketDeploymentOverrides;
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
  /**
   * The number of files to upload in parallel.
   */
  readonly queueSize?: number | undefined;
}

/**
 * @internal
 */
export interface CustomResourceProperties {
  destinationBucketName: string;
  destinationKeyPrefix?: string;
  prune?: boolean | undefined;
  putConfig?: NextjsBucketDeploymentProps['putConfig'];
  queueSize?: number | undefined;
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
  /**
   * Creates `substitutionConfig` an object by extracting unresolved tokens.
   */
  static getSubstitutionConfig(env: Record<string, string>): Record<string, string> {
    const substitutionConfig: Record<string, string> = {};
    for (const [k, v] of Object.entries(env)) {
      if (Token.isUnresolved(v)) {
        substitutionConfig[NextjsBucketDeployment.getSubstitutionValue(k)] = v;
      }
    }
    return substitutionConfig;
  }
  /**
   * Lambda Function Provider for Custom Resource
   */
  function: Function;
  private props: NextjsBucketDeploymentProps;

  constructor(scope: Construct, id: string, props: NextjsBucketDeploymentProps) {
    super(scope, id);
    this.props = props;
    this.function = this.createFunction();
    this.createCustomResource(this.function.functionArn);
  }

  private createFunction() {
    const fn = new Function(this, 'Fn', {
      ...getCommonFunctionProps(this),
      code: Code.fromAsset(path.resolve(__dirname, '..', 'assets', 'lambdas', 'nextjs-bucket-deployment')),
      handler: 'index.handler',
      timeout: Duration.minutes(5),
      ...this.props.overrides?.functionProps,
    });
    if (this.props.debug) {
      fn.addEnvironment('DEBUG', '1');
    }
    this.props.asset.grantRead(fn);
    this.props.destinationBucket.grantReadWrite(fn);
    return fn;
  }

  private createCustomResource(serviceToken: string) {
    const properties: CustomResourceProperties = {
      sourceBucketName: this.props.asset.s3BucketName,
      sourceKeyPrefix: this.props.asset.s3ObjectKey,
      destinationBucketName: this.props.destinationBucket.bucketName,
      destinationKeyPrefix: this.props.destinationKeyPrefix,
      putConfig: this.props.putConfig,
      prune: this.props.prune ?? false,
      substitutionConfig: this.props.substitutionConfig,
      zip: this.props.zip,
      queueSize: this.props.queueSize,
    };
    return new CustomResource(this, 'CustomResource', {
      properties,
      resourceType: 'Custom::NextjsBucketDeployment',
      serviceToken,
      ...this.props.overrides?.customResourceProps,
    });
  }
}
