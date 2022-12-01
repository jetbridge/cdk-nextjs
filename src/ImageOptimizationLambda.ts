import * as os from 'os';
import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Function, FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import * as s3Assets from 'aws-cdk-lib/aws-s3-assets';

import { Construct } from 'constructs';
import * as fs from 'fs-extra';
import { bundleFunction } from './BundleFunction';
import { NextjsBaseProps } from './NextjsBase';
import { createArchive, NextjsBuild } from './NextjsBuild';
import { NextjsLayer } from './NextjsLayer';
export interface ImageOptimizationProps extends NextjsBaseProps {
  /**
   * The internal S3 bucket for application images.
   */
  readonly bucket: IBucket;
  /**
   * Built nextJS application.
   */
  readonly nextBuild: NextjsBuild;

  /**
   * Override function properties.
   */
  readonly lambdaOptions?: FunctionOptions;
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
    const { nextBuild, lambdaOptions, bucket } = props;
    this.bucket = bucket;

    // build our server handler in build.nextStandaloneDir
    const serverHandler = path.resolve(__dirname, '../assets/lambda/ImageOptimization.ts');
    // server should live in the same dir as the nextjs app to access deps properly
    const serverPath = path.join(props.nextjsPath, 'server.cjs');
    bundleFunction({
      inputPath: serverHandler,
      outputPath: path.join(nextBuild.nextStandaloneDir, serverPath),
      bundleOptions: {
        bundle: true,
        minify: false,
        sourcemap: true,
        target: 'node16',
        platform: 'node',
        external: ['sharp', 'next', 'aws-sdk'],
        format: 'cjs', // hope one day we can use esm
      },
    });

    // zip up the standalone directory
    const zipOutDir = path.resolve(
      props.tempBuildDir
        ? path.resolve(path.join(props.tempBuildDir, `imageOptimization`))
        : fs.mkdtempSync(path.join(os.tmpdir(), 'imageOptimization-'))
    );
    const zipFilePath = createArchive({
      directory: nextBuild.nextStandaloneDir,
      zipFileName: 'imageOptimization.zip',
      zipOutDir,
      fileGlob: '*',
      quiet: props.quiet,
    });

    if (!zipFilePath) throw new Error('Failed to create archive for image optimization lambda function code');

    // build native deps layer
    const nextLayer = new NextjsLayer(scope, 'ImageOptimizationLayer', {});

    // upload the lambda package to S3
    const s3asset = new s3Assets.Asset(scope, 'ImageOptimizationFnAsset', { path: zipFilePath });
    const code = lambda.Code.fromBucket(s3asset.bucket, s3asset.s3ObjectKey);

    // build the lambda function
    const fn = new Function(scope, 'ImageOptimizationHandler', {
      memorySize: lambdaOptions?.memorySize || 1024,
      timeout: lambdaOptions?.timeout ?? Duration.seconds(10),
      runtime: RUNTIME,
      handler: path.join(props.nextjsPath, 'server.handler'),
      layers: [nextLayer],
      code,
      environment: {
        S3_SOURCE_BUCKET: this.bucket.bucketName,
      },
      ...lambdaOptions,
    });
    this.lambdaFunction = fn;

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
