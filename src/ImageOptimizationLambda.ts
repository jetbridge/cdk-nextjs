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
// import { config } from 'process';

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
    const lambdaPath = path.resolve(__dirname, '../assets/lambda/ImageOptimization');
    const imageOptHandlerPath = path.resolve(lambdaPath, 'index.ts');

    /**
     * NOTE: This needs to be configured before calling super(), otherwise the build
     * will fail about missing modules.
     * Creates a symlink from the user's nextjs node_modules/next =>
     * assets/lambda/node_modules/next.
     * When NextjsFunction executes, it will use esbuild to bundle the required modules
     * in `imageOptimization.ts` to minimize the function size.
     */
    const source = path.join(props.nextBuild.nextDir, 'node_modules/next');
    const modulesPath = path.join(lambdaPath, 'node_modules');
    const target = path.join(modulesPath, 'next');
    if (!fs.existsSync(modulesPath)) fs.mkdirSync(modulesPath);
    if (!fs.existsSync(target)) fs.symlinkSync(source, target, 'dir');

    super(scope, id, {
      entry: imageOptHandlerPath,
      runtime: RUNTIME,
      bundling: {
        commandHooks: {
          beforeBundling(_: string, outputDir: string): string[] {
            // Saves the required-server-files.json to the .next folder
            const filePath = path.join(props.nextBuild.nextStandaloneBuildDir, 'required-server-files.json');
            return [`mkdir -p "${outputDir}/.next"`, `cp "${filePath}" "${outputDir}/.next"`];
          },
          afterBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
        },
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
        S3_SOURCE_BUCKET: bucket.bucketName,
      },
    });

    this.bucket = bucket;
    this.addPolicy();

    fs.rmSync(modulesPath, { recursive: true, force: true });
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
