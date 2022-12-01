import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Function, FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IBucket } from 'aws-cdk-lib/aws-s3';

import { Construct } from 'constructs';
import { NextjsBaseProps } from './NextjsBase';
import { NextjsLayer } from './NextjsLayer';
export interface ImageOptimizationProps extends NextjsBaseProps {
  /**
   * The internal S3 bucket for application images.
   */
  readonly bucket: IBucket;

  /**
   * Override function properties.
   */
  readonly lambdaOptions?: FunctionOptions;

  /**
   * NextjsLayer
   */
  readonly nextLayer: NextjsLayer;
}

const RUNTIME = lambda.Runtime.NODEJS_16_X;

/**
 * This lambda handles image optimization.
 */
export class ImageOptimizationLambda extends Construct {
  bucket: IBucket;
  lambdaFunction: Function;

  constructor(scope: Construct, id: string, props: ImageOptimizationProps) {
    super(scope, id);
    const { lambdaOptions, bucket } = props;
    this.bucket = bucket;

    const imageOptHandlerPath = path.resolve(__dirname, '../assets/lambda/ImageOptimization.ts');
    this.lambdaFunction = new NodejsFunction(this, 'ImageOptimizationHandler', {
      entry: imageOptHandlerPath,
      runtime: RUNTIME,
      bundling: {
        minify: true,
        target: 'node16',
      },
      layers: [props.nextLayer],
      ...lambdaOptions,
      // defaults
      memorySize: lambdaOptions?.memorySize || 1024,
      timeout: lambdaOptions?.timeout ?? Duration.seconds(10),
      environment: {
        ...lambdaOptions?.environment,
        S3_SOURCE_BUCKET: this.bucket.bucketName,
      },
    });

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

    this.lambdaFunction.role?.attachInlinePolicy(
      new Policy(this, 'get-image-policy', {
        statements: [policyStatement],
      })
    );
  }
}
