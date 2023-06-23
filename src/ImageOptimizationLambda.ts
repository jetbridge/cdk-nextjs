/* eslint-disable prettier/prettier */
import { Duration, PhysicalName, Stack } from 'aws-cdk-lib';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Code, Function, FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { LAMBDA_RUNTIME } from './constants';
import { NextjsBaseProps } from './NextjsBase';
import type { NextjsBuild } from './NextjsBuild';

export type RemotePattern = {
  protocol: string;
  hostname: string;
  port?: string;
  pathname?: string;
};

export interface ImageOptimizationProps extends NextjsBaseProps {
  /**
   * The S3 bucket holding application images.
   */
  readonly bucket: IBucket;

  /**
   * Override function properties.
   */
  readonly lambdaOptions?: FunctionOptions;

  /**
   * The `NextjsBuild` instance representing the built Nextjs application.
   */
  readonly nextBuild: NextjsBuild;
}

/**
 * This lambda handles image optimization.
 */
export class ImageOptimizationLambda extends Function {
  bucket: IBucket;

  constructor(scope: Construct, id: string, props: ImageOptimizationProps) {
    const { lambdaOptions, bucket, isPlaceholder } = props;

    const code = isPlaceholder
      ? Code.fromInline(
        "module.exports.handler = async () => { return { statusCode: 200, body: 'SST placeholder site' } }"
      )
      : Code.fromAsset(props.nextBuild.nextImageFnDir);

    super(scope, id, {
      code,
      handler: 'index.handler',
      runtime: LAMBDA_RUNTIME,
      architecture: Architecture.ARM_64,
      // prevents "Resolution error: Cannot use resource in a cross-environment
      // fashion, the resource's physical name must be explicit set or use
      // PhysicalName.GENERATE_IF_NEEDED."
      functionName: Stack.of(scope).region !== 'us-east-1' ? PhysicalName.GENERATE_IF_NEEDED : undefined,
      ...lambdaOptions,
      // defaults
      memorySize: lambdaOptions?.memorySize || 1024,
      timeout: lambdaOptions?.timeout ?? Duration.seconds(10),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    this.bucket = bucket;
    this.addPolicy();
  }

  /**
   * Adds policy statement to give GetObject permission Image Optimization lambda.
   */
  private addPolicy(): void {
    const policyStatement = new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [this.bucket.arnForObjects('*')],
    });

    this.role?.attachInlinePolicy(
      new Policy(this, 'get-image-policy', {
        statements: [policyStatement],
      })
    );
  }
}
