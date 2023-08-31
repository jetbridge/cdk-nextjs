/* eslint-disable prettier/prettier */
import * as fs from 'node:fs';
import * as os from 'os';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { BaseSiteDomainProps, NextjsBaseProps } from './NextjsBase';
import { NextjsBuild } from './NextjsBuild';
import { NextjsDistribution, NextjsDistributionProps } from './NextjsDistribution';
import { NextjsImage } from './NextjsImage';
import { NextjsInvalidation } from './NextjsInvalidation';
import { NextjsRevalidation } from './NextjsRevalidation';
import { NextjsServer } from './NextjsServer';
import { NextjsStaticAssets, NextjsStaticAssetsProps } from './NextjsStaticAssets';

// contains server-side resolved environment vars in config bucket
export const CONFIG_ENV_JSON_PATH = 'next-env.json';

export interface NextjsDomainProps extends BaseSiteDomainProps {}

/**
 * Defaults for created resources.
 * Why `any`? see https://github.com/aws/jsii/issues/2901
 */
export interface NextjsDefaultsProps {
  /**
   * Override static file deployment settings.
   */
  readonly assetDeployment?: NextjsStaticAssetsProps | any;

  /**
   * Override server lambda function settings.
   */
  readonly lambda?: FunctionOptions;

  /**
   * Override CloudFront distribution settings.
   *
   * These properties should all be optional but cannot be due to a limitation in jsii.
   */
  readonly distribution?: NextjsDistributionProps | any;
}

export interface NextjsProps extends NextjsBaseProps {
  /**
   * Optional S3 Bucket to use, defaults to assets bucket
   */
  readonly imageOptimizationBucket?: s3.IBucket;
  /**
   * Allows you to override defaults for the resources created by this
   * construct.
   */
  readonly defaults?: NextjsDefaultsProps;
  /**
   * Skips running Next.js build. Useful if you want to deploy `Nextjs` but
   * haven't made any changes to Next.js app code.
   * @default false
   */
  readonly skipBuild?: boolean;
}

/**
 * The `Nextjs` construct is a higher level construct that makes it easy to create a NextJS app.
 *
 * Your standalone server application will be bundled using o(utput tracing and will be deployed to a Lambda function.
 * Static assets will be deployed to an S3 bucket and served via CloudFront.
 * You must use Next.js 10.3.0 or newer.
 *
 * Please provide a `nextjsPath` to the Next.js app inside your project.
 *
 * @example
 * new Nextjs(this, "Web", {
 *   nextjsPath: path.resolve("packages/web"),
 * })
 */
export class Nextjs extends Construct {
  /**
   * The main NextJS server handler lambda function.
   */
  public serverFunction: NextjsServer;

  /**
   * The image optimization handler lambda function.
   */
  public imageOptimizationFunction: NextjsImage;

  /**
   * Built NextJS project output.
   */
  public nextBuild: NextjsBuild;

  /**
   * Asset deployment to S3.
   */
  public staticAssets: NextjsStaticAssets;

  /**
   * CloudFront distribution.
   */
  public distribution: NextjsDistribution;

  /**
   * Where build-time assets for deployment are stored.
   */
  public get tempBuildDir(): string {
    return this.props.tempBuildDir
    ? path.resolve(
        path.join(this.props.tempBuildDir, `nextjs-cdk-build-${this.node.id}-${this.node.addr.substring(0, 4)}`)
      )
    : fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-cdk-build-'))
  }

  /**
   * Revalidation handler and queue.
   */
  public revalidation: NextjsRevalidation;

  public lambdaFunctionUrl!: lambda.FunctionUrl;
  public imageOptimizationLambdaFunctionUrl!: lambda.FunctionUrl;

  constructor(scope: Construct, id: string, protected props: NextjsProps) {
    super(scope, id);

    if (!props.quiet && !props.skipBuild) {
      console.debug('┌ Building Next.js app ▼ ...');
    }

    // build nextjs app
    this.nextBuild = new NextjsBuild(this, id, { ...props, tempBuildDir: this.tempBuildDir });

    // deploy nextjs static assets to s3
    this.staticAssets = new NextjsStaticAssets(this, 'StaticAssets', {
      bucket: props.defaults?.assetDeployment.bucket,
      nextBuild: this.nextBuild,
    });

    this.serverFunction = new NextjsServer(this, 'Server', {
      ...props,
      tempBuildDir: this.tempBuildDir,
      nextBuild: this.nextBuild,
      lambda: props.defaults?.lambda,
      staticAssetBucket: this.staticAssets.bucket,
    });
    // build image optimization
    this.imageOptimizationFunction = new NextjsImage(this, 'ImgOptFn', {
      ...props,
      nextBuild: this.nextBuild,
      bucket: props.imageOptimizationBucket || this.bucket,
      lambdaOptions: props.defaults?.lambda,
    });

    // build revalidation queue and handler function
    this.revalidation = new NextjsRevalidation(this, 'Revalidation', {
      ...props,
      nextBuild: this.nextBuild,
      serverFunction: this.serverFunction,
    });

    this.distribution = new NextjsDistribution(this, 'Distribution', {
      ...props,
      ...props.defaults?.distribution,
      staticAssetsBucket: this.staticAssets.bucket,
      tempBuildDir: this.tempBuildDir,
      nextBuild: this.nextBuild,
      serverFunction: this.serverFunction.lambdaFunction,
      imageOptFunction: this.imageOptimizationFunction,
    });

    if (!this.props.skipFullInvalidation) {
      new NextjsInvalidation(this, 'Invalidation', {
        distributionId: this.distribution.distributionId,
        dependencies: [], // [this.staticAssets, this.serverFunction, this.imageOptimizationFunction]
      })
    }

    if (!props.quiet && !props.skipBuild) {
      console.debug('└ Finished preparing NextJS app for deployment');
    }
  }

  /**
   * URL of Next.js App.
   */
  public get url(): string {
    const customDomain = this.distribution.customDomainName;
    return customDomain ? `https://${customDomain}` : this.distribution.url;
  }

  /**
   * Convenience method to access `Nextjs.staticAssets.bucket`.
   */
  public get bucket(): s3.IBucket {
    return this.staticAssets.bucket;
  }
}
