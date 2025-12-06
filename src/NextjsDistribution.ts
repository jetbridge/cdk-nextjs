import * as fs from 'node:fs';
import * as path from 'path';
import { Duration, Fn, RemovalPolicy } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import {
  AddBehaviorOptions,
  BehaviorOptions,
  CachePolicyProps,
  Distribution,
  ResponseHeadersPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { HttpOriginProps } from 'aws-cdk-lib/aws-cloudfront-origins';
import { PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Runtime, InvokeMode } from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { NEXTJS_BUILD_DIR, NEXTJS_STATIC_DIR } from './constants';
import {
  OptionalCloudFrontFunctionProps,
  OptionalDistributionProps,
  OptionalEdgeFunctionProps,
  OptionalS3OriginProps,
} from './generated-structs';
import { NextjsProps } from './Nextjs';
import { NextjsBuild } from './NextjsBuild';
import { NextjsDomain } from './NextjsDomain';

export interface ViewerRequestFunctionProps extends OptionalCloudFrontFunctionProps {
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

export interface NextjsDistributionDefaults {
  /**
   * Prevent the creation of a default response headers policy for static requests.
   * Has no effect if a `staticBehaviorOptions.responseHeadersPolicy` is provided in {@link NextjsDistributionProps.overrides}
   * @default false
   */
  readonly staticResponseHeadersPolicy?: boolean;
  /**
   * Prevent the creation of a default cache policy for server requests.
   * Has no effect if a `serverBehaviorOptions.cachePolicy` is provided in {@link NextjsDistributionProps.overrides}
   * @default false
   */
  readonly serverCachePolicy?: boolean;
  /**
   * Prevent the creation of a default response headers policy for server requests.
   * Has no effect if a `serverBehaviorOptions.responseHeadersPolicy` is provided in {@link NextjsDistributionProps.overrides}
   * @default false
   */
  readonly serverResponseHeadersPolicy?: boolean;
  /**
   * Prevent the creation of a default cache policy for image requests.
   * Has no effect if a `imageBehaviorOptions.cachePolicy` is provided in {@link NextjsDistributionProps.overrides}
   * @default false
   */
  readonly imageCachePolicy?: boolean;
  /**
   * Prevent the creation of a default response headers policy for image requests.
   * Has no effect if a `imageBehaviorOptions.responseHeadersPolicy` is provided in {@link NextjsDistributionProps.overrides}
   * @default false
   */
  readonly imageResponseHeadersPolicy?: boolean;
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
  readonly basePath?: NextjsProps['basePath'];
  /**
   * @see {@link NextjsProps.distribution}
   */
  readonly distribution?: NextjsProps['distribution'];
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
  readonly nextjsPath: NextjsProps['nextjsPath'];
  /**
   * Override props for every construct.
   */
  readonly overrides?: NextjsDistributionOverrides;
  /**
   * Lambda function to route all non-static requests to.
   * Must be provided if you want to serve dynamic requests.
   */
  readonly serverFunction: lambda.IFunction;
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
   * Supress the creation of default policies if
   * none are provided by you
   */
  readonly supressDefaults?: NextjsDistributionDefaults;
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

  private commonBehaviorOptions: Pick<cloudfront.BehaviorOptions, 'viewerProtocolPolicy' | 'compress'> = {
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    compress: true,
  };

  /**
   * Common security headers applied by default to all origins
   * @see https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-response-headers-policies.html#managed-response-headers-policies-security
   */
  private commonSecurityHeadersBehavior: cloudfront.ResponseSecurityHeadersBehavior = {
    contentTypeOptions: { override: false },
    frameOptions: { frameOption: cloudfront.HeadersFrameOption.SAMEORIGIN, override: false },
    referrerPolicy: {
      override: false,
      referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
    },
    strictTransportSecurity: {
      accessControlMaxAge: Duration.days(365),
      includeSubdomains: true,
      override: false,
      preload: true,
    },
    xssProtection: { override: false, protection: true, modeBlock: true },
  };

  private s3Origin: origins.S3Origin;

  private staticBehaviorOptions: cloudfront.BehaviorOptions;

  private edgeLambdas: cloudfront.EdgeLambda[] = [];

  private serverBehaviorOptions: cloudfront.BehaviorOptions;

  private imageBehaviorOptions: cloudfront.BehaviorOptions;

  constructor(scope: Construct, id: string, props: NextjsDistributionProps) {
    super(scope, id);

    this.props = props;

    // Create Behaviors
    this.s3Origin = new origins.S3Origin(this.props.staticAssetsBucket, this.props.overrides?.s3OriginProps);
    this.staticBehaviorOptions = this.createStaticBehaviorOptions();
    if (this.isFnUrlIamAuth) {
      this.edgeLambdas.push(this.createEdgeLambda());
    }
    this.serverBehaviorOptions = this.createServerBehaviorOptions();
    this.imageBehaviorOptions = this.createImageBehaviorOptions();

    // Create CloudFront Distribution
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
    return this.props.functionUrlAuthType === lambda.FunctionUrlAuthType.AWS_IAM;
  }

  private createStaticBehaviorOptions(): BehaviorOptions {
    const staticBehaviorOptions = this.props.overrides?.staticBehaviorOptions;

    let responseHeadersPolicy = staticBehaviorOptions?.responseHeadersPolicy;

    if (!responseHeadersPolicy && !this.props.supressDefaults?.staticResponseHeadersPolicy) {
      // create default response headers policy if not provided
      responseHeadersPolicy = new ResponseHeadersPolicy(this, 'StaticResponseHeadersPolicy', {
        // add default header for static assets
        customHeadersBehavior: {
          customHeaders: [
            {
              header: 'cache-control',
              override: false,
              // MDN Cache-Control Use Case: Caching static assets with "cache busting"
              // @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#caching_static_assets_with_cache_busting
              value: `no-cache, no-store, must-revalidate, max-age=0`,
            },
          ],
        },
        securityHeadersBehavior: this.commonSecurityHeadersBehavior,
        comment: 'Nextjs Static Response Headers Policy',
        ...this.props.overrides?.staticResponseHeadersPolicyProps,
      });
    }

    return {
      ...this.commonBehaviorOptions,
      origin: this.s3Origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      responseHeadersPolicy,
      ...staticBehaviorOptions,
    };
  }

  private get fnUrlAuthType(): lambda.FunctionUrlAuthType {
    return this.props.functionUrlAuthType || lambda.FunctionUrlAuthType.NONE;
  }

  /**
   * Once CloudFront OAC is released, remove this to reduce latency.
   */
  private createEdgeLambda(): cloudfront.EdgeLambda {
    const signFnUrlDir = path.resolve(__dirname, '..', 'assets', 'lambdas', 'sign-fn-url');
    const originRequestEdgeFn = new cloudfront.experimental.EdgeFunction(this, 'EdgeFn', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(signFnUrlDir),
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.DESTROY, // destroy old versions
        retryAttempts: 1, // async retry attempts
      },
      ...this.props.overrides?.edgeFunctionProps,
    });
    originRequestEdgeFn.currentVersion.grantInvoke(new ServicePrincipal('edgelambda.amazonaws.com'));
    originRequestEdgeFn.currentVersion.grantInvoke(new ServicePrincipal('lambda.amazonaws.com'));
    originRequestEdgeFn.addToRolePolicy(
      new PolicyStatement({
        actions: ['lambda:InvokeFunctionUrl', 'lambda:InvokeFunction'],
        resources: [this.props.serverFunction.functionArn, this.props.imageOptFunction.functionArn],
      })
    );
    const originRequestEdgeFnVersion = lambda.Version.fromVersionArn(
      this,
      'Version',
      originRequestEdgeFn.currentVersion.functionArn
    );
    return {
      eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
      functionVersion: originRequestEdgeFnVersion,
      includeBody: true,
    };
  }

  private createServerBehaviorOptions(): cloudfront.BehaviorOptions {
    const fnUrl = this.props.serverFunction.addFunctionUrl({
      authType: this.fnUrlAuthType,
      invokeMode: this.props.streaming ? InvokeMode.RESPONSE_STREAM : InvokeMode.BUFFERED,
    });
    const origin = new origins.HttpOrigin(Fn.parseDomainName(fnUrl.url), this.props.overrides?.serverHttpOriginProps);
    const serverBehaviorOptions = this.props.overrides?.serverBehaviorOptions;

    let cachePolicy = serverBehaviorOptions?.cachePolicy;

    if (!cachePolicy && !this.props.supressDefaults?.serverCachePolicy) {
      // create default cache policy if not provided
      cachePolicy = new cloudfront.CachePolicy(this, 'ServerCachePolicy', {
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
        headerBehavior: cloudfront.CacheHeaderBehavior.allowList('x-open-next-cache-key'),
        cookieBehavior: cloudfront.CacheCookieBehavior.all(),
        defaultTtl: Duration.seconds(0),
        maxTtl: Duration.days(365),
        minTtl: Duration.seconds(0),
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true,
        comment: 'Nextjs Server Cache Policy',
        ...this.props.overrides?.serverCachePolicyProps,
      });
    }

    let responseHeadersPolicy = serverBehaviorOptions?.responseHeadersPolicy;

    // create default response headers policy if not provided
    if (!responseHeadersPolicy && !this.props.supressDefaults?.serverResponseHeadersPolicy) {
      responseHeadersPolicy = new ResponseHeadersPolicy(this, 'ServerResponseHeadersPolicy', {
        customHeadersBehavior: {
          customHeaders: [
            {
              header: 'cache-control',
              override: false,
              // MDN Cache-Control Use Case: Up-to-date contents always
              // @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#up-to-date_contents_always
              value: 'no-cache',
            },
          ],
        },
        securityHeadersBehavior: this.commonSecurityHeadersBehavior,
        comment: 'Nextjs Server Response Headers Policy',
        ...this.props.overrides?.serverResponseHeadersPolicyProps,
      });
    }

    return {
      ...this.commonBehaviorOptions,
      origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      edgeLambdas: this.edgeLambdas.length ? this.edgeLambdas : undefined,
      functionAssociations: this.createCloudFrontFnAssociations(),
      cachePolicy,
      responseHeadersPolicy,
      ...serverBehaviorOptions,
    };
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
  private createCloudFrontFnAssociations() {
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
      this.useCloudFrontFunctionHostHeader()
    );
    code = code.replace(
      /^\s*\/\/\s*INJECT_CLOUDFRONT_FUNCTION_CACHE_HEADER_KEY.*$/im,
      this.useCloudFrontFunctionCacheHeaderKey()
    );
    const cloudFrontFn = new cloudfront.Function(this, 'CloudFrontFn', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      ...this.props.overrides?.viewerRequestFunctionProps,
      // Override code last to get injections
      code: cloudfront.FunctionCode.fromInline(code),
    });
    return [{ eventType: cloudfront.FunctionEventType.VIEWER_REQUEST, function: cloudFrontFn }];
  }

  private createImageBehaviorOptions(): cloudfront.BehaviorOptions {
    const imageOptFnUrl = this.props.imageOptFunction.addFunctionUrl({ authType: this.fnUrlAuthType });
    const origin = new origins.HttpOrigin(
      Fn.parseDomainName(imageOptFnUrl.url),
      this.props.overrides?.imageHttpOriginProps
    );

    const imageBehaviorOptions = this.props.overrides?.imageBehaviorOptions;

    let cachePolicy = imageBehaviorOptions?.cachePolicy;

    if (!cachePolicy && !this.props.supressDefaults?.imageCachePolicy) {
      // add default cache policy if not provided
      cachePolicy = new cloudfront.CachePolicy(this, 'ImageCachePolicy', {
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
        headerBehavior: cloudfront.CacheHeaderBehavior.allowList('accept'),
        cookieBehavior: cloudfront.CacheCookieBehavior.none(),
        defaultTtl: Duration.days(1),
        maxTtl: Duration.days(365),
        minTtl: Duration.days(0),
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true,
        comment: 'Nextjs Image Cache Policy',
        ...this.props.overrides?.imageCachePolicyProps,
      });
    }

    let responseHeadersPolicy = imageBehaviorOptions?.responseHeadersPolicy;

    if (!responseHeadersPolicy && !this.props.supressDefaults?.imageResponseHeadersPolicy) {
      // add default response headers policy if not provided
      responseHeadersPolicy = new ResponseHeadersPolicy(this, 'ImageResponseHeadersPolicy', {
        customHeadersBehavior: {
          customHeaders: [
            {
              header: 'cache-control',
              override: false,
              // MDN Cache-Control Use Case: Up-to-date contents always
              // @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#up-to-date_contents_always
              value: 'no-cache',
            },
          ],
        },
        securityHeadersBehavior: this.commonSecurityHeadersBehavior,
        comment: 'Nextjs Image Response Headers Policy',
        ...this.props.overrides?.imageResponseHeadersPolicyProps,
      });
    }

    return {
      ...this.commonBehaviorOptions,
      origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      edgeLambdas: this.edgeLambdas,
      cachePolicy,
      responseHeadersPolicy,
      ...imageBehaviorOptions,
    };
  }

  /**
   * Creates or uses user specified CloudFront Distribution adding behaviors
   * needed for Next.js.
   */
  private getCloudFrontDistribution(): cloudfront.Distribution {
    let distribution: cloudfront.Distribution;
    if (this.props.distribution) {
      distribution = this.props.distribution;
    } else {
      distribution = this.createCloudFrontDistribution();
    }

    distribution.addBehavior(
      this.getPathPattern('api/*'),
      this.serverBehaviorOptions.origin,
      this.serverBehaviorOptions
    );
    distribution.addBehavior(
      this.getPathPattern('_next/data/*'),
      this.serverBehaviorOptions.origin,
      this.serverBehaviorOptions
    );
    distribution.addBehavior(
      this.getPathPattern('_next/image*'),
      this.imageBehaviorOptions.origin,
      this.imageBehaviorOptions
    );

    return distribution;
  }

  /**
   * Creates default CloudFront Distribution. Note, this construct will not
   * create a CloudFront Distribution if one is passed in by user.
   */
  private createCloudFrontDistribution() {
    return new cloudfront.Distribution(this, 'Distribution', {
      // defaultRootObject: "index.html",
      defaultRootObject: '',
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      domainNames: this.props.nextDomain?.domainNames,
      certificate: this.props.nextDomain?.certificate,
      // these values can NOT be overwritten by cfDistributionProps
      defaultBehavior: this.serverBehaviorOptions,
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
    const hasIndexHtml = this.props.nextBuild.readPublicFileList().includes('index.html');
    if (hasIndexHtml) return; // don't add root path behavior

    const { origin, ...options } = this.serverBehaviorOptions;

    // when basePath is set, we emulate the "default behavior" (*) for the site as `/base-path/*`
    if (this.props.basePath) {
      this.distribution.addBehavior(this.getPathPattern(''), origin, options);
      this.distribution.addBehavior(this.getPathPattern('*'), origin, options);
    } else {
      this.distribution.addBehavior(this.getPathPattern('/'), origin, options);
    }
  }

  private addStaticBehaviorsToDistribution() {
    const publicFiles = fs.readdirSync(path.join(this.props.nextjsPath, NEXTJS_BUILD_DIR, NEXTJS_STATIC_DIR), {
      withFileTypes: true,
    });
    if (publicFiles.length >= 25) {
      throw new Error(
        'Too many public/ files in Next.js build. CloudFront limits Distributions to 25 Cache Behaviors. See documented limit here: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html#limits-web-distributions'
      );
    }
    for (const publicFile of publicFiles) {
      const pathPattern = publicFile.isDirectory() ? `${publicFile.name}/*` : publicFile.name;
      if (!/^[a-zA-Z0-9_\-\.\*\$/~"'@:+?&]+$/.test(pathPattern)) {
        throw new Error(
          `Invalid CloudFront Distribution Cache Behavior Path Pattern: ${pathPattern}. Please see documentation here: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesPathPattern`
        );
      }
      const finalPathPattern = this.getPathPattern(pathPattern);
      this.distribution.addBehavior(finalPathPattern, this.s3Origin, this.staticBehaviorOptions);
    }
  }

  /**
   * Optionally prepends base path to given path pattern.
   */
  private getPathPattern(pathPattern: string) {
    if (this.props.basePath) {
      // because we already have a basePath we don't use / instead we use /base-path
      if (pathPattern === '') return this.props.basePath;
      return `${this.props.basePath}/${pathPattern}`;
    }

    return pathPattern;
  }
}
