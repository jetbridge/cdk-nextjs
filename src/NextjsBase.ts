import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { DistributionProps, ErrorResponse } from 'aws-cdk-lib/aws-cloudfront';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';

export type CompressionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Common props shared across NextJS-related CDK constructs.
 */
export interface NextjsBaseProps {
  /**
   * Relative path to the directory where the NextJS project is located.
   * Can be the root of your project (`.`) or a subdirectory (`packages/web`).
   */
  readonly nextjsPath: string;

  /**
   * Custom environment variables to pass to the NextJS build and runtime.
   */
  readonly environment?: Record<string, string>;

  /**
   * Skip building app and deploy a placeholder.
   * Useful when using `next dev` for local development.
   */
  readonly isPlaceholder?: boolean;

  /**
   * Directory to store temporary build files in.
   * Defaults to os.tmpdir().
   */
  readonly tempBuildDir?: string; // move to NextjsBuildProps?

  /**
   * Optional value for NODE_ENV during build and runtime.
   */
  readonly nodeEnv?: string;

  /**
   * 0 - no compression, fatest
   * 9 - maximum compression, slowest
   * @default 1
   */
  readonly compressionLevel?: CompressionLevel;

  /**
   * Less build output.
   */
  readonly quiet?: boolean;
}

///// stuff below taken from https://github.com/serverless-stack/sst/blob/8d377e941467ced81d8cc31ee67d5a06550f04d4/packages/resources/src/BaseSite.ts

export interface BaseSiteDomainProps {
  /**
   * The domain to be assigned to the website URL (ie. domain.com).
   *
   * Supports domains that are hosted either on [Route 53](https://aws.amazon.com/route53/) or externally.
   */
  readonly domainName: string;
  /**
   * An alternative domain to be assigned to the website URL. Visitors to the alias will be redirected to the main domain. (ie. `www.domain.com`).
   *
   * Use this to create a `www.` version of your domain and redirect visitors to the root domain.
   */
  readonly domainAlias?: string;
  /**
   * Specify additional names that should route to the Cloudfront Distribution. Note, certificates for these names will not be automatically generated so the `certificate` option must be specified.
   */
  readonly alternateNames?: string[];
  /**
   * Set this option if the domain is not hosted on Amazon Route 53.
   */
  readonly isExternalDomain?: boolean;

  /**
   * Import the underlying Route 53 hosted zone.
   */
  readonly hostedZone?: IHostedZone;
  /**
   * Import the certificate for the domain. By default, SST will create a certificate with the domain name. The certificate will be created in the `us-east-1`(N. Virginia) region as required by AWS CloudFront.
   *
   * Set this option if you have an existing certificate in the `us-east-1` region in AWS Certificate Manager you want to use.
   */
  readonly certificate?: ICertificate;
}

export type BaseSiteCdkDistributionProps = DistributionProps;
// export interface BaseSiteCdkDistributionProps extends Omit<DistributionProps, 'defaultBehavior'> {
//   readonly defaultBehavior?: Omit<BehaviorOptions, 'origin'> & {
//     origin?: IOrigin;
//   };
// }
export interface BaseSiteReplaceProps {
  readonly files: string;
  readonly search: string;
  readonly replace: string;
}

export interface BaseSiteEnvironmentOutputsInfo {
  readonly path: string;
  readonly stack: string;
  readonly environmentOutputs: { [key: string]: string };
}

/////////////////////
// Helper Functions
/////////////////////

export function buildErrorResponsesForRedirectToIndex(indexPage: string): ErrorResponse[] {
  return [
    {
      httpStatus: 403,
      responsePagePath: `/${indexPage}`,
      responseHttpStatus: 200,
    },
    {
      httpStatus: 404,
      responsePagePath: `/${indexPage}`,
      responseHttpStatus: 200,
    },
  ];
}

export function buildErrorResponsesFor404ErrorPage(errorPage: string): ErrorResponse[] {
  return [
    {
      httpStatus: 403,
      responsePagePath: `/${errorPage}`,
    },
    {
      httpStatus: 404,
      responsePagePath: `/${errorPage}`,
    },
  ];
}
