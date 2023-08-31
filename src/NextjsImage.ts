/* eslint-disable prettier/prettier */
import { LogLevel, NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
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

    const nodejsFnProps = getCommonNodejsFunctionProps(scope);
    super(scope, id, {
      ...nodejsFnProps,
      bundling: {
        ...nodejsFnProps.bundling,
        logLevel: LogLevel.SILENT // silence error on use of `eval` in node_module
      },
      entry: props.nextBuild.nextImageFnPath,
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
