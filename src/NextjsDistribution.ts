import * as fs from 'node:fs';
import * as path from 'path';
import { Duration, Fn, RemovalPolicy } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { BehaviorOptions, CachePolicyProps, Distribution, ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { HttpOriginProps } from 'aws-cdk-lib/aws-cloudfront-origins';
import { PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
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

export interface NextjsDistributionOverrides {
  readonly cloudFrontFunctionProps?: OptionalCloudFrontFunctionProps;
  readonly distributionProps?: OptionalDistributionProps;
  readonly edgeFunctionProps?: OptionalEdgeFunctionProps;
  readonly imageBehaviorOptions?: BehaviorOptions;
  readonly imageCachePolicyProps?: CachePolicyProps;
  readonly imageResponseHeadersPolicyProps: cloudfront.ResponseHeadersPolicyProps;
  readonly imageHttpOriginProps?: HttpOriginProps;
  readonly serverBehaviorOptions?: BehaviorOptions;
  readonly serverCachePolicyProps?: CachePolicyProps;
  readonly serverResponseHeadersPolicyProps?: cloudfront.ResponseHeadersPolicyProps;
  readonly serverHttpOriginProps?: HttpOriginProps;
  readonly staticBehaviorOptions?: BehaviorOptions;
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
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

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
    const staticBehaviorOptions = <Mutable<BehaviorOptions>>{
      ...this.commonBehaviorOptions,
      origin: this.s3Origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      ...this.props.overrides?.staticBehaviorOptions,
    };

    // add default response headers policy if not provided
    if (!staticBehaviorOptions.responseHeadersPolicy) {
      staticBehaviorOptions.responseHeadersPolicy = new ResponseHeadersPolicy(this, 'StaticResponseHeadersPolicy', {
        // add default header for static assets
        customHeadersBehavior: {
          customHeaders: [
            {
              header: 'cache-control',
              override: false,
              // MDN Cache-Control Use Case: Caching static assets with "cache busting"
              // @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#caching_static_assets_with_cache_busting
              value: `max-age=${Duration.days(365).toSeconds()}, immutable`,
            },
          ],
        },
        securityHeadersBehavior: this.commonSecurityHeadersBehavior,
        comment: 'Nextjs Static Response Headers Policy',
        ...this.props.overrides?.staticResponseHeadersPolicyProps,
      });
    }

    return <BehaviorOptions>staticBehaviorOptions;
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
      runtime: Runtime.NODEJS_20_X,
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
        actions: ['lambda:InvokeFunctionUrl'],
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
    const fnUrl = this.props.serverFunction.addFunctionUrl({ authType: this.fnUrlAuthType });
    const origin = new origins.HttpOrigin(Fn.parseDomainName(fnUrl.url), this.props.overrides?.serverHttpOriginProps);

    const serverBehaviorOptions = <Mutable<BehaviorOptions>>{
      ...this.commonBehaviorOptions,
      origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      edgeLambdas: this.edgeLambdas.length ? this.edgeLambdas : undefined,
      functionAssociations: this.createCloudFrontFnAssociations(),
      ...this.props.overrides?.serverBehaviorOptions,
    };

    // add default cache policy if not provided
    if (!serverBehaviorOptions.cachePolicy) {
      serverBehaviorOptions.cachePolicy = new cloudfront.CachePolicy(this, 'ServerCachePolicy', {
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
        headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
          'accept',
          'rsc',
          'next-router-prefetch',
          'next-router-state-tree',
          'next-url',
          'x-prerender-revalidate'
        ),
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

    // add default response headers policy if not provided
    if (!serverBehaviorOptions.responseHeadersPolicy) {
      serverBehaviorOptions.responseHeadersPolicy = new ResponseHeadersPolicy(this, 'ServerResponseHeadersPolicy', {
        customHeadersBehavior: {
          customHeaders: [
            {
              header: 'cache-control',
              override: false,
              // MDN Cache-Control Use Case: Up-to-date contents always
              // @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#up-to-date_contents_always
              value: `no-cache`,
            },
          ],
        },
        securityHeadersBehavior: this.commonSecurityHeadersBehavior,
        comment: 'Nextjs Server Response Headers Policy',
        ...this.props.overrides?.serverResponseHeadersPolicyProps,
      });
    }

    return <BehaviorOptions>serverBehaviorOptions;
  }

  /**
   * If this doesn't run, then Next.js Server's `request.url` will be Lambda Function
   * URL instead of domain
   */
  private createCloudFrontFnAssociations() {
    const cloudFrontFn = new cloudfront.Function(this, 'CloudFrontFn', {
      code: cloudfront.FunctionCode.fromInline(`
      function handler(event) {
        var request = event.request;
        request.headers["x-forwarded-host"] = request.headers.host;
        return request;
      }
      `),
    });
    return [{ eventType: cloudfront.FunctionEventType.VIEWER_REQUEST, function: cloudFrontFn }];
  }

  private createImageBehaviorOptions(): cloudfront.BehaviorOptions {
    const imageOptFnUrl = this.props.imageOptFunction.addFunctionUrl({ authType: this.fnUrlAuthType });
    const origin = new origins.HttpOrigin(
      Fn.parseDomainName(imageOptFnUrl.url),
      this.props.overrides?.imageHttpOriginProps
    );

    const imageBehaviorOptions = <Mutable<BehaviorOptions>>{
      ...this.commonBehaviorOptions,
      origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      edgeLambdas: this.edgeLambdas,
      ...this.props.overrides?.imageBehaviorOptions,
    };

    // add default cache policy if not provided
    if (!imageBehaviorOptions.cachePolicy) {
      imageBehaviorOptions.cachePolicy = new cloudfront.CachePolicy(this, 'ImageCachePolicy', {
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
        headerBehavior: cloudfront.CacheHeaderBehavior.allowList('accept'),
        cookieBehavior: cloudfront.CacheCookieBehavior.all(),
        defaultTtl: Duration.days(1),
        maxTtl: Duration.days(365),
        minTtl: Duration.days(0),
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true,
        comment: 'Nextjs Image Cache Policy',
        ...this.props.overrides?.imageCachePolicyProps,
      });
    }

    // add default response headers policy if not provided
    if (!imageBehaviorOptions.responseHeadersPolicy) {
      imageBehaviorOptions.responseHeadersPolicy = new ResponseHeadersPolicy(this, 'ImageResponseHeadersPolicy', {
        customHeadersBehavior: {
          customHeaders: [
            {
              header: 'cache-control',
              override: false,
              // MDN Cache-Control Use Case: Up-to-date contents always
              // @see: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#up-to-date_contents_always
              value: `no-cache`,
            },
          ],
        },
        securityHeadersBehavior: this.commonSecurityHeadersBehavior,
        comment: 'Nextjs Image Response Headers Policy',
        ...this.props.overrides?.imageResponseHeadersPolicyProps,
      });
    }
    return <BehaviorOptions>imageBehaviorOptions;
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
        `Too many public/ files in Next.js build. CloudFront limits Distributions to 25 Cache Behaviors. See documented limit here: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html#limits-web-distributions`
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
