import * as fs from "node:fs";
import * as path from "path";
import { Duration, Fn, RemovalPolicy } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import {
  AddBehaviorOptions,
  BehaviorOptions,
  CachePolicyProps,
  Distribution,
  ResponseHeadersPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { HttpOriginProps } from "aws-cdk-lib/aws-cloudfront-origins";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

import type { ProcessedBehaviorConfig } from "./utils/open-next-types";
import { NEXTJS_BUILD_DIR, NEXTJS_STATIC_DIR } from "./constants";
import {
  OptionalCloudFrontFunctionProps,
  OptionalDistributionProps,
  OptionalEdgeFunctionProps,
  OptionalS3OriginProps,
} from "./generated-structs";
import { NextjsProps } from "./Nextjs";
import { NextjsBuild } from "./NextjsBuild";
import { NextjsDomain } from "./NextjsDomain";
import { NextjsMultiServer } from "./NextjsMultiServer";
import {
  detectFunctionType,
  getInvokeModeForType,
} from "./utils/common-lambda-props";

export interface ViewerRequestFunctionProps
  extends OptionalCloudFrontFunctionProps {
  /**
   * Cloudfront function code that runs on VIEWER_REQUEST.
   * The following comments will be replaced with code snippets
   * so you can customize this function.
   *
   * INJECT_CLOUDFRONT_FUNCTION_HOST_HEADER: Add the required x-forwarded-host header.
   * INJECT_CLOUDFRONT_FUNCTION_CACHE_HEADER_KEY: Improves open-next cache key.
   *
   * @default
   * async function handler(event) {
   *  // INJECT_CLOUDFRONT_FUNCTION_HOST_HEADER
   *  // INJECT_CLOUDFRONT_FUNCTION_CACHE_HEADER_KEY
   * }
   */
  readonly code?: cloudfront.FunctionCode;
}
export interface NextjsDistributionOverrides {
  readonly viewerRequestFunctionProps?: ViewerRequestFunctionProps;
  readonly distributionProps?: OptionalDistributionProps;
  readonly edgeFunctionProps?: OptionalEdgeFunctionProps;
  readonly imageBehaviorOptions?: AddBehaviorOptions;
  readonly imageCachePolicyProps?: CachePolicyProps;
  readonly imageResponseHeadersPolicyProps?: cloudfront.ResponseHeadersPolicyProps;
  readonly imageHttpOriginProps?: HttpOriginProps;
  readonly serverBehaviorOptions?: AddBehaviorOptions;
  readonly serverCachePolicyProps?: CachePolicyProps;
  readonly serverResponseHeadersPolicyProps?: cloudfront.ResponseHeadersPolicyProps;
  readonly serverHttpOriginProps?: HttpOriginProps;
  readonly staticBehaviorOptions?: AddBehaviorOptions;
  readonly staticResponseHeadersPolicyProps?: cloudfront.ResponseHeadersPolicyProps;
  readonly s3OriginProps?: OptionalS3OriginProps;
}

export interface NextjsDistributionProps {
  /**
   * @see {@link NextjsProps.basePath}
   */
  readonly basePath?: NextjsProps["basePath"];
  /**
   * @see {@link NextjsProps.distribution}
   */
  readonly distribution?: NextjsProps["distribution"];
  /**
   * Override lambda function url auth type
   * @default "NONE"
   */
  readonly functionUrlAuthType?: lambda.FunctionUrlAuthType;
  /**
   * Lambda function to optimize images.
   * Must be provided if you want to serve dynamic requests.
   */
  readonly imageOptFunction: lambda.IFunction;
  /**
   * @see {@link NextjsBuild}
   */
  readonly nextBuild: NextjsBuild;
  /**
   * @see {@link NextjsDomain}
   */
  readonly nextDomain?: NextjsDomain;
  /**
   * @see {@link NextjsProps.nextjsPath}
   */
  readonly nextjsPath: NextjsProps["nextjsPath"];
  /**
   * Override props for every construct.
   */
  readonly overrides?: NextjsDistributionOverrides;
  /**
   * Lambda function to route all non-static requests to.
   * Must be provided if you want to serve dynamic requests.
   * @deprecated Use multiServer instead for dynamic routing based on open-next.output.json
   */
  readonly serverFunction?: lambda.IFunction;
  /**
   * Multi-server instance that manages multiple Lambda functions.
   * When provided, will use dynamic behaviors from open-next.output.json
   */
  readonly multiServer?: NextjsMultiServer;
  /**
   * Bucket containing static assets.
   * Must be provided if you want to serve static files.
   */
  readonly staticAssetsBucket: s3.IBucket;
  /**
   * @see {@link NextjsProps.streaming}
   */
  readonly streaming?: boolean;
  /**
   * Whether to use dynamic behaviors from open-next.output.json
   * @default false
   */
  readonly enableDynamicBehaviors?: boolean;
}

/**
 * Create a CloudFront distribution to serve a Next.js application.
 */
export class NextjsDistribution extends Construct {
  private props: NextjsDistributionProps;
  /**
   * The internally created CloudFront `Distribution` instance.
   */
  public distribution: Distribution;

  private commonBehaviorOptions: Pick<
    cloudfront.BehaviorOptions,
    "viewerProtocolPolicy" | "compress"
  > = {
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    compress: true,
  };

  private commonSecurityHeadersBehavior: cloudfront.ResponseSecurityHeadersBehavior =
    {
      contentTypeOptions: {
        override: true,
      },
      frameOptions: {
        frameOption: cloudfront.HeadersFrameOption.DENY,
        override: true,
      },
      referrerPolicy: {
        referrerPolicy:
          cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
        override: true,
      },
      strictTransportSecurity: {
        accessControlMaxAge: Duration.days(365 * 2),
        includeSubdomains: true,
        override: true,
      },
    };

  private s3Origin: origins.S3Origin;

  private staticBehaviorOptions: BehaviorOptions;

  private edgeLambdas: cloudfront.EdgeLambda[] = [];

  private serverBehaviorOptions?: cloudfront.BehaviorOptions;

  private imageBehaviorOptions: cloudfront.BehaviorOptions;

  // Maps for multi-server support
  private serverOrigins: Map<string, origins.HttpOrigin> = new Map();
  private serverBehaviorOptionsMap: Map<string, cloudfront.BehaviorOptions> =
    new Map();

  // Shared resources for optimization
  private sharedServerCachePolicy?: cloudfront.CachePolicy;
  private sharedServerResponseHeadersPolicy?: ResponseHeadersPolicy;
  private sharedCloudFrontFunction?: cloudfront.Function;

  constructor(scope: Construct, id: string, props: NextjsDistributionProps) {
    super(scope, id);

    this.props = props;

    // Validate configuration
    this.validateProps();

    // Initialize components in logical order
    this.initializeOrigins();
    this.initializeBehaviors();
    this.createDistribution();
  }

  /**
   * Validates required props and throws descriptive errors
   */
  private validateProps(): void {
    if (!this.props.serverFunction && !this.props.multiServer) {
      throw new Error("Either serverFunction or multiServer must be provided");
    }
  }

  /**
   * Initialize S3 origin and edge lambdas if needed
   */
  private initializeOrigins(): void {
    this.s3Origin = new origins.S3Origin(
      this.props.staticAssetsBucket,
      this.props.overrides?.s3OriginProps,
    );

    if (this.isFnUrlIamAuth) {
      this.edgeLambdas.push(this.createEdgeLambda());
    }
  }

  /**
   * Initialize all behavior options based on configuration
   */
  private initializeBehaviors(): void {
    this.staticBehaviorOptions = this.createStaticBehaviorOptions();
    this.setupServerBehaviors();
    this.imageBehaviorOptions = this.createImageBehaviorOptions();
  }

  /**
   * Setup server behaviors based on dynamic vs traditional approach
   */
  private setupServerBehaviors(): void {
    if (this.shouldUseDynamicBehaviors()) {
      this.createMultiServerBehaviors();
    } else {
      this.createSingleServerBehavior();
    }
  }

  /**
   * Determines if dynamic behaviors should be used
   */
  private shouldUseDynamicBehaviors(): boolean {
    return Boolean(this.props.multiServer && this.props.enableDynamicBehaviors);
  }

  /**
   * Creates behavior for single server function
   */
  private createSingleServerBehavior(): void {
    const serverFunction =
      this.props.serverFunction || this.props.multiServer?.lambdaFunction;

    if (serverFunction) {
      this.serverBehaviorOptions =
        this.createServerBehaviorOptions(serverFunction);
    }
  }

  /**
   * Creates and configures the CloudFront distribution
   */
  private createDistribution(): void {
    this.distribution = this.getCloudFrontDistribution();
    this.addStaticBehaviorsToDistribution();
    this.addRootPathBehavior();
  }

  /**
   * The CloudFront URL of the website.
   */
  public get url(): string {
    return `https://${this.distribution.distributionDomainName}`;
  }

  /**
   * The ID of the internally created CloudFront Distribution.
   */
  public get distributionId(): string {
    return this.distribution.distributionId;
  }

  /**
   * The domain name of the internally created CloudFront Distribution.
   */
  public get distributionDomain(): string {
    return this.distribution.distributionDomainName;
  }

  private get isFnUrlIamAuth() {
    return (
      this.props.functionUrlAuthType === lambda.FunctionUrlAuthType.AWS_IAM
    );
  }

  private createStaticBehaviorOptions(): BehaviorOptions {
    const staticBehaviorOptions = this.props.overrides?.staticBehaviorOptions;

    // Create default response headers policy if not provided
    const responseHeadersPolicy =
      staticBehaviorOptions?.responseHeadersPolicy ??
      this.createResponseHeadersPolicy(
        "StaticResponseHeadersPolicy",
        "Nextjs Static Response Headers Policy",
        [
          {
            header: "cache-control",
            value: "no-cache, no-store, must-revalidate, max-age=0",
            override: false,
          },
        ],
        this.props.overrides?.staticResponseHeadersPolicyProps,
      );

    return this.createBehaviorOptions(this.s3Origin, {
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      responseHeadersPolicy,
      overrides: staticBehaviorOptions,
    });
  }

  private get fnUrlAuthType(): lambda.FunctionUrlAuthType {
    return this.props.functionUrlAuthType || lambda.FunctionUrlAuthType.NONE;
  }

  /**
   * Once CloudFront OAC is released, remove this to reduce latency.
   */
  private createEdgeLambda(): cloudfront.EdgeLambda {
    const signFnUrlDir = path.resolve(
      __dirname,
      "..",
      "assets",
      "lambdas",
      "sign-fn-url",
    );
    const originRequestEdgeFn = new cloudfront.experimental.EdgeFunction(
      this,
      "EdgeFn",
      {
        runtime: Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset(signFnUrlDir),
        currentVersionOptions: {
          removalPolicy: RemovalPolicy.DESTROY, // destroy old versions
          retryAttempts: 1, // async retry attempts
        },
        ...this.props.overrides?.edgeFunctionProps,
      },
    );
    originRequestEdgeFn.currentVersion.grantInvoke(
      new ServicePrincipal("edgelambda.amazonaws.com"),
    );
    originRequestEdgeFn.currentVersion.grantInvoke(
      new ServicePrincipal("lambda.amazonaws.com"),
    );

    // Grant invoke permissions for all relevant functions
    const functionsToGrant: lambda.IFunction[] = [];

    if (this.props.serverFunction) {
      functionsToGrant.push(this.props.serverFunction);
    }

    if (this.props.multiServer) {
      functionsToGrant.push(this.props.multiServer.lambdaFunction);
      for (const functionName of this.props.multiServer.getServerFunctionNames()) {
        const fn = this.props.multiServer.getServerFunction(functionName);
        if (fn) {
          functionsToGrant.push(fn);
        }
      }
    }

    functionsToGrant.push(this.props.imageOptFunction);

    originRequestEdgeFn.addToRolePolicy(
      new PolicyStatement({
        actions: ["lambda:InvokeFunctionUrl"],
        resources: functionsToGrant.map((fn) => fn.functionArn),
      }),
    );
    const originRequestEdgeFnVersion = lambda.Version.fromVersionArn(
      this,
      "Version",
      originRequestEdgeFn.currentVersion.functionArn,
    );
    return {
      eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
      functionVersion: originRequestEdgeFnVersion,
      includeBody: true,
    };
  }

  private createServerBehaviorOptions(
    serverFunction: lambda.IFunction,
  ): cloudfront.BehaviorOptions {
    const origin = this.createServerOrigin(serverFunction);
    const serverBehaviorOptions = this.props.overrides?.serverBehaviorOptions;

    // Create default cache policy if not provided
    const cachePolicy =
      serverBehaviorOptions?.cachePolicy ??
      this.createCachePolicy(
        "ServerCachePolicy",
        "Nextjs Server Cache Policy",
        this.props.overrides?.serverCachePolicyProps,
      );

    // Create default response headers policy if not provided
    const responseHeadersPolicy =
      serverBehaviorOptions?.responseHeadersPolicy ??
      this.createResponseHeadersPolicy(
        "ServerResponseHeadersPolicy",
        "Nextjs Server Response Headers Policy",
        [{ header: "cache-control", value: "no-cache", override: false }],
        this.props.overrides?.serverResponseHeadersPolicyProps,
      );

    return this.createBehaviorOptions(origin, {
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      originRequestPolicy:
        cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      edgeLambdas: this.edgeLambdas.length ? this.edgeLambdas : undefined,
      functionAssociations: this.createCloudFrontFnAssociations(),
      cachePolicy,
      responseHeadersPolicy,
      overrides: serverBehaviorOptions,
    });
  }

  /**
   * Creates HTTP origin for server function
   */
  private createServerOrigin(
    serverFunction: lambda.IFunction,
  ): origins.HttpOrigin {
    // Extract function name from the function ARN or use fallback logic
    const functionName = serverFunction.functionName;
    const functionType = detectFunctionType(functionName);
    const invokeMode = getInvokeModeForType(functionType);

    const fnUrl = serverFunction.addFunctionUrl({
      authType: this.fnUrlAuthType,
      invokeMode: invokeMode,
    });

    return new origins.HttpOrigin(
      Fn.parseDomainName(fnUrl.url),
      this.props.overrides?.serverHttpOriginProps,
    );
  }

  private useCloudFrontFunctionHostHeader() {
    return `  event.request.headers["x-forwarded-host"] = event.request.headers.host;`;
  }

  private useCloudFrontFunctionCacheHeaderKey() {
    // This function is used to improve cache hit ratio by setting the cache key
    // based on the request headers and the path. `next/image` only needs the
    // accept header, and this header is not useful for the rest of the query
    return `
  const getHeader = (key) => {
    const header = event.request.headers[key];
    if (header) {
      if (header.multiValue) {
        return header.multiValue.map((header) => header.value).join(",");
      }
      if (header.value) {
        return header.value;
      }
    }
    return "";
  }

  let cacheKey = "";

  if (event.request.uri.startsWith("/_next/image")) {
    cacheKey = getHeader("accept");
  } else {
    cacheKey =
      getHeader("rsc") +
      getHeader("next-router-prefetch") +
      getHeader("next-router-state-tree") +
      getHeader("next-url") +
      getHeader("x-prerender-revalidate");
  }

  if (event.request.cookies["__prerender_bypass"]) {
    cacheKey += event.request.cookies["__prerender_bypass"]
      ? event.request.cookies["__prerender_bypass"].value
      : "";
  }
  const crypto = require("crypto");
  const hashedKey = crypto.createHash("md5").update(cacheKey).digest("hex");
  event.request.headers["x-open-next-cache-key"] = { value: hashedKey };
    `;
  }

  /**
   * If this doesn't run, then Next.js Server's `request.url` will be Lambda Function
   * URL instead of domain
   */
  private createCloudFrontFnAssociations(functionId?: string) {
    let code =
      this.props.overrides?.viewerRequestFunctionProps?.code?.render() ??
      `
async function handler(event) {
// INJECT_CLOUDFRONT_FUNCTION_HOST_HEADER
// INJECT_CLOUDFRONT_FUNCTION_CACHE_HEADER_KEY
  return event.request;
}
    `;
    code = code.replace(
      /^\s*\/\/\s*INJECT_CLOUDFRONT_FUNCTION_HOST_HEADER.*$/im,
      this.useCloudFrontFunctionHostHeader(),
    );
    code = code.replace(
      /^\s*\/\/\s*INJECT_CLOUDFRONT_FUNCTION_CACHE_HEADER_KEY.*$/im,
      this.useCloudFrontFunctionCacheHeaderKey(),
    );

    const cloudFrontFnId = functionId
      ? `CloudFrontFn-${functionId}`
      : "CloudFrontFn";
    const cloudFrontFn = new cloudfront.Function(this, cloudFrontFnId, {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      ...this.props.overrides?.viewerRequestFunctionProps,
      // Override code last to get injections
      code: cloudfront.FunctionCode.fromInline(code),
    });
    return [
      {
        eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        function: cloudFrontFn,
      },
    ];
  }

  private createImageBehaviorOptions(): cloudfront.BehaviorOptions {
    const origin = this.createImageOrigin();
    const imageBehaviorOptions = this.props.overrides?.imageBehaviorOptions;

    // Create default cache policy if not provided
    const cachePolicy =
      imageBehaviorOptions?.cachePolicy ??
      this.createCachePolicy(
        "ImageCachePolicy",
        "Nextjs Image Cache Policy",
        this.props.overrides?.imageCachePolicyProps,
        {
          headerBehavior: cloudfront.CacheHeaderBehavior.allowList("accept"),
          cookieBehavior: cloudfront.CacheCookieBehavior.none(),
          defaultTtl: Duration.days(1),
          minTtl: Duration.days(0),
        },
      );

    // Create default response headers policy if not provided
    const responseHeadersPolicy =
      imageBehaviorOptions?.responseHeadersPolicy ??
      this.createResponseHeadersPolicy(
        "ImageResponseHeadersPolicy",
        "Nextjs Image Response Headers Policy",
        [{ header: "cache-control", value: "no-cache", override: false }],
        this.props.overrides?.imageResponseHeadersPolicyProps,
      );

    return this.createBehaviorOptions(origin, {
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      originRequestPolicy:
        cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      edgeLambdas: this.edgeLambdas,
      cachePolicy,
      responseHeadersPolicy,
      overrides: imageBehaviorOptions,
    });
  }

  /**
   * Creates HTTP origin for image optimization function
   */
  private createImageOrigin(): origins.HttpOrigin {
    const imageOptFnUrl = this.props.imageOptFunction.addFunctionUrl({
      authType: this.fnUrlAuthType,
    });

    return new origins.HttpOrigin(
      Fn.parseDomainName(imageOptFnUrl.url),
      this.props.overrides?.imageHttpOriginProps,
    );
  }

  /**
   * Creates a cache policy with common settings
   */
  private createCachePolicy(
    id: string,
    comment: string,
    overrides?: CachePolicyProps,
    customConfig?: Partial<CachePolicyProps>,
  ): cloudfront.CachePolicy {
    const baseConfig: CachePolicyProps = {
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
        "x-open-next-cache-key",
      ),
      cookieBehavior: cloudfront.CacheCookieBehavior.all(),
      defaultTtl: Duration.seconds(0),
      maxTtl: Duration.days(365),
      minTtl: Duration.seconds(0),
      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true,
      comment,
      ...customConfig,
      ...overrides,
    };

    return new cloudfront.CachePolicy(this, id, baseConfig);
  }

  /**
   * Creates a response headers policy with common security headers
   */
  private createResponseHeadersPolicy(
    id: string,
    comment: string,
    customHeaders: Array<{
      header: string;
      value: string;
      override?: boolean;
    }> = [],
    overrides?: cloudfront.ResponseHeadersPolicyProps,
  ): ResponseHeadersPolicy {
    return new ResponseHeadersPolicy(this, id, {
      customHeadersBehavior: {
        customHeaders: customHeaders.map(
          ({ header, value, override = false }) => ({
            header,
            value,
            override,
          }),
        ),
      },
      securityHeadersBehavior: this.commonSecurityHeadersBehavior,
      comment,
      ...overrides,
    });
  }

  /**
   * Creates behavior options with common settings
   */
  private createBehaviorOptions(
    origin: cloudfront.IOrigin,
    options: {
      allowedMethods?: cloudfront.AllowedMethods;
      cachedMethods?: cloudfront.CachedMethods;
      cachePolicy?: cloudfront.ICachePolicy;
      responseHeadersPolicy?: cloudfront.IResponseHeadersPolicy;
      originRequestPolicy?: cloudfront.IOriginRequestPolicy;
      functionAssociations?: cloudfront.FunctionAssociation[];
      edgeLambdas?: cloudfront.EdgeLambda[];
      overrides?: AddBehaviorOptions;
    } = {},
  ): cloudfront.BehaviorOptions {
    return {
      ...this.commonBehaviorOptions,
      origin,
      allowedMethods:
        options.allowedMethods || cloudfront.AllowedMethods.ALLOW_ALL,
      cachedMethods: options.cachedMethods,
      cachePolicy: options.cachePolicy,
      responseHeadersPolicy: options.responseHeadersPolicy,
      originRequestPolicy: options.originRequestPolicy,
      functionAssociations: options.functionAssociations,
      edgeLambdas: options.edgeLambdas,
      ...options.overrides,
    };
  }

  /**
   * Creates or returns a shared cache policy for server functions
   */
  private getSharedServerCachePolicy(): cloudfront.CachePolicy {
    if (!this.sharedServerCachePolicy) {
      this.sharedServerCachePolicy = new cloudfront.CachePolicy(
        this,
        "SharedServerCachePolicy",
        {
          queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
          headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
            "x-open-next-cache-key",
          ),
          cookieBehavior: cloudfront.CacheCookieBehavior.all(),
          defaultTtl: Duration.seconds(0),
          maxTtl: Duration.days(365),
          minTtl: Duration.seconds(0),
          enableAcceptEncodingBrotli: true,
          enableAcceptEncodingGzip: true,
          comment: "Shared Nextjs Server Cache Policy",
          ...this.props.overrides?.serverCachePolicyProps,
        },
      );
    }
    return this.sharedServerCachePolicy;
  }

  /**
   * Creates or returns a shared response headers policy for server functions
   */
  private getSharedServerResponseHeadersPolicy(): ResponseHeadersPolicy {
    if (!this.sharedServerResponseHeadersPolicy) {
      this.sharedServerResponseHeadersPolicy = new ResponseHeadersPolicy(
        this,
        "SharedServerResponseHeadersPolicy",
        {
          customHeadersBehavior: {
            customHeaders: [
              {
                header: "cache-control",
                override: false,
                value: "no-cache",
              },
            ],
          },
          securityHeadersBehavior: this.commonSecurityHeadersBehavior,
          comment: "Shared Nextjs Server Response Headers Policy",
          ...this.props.overrides?.serverResponseHeadersPolicyProps,
        },
      );
    }
    return this.sharedServerResponseHeadersPolicy;
  }

  /**
   * Creates or returns a shared CloudFront function
   */
  private getSharedCloudFrontFunction(): cloudfront.Function {
    if (!this.sharedCloudFrontFunction) {
      let code =
        this.props.overrides?.viewerRequestFunctionProps?.code?.render() ??
        `
async function handler(event) {
// INJECT_CLOUDFRONT_FUNCTION_HOST_HEADER
// INJECT_CLOUDFRONT_FUNCTION_CACHE_HEADER_KEY
  return event.request;
}
    `;
      code = code.replace(
        /^\s*\/\/\s*INJECT_CLOUDFRONT_FUNCTION_HOST_HEADER.*$/im,
        this.useCloudFrontFunctionHostHeader(),
      );
      code = code.replace(
        /^\s*\/\/\s*INJECT_CLOUDFRONT_FUNCTION_CACHE_HEADER_KEY.*$/im,
        this.useCloudFrontFunctionCacheHeaderKey(),
      );

      this.sharedCloudFrontFunction = new cloudfront.Function(
        this,
        "SharedCloudFrontFn",
        {
          runtime: cloudfront.FunctionRuntime.JS_2_0,
          ...this.props.overrides?.viewerRequestFunctionProps,
          code: cloudfront.FunctionCode.fromInline(code),
        },
      );
    }
    return this.sharedCloudFrontFunction;
  }

  private createBehaviorOptionsForFunction(
    origin: origins.HttpOrigin,
    functionName: string,
  ): cloudfront.BehaviorOptions {
    const serverBehaviorOptions = this.props.overrides?.serverBehaviorOptions;

    // Use shared resources instead of creating individual ones
    const cachePolicy =
      serverBehaviorOptions?.cachePolicy ?? this.getSharedServerCachePolicy();
    const responseHeadersPolicy =
      serverBehaviorOptions?.responseHeadersPolicy ??
      this.getSharedServerResponseHeadersPolicy();

    // Use shared CloudFront function for most cases, create individual only if needed
    const functionAssociations = this.shouldUseIndividualCloudFrontFunction(
      functionName,
    )
      ? this.createCloudFrontFnAssociations(functionName)
      : [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: this.getSharedCloudFrontFunction(),
          },
        ];

    return {
      ...this.commonBehaviorOptions,
      origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      originRequestPolicy:
        cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      edgeLambdas: this.edgeLambdas.length ? this.edgeLambdas : undefined,
      functionAssociations,
      cachePolicy,
      responseHeadersPolicy,
      ...serverBehaviorOptions,
    };
  }

  /**
   * Determines if a function needs its own CloudFront function (for special cases)
   */
  private shouldUseIndividualCloudFrontFunction(functionName: string): boolean {
    // Only create individual CloudFront functions for special cases
    // For example, if the function has specific routing requirements
    return false; // Default to shared function for optimization
  }

  /**
   * Creates or uses user specified CloudFront Distribution adding behaviors
   * needed for Next.js.
   */
  private getCloudFrontDistribution(): cloudfront.Distribution {
    const distribution =
      this.props.distribution || this.createCloudFrontDistribution();

    // Add behaviors based on configuration - unified approach to avoid duplicates
    this.addBehaviorsToDistribution(distribution);

    return distribution;
  }

  /**
   * Unified method to add behaviors, resolving conflicts between dynamic and traditional approaches
   */
  private addBehaviorsToDistribution(
    distribution: cloudfront.Distribution,
  ): void {
    if (this.shouldUseDynamicBehaviors()) {
      this.addDynamicBehaviors(distribution);
    } else {
      this.addTraditionalBehaviors(distribution);
    }
  }

  /**
   * Adds behaviors based on open-next.output.json configuration
   * Enhanced with pre-processed behavior configurations
   */
  private addDynamicBehaviors(distribution: cloudfront.Distribution): void {
    const processedBehaviors = this.props.nextBuild.getProcessedBehaviors();
    const addedPatterns = new Set<string>();

    // Track function usage for optimization insights
    const usedFunctions = new Set<string>();
    const allCreatedFunctions =
      this.props.multiServer?.getServerFunctionNames() || [];

    for (const behaviorConfig of processedBehaviors) {
      // Skip wildcard pattern (handled by default behavior) and duplicates
      if (
        behaviorConfig.pattern === "*" ||
        addedPatterns.has(behaviorConfig.pattern)
      ) {
        continue;
      }

      // Track function usage
      if (
        behaviorConfig.originType === "function" &&
        behaviorConfig.functionName
      ) {
        usedFunctions.add(behaviorConfig.functionName);
      }

      const pathPattern = this.getPathPattern(behaviorConfig.pattern);
      const cloudFrontConfig =
        this.getBehaviorConfigFromProcessed(behaviorConfig);

      if (cloudFrontConfig) {
        distribution.addBehavior(
          pathPattern,
          cloudFrontConfig.origin,
          cloudFrontConfig.options,
        );
        addedPatterns.add(behaviorConfig.pattern);
      }
    }

    // Log function usage analysis for optimization insights
    this.logFunctionUsageAnalysis(usedFunctions, allCreatedFunctions);
  }

  /**
   * Logs analysis of function usage to help identify optimization opportunities
   */
  private logFunctionUsageAnalysis(
    usedFunctions: Set<string>,
    allCreatedFunctions: string[],
  ): void {
    const usedFunctionList = Array.from(usedFunctions);
    const unusedFunctions = allCreatedFunctions.filter(
      (fn) => !usedFunctions.has(fn),
    );

    console.log(`🔍 Lambda Function Usage Analysis:`);
    console.log(`  📊 Total functions created: ${allCreatedFunctions.length}`);
    console.log(
      `  ✅ Functions used in CloudFront: ${usedFunctionList.length} (${usedFunctionList.join(", ")})`,
    );

    if (unusedFunctions.length > 0) {
      console.log(
        `  ⚠️  Unused functions: ${unusedFunctions.length} (${unusedFunctions.join(", ")})`,
      );
      console.log(
        `  💡 Consider enabling 'createOnlyUsedFunctions' to reduce costs`,
      );
    } else {
      console.log(`  ✅ All functions are used - optimal configuration!`);
    }
  }

  /**
   * Enhanced method using ProcessedBehaviorConfig for direct mapping
   * Eliminates the need for pattern matching loops
   */
  private getBehaviorConfigFromProcessed(
    behaviorConfig: ProcessedBehaviorConfig,
  ): {
    origin: cloudfront.IOrigin;
    options: cloudfront.BehaviorOptions;
  } | null {
    switch (behaviorConfig.originType) {
      case "function":
        if (behaviorConfig.functionName) {
          const multiServerBehavior = this.serverBehaviorOptionsMap.get(
            behaviorConfig.functionName,
          );
          if (multiServerBehavior) {
            return {
              origin: multiServerBehavior.origin,
              options: multiServerBehavior,
            };
          }
        }
        // Fallback to default server behavior
        if (this.serverBehaviorOptions) {
          return {
            origin: this.serverBehaviorOptions.origin,
            options: this.serverBehaviorOptions,
          };
        }
        return null;

      case "imageOptimizer":
        return {
          origin: this.imageBehaviorOptions.origin,
          options: this.imageBehaviorOptions,
        };

      case "s3":
        // S3 behaviors are handled by addStaticBehaviorsToDistribution
        return null;

      default:
        // Custom origins - fallback to server if available
        if (this.serverBehaviorOptions) {
          return {
            origin: this.serverBehaviorOptions.origin,
            options: this.serverBehaviorOptions,
          };
        }
        return null;
    }
  }

  private addTraditionalBehaviors(distribution: cloudfront.Distribution) {
    if (!this.serverBehaviorOptions) {
      throw new Error("Server behavior options are not available");
    }

    distribution.addBehavior(
      this.getPathPattern("api/*"),
      this.serverBehaviorOptions.origin,
      this.serverBehaviorOptions,
    );
    distribution.addBehavior(
      this.getPathPattern("_next/data/*"),
      this.serverBehaviorOptions.origin,
      this.serverBehaviorOptions,
    );
    distribution.addBehavior(
      this.getPathPattern("_next/image*"),
      this.imageBehaviorOptions.origin,
      this.imageBehaviorOptions,
    );
  }

  /**
   * Creates default CloudFront Distribution. Note, this construct will not
   * create a CloudFront Distribution if one is passed in by user.
   */
  private createCloudFrontDistribution() {
    // Use default server behavior for the default behavior, fallback to a basic setup if not available
    const defaultBehavior = this.serverBehaviorOptions || {
      ...this.commonBehaviorOptions,
      origin: this.s3Origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    };

    return new cloudfront.Distribution(this, "Distribution", {
      // defaultRootObject: "index.html",
      defaultRootObject: "",
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      domainNames: this.props.nextDomain?.domainNames,
      certificate: this.props.nextDomain?.certificate,
      // these values can NOT be overwritten by cfDistributionProps
      defaultBehavior,
      ...this.props.overrides?.distributionProps,
    });
  }

  /**
   * this needs to be added last so that it doesn't override any other behaviors
   * when basePath is set, we emulate the "default behavior" (*) and / as `/base-path/*`
   * @private
   */
  private addRootPathBehavior() {
    // if we don't have a static file called index.html then we should
    // redirect to the lambda handler
    const hasIndexHtml = this.props.nextBuild
      .readPublicFileList()
      .includes("index.html");
    if (hasIndexHtml || !this.serverBehaviorOptions) return; // don't add root path behavior

    const { origin, ...options } = this.serverBehaviorOptions;

    // when basePath is set, we emulate the "default behavior" (*) for the site as `/base-path/*`
    if (this.props.basePath) {
      this.distribution.addBehavior(this.getPathPattern(""), origin, options);
      this.distribution.addBehavior(this.getPathPattern("*"), origin, options);
    } else {
      this.distribution.addBehavior(this.getPathPattern("/"), origin, options);
    }
  }

  private addStaticBehaviorsToDistribution() {
    const publicFiles = fs.readdirSync(
      path.join(this.props.nextjsPath, NEXTJS_BUILD_DIR, NEXTJS_STATIC_DIR),
      {
        withFileTypes: true,
      },
    );
    if (publicFiles.length >= 25) {
      throw new Error(
        "Too many public/ files in Next.js build. CloudFront limits Distributions to 25 Cache Behaviors. See documented limit here: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html#limits-web-distributions",
      );
    }
    for (const publicFile of publicFiles) {
      const pathPattern = publicFile.isDirectory()
        ? `${publicFile.name}/*`
        : publicFile.name;
      if (!/^[a-zA-Z0-9_\-\.\*\$/~"'@:+?&]+$/.test(pathPattern)) {
        throw new Error(
          `Invalid CloudFront Distribution Cache Behavior Path Pattern: ${pathPattern}. Please see documentation here: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesPathPattern`,
        );
      }
      const finalPathPattern = this.getPathPattern(pathPattern);
      this.distribution.addBehavior(
        finalPathPattern,
        this.s3Origin,
        this.staticBehaviorOptions,
      );
    }
  }

  /**
   * Optionally prepends base path to given path pattern.
   */
  private getPathPattern(pathPattern: string) {
    if (this.props.basePath) {
      // because we already have a basePath we don't use / instead we use /base-path
      if (pathPattern === "") return this.props.basePath;
      return `${this.props.basePath}/${pathPattern}`;
    }

    return pathPattern;
  }

  /**
   * Enhanced multi-server behavior creation using pre-processed data
   * No longer needs to process behaviors directly
   */
  private createMultiServerBehaviors() {
    if (!this.props.multiServer) return;

    const serverFunctions = this.props.multiServer.getServerFunctionNames();

    // Create origins and behavior options for each server function
    for (const functionName of serverFunctions) {
      const serverFunction =
        this.props.multiServer.getServerFunction(functionName);
      if (!serverFunction) continue;

      // Determine invoke mode based on function type
      const functionType = detectFunctionType(functionName);
      const invokeMode = getInvokeModeForType(functionType);

      const fnUrl = serverFunction.addFunctionUrl({
        authType: this.fnUrlAuthType,
        invokeMode: invokeMode,
      });

      const origin = new origins.HttpOrigin(
        Fn.parseDomainName(fnUrl.url),
        this.props.overrides?.serverHttpOriginProps,
      );
      this.serverOrigins.set(functionName, origin);

      // Create behavior options for this function using enhanced method
      const behaviorOptions = this.createBehaviorOptionsForFunction(
        origin,
        functionName,
      );
      this.serverBehaviorOptionsMap.set(functionName, behaviorOptions);
    }

    // Set default server behavior options for fallback
    // Use the already created behavior options for the default function
    this.serverBehaviorOptions =
      this.serverBehaviorOptionsMap.get("default") ||
      this.serverBehaviorOptionsMap.values().next().value;
  }
}
