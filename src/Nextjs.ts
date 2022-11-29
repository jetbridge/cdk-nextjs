import * as os from 'os';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as fs from 'fs-extra';
import { NextJsAssetsDeployment, NextjsAssetsDeploymentProps } from './NextjsAssetsDeployment';
import { BaseSiteCdkDistributionProps, BaseSiteDomainProps, NextjsBaseProps } from './NextjsBase';
import { NextjsBuild } from './NextjsBuild';
import { NextjsDistribution } from './NextjsDistribution';
import { NextJsLambda } from './NextjsLambda';

// contains server-side resolved environment vars in config bucket
export const CONFIG_ENV_JSON_PATH = 'next-env.json';

export interface NextjsDomainProps extends BaseSiteDomainProps {}

/**
 * Resources that will be created automatically if not supplied.
 */
export interface NextjsCdkProps {
  /**
   * Override static file deployment settings.
   */
  readonly assetDeployment?: NextjsAssetsDeploymentProps;

  /**
   * Override server lambda function settings.
   */
  readonly lambda?: FunctionOptions;

  /**
   * Override CloudFront distribution settings.
   *
   * These properties should all be optional but cannot be due to a limitation in jsii.
   */
  readonly distribution?: BaseSiteCdkDistributionProps;
}

export interface NextjsProps extends NextjsBaseProps {
  /**
   * Allows you to override defaults for the CDK resources created by this
   * construct.
   */
  readonly cdk?: NextjsCdkProps;
}

/**
 * The `Nextjs` construct is a higher level CDK construct that makes it easy to create a NextJS app.
 *
 * Your standalone server application will be bundled using output tracing and will be deployed to a Lambda function.
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
   * Built NextJS project output.
   */
  public nextBuild: NextjsBuild;

  /**
   * Bucket containing NextJS static assets.
   */
  public bucket: s3.IBucket;

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

  public configBucket?: s3.Bucket;
  public lambdaFunctionUrl!: lambda.FunctionUrl;

  constructor(scope: Construct, id: string, props: NextjsProps) {
    super(scope, id);

    if (!props.quiet) console.debug('┌ Building Next.js app ▼ ...');

    // get dir to store temp build files in
    const tempBuildDir = props.tempBuildDir
      ? path.resolve(
          path.join(props.tempBuildDir, `nextjs-cdk-build-${this.node.id}-${this.node.addr.substring(0, 4)}`)
        )
      : fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-cdk-build-'));
    this.tempBuildDir = tempBuildDir;

    // create bucket for static assets
    this.bucket = new s3.Bucket(this, 'StaticPublicBucket', {});

    // build nextjs app
    this.nextBuild = new NextjsBuild(this, id, { ...props, tempBuildDir });
    this.serverFunction = new NextJsLambda(this, 'Fn', {
      ...props,
      tempBuildDir,
      nextBuild: this.nextBuild,
      function: props.cdk?.lambda,
    });
    // deploy nextjs static assets to s3
    this.assetsDeployment = new NextJsAssetsDeployment(this, 'AssetDeployment', {
      ...props,
      ...props.cdk?.assetDeployment,
      tempBuildDir,
      bucket: this.bucket,
      nextBuild: this.nextBuild,
    });
    // finish static deployment BEFORE deploying new function code
    // as there is some time after the new static files are uploaded but before they are rewritten
    this.assetsDeployment.node.addDependency(this.serverFunction);

    this.distribution = new NextjsDistribution(this, 'Distribution', {
      ...props,
      ...props.cdk?.distribution,
      bucket: this.bucket,
      tempBuildDir,
      nextBuild: this.nextBuild,
      serverFunction: this.serverFunction.lambdaFunction,
      distribution: props.cdk?.distribution,
    });

    if (!props.quiet) console.debug('└ Finished preparing NextJS app for deployment');
  }
}
