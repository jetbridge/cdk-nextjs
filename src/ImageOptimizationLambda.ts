import * as fs from 'fs';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { NextjsBaseProps } from './NextjsBase';
import type { NextjsBuild } from './NextjsBuild';
import { NextjsLayer } from './NextjsLayer';

export type RemotePattern = {
  protocol: string;
  hostname: string;
  port?: string;
  pathname?: string;
};

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
   * NextjsLayer - sharp runtime
   */
  readonly nextLayer: NextjsLayer;
  /**
   * The `NextjsBuild` instance representing the built Nextjs application.
   */
  readonly nextBuild: NextjsBuild;
}

const RUNTIME = lambda.Runtime.NODEJS_18_X;

/**
 * This lambda handles image optimization.
 */
export class ImageOptimizationLambda extends NodejsFunction {
  bucket: IBucket;

  constructor(scope: Construct, id: string, props: ImageOptimizationProps) {
    const { lambdaOptions, bucket } = props;
    const lambdaPath = path.resolve(__dirname, '../assets/lambda');
    const imageOptHandlerPath = path.resolve(lambdaPath, 'ImageOptimization.ts');

    /**
     * NOTE: This needs to be configured before calling super(), otherwise the build
     * will fail about missing modules.
     * Creates a symlink from the user's nextjs node_modules/next =>
     * assets/lambda/node_modules/next.
     * When NextjsFunction executes, it will use esbuild to bundle the required modules
     * in `imageOptimization.ts` to minimize the function size.
     */
    const source = path.join(props.nextBuild.nextDir, 'node_modules/next');
    const modules = path.join(lambdaPath, 'node_modules');
    const target = path.join(modules, 'next');
    if (!fs.existsSync(modules)) fs.mkdirSync(modules);
    if (!fs.existsSync(target)) fs.symlinkSync(source, target, 'dir');

    super(scope, id, {
      entry: imageOptHandlerPath,
      runtime: RUNTIME,
      bundling: {
        minify: true,
        target: 'node18',
        externalModules: ['@aws-sdk/client-s3'],
      },
      layers: [props.nextLayer],
      ...lambdaOptions,
      // defaults
      memorySize: lambdaOptions?.memorySize || 1024,
      timeout: lambdaOptions?.timeout ?? Duration.seconds(10),
      environment: {
        ...lambdaOptions?.environment,
        S3_SOURCE_BUCKET: bucket.bucketName,
      },
    });

    this.bucket = bucket;
    this.loadNextNextConfig(props.nextBuild.imagesManifestPath).catch((err) => {
      console.error('Error: ', { err });
    });
    this.addPolicy();
  }

  private async loadNextNextConfig(p: string) {
    const nextConfig = await import(p);
    this.addEnvironment('NEXT_IMAGE_CONFIG', JSON.stringify(nextConfig.images));
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
