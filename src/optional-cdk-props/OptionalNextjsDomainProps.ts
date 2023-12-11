// ~~ Generated by projen. To modify, edit .projenrc.ts and run "npx projen".
import type { NextjsDomainOverrides } from '../';
import type { aws_certificatemanager, aws_route53 } from 'aws-cdk-lib';

/**
 * OptionalNextjsDomainProps
 */
export interface OptionalNextjsDomainProps {
  /**
   * Overrides.
   * @stability stable
   */
  readonly overrides?: NextjsDomainOverrides;
  /**
   * You must create the hosted zone out-of-band.
   * You can lookup the hosted zone outside this construct and pass it in via this prop.
   * Alternatively if this prop is `undefined`, then the hosted zone will be
   * **looked up** (not created) via `HostedZone.fromLookup` with {@link NextjsDomainProps.domainName}.
   * @stability stable
   */
  readonly hostedZone?: aws_route53.IHostedZone;
  /**
   * The domain name used in this construct when creating an ACM `Certificate`.
   * Useful
   * when passing {@link NextjsDomainProps.alternateNames} and you need to specify
   * a wildcard domain like "*.example.com". If `undefined`, then {@link NextjsDomainProps.domainName}
   * will be used.
   *
   * If {@link NextjsDomainProps.certificate} is passed, then this prop is ignored.
   * @stability stable
   */
  readonly certificateDomainName?: string;
  /**
   * If this prop is `undefined` then an ACM `Certificate` will be created based on {@link NextjsDomainProps.domainName} with DNS Validation. This prop allows you to control the TLS/SSL certificate created. The certificate you create must be in the `us-east-1` (N. Virginia) region as required by AWS CloudFront.
   * Set this option if you have an existing certificate in the `us-east-1` region in AWS Certificate Manager you want to use.
   * @stability stable
   */
  readonly certificate?: aws_certificatemanager.ICertificate;
  /**
   * Alternate domain names that should route to the Cloudfront Distribution.
   * For example, if you specificied `"example.com"` as your {@link NextjsDomainProps.domainName},
   * you could specify `["www.example.com", "api.example.com"]`.
   * Learn more about the [requirements](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html#alternate-domain-names-requirements)
   * and [restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html#alternate-domain-names-restrictions)
   * for using alternate domain names with CloudFront.
   *
   * Note, in order to use alternate domain names, they must be covered by your
   * certificate. By default, the certificate created in this construct only covers
   * the {@link NextjsDomainProps.domainName}. Therefore, you'll need to specify
   * a wildcard domain name like `"*.example.com"` with {@link NextjsDomainProps.certificateDomainName}
   * so that this construct will create the certificate the covers the alternate
   * domain names. Otherwise, you can use {@link NextjsDomainProps.certificate}
   * to create the certificate yourself where you'll need to ensure it has a
   * wildcard or uses subject alternative names including the
   * alternative names specified here.
   * @stability stable
   */
  readonly alternateNames?: Array<string>;
  /**
   * An easy to remember address of your website.
   * Only supports domains hosted
   * on [Route 53](https://aws.amazon.com/route53/). Used as `domainName` for
   * ACM `Certificate` if {@link NextjsDomainProps.certificate} and
   * {@link NextjsDomainProps.certificateDomainName} are `undefined`.
   * @stability stable
   */
  readonly domainName?: string;
}
