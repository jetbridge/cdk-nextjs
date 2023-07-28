/* eslint-disable prettier/prettier */
import * as os from 'os';
import * as path from 'path';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as fs from 'fs-extra';
import { ImageOptimizationLambda } from './ImageOptimizationLambda';
import { NextJsAssetsDeployment, NextjsAssetsDeploymentProps } from './NextjsAssetsDeployment';
import { BaseSiteDomainProps, NextjsBaseProps } from './NextjsBase';
import { NextjsBuild } from './NextjsBuild';
import { NextjsDistribution, NextjsDistributionProps } from './NextjsDistribution';
import { NextJsLambda } from './NextjsLambda';
import { NextjsRevaluation } from './NextjsRevaluation';

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
  readonly assetDeployment?: NextjsAssetsDeploymentProps | any;

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
  public serverFunction: NextJsLambda;

  /**
   * The image optimization handler lambda function.
   */
  public imageOptimizationFunction: ImageOptimizationLambda;

  /**
   * Built NextJS project output.
   */
  public nextBuild: NextjsBuild;

  /**
   * Asset deployment to S3.
   */
  public assetsDeployment: NextJsAssetsDeployment;

  /**
   * CloudFront distribution.
   */
  public distribution: NextjsDistribution;

  /**
   * Where build-time assets for deployment are stored.
   */
  public tempBuildDir: string;

  /**
   * Revalidation handler and queue.
   */
  public revalidation: NextjsRevaluation;

  public configBucket?: s3.Bucket;
  public lambdaFunctionUrl!: lambda.FunctionUrl;
  public imageOptimizationLambdaFunctionUrl!: lambda.FunctionUrl;

  protected staticAssetBucket: s3.IBucket;

  constructor(scope: Construct, id: string, protected props: NextjsProps) {
    super(scope, id);

    if (!props.quiet) console.debug('┌ Building Next.js app ▼ ...');

    // get dir to store temp build files in
    const tempBuildDir = props.tempBuildDir
      ? path.resolve(
        path.join(props.tempBuildDir, `nextjs-cdk-build-${this.node.id}-${this.node.addr.substring(0, 4)}`)
      )
      : fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-cdk-build-'));

    this.tempBuildDir = tempBuildDir;

    // create static asset bucket
    this.staticAssetBucket =
      props.defaults?.assetDeployment?.bucket ??
      new s3.Bucket(this, 'Bucket', {
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      });

    // build nextjs app
    this.nextBuild = new NextjsBuild(this, id, { ...props, tempBuildDir });
    this.serverFunction = new NextJsLambda(this, 'Fn', {
      ...props,
      tempBuildDir,
      nextBuild: this.nextBuild,
      lambda: props.defaults?.lambda,
      cacheBucket: this.staticAssetBucket,
    });
    // build image optimization
    this.imageOptimizationFunction = new ImageOptimizationLambda(this, 'ImgOptFn', {
      ...props,
      nextBuild: this.nextBuild,
      bucket: props.imageOptimizationBucket || this.bucket,
      lambdaOptions: props.defaults?.lambda,
    });

    // deploy nextjs static assets to s3
    this.assetsDeployment = new NextJsAssetsDeployment(this, 'AssetDeployment', {
      ...props,
      ...props.defaults?.assetDeployment,
      tempBuildDir,
      nextBuild: this.nextBuild,
      bucket: this.staticAssetBucket,
    });
    // finish static deployment BEFORE deploying new function code
    // as there is some time after the new static files are uploaded but before they are rewritten
    const rewriter = this.assetsDeployment.rewriter?.rewriteNode;
    if (rewriter) {
      this.serverFunction.lambdaFunction.node.addDependency(rewriter);
    } else {
      this.serverFunction.lambdaFunction.node.addDependency(...this.assetsDeployment.deployments);
    }

    this.revalidation = new NextjsRevaluation(this, 'Revaluation', {
      ...props,
      nextBuild: this.nextBuild,
      serverFunction: this.serverFunction,
    });

    this.distribution = new NextjsDistribution(this, 'Distribution', {
      ...props,
      ...props.defaults?.distribution,
      staticAssetsBucket: this.assetsDeployment.bucket,
      tempBuildDir,
      nextBuild: this.nextBuild,
      serverFunction: this.serverFunction.lambdaFunction,
      imageOptFunction: this.imageOptimizationFunction,
    });

    if (!props.quiet) console.debug('└ Finished preparing NextJS app for deployment');
  }

  public get url(): string {
    const customDomain = this.distribution.customDomainName;
    return customDomain ? `https://${customDomain}` : this.distribution.url;
  }

  public get bucket(): s3.IBucket {
    return this.staticAssetBucket;
  }
}
