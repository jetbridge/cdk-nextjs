// ~~ Generated by projen. To modify, edit .projenrc.ts and run "npx projen".
import type { aws_cloudfront } from 'aws-cdk-lib';

/**
 * OptionalCloudFrontFunctionProps
 */
export interface OptionalCloudFrontFunctionProps {
  /**
   * A name to identify the function.
   * @default - generated from the `id`
   * @stability stable
   */
  readonly functionName?: string;
  /**
   * A comment to describe the function.
   * @default - same as `functionName`
   * @stability stable
   */
  readonly comment?: string;
  /**
   * The source code of the function.
   * @stability stable
   */
  readonly code?: aws_cloudfront.FunctionCode;
}