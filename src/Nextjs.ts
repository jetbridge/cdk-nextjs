import * as os from 'os';
import * as path from 'path';
import { dirname } from 'path';
import { App, Duration, Fn, RemovalPolicy } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Patterns from 'aws-cdk-lib/aws-route53-patterns';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as fs from 'fs-extra';
import { bundleFunction } from './BundleFunction';
import { NextJsAssetsDeployment, NextjsAssetsDeploymentProps } from './NextjsAssetsDeployment';
import {
  BaseSiteCdkDistributionProps,
  BaseSiteDomainProps,
  buildErrorResponsesForRedirectToIndex,
  NextjsBaseProps,
} from './NextjsBase';
import { NextjsBuild } from './NextjsBuild';
import { NextJsLambda, NextjsLambdaProps } from './NextjsLambda';

// contains server-side resolved environment vars in config bucket
export const CONFIG_ENV_JSON_PATH = 'next-env.json';

export interface NextjsDomainProps extends BaseSiteDomainProps {}
export interface NextjsCdkDistributionProps extends BaseSiteCdkDistributionProps {}

export interface NextjsCachePolicyProps {
  readonly staticCachePolicy?: cloudfront.ICachePolicy;
  readonly lambdaCachePolicy?: cloudfront.ICachePolicy;
  readonly imageCachePolicy?: cloudfront.ICachePolicy;
}

/**
 * Resources that will be created automatically if not supplied.
 */
export interface NextjsCdkProps {
  /**
   * Pass in a value to override the default settings this construct uses to
   * create the CDK `Distribution` internally.
   */
  readonly distribution?: NextjsCdkDistributionProps;

  /**
   * Override the default CloudFront cache policies created internally.
   */
  readonly cachePolicies?: NextjsCachePolicyProps;

  /**
   * Override the default CloudFront lambda origin request policy created internally
   */
  readonly lambdaOriginRequestPolicy?: cloudfront.IOriginRequestPolicy;

  /**
   * Override static file deployment settings.
   */
  readonly deployment?: NextjsAssetsDeploymentProps;

  /**
   * Override server lambda function settings.
   */
  readonly lambda?: NextjsLambdaProps;
}

export interface NextjsProps extends NextjsBaseProps {
  /**
   * Allows you to override default settings this construct uses internally to create the cloudfront distribution.
   */
  readonly cdk?: NextjsCdkProps;
  /**
   * The customDomain for this website. Supports domains that are hosted
   * either on [Route 53](https://aws.amazon.com/route53/) or externally.
   *
   * Note that you can also migrate externally hosted domains to Route 53 by
   * [following this guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html).
   *
   * @example
   * new Nextjs(this, "Web", {
   *   nextjsPath: ".",
   *   customDomain: "domain.com",
   * });
   *
   * new Nextjs(this, "Web", {
   *   nextjsPath: "packages/web", // monorepo: relative to the root of the CDK project
   *   customDomain: {
   *     domainName: "domain.com",
   *     domainAlias: "www.domain.com",
   *     hostedZone: "domain.com"
   *   },
   * });
   */
  readonly customDomain?: string | NextjsDomainProps;

  /**
   * While deploying, waits for the CloudFront cache invalidation process to finish. This ensures that the new content will be served once the deploy command finishes. However, this process can sometimes take more than 5 mins. For non-prod environments it might make sense to pass in `false`. That'll skip waiting for the cache to invalidate and speed up the deploy process.
   */
  readonly waitForInvalidation?: boolean;

  readonly stageName?: string;
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
    headerBehavior: cloudfront.CacheHeaderBehavior.none(),
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
   * The internally created CDK `Distribution` instance.
   */
  public distribution: cloudfront.Distribution;
  /**
   * The Route 53 hosted zone for the custom domain.
   */
  hostedZone?: route53.IHostedZone;
  /**
   * The AWS Certificate Manager certificate for the custom domain.
   */
  certificate?: acm.ICertificate;

  protected props: NextjsProps;

  public originAccessIdentity: cloudfront.IOriginAccessIdentity;
  public tempBuildDir: string;
  public configBucket?: s3.Bucket;
  public lambdaFunctionUrl!: lambda.FunctionUrl;

