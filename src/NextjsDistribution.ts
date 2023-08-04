import * as os from 'os';
import * as path from 'path';
import { dirname } from 'path';
import { App, Duration, Fn, RemovalPolicy } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { Distribution, ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Patterns from 'aws-cdk-lib/aws-route53-patterns';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as fs from 'fs-extra';
import { bundleFunction } from './BundleFunction';
import { DEFAULT_STATIC_MAX_AGE } from './constants';
import { BaseSiteDomainProps, buildErrorResponsesForRedirectToIndex, NextjsBaseProps } from './NextjsBase';
import { NextjsBuild } from './NextjsBuild';

// contains server-side resolved environment vars in config bucket
export const CONFIG_ENV_JSON_PATH = 'next-env.json';

export interface NextjsDomainProps extends BaseSiteDomainProps {}

export type NextjsDistributionCdkOverrideProps = cloudfront.DistributionProps;

export interface NextjsDistributionCdkProps {
  /**
   * Pass in a value to override the default settings this construct uses to
   * create the CloudFront `Distribution` internally.
   */
  readonly distribution?: NextjsDistributionCdkOverrideProps;
}

export interface NextjsCachePolicyProps {
  readonly staticCachePolicy?: cloudfront.ICachePolicy;
  readonly lambdaCachePolicy?: cloudfront.ICachePolicy;
  readonly imageCachePolicy?: cloudfront.ICachePolicy;

  /**
   * Cache-control max-age default for static assets (/_next/*).
   * Default: 30 days.
   */
  readonly staticClientMaxAgeDefault?: Duration;
}

export interface NextjsOriginRequestPolicyProps {
  readonly lambdaOriginRequestPolicy?: cloudfront.IOriginRequestPolicy;
  readonly fallbackOriginRequestPolicy?: cloudfront.IOriginRequestPolicy;
  readonly imageOptimizationOriginRequestPolicy?: cloudfront.IOriginRequestPolicy;
}

export interface NextjsDistributionProps extends NextjsBaseProps {
  /**
   * Bucket containing static assets.
   * Must be provided if you want to serve static files.
   */
  readonly staticAssetsBucket: s3.IBucket;

  /**
   * Lambda function to route all non-static requests to.
   * Must be provided if you want to serve dynamic requests.
   */
  readonly serverFunction: lambda.IFunction;

  /**
   * Lambda function to optimize images.
   * Must be provided if you want to serve dynamic requests.
   */
  readonly imageOptFunction: lambda.IFunction;

  /**
   * Overrides for created CDK resources.
   */
  readonly cdk?: NextjsDistributionCdkProps;

  /**
   * Built NextJS app.
   */
  readonly nextBuild: NextjsBuild;

  /**
   * Override the default CloudFront cache policies created internally.
   */
  readonly cachePolicies?: NextjsCachePolicyProps;

  /**
   * Override the default CloudFront origin request policies created internally.
   */
  readonly originRequestPolicies?: NextjsOriginRequestPolicyProps;

  /**
   * The customDomain for this website. Supports domains that are hosted
   * either on [Route 53](https://aws.amazon.com/route53/) or externally.
   *
   * Note that you can also migrate externally hosted domains to Route 53 by
   * [following this guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html).
   *
   * @example
   * new NextjsDistribution(this, "Dist", {
   *   customDomain: "domain.com",
   * });
   *
   * new NextjsDistribution(this, "Dist", {
   *   customDomain: {
   *     domainName: "domain.com",
   *     domainAlias: "www.domain.com",
   *     hostedZone: "domain.com"
   *   },
   * });
   */
  readonly customDomain?: string | NextjsDomainProps;

  /**
   * Include the name of your deployment stage if present.
   * Used to name the edge functions stack.
   * Required if using SST.
   */
  readonly stageName?: string;

  /**
   * Optional value to prefix the edge function stack
   * It defaults to "Nextjs"
   */
  readonly stackPrefix?: string;

  /**
   * Override lambda function url auth type
   * @default "NONE"
   */
  readonly functionUrlAuthType?: lambda.FunctionUrlAuthType;
}

/**
 * Create a CloudFront distribution to serve a Next.js application.
 */
export class NextjsDistribution extends Construct {
  /**
   * The default CloudFront cache policy properties for static pages.
   */
  public static staticCachePolicyProps: cloudfront.CachePolicyProps = {
    queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
    headerBehavior: cloudfront.CacheHeaderBehavior.none(),
    cookieBehavior: cloudfront.CacheCookieBehavior.none(),
    defaultTtl: Duration.days(30),
    maxTtl: Duration.days(60),
    minTtl: Duration.days(30),
    enableAcceptEncodingBrotli: true,
    enableAcceptEncodingGzip: true,
    comment: 'Nextjs Static Default Cache Policy',
  };

  /**
   * The default CloudFront cache policy properties for images.
   */
  public static imageCachePolicyProps: cloudfront.CachePolicyProps = {
    queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
    headerBehavior: cloudfront.CacheHeaderBehavior.allowList('Accept'),
    cookieBehavior: cloudfront.CacheCookieBehavior.none(),
    defaultTtl: Duration.days(1),
    maxTtl: Duration.days(365),
    minTtl: Duration.days(0),
    enableAcceptEncodingBrotli: true,
    enableAcceptEncodingGzip: true,
    comment: 'Nextjs Image Default Cache Policy',
  };

  /**
   * The default CloudFront cache policy properties for the Lambda server handler.
   */
  public static lambdaCachePolicyProps: cloudfront.CachePolicyProps = {
    queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
    headerBehavior: cloudfront.CacheHeaderBehavior.allowList('rsc', 'next-router-prefetch', 'next-router-state-tree'),
    cookieBehavior: cloudfront.CacheCookieBehavior.all(),
    defaultTtl: Duration.seconds(0),
    maxTtl: Duration.days(365),
    minTtl: Duration.seconds(0),
    enableAcceptEncodingBrotli: true,
    enableAcceptEncodingGzip: true,
    comment: 'Nextjs Lambda Default Cache Policy',
  };

  /**
   * The default CloudFront lambda origin request policy.
   */
  public static lambdaOriginRequestPolicyProps: cloudfront.OriginRequestPolicyProps = {
    cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
    queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
    headerBehavior: cloudfront.OriginRequestHeaderBehavior.all(), // can't include host
    comment: 'Nextjs Lambda Origin Request Policy',
  };

  public static fallbackOriginRequestPolicyProps: cloudfront.OriginRequestPolicyProps = {
    cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(), // pretty much disables caching - maybe can be changed
    queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
    headerBehavior: cloudfront.OriginRequestHeaderBehavior.all(),
    comment: 'Nextjs Fallback Origin Request Policy',
  };

  public static imageOptimizationOriginRequestPolicyProps: cloudfront.OriginRequestPolicyProps = {
    cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
    // NOTE: if `NextjsDistributionProps.functionUrlAuthType` is set to AWS_IAM
    // auth, then the assets/lambda@edge/LambdaOriginRequestIamAuth.ts file
    // needs to be updated to exclude these query strings/headers (below) from
    // the signature calculation. Otherwise you'll get signature mismatch error.
    queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.allowList('q', 'w', 'url'),
    headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList('accept'),
    comment: 'Nextjs Image Optimization Origin Request Policy',
  };

  protected props: NextjsDistributionProps;

  /////////////////////
  // Public Properties
  /////////////////////
  /**
   * The internally created CloudFront `Distribution` instance.
   */
  public distribution: Distribution;
  /**
   * The Route 53 hosted zone for the custom domain.
   */
  hostedZone?: route53.IHostedZone;
  /**
   * The AWS Certificate Manager certificate for the custom domain.
   */
  certificate?: acm.ICertificate;

  public tempBuildDir: string;

  constructor(scope: Construct, id: string, props: NextjsDistributionProps) {
    super(scope, id);

    // get dir to store temp build files in
    this.tempBuildDir = props.tempBuildDir
      ? path.resolve(
          path.join(props.tempBuildDir, `nextjs-cdk-build-${this.node.id}-${this.node.addr.substring(0, 4)}`)
        )
      : fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-cdk-build-'));

    // save props
    this.props = { ...props, tempBuildDir: this.tempBuildDir };

    // Create Custom Domain
    this.validateCustomDomainSettings();
    this.hostedZone = this.lookupHostedZone();
    this.certificate = this.createCertificate();

    // Create CloudFront
    this.distribution = this.props.isPlaceholder
      ? this.createCloudFrontDistributionForStub()
      : this.createCloudFrontDistribution();

    // Connect Custom Domain to CloudFront Distribution
    this.createRoute53Records();
  }

  /**
   * The CloudFront URL of the website.
   */
  public get url(): string {
    return `https://${this.distribution.distributionDomainName}`;
  }

  get customDomainName(): string | undefined {
    const { customDomain } = this.props;

    if (!customDomain) {
      return;
    }

    if (typeof customDomain === 'string') {
      return customDomain;
    }

    return customDomain.domainName;
  }

  /**
   * If the custom domain is enabled, this is the URL of the website with the
   * custom domain.
   */
  public get customDomainUrl(): string | undefined {
    const customDomainName = this.customDomainName;
    return customDomainName ? `https://${customDomainName}` : undefined;
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

  /////////////////////
  // CloudFront Distribution
  /////////////////////

  private createCloudFrontDistribution(): cloudfront.Distribution {
    const { cdk: cdkProps, cachePolicies, originRequestPolicies } = this.props;
    const cfDistributionProps = cdkProps?.distribution;

    // build domainNames
    const domainNames = this.buildDistributionDomainNames();

    // S3 origin
    const s3Origin = new origins.S3Origin(this.props.staticAssetsBucket);

    const viewerProtocolPolicy = cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS;

    // handle placeholder
    if (this.props.isPlaceholder) {
      return new cloudfront.Distribution(this, 'Distribution', {
        defaultRootObject: 'index.html',
        errorResponses: buildErrorResponsesForRedirectToIndex('index.html'),
        domainNames,
        certificate: this.certificate,
        defaultBehavior: {
          origin: s3Origin,
          viewerProtocolPolicy,
        },
      });
    }

    // cache policies
    const staticCachePolicy = cachePolicies?.staticCachePolicy ?? this.createCloudFrontStaticCachePolicy();
    const imageCachePolicy = cachePolicies?.imageCachePolicy ?? this.createCloudFrontImageCachePolicy();

    // origin request policies
    const lambdaOriginRequestPolicy =
      originRequestPolicies?.lambdaOriginRequestPolicy ?? this.createLambdaOriginRequestPolicy();

    const fnUrlAuthType: lambda.FunctionUrlAuthType = this.props.functionUrlAuthType || lambda.FunctionUrlAuthType.NONE;
    // main server function origin (lambda URL HTTP origin)
    const fnUrl = this.props.serverFunction.addFunctionUrl({ authType: fnUrlAuthType });
    const serverFunctionOrigin = new origins.HttpOrigin(Fn.parseDomainName(fnUrl.url));

    // Image Optimization
    const imageOptFnUrl = this.props.imageOptFunction.addFunctionUrl({ authType: fnUrlAuthType });
    const imageOptFunctionOrigin = new origins.HttpOrigin(Fn.parseDomainName(imageOptFnUrl.url));
    const imageOptORP =
      originRequestPolicies?.imageOptimizationOriginRequestPolicy ?? this.createImageOptimizationOriginRequestPolicy();

    // lambda behavior edge function
    const lambdaOriginRequestEdgeFn = this.buildLambdaOriginRequestEdgeFunction();
    if (this.isFnUrlIamAuth) {
      lambdaOriginRequestEdgeFn.addToRolePolicy(
        new PolicyStatement({
          actions: ['lambda:InvokeFunctionUrl'],
          resources: [this.props.serverFunction.functionArn, this.props.imageOptFunction.functionArn],
        })
      );
    }
    const lambdaOriginRequestEdgeFnVersion = lambda.Version.fromVersionArn(
      this,
      'Version',
      lambdaOriginRequestEdgeFn.currentVersion.functionArn
    );
    const lambdaOriginEdgeFns: cloudfront.EdgeLambda[] = [
      {
        eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
        functionVersion: lambdaOriginRequestEdgeFnVersion,
        includeBody: this.isFnUrlIamAuth,
      },
    ];

    // default handler for requests that don't match any other path:
    //   - try S3 bucket first
    //   - if 403, 404, or 503 fall back to Lambda handler
    // see discussion here: https://github.com/jetbridge/cdk-nextjs/pull/125#discussion_r1279212678
    const fallbackOriginGroup = new origins.OriginGroup({
      primaryOrigin: s3Origin,
      fallbackOrigin: serverFunctionOrigin,
      fallbackStatusCodes: [403, 404, 503],
    });

    const lambdaCachePolicy = cachePolicies?.lambdaCachePolicy ?? this.createCloudFrontLambdaCachePolicy();

    // requests for static objects
    const defaultStaticMaxAge = cachePolicies?.staticClientMaxAgeDefault?.toSeconds() || DEFAULT_STATIC_MAX_AGE;
    const staticResponseHeadersPolicy = new ResponseHeadersPolicy(this, 'StaticResponseHeadersPolicy', {
      // add default header for static assets
      customHeadersBehavior: {
        customHeaders: [
          {
            header: 'cache-control',
            override: false,
            // by default tell browser to cache static files for this long
            // this is separate from the origin cache policy
            value: `public,max-age=${defaultStaticMaxAge},immutable`,
          },
        ],
      },
    });
    const staticBehavior: cloudfront.BehaviorOptions = {
      viewerProtocolPolicy,
      origin: s3Origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      compress: true,
      cachePolicy: staticCachePolicy,
      responseHeadersPolicy: staticResponseHeadersPolicy,
    };

    // requests going to lambda (api, etc)
    const lambdaBehavior: cloudfront.BehaviorOptions = {
      viewerProtocolPolicy,
      origin: serverFunctionOrigin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      // cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS, // this should be configurable
      originRequestPolicy: lambdaOriginRequestPolicy,
      compress: true,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      edgeLambdas: lambdaOriginEdgeFns,
    };

    const imageBehavior: cloudfront.BehaviorOptions = {
      viewerProtocolPolicy,
      origin: imageOptFunctionOrigin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      compress: true,
      cachePolicy: imageCachePolicy,
      originRequestPolicy: imageOptORP,
      edgeLambdas: this.isFnUrlIamAuth ? lambdaOriginEdgeFns : [],
    };

    // requests to fallback origin group (default behavior)
    // used for S3 and lambda. would prefer to forward all headers to lambda but need to strip out host
    // TODO: try to do this with headers whitelist or edge lambda
    const fallbackOriginRequestPolicy =
      originRequestPolicies?.fallbackOriginRequestPolicy ?? this.createFallbackOriginRequestPolicy();

    // if we don't have a static file called index.html then we should
    // redirect to the lambda handler
    const hasIndexHtml = this.props.nextBuild.readPublicFileList().includes('index.html');

    return new cloudfront.Distribution(this, 'Distribution', {
      // defaultRootObject: "index.html",
      defaultRootObject: '',

      // Override props.
      ...cfDistributionProps,

      // these values can NOT be overwritten by cfDistributionProps
      domainNames,
      certificate: this.certificate,
      defaultBehavior: {
        origin: fallbackOriginGroup, // try S3 first, then lambda
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
        // what goes here? static or lambda?
        cachePolicy: lambdaCachePolicy,
        originRequestPolicy: fallbackOriginRequestPolicy,
        edgeLambdas: lambdaOriginEdgeFns,
      },

      additionalBehaviors: {
        // is index.html static or dynamic?
        ...(hasIndexHtml ? {} : { '/': lambdaBehavior }),

        // known dynamic routes
        'api/*': lambdaBehavior,
        '_next/data/*': lambdaBehavior,

        // dynamic images go to lambda
        '_next/image*': imageBehavior,

        // known static routes
        // it would be nice to create routes for all the static files we know of
        // but we run into the limit of CacheBehaviors per distribution
        '_next/*': staticBehavior,
      },
    });
  }

  private createCloudFrontStaticCachePolicy(): cloudfront.CachePolicy {
    return new cloudfront.CachePolicy(this, 'StaticsCache', NextjsDistribution.staticCachePolicyProps);
  }

  private createCloudFrontImageCachePolicy(): cloudfront.CachePolicy {
    return new cloudfront.CachePolicy(this, 'ImageCache', NextjsDistribution.imageCachePolicyProps);
  }

  private createLambdaOriginRequestPolicy(): cloudfront.OriginRequestPolicy {
    return new cloudfront.OriginRequestPolicy(
      this,
      'LambdaOriginPolicy',
      NextjsDistribution.lambdaOriginRequestPolicyProps
    );
  }

  private createFallbackOriginRequestPolicy(): cloudfront.OriginRequestPolicy {
    return new cloudfront.OriginRequestPolicy(
      this,
      'FallbackOriginRequestPolicy',
      NextjsDistribution.fallbackOriginRequestPolicyProps
    );
  }

  private createImageOptimizationOriginRequestPolicy(): cloudfront.OriginRequestPolicy {
    return new cloudfront.OriginRequestPolicy(
      this,
      'ImageOptPolicy',
      NextjsDistribution.imageOptimizationOriginRequestPolicyProps
    );
  }

  private createCloudFrontLambdaCachePolicy(): cloudfront.CachePolicy {
    return new cloudfront.CachePolicy(this, 'LambdaCache', NextjsDistribution.lambdaCachePolicyProps);
  }

  private createCloudFrontDistributionForStub(): cloudfront.Distribution {
    return new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      errorResponses: buildErrorResponsesForRedirectToIndex('index.html'),
      domainNames: this.buildDistributionDomainNames(),
      certificate: this.certificate,
      defaultBehavior: {
        origin: new origins.S3Origin(this.props.staticAssetsBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      ...this.props.cdk?.distribution, // not sure if needed
    });
  }

  private buildDistributionDomainNames(): string[] {
    const customDomain =
      typeof this.props.customDomain === 'string' ? this.props.customDomain : this.props.customDomain?.domainName;

    const alternateNames =
      typeof this.props.customDomain === 'string' ? [] : this.props.customDomain?.alternateNames || [];

    return customDomain ? [customDomain, ...alternateNames] : [];
  }

  /**
   * Create an edge function to handle requests to the lambda server handler origin.
   * It overrides the host header in the request to be the lambda URL's host.
   * It's needed because we forward all headers to the origin, but the origin is itself an
   *  HTTP server so it needs the host header to be the address of the lambda and not
   *  the distribution.
   *
   */
  private buildLambdaOriginRequestEdgeFunction() {
    const app = App.of(this) as App;

    // bundle the edge function
    const fileName =
      this.props.functionUrlAuthType === lambda.FunctionUrlAuthType.NONE
        ? 'LambdaOriginRequest'
        : 'LambdaOriginRequestIamAuth';
    const inputPath = path.join(__dirname, '..', 'assets', 'lambda@edge', fileName);
    const outputPath = path.join(this.tempBuildDir, 'lambda@edge', 'LambdaOriginRequest.js');
    bundleFunction({
      inputPath,
      outputPath,
      bundleOptions: {
        bundle: true,
        external: ['aws-sdk', 'url'],
        minify: true,
        target: 'node18',
        platform: 'node',
      },
    });

    const fn = new cloudfront.experimental.EdgeFunction(this, 'DefaultOriginRequestEdgeFn', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'LambdaOriginRequest.handler',
      code: lambda.Code.fromAsset(dirname(outputPath)),
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.DESTROY, // destroy old versions
        retryAttempts: 1, // async retry attempts
      },
      stackId:
        `${this.props.stackPrefix ?? 'Nextjs'}-${this.props.stageName || app.stageName || 'default'}-EdgeFn-` +
        this.node.addr.substring(0, 5),
    });
    fn.currentVersion.grantInvoke(new ServicePrincipal('edgelambda.amazonaws.com'));
    fn.currentVersion.grantInvoke(new ServicePrincipal('lambda.amazonaws.com'));

    return fn;
  }

  /////////////////////
  // Custom Domain
  /////////////////////

  protected validateCustomDomainSettings() {
    const { customDomain } = this.props;

    if (!customDomain) {
      return;
    }

    if (typeof customDomain === 'string') {
      return;
    }

    if (customDomain.isExternalDomain === true) {
      if (!customDomain.certificate) {
        throw new Error('A valid certificate is required when "isExternalDomain" is set to "true".');
      }
      if (customDomain.domainAlias) {
        throw new Error(
          'Domain alias is only supported for domains hosted on Amazon Route 53. Do not set the "customDomain.domainAlias" when "isExternalDomain" is enabled.'
        );
      }
      if (customDomain.hostedZone) {
        throw new Error(
          'Hosted zones can only be configured for domains hosted on Amazon Route 53. Do not set the "customDomain.hostedZone" when "isExternalDomain" is enabled.'
        );
      }
    }
  }

  protected lookupHostedZone(): route53.IHostedZone | undefined {
    const { customDomain } = this.props;

    // Skip if customDomain is not configured
    if (!customDomain) {
      return;
    }

    let hostedZone;

    if (typeof customDomain === 'string') {
      hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: customDomain,
      });
    } else if (typeof customDomain.hostedZone === 'string') {
      hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: customDomain.hostedZone,
      });
    } else if (customDomain.hostedZone) {
      hostedZone = customDomain.hostedZone;
    } else if (typeof customDomain.domainName === 'string') {
      // Skip if domain is not a Route53 domain
      if (customDomain.isExternalDomain === true) {
        return;
      }

      hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: customDomain.domainName,
      });
    } else {
      hostedZone = customDomain.hostedZone;
    }

    return hostedZone;
  }

  private createCertificate(): acm.ICertificate | undefined {
    const { customDomain } = this.props;

    if (!customDomain) {
      return;
    }

    let acmCertificate;

    // HostedZone is set for Route 53 domains
    if (this.hostedZone) {
      if (typeof customDomain === 'string') {
        acmCertificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
          domainName: customDomain,
          hostedZone: this.hostedZone,
          region: 'us-east-1',
        });
      } else if (customDomain.certificate) {
        acmCertificate = customDomain.certificate;
      } else {
        acmCertificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
          domainName: customDomain.domainName,
          hostedZone: this.hostedZone,
          region: 'us-east-1',
        });
      }
    }
    // HostedZone is NOT set for non-Route 53 domains
    else {
      if (typeof customDomain !== 'string') {
        acmCertificate = customDomain.certificate;
      }
    }

    return acmCertificate;
  }

  private createRoute53Records(): void {
    const { customDomain } = this.props;

    if (!customDomain || !this.hostedZone) {
      return;
    }

    let recordName;
    let domainAlias;
    if (typeof customDomain === 'string') {
      recordName = customDomain;
    } else {
      recordName = customDomain.domainName;
      domainAlias = customDomain.domainAlias;
    }

    // Create DNS record
    const recordProps = {
      recordName,
      zone: this.hostedZone,
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(this.distribution)),
    };
    new route53.ARecord(this, 'AliasRecord', recordProps);
    new route53.AaaaRecord(this, 'AliasRecordAAAA', recordProps);

    // Create Alias redirect record
    if (domainAlias) {
      new route53Patterns.HttpsRedirect(this, 'Redirect', {
        zone: this.hostedZone,
        recordNames: [domainAlias],
        targetDomain: recordName,
      });
    }
  }
}
