import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import {
  OptionalNextjsDistributionProps,
  OptionalNextjsDomainProps,
  OptionalNextjsImageProps,
  OptionalNextjsInvalidationProps,
  OptionalNextjsRevalidationProps,
  OptionalNextjsServerProps,
  OptionalNextjsStaticAssetsProps,
} from './generated-structs';
import { OptionalNextjsBuildProps } from './generated-structs/OptionalNextjsBuildProps';
import { NextjsBuild } from './NextjsBuild';
import { NextjsDistribution } from './NextjsDistribution';
import { NextjsDomain, NextjsDomainProps } from './NextjsDomain';
import { NextjsImage } from './NextjsImage';
import { NextjsInvalidation } from './NextjsInvalidation';
import { NextjsMultiServer } from './NextjsMultiServer';
import { NextjsOverrides } from './NextjsOverrides';
import { NextjsRevalidation } from './NextjsRevalidation';
import { NextjsServer } from './NextjsServer';
import { NextjsStaticAssets } from './NextjsStaticAssets';

export interface NextjsConstructOverrides {
  readonly nextjsBuildProps?: OptionalNextjsBuildProps;
  readonly nextjsStaticAssetsProps?: OptionalNextjsStaticAssetsProps;
  readonly nextjsServerProps?: OptionalNextjsServerProps;
  readonly nextjsImageProps?: OptionalNextjsImageProps;
  readonly nextjsRevalidationProps?: OptionalNextjsRevalidationProps;
  readonly nextjsDomainProps?: OptionalNextjsDomainProps;
  readonly nextjsDistributionProps?: OptionalNextjsDistributionProps;
  readonly nextjsInvalidationProps?: OptionalNextjsInvalidationProps;
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
   * Optional build command override value.
   * @default 'npx @opennextjs/aws@^3 build'
   */
  readonly buildCommand?: string;
  /**
   * The directory to execute `npm run build` from. By default, it is `nextjsPath`.
   * Can be overridden, particularly useful for monorepos where `build` is expected to run
   * at the root of the project.
   */
  readonly buildPath?: string;
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
   * Override props for every construct. Enables deep customization. Use with caution as
   * you can override all props. Recommend reviewing source code to see props
   * you'll be overriding before using.
   */
  readonly overrides?: NextjsOverrides;
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
  /**
   * Streaming allows you to send data to the client as it's generated
   * instead of waiting for the entire response to be generated.
   */
  readonly streaming?: boolean;
  /**
   * Enable multi-server mode based on open-next.output.json.
   * This will create separate Lambda functions for different API routes
   * based on the configuration in open-next.output.json.
   * @default false
   */
  readonly enableMultiServer?: boolean;
  /**
   * Enable dynamic behaviors from open-next.output.json.
   * This will automatically create CloudFront behaviors based on the
   * patterns defined in open-next.output.json.
   * Only works when enableMultiServer is true.
   * @default false
   */
  readonly enableDynamicBehaviors?: boolean;
  /**
   * Only create Lambda functions that are actually used in CloudFront behaviors.
   * This can significantly reduce costs by avoiding unused functions.
   * Only works when enableMultiServer is true.
   * @default false
   */
  readonly createOnlyUsedFunctions?: boolean;
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
   * Multi-server instance for managing multiple Lambda functions (when enabled).
   */
  public multiServer?: NextjsMultiServer;
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

  constructor(
    scope: Construct,
    id: string,
    protected props: NextjsProps
  ) {
    super(scope, id);

    // build nextjs app
    this.nextBuild = new NextjsBuild(this, 'Build', {
      nextjsPath: props.nextjsPath,
      buildCommand: props.buildCommand,
      buildPath: props.buildPath,
      environment: props.environment,
      quiet: props.quiet,
      skipBuild: props.skipBuild,
      streaming: props.streaming,
      ...props.overrides?.nextjs?.nextjsBuildProps,
    });

    // deploy nextjs static assets to s3
    this.staticAssets = new NextjsStaticAssets(this, 'StaticAssets', {
      basePath: props.basePath,
      environment: props.environment,
      nextBuild: this.nextBuild,
      overrides: props.overrides?.nextjsStaticAssets,
      ...props.overrides?.nextjs?.nextjsStaticAssetsProps,
    });

    // Create server function(s) - either single or multi-server mode
    if (props.enableMultiServer) {
      this.multiServer = new NextjsMultiServer(this, 'MultiServer', {
        environment: props.environment,
        nextBuild: this.nextBuild,
        staticAssetBucket: this.staticAssets.bucket,
        enableMultiServer: true,
        createOnlyUsedFunctions: props.createOnlyUsedFunctions,
        overrides: props.overrides?.nextjsServer,
        quiet: props.quiet,
        ...props.overrides?.nextjs?.nextjsServerProps,
      });
      // For backwards compatibility, expose the main function as serverFunction
      // Multi-server mode now uses enhanced behavior processing for better performance
      this.serverFunction = this.multiServer.lambdaFunction as any;
    } else {
      this.serverFunction = new NextjsServer(this, 'Server', {
        environment: props.environment,
        nextBuild: this.nextBuild,
        staticAssetBucket: this.staticAssets.bucket,
        overrides: props.overrides?.nextjsServer,
        ...props.overrides?.nextjs?.nextjsServerProps,
      });
    }

    // build image optimization
    this.imageOptimizationFunction = new NextjsImage(this, 'Image', {
      bucket: props.imageOptimizationBucket || this.bucket,
      nextBuild: this.nextBuild,
      overrides: props.overrides?.nextjsImage,
      ...props.overrides?.nextjs?.nextjsImageProps,
    });

    // build revalidation queue and handler function
    this.revalidation = new NextjsRevalidation(this, 'Revalidation', {
      nextBuild: this.nextBuild,
      serverFunction: this.multiServer ? undefined : this.serverFunction,
      multiServer: this.multiServer,
      overrides: props.overrides?.nextjsRevalidation,
      ...props.overrides?.nextjs?.nextjsRevalidationProps,
    });

    if (this.props.domainProps) {
      this.domain = new NextjsDomain(this, 'Domain', {
        ...this.props.domainProps,
        overrides: props.overrides?.nextjsDomain,
        ...props.overrides?.nextjs?.nextjsDomainProps,
      });
    }
    this.distribution = new NextjsDistribution(this, 'Distribution', {
      nextjsPath: props.nextjsPath,
      basePath: props.basePath,
      distribution: props.distribution,
      streaming: props.streaming,
      staticAssetsBucket: this.staticAssets.bucket,
      nextBuild: this.nextBuild,
      nextDomain: this.domain,
      serverFunction: this.multiServer ? undefined : this.serverFunction.lambdaFunction,
      multiServer: this.multiServer,
      enableDynamicBehaviors: props.enableDynamicBehaviors,
      imageOptFunction: this.imageOptimizationFunction,
      overrides: props.overrides?.nextjsDistribution,
      ...props.overrides?.nextjs?.nextjsDistributionProps,
    });
    if (this.domain) {
      this.domain.createDnsRecords(this.distribution.distribution);
    }

    if (!this.props.skipFullInvalidation) {
      new NextjsInvalidation(this, 'Invalidation', {
        distribution: this.distribution.distribution,
        dependencies: [], // [this.staticAssets, this.serverFunction, this.imageOptimizationFunction]
        overrides: props.overrides?.nextjsInvalidation,
        ...props.overrides?.nextjs?.nextjsInvalidationProps,
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
