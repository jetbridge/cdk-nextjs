// ~~ Generated by projen. To modify, edit .projenrc.ts and run "npx projen".
import type { NextjsBuild, NextjsServerOverrides } from '../';
import type { aws_lambda, aws_s3 } from 'aws-cdk-lib';

/**
 * OptionalNextjsServerProps
 */
export interface OptionalNextjsServerProps {
  /**
   * @stability stable
   */
  readonly quiet?: boolean;
  /**
   * Overrides.
   * @stability stable
   */
  readonly overrides?: NextjsServerOverrides;
  /**
   * Override function properties.
   * @stability stable
   */
  readonly lambda?: aws_lambda.FunctionOptions;
  /**
   * @stability stable
   */
  readonly environment?: Record<string, string>;
  /**
   * Static asset bucket.
   * Function needs bucket to read from cache.
   * @stability stable
   */
  readonly staticAssetBucket?: aws_s3.IBucket;
  /**
   * @stability stable
   */
  readonly nextBuild?: NextjsBuild;
}
