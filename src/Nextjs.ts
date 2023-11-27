import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { NextjsBuild } from './NextjsBuild';
import { NextjsDistribution, NextjsDistributionProps } from './NextjsDistribution';
import { NextjsDomain, NextjsDomainProps } from './NextjsDomain';
import { NextjsImage } from './NextjsImage';
import { NextjsInvalidation } from './NextjsInvalidation';
import { NextjsRevalidation } from './NextjsRevalidation';
import { NextjsServer } from './NextjsServer';
import { NextjsStaticAssets, NextjsStaticAssetsProps } from './NextjsStaticAssets';

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

export interface NextjsProps {
  /**
   * Optional value to prefix the Next.js site under a /prefix path on CloudFront.
   * Usually used when you deploy multiple Next.js sites on same domain using /sub-path
   *
   * Note, you'll need to set [basePath](https://nextjs.org/docs/app/api-reference/next-config-js/basePath)
   * in your `next.config.ts` to this value and ensure any files in `public`
   * folder have correct prefix.
   * @example "/my-base-path"
   */
  readonly basePath?: string;
  /**
   * Optional value used to install NextJS node dependencies.
   * @default 'npx --yes open-next@^2 build'
   */
  readonly buildCommand?: string;
  /**
   * The directory to execute `npm run build` from. By default, it is `nextjsPath`.
   * Can be overridden, particularly useful for monorepos where `build` is expected to run
   * at the root of the project.
   */
  readonly buildPath?: string;
  /**
   * Allows you to override defaults for the resources created by this
   * construct.
   */
  readonly defaults?: NextjsDefaultsProps;
  /**
   * Optional CloudFront Distribution created outside of this construct that will
   * be used to add Next.js behaviors and origins onto. Useful with `basePath`.
   */
  readonly distribution?: Distribution;
  /**
   * Props to configure {@link NextjsDomain}. See details on how to customize at
   * {@link NextjsDomainProps}
   */
  readonly domainProps?: NextjsDomainProps;
  /**
   * Custom environment variables to pass to the NextJS build **and** runtime.
   */
  readonly environment?: Record<string, string>;
  /**
   * Optional S3 Bucket to use, defaults to assets bucket
   */
  readonly imageOptimizationBucket?: s3.IBucket;
  /**
   * Relative path to the directory where the NextJS project is located.
   * Can be the root of your project (`.`) or a subdirectory (`packages/web`).
   */
  readonly nextjsPath: string;
  /**
   * Less build output.
   */
  readonly quiet?: boolean;
  /**
   * Skips running Next.js build. Useful if you want to deploy `Nextjs` but
   * haven't made any changes to Next.js app code.
   * @default false
   */
  readonly skipBuild?: boolean;
  /**
   * By default all CloudFront cache will be invalidated on deployment.
   * This can be set to true to skip the full cache invalidation, which
   * could be important for some users.
   */
  readonly skipFullInvalidation?: boolean;
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
   * Optional Route53 Hosted Zone, ACM Certificate, and Route53 DNS Records
   */
  public domain?: NextjsDomain;
  /**
   * CloudFront distribution.
   */
  public distribution: NextjsDistribution;
  /**
   * Revalidation handler and queue.
   */
  public revalidation: NextjsRevalidation;

  public lambdaFunctionUrl!: lambda.FunctionUrl;
  public imageOptimizationLambdaFunctionUrl!: lambda.FunctionUrl;

  constructor(scope: Construct, id: string, protected props: NextjsProps) {
    super(scope, id);

    // build nextjs app
    this.nextBuild = new NextjsBuild(this, id, props);

    // deploy nextjs static assets to s3
    this.staticAssets = new NextjsStaticAssets(this, 'StaticAssets', {
      basePath: props.basePath,
      bucket: props.defaults?.assetDeployment?.bucket,
      environment: props.environment,
      nextBuild: this.nextBuild,
    });

    this.serverFunction = new NextjsServer(this, 'Server', {
      nextBuild: this.nextBuild,
      lambda: props.defaults?.lambda,
      staticAssetBucket: this.staticAssets.bucket,
    });
    // build image optimization
    this.imageOptimizationFunction = new NextjsImage(this, 'ImgOptFn', {
      bucket: props.imageOptimizationBucket || this.bucket,
      lambdaOptions: props.defaults?.lambda,
      nextBuild: this.nextBuild,
    });

    // build revalidation queue and handler function
    this.revalidation = new NextjsRevalidation(this, 'Revalidation', {
      lambdaOptions: props.defaults?.lambda,
      nextBuild: this.nextBuild,
      serverFunction: this.serverFunction,
    });

    if (this.props.domainProps) {
      this.domain = new NextjsDomain(this, 'Domain', this.props.domainProps);
    }
    this.distribution = new NextjsDistribution(this, 'Distribution', {
      nextjsPath: props.nextjsPath,
      basePath: props.basePath,
      distribution: props.distribution,
      ...props.defaults?.distribution,
      staticAssetsBucket: this.staticAssets.bucket,
      nextBuild: this.nextBuild,
      nextDomain: this.domain,
      serverFunction: this.serverFunction.lambdaFunction,
      imageOptFunction: this.imageOptimizationFunction,
    });
    if (this.domain) {
      this.domain.createDnsRecords(this.distribution.distribution);
    }

    if (!this.props.skipFullInvalidation) {
      new NextjsInvalidation(this, 'Invalidation', {
        distribution: this.distribution.distribution,
        dependencies: [], // [this.staticAssets, this.serverFunction, this.imageOptimizationFunction]
      });
    }
  }

  /**
   * URL of Next.js App.
   */
  public get url(): string {
    const customDomain = this.props.domainProps?.domainName;
    return customDomain ? `https://${customDomain}` : this.distribution.url;
  }

  /**
   * Convenience method to access `Nextjs.staticAssets.bucket`.
   */
  public get bucket(): s3.IBucket {
    return this.staticAssets.bucket;
  }
}
