import { Code, Function as LambdaFunction, FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import type { NextjsBuild } from './NextjsBuild';
import { OptionalFunctionProps } from './optional-cdk-props/OptionalFunctionProps';
import { getCommonFunctionProps } from './utils/common-lambda-props';

export interface NextjsImageOverrides {
  readonly functionProps?: OptionalFunctionProps;
}

export interface NextjsImageProps {
  /**
   * The S3 bucket holding application images.
   */
  readonly bucket: IBucket;
  /**
   * Override function properties.
   */
  readonly lambdaOptions?: FunctionOptions;
  /**
   * @see {@link NextjsBuild}
   */
  readonly nextBuild: NextjsBuild;
  /**
   * Overrides
   */
  readonly overrides?: NextjsImageOverrides;
}

/**
 * This lambda handles image optimization.
 */
export class NextjsImage extends LambdaFunction {
  constructor(scope: Construct, id: string, props: NextjsImageProps) {
    const { lambdaOptions, bucket } = props;

    const commonFnProps = getCommonFunctionProps(scope);
    super(scope, id, {
      ...commonFnProps,
      code: Code.fromAsset(props.nextBuild.nextImageFnDir),
      handler: 'index.handler',
      description: 'Next.js Image Optimization Function',
      ...lambdaOptions,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        ...lambdaOptions?.environment,
      },
      ...props.overrides?.functionProps,
    });

    bucket.grantRead(this);
  }
}
