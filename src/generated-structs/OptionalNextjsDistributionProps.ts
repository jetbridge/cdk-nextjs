// ~~ Generated by projen. To modify, edit .projenrc.ts and run "npx projen".
import type { aws_cloudfront, aws_lambda, aws_s3 } from 'aws-cdk-lib';
import type { NextjsBuild, NextjsDistributionOverrides, NextjsDomain } from '../';

/**
 * OptionalNextjsDistributionProps
 */
export interface OptionalNextjsDistributionProps {
  /**
   * @stability stable
   */
  readonly staticResponseHeadersPolicy?: aws_cloudfront.IResponseHeadersPolicy;
  /**
   * @stability stable
   */
  readonly serverResponseHeadersPolicy?: aws_cloudfront.IResponseHeadersPolicy;
  /**
   * @stability stable
   */
  readonly serverCachePolicy?: aws_cloudfront.ICachePolicy;
  /**
   * Override props for every construct.
   * @stability stable
   */
  readonly overrides?: NextjsDistributionOverrides;
  /**
   * @stability stable
   */
  readonly nextDomain?: NextjsDomain;
  /**
   * @stability stable
   */
  readonly imageResponseHeadersPolicy?: aws_cloudfront.IResponseHeadersPolicy;
  /**
   * @stability stable
   */
  readonly imageCachePolicy?: aws_cloudfront.ICachePolicy;
  /**
   * Override lambda function url auth type.
   * @default "NONE"
   * @stability stable
   */
  readonly functionUrlAuthType?: aws_lambda.FunctionUrlAuthType;
  /**
   * @stability stable
   */
  readonly distribution?: aws_cloudfront.Distribution;
  /**
   * @stability stable
   */
  readonly basePath?: string;
  /**
   * Bucket containing static assets.
   * Must be provided if you want to serve static files.
   * @stability stable
   */
  readonly staticAssetsBucket?: aws_s3.IBucket;
  /**
   * Lambda function to route all non-static requests to.
   * Must be provided if you want to serve dynamic requests.
   * @stability stable
   */
  readonly serverFunction?: aws_lambda.IFunction;
  /**
   * @stability stable
   */
  readonly nextjsPath?: string;
  /**
   * @stability stable
   */
  readonly nextBuild?: NextjsBuild;
  /**
   * Lambda function to optimize images.
   * Must be provided if you want to serve dynamic requests.
   * @stability stable
   */
  readonly imageOptFunction?: aws_lambda.IFunction;
}
