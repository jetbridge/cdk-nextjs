import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';

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
   * The directory to execute `npm run build` from. By default, it is `nextjsPath`.
   * Can be overridden, particularly useful for monorepos where `build` is expected to run
   * at the root of the project.
   */
  readonly buildPath?: string;

  /**
   * Root of your project, if different from `nextjsPath`.
   * Defaults to current working directory.
   */
  readonly projectRoot?: string;

  /**
   * Custom environment variables to pass to the NextJS build and runtime.
   */
  readonly environment?: Record<string, string>;

  /**
   * Directory to store temporary build files in.
   * Defaults to os.tmpdir().
   */
  readonly tempBuildDir?: string; // move to NextjsBuildProps?

  /**
   * Optional value used to install NextJS node dependencies.
   * @default 'npx --yes open-next@^2 build'
   */
  readonly buildCommand?: string;

  /**
   * Less build output.
   */
  readonly quiet?: boolean;

  /**
   * Optional arn for the sharp lambda layer.
   * If omitted, the layer will be created.
   */
  readonly sharpLayerArn?: string;

  /**
   * By default all CloudFront cache will be invalidated on deployment.
   * This can be set to true to skip the full cache invalidation, which
   * could be important for some users.
   */
  readonly skipFullInvalidation?: boolean;
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
