import { Code, FunctionOptions, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { OptionalFunctionProps } from './generated-structs';
import type { NextjsBuild } from './NextjsBuild';
import { getCommonFunctionProps } from './utils/common-lambda-props';
import { createArchive } from './utils/create-archive';

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
   * Override props for every construct.
   */
  readonly overrides?: NextjsImageOverrides;
}

/**
 * This lambda handles image optimization.
 */
export class NextjsImage extends LambdaFunction {
  constructor(scope: Construct, id: string, props: NextjsImageProps) {
    const { lambdaOptions, bucket } = props;

    const commonProps = getCommonFunctionProps(scope, 'image-optimizer');
    const { runtime, ...otherProps } = commonProps;

    // 1) Create ZIP archive from image optimization function directory to avoid symlink issues
    const archivePath = createArchive({
      directory: props.nextBuild.nextImageFnDir,
      zipFileName: 'image-fn.zip',
      quiet: true,
    });

    super(scope, id, {
      ...otherProps,
      runtime: runtime || Runtime.NODEJS_20_X, // Provide default runtime
      // 2) Use ZIP file as Lambda code
      code: Code.fromAsset(archivePath),
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
