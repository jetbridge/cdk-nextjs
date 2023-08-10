/* eslint-disable prettier/prettier */
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { NextjsBaseProps } from './NextjsBase';
import type { NextjsBuild } from './NextjsBuild';
import { getCommonNodejsFunctionProps } from './utils/common-lambda-props';

export interface NextjsImageProps extends NextjsBaseProps {
  /**
   * The S3 bucket holding application images.
   */
  readonly bucket: IBucket;
  /**
   * Override function properties.
   */
  readonly lambdaOptions?: NodejsFunctionProps;
  /**
   * The `NextjsBuild` instance representing the built Nextjs application.
   */
  readonly nextBuild: NextjsBuild;
}

/**
 * This lambda handles image optimization.
 */
export class NextjsImage extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NextjsImageProps) {
    const { lambdaOptions, bucket } = props;

    super(scope, id, {
      ...getCommonNodejsFunctionProps(scope),
      entry: props.nextBuild.nextImageFnDir,
      handler: 'index.handler',
      description: 'Next.js Image Optimization Function',
      ...lambdaOptions,
      environment: {
        BUCKET_NAME: bucket.bucketName,
        ...lambdaOptions?.environment,
      },
    });

    bucket.grantRead(this);
  }
}