  constructor(scope: Construct, id: string, props: NextjsProps) {
    super(scope, id);

    console.debug('┌ Building Next.js app ▼ ...');

    // get dir to store temp build files in
    this.tempBuildDir = props.tempBuildDir
      ? path.resolve(
          path.join(props.tempBuildDir, `nextjs-cdk-build-${this.node.id}-${this.node.addr.substring(0, 4)}`)
        )
      : fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-cdk-build-'));

    // save props
    this.props = { ...props, tempBuildDir: this.tempBuildDir };

    // build nextjs app
    this.nextBuild = new NextjsBuild(this, id, this.props);
    this.serverFunction = new NextJsLambda(this, 'Fn', {
      ...this.props,
      nextBuild: this.nextBuild,
      ...props.cdk?.lambda,
    });
    this.assetsDeployment = new NextJsAssetsDeployment(this, 'AssetDeployment', {
      ...this.props,
      ...props.cdk?.deployment,
      nextBuild: this.nextBuild,
    });
    this.bucket = this.assetsDeployment.bucket;

    this.originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'Allows CloudFront to access S3 bucket with assets',
    });

    // allow cloudfront to access assets bucket
    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        // only allow getting of files - not listing
        actions: ['s3:GetObject'],
        resources: [this.bucket.arnForObjects('*')],
        principals: [this.originAccessIdentity.grantPrincipal],
      })
    );
    // Create Custom Domain
    this.validateCustomDomainSettings();
    this.hostedZone = this.lookupHostedZone();
    this.certificate = this.createCertificate();

    // Create CloudFront
    this.distribution = this.props.isPlaceholder
      ? this.createCloudFrontDistributionForStub()
      : this.createCloudFrontDistribution();
    // wait for asset deployments to finish
    this.assetsDeployment.deployments.forEach((s3Deployment) => this.distribution.node.addDependency(s3Deployment));

    // // Invalidate CloudFront (might already be handled by deployments?)
    // const invalidationCR = this.createCloudFrontInvalidation();
    // invalidationCR.node.addDependency(this.distribution);

    // Connect Custom Domain to CloudFront Distribution
    this.createRoute53Records();

    console.debug('└ Finished preparing NextJS app for deployment');
  }

  /////////////////////
  // Public Properties
  /////////////////////

  /**
   * The CloudFront URL of the website.
   */
  public get url(): string {
    return `https://${this.distribution.distributionDomainName}`;
  }

  /**
   * If the custom domain is enabled, this is the URL of the website with the
   * custom domain.
   */
  public get customDomainUrl(): string | undefined {
    const { customDomain } = this.props;
    if (!customDomain) {
      return;
    }

    if (typeof customDomain === 'string') {
      return `https://${customDomain}`;
    } else {
      return `https://${customDomain.domainName}`;
    }
  }

  /**
   * The ARN of the internally created S3 Bucket.
   */
  public get bucketArn(): string {
    return this.bucket.bucketArn;
  }

  /**
   * The name of the internally created S3 Bucket.
   */
  public get bucketName(): string {
    return this.bucket.bucketName;
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

  /////////////////////
  // CloudFront Distribution
  /////////////////////

  private createCloudFrontDistribution(): cloudfront.Distribution {
    const { cdk, customDomain } = this.props;
    const cfDistributionProps = cdk?.distribution;

    // build domainNames
    const domainNames = [];
    if (!customDomain) {
      // no domain
    } else if (typeof customDomain === 'string') {
      domainNames.push(customDomain);
    } else {
      domainNames.push(customDomain.domainName);
    }

    // S3 origin
    const s3Origin = new origins.S3Origin(this.bucket, {
      originAccessIdentity: this.originAccessIdentity,
    });

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
    const staticCachePolicy = cdk?.cachePolicies?.staticCachePolicy ?? this.createCloudFrontStaticCachePolicy();
    const imageCachePolicy = cdk?.cachePolicies?.imageCachePolicy ?? this.createCloudFrontImageCachePolicy();

    // origin request policies
    const lambdaOriginRequestPolicy = cdk?.lambdaOriginRequestPolicy ?? this.createLambdaOriginRequestPolicy();

    // main server function origin (lambda URL HTTP origin)
    const fnUrl = this.serverFunction.lambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });
    this.lambdaFunctionUrl = fnUrl;
    const serverFunctionOrigin = new origins.HttpOrigin(Fn.parseDomainName(fnUrl.url), {
      customHeaders: {
        // provide config to edge lambda function
        'x-origin-url': fnUrl.url,
      },
    });

    // lambda behavior edge function
    const lambdaOriginRequestEdgeFn = this.buildLambdaOriginRequestEdgeFunction();
    const lambdaOriginRequestEdgeFnVersion = lambda.Version.fromVersionArn(
      this,
      'Version',
      lambdaOriginRequestEdgeFn.currentVersion.functionArn
    );
    const lambdaOriginEdgeFns: cloudfront.EdgeLambda[] = [
      {
        eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
        functionVersion: lambdaOriginRequestEdgeFnVersion,
        includeBody: false,
      },
    ];

    // default handler for requests that don't match any other path:
    //   - try S3 first
    //   - if 403, fall back to lambda handler (mostly for /)
    //   - if 404, fall back to lambda handler
    const fallbackOriginGroup = new origins.OriginGroup({
      primaryOrigin: s3Origin,
      fallbackOrigin: serverFunctionOrigin,
      fallbackStatusCodes: [403, 404],
    });

    const lambdaCachePolicy = cdk?.cachePolicies?.lambdaCachePolicy ?? this.createCloudFrontLambdaCachePolicy();

    // requests for static objects
    const staticBehavior: cloudfront.BehaviorOptions = {
      viewerProtocolPolicy,
      origin: s3Origin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      compress: true,
      cachePolicy: staticCachePolicy,
    };

    // requests going to lambda (api, etc)
    const lambdaBehavior: cloudfront.BehaviorOptions = {
      viewerProtocolPolicy,
      origin: serverFunctionOrigin,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      // allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      // cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      originRequestPolicy: lambdaOriginRequestPolicy,
      compress: true,
      // cachePolicy: lambdaCachePolicy,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      edgeLambdas: lambdaOriginEdgeFns,
    };

    // requests to fallback origin group (default behavior)
    // used for S3 and lambda. would prefer to forward all headers to lambda but need to strip out host
    // TODO: try to do this with headers whitelist or edge lambda
    const fallbackOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'FallbackOriginRequestPolicy', {
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(), // pretty much disables caching - maybe can be changed
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      // we cannot forward the host header to a lambda URL
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
        'Accept',
        'Referer',
        'User-Agent',
        'Content-Type'
      ),
      comment: 'Nextjs Fallback Origin Request Policy',
    });

    // if we don't have a static file called index.html then we should
    // redirect to the lambda handler
    const hasIndexHtml = this.nextBuild.readPublicFileList().includes('index.html');

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
        // allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL, // doesn't work with an OriginGroup
        // cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        compress: true,

        // what goes here? static or lambda?
        cachePolicy: lambdaCachePolicy,
        originRequestPolicy: fallbackOriginRequestPolicy,

        // edgeLambdas: lambdaOriginEdgeFns,
      },

      additionalBehaviors: {
        // is index.html static or dynamic?
        ...(hasIndexHtml ? {} : { '/': lambdaBehavior }),

        // known dynamic routes
        'api/*': lambdaBehavior,
        '_next/data/*': lambdaBehavior,

        // known static routes
        // it would be nice to create routes for all the static files we know of
        // but we run into the limit of CacheBehaviors per distribution
        '_next/*': staticBehavior,

        // dynamic images go to lambda
        '_next/image*': {
          viewerProtocolPolicy,
          origin: serverFunctionOrigin,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
          cachePolicy: imageCachePolicy,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER, // not sure what goes here
        },

        ...(cfDistributionProps?.additionalBehaviors || {}),
      },
    });
  }

  private createCloudFrontStaticCachePolicy(): cloudfront.CachePolicy {
    return new cloudfront.CachePolicy(this, 'StaticsCache', Nextjs.staticCachePolicyProps);
  }

  private createCloudFrontImageCachePolicy(): cloudfront.CachePolicy {
    return new cloudfront.CachePolicy(this, 'ImageCache', Nextjs.imageCachePolicyProps);
  }

  private createLambdaOriginRequestPolicy(): cloudfront.OriginRequestPolicy {
    return new cloudfront.OriginRequestPolicy(this, 'LambdaOriginPolicy', Nextjs.lambdaOriginRequestPolicyProps);
  }

  private createCloudFrontLambdaCachePolicy(): cloudfront.CachePolicy {
    return new cloudfront.CachePolicy(this, 'LambdaCache', Nextjs.lambdaCachePolicyProps);
  }

  private createCloudFrontDistributionForStub(): cloudfront.Distribution {
    return new cloudfront.Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      errorResponses: buildErrorResponsesForRedirectToIndex('index.html'),
      domainNames: this.buildDistributionDomainNames(),
      certificate: this.certificate,
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, {
          originAccessIdentity: this.originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      ...this.props.cdk?.distribution, // not sure if needed
    });
  }

  private buildDistributionDomainNames(): string[] {
    const { customDomain } = this.props;
    const domainNames = [];
    if (!customDomain) {
      // no domain
    } else if (typeof customDomain === 'string') {
      domainNames.push(customDomain);
    } else {
      domainNames.push(customDomain.domainName);
    }
    return domainNames;
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
    const inputPath = path.join(__dirname, '..', 'assets', 'lambda@edge', 'LambdaOriginRequest');
    const outputPath = path.join(this.tempBuildDir, 'lambda@edge', 'LambdaOriginRequest.js');
    bundleFunction({
      inputPath,
      outputPath,
      bundleOptions: {
        bundle: true,
        external: ['aws-sdk', 'url'],
        minify: true,
        target: 'node16',
        platform: 'node',
      },
    });

    const fn = new cloudfront.experimental.EdgeFunction(this, 'DefaultOriginRequestEdgeFn', {
      runtime: lambda.Runtime.NODEJS_16_X,
      // role,
      handler: 'LambdaOriginRequest.handler',
      code: lambda.Code.fromAsset(dirname(outputPath)),
      currentVersionOptions: {
        removalPolicy: RemovalPolicy.DESTROY, // destroy old versions
        retryAttempts: 1, // async retry attempts
      },
      stackId:
        `Nextjs-${this.props.stageName || app.stageName || 'default'}-EdgeFunctions-` + this.node.addr.substring(0, 5),
    });
    fn.currentVersion.grantInvoke(new ServicePrincipal('edgelambda.amazonaws.com'));
    fn.currentVersion.grantInvoke(new ServicePrincipal('lambda.amazonaws.com'));

    return fn;
  }

  /* handled by BucketDeployment supposedly?

  private createCloudFrontInvalidation(): CustomResource {
    // Create a Lambda function that will be doing the invalidation
    const invalidator = new lambda.Function(this, 'CloudFrontInvalidator', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets/BaseSite/custom-resource')),
      // layers: [this.awsCliLayer], // needed?
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: 'cf-invalidate.handler',
      timeout: Duration.minutes(15),
      memorySize: 1024,
    });

    // Grant permissions to invalidate CF Distribution
    invalidator.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cloudfront:GetInvalidation', 'cloudfront:CreateInvalidation'],
        resources: ['*'],
      })
    );

    const waitForInvalidation = this.props.waitForInvalidation === false ? false : true;

    return new CustomResource(this, 'CloudFrontInvalidation', {
      serviceToken: invalidator.functionArn,
      resourceType: 'Custom::SSTCloudFrontInvalidation',
      properties: {
        BuildId: this.isPlaceholder ? 'live' : this._getNextBuildId(),
        DistributionId: this.distribution.distributionId,
        // TODO: Ignore the browser build path as it may speed up invalidation
        DistributionPaths: ['/*'],
        WaitForInvalidation: waitForInvalidation,
      },
    });
  }
  */

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
    } else if (customDomain.hostedZone) {
      hostedZone = customDomain.hostedZone;
    } else if (typeof customDomain.hostedZone === 'string') {
      hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: customDomain.hostedZone,
      });
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
