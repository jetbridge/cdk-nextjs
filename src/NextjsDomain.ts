import { ICertificate, Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import {
  ARecord,
  ARecordProps,
  AaaaRecord,
  AaaaRecordProps,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import { NextjsProps } from '.';

export interface NextjsDomainProps {
  /**
   * An easy to remember address of your website. Only supports domains hosted on [Route 53](https://aws.amazon.com/route53/).
   * @example "example.com"
   */
  readonly domainName: string;
  /**
   * Alternate domain names that should route to the Cloudfront Distribution.
   * For example, if you specificied `"example.com"` as your `domainName`, you can specify `["www.example.com", "api.example.com"]`.
   * Learn more about the [requirements](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html#alternate-domain-names-requirements) and [restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html#alternate-domain-names-restrictions) for using alternate domain names with CloudFront.
   *
   * Note if you create your own certificate, you'll need to ensure it has a wildcard (*.example.com) or uses subject alternative names including the alternative names specified here.
   * @example ["www.example.com", "api.example.com"]
   */
  readonly alternateNames?: string[];
  /**
   * You must create the hosted zone out-of-band.
   * You can lookup the hosted zone outside this construct and pass it in via this prop.
   * Alternatively if this prop is `undefined`, then the hosted zone will be **looked up** (not created) via `HostedZone.fromLookup` with {@link NextjsDomainProps.domainName}.
   */
  readonly hostedZone?: IHostedZone;
  /**
   * If this prop is `undefined` then a certificate will be created based on {@link NextjsDomainProps.domainName} and {@link NextjsDomainProps.isWildcardCertificate} with DNS Validation.
   * This prop allows you to control the TLS/SSL certificate created. The certificate you create must be in the `us-east-1` (N. Virginia) region as required by AWS CloudFront.
   *
   * Set this option if you have an existing certificate in the `us-east-1` region in AWS Certificate Manager you want to use.
   */
  readonly certificate?: ICertificate;
  /**
   * If {@link NextjsDomainProps.certificate} is `undefined` and therefore `NextjsDomain` creates a certificate, controls whether
   * a wildcard certificate is created.
   * For example, if `"example.com"` is passed for {@link NextjsDomainProps.domainName}, then a certificate with domain name, `"*.example.com"`, would be created if `true` (default).
   * @default true
   */
  readonly isWildcardCertificate: boolean;
}

/**
 * Use a custom domain with `Nextjs`. Requires a Route53 hosted zone to have been
 * created within the same AWS account. For DNS setups where you cannot use a
 * Route53 hosted zone in the same AWS account, use the `defaults.distribution`
 * prop of {@link NextjsProps}.
 *
 * See {@link NextjsDomainProps} TS Doc comments for detailed docs on how to customize.
 * This construct is helpful to user to not have to worry about interdependencies
 * between Route53 Hosted Zone, CloudFront Distribution, and Route53 Hosted Zone Records.
 *
 * Note, if you're using another service for domain name registration, you can
 * still create a Route53 hosted zone. Please see [Configuring DNS Delegation from CloudFlare to AWS Route53](https://veducate.co.uk/dns-delegation-route53/)
 * as an example.
 */
export class NextjsDomain extends Construct {
  /**
   * Concatentation of {@link NextjsDomainProps.domainName} and {@link NextjsDomainProps.alternateNames}. Used in instantiation of CloudFront Distribution in NextjsDistribution
   */
  get domainNames(): string[] {
    const names = [this.props.domainName];
    if (this.props.alternateNames?.length) {
      names.push(...this.props.alternateNames);
    }
    return names;
  }
  /**
   * Route53 Hosted Zone.
   */
  hostedZone: IHostedZone;
  /**
   * ACM Certificate.
   */
  certificate: ICertificate;

  private props: NextjsDomainProps;
  private get certificateDomainName() {
    return this.props.isWildcardCertificate ? `*.${this.props.domainName}` : this.props.domainName;
  }

  constructor(scope: Construct, id: string, props: NextjsDomainProps) {
    super(scope, id);
    this.props = props;
    this.hostedZone = this.getHostedZone();
    this.certificate = this.getCertificate();
  }

  private getHostedZone(): IHostedZone {
    if (!this.props.hostedZone) {
      return HostedZone.fromLookup(this, 'HostedZone', {
        domainName: this.props.domainName,
      });
    } else {
      return this.props.hostedZone;
    }
  }

  private getCertificate(): ICertificate {
    if (!this.props.certificate) {
      return new Certificate(this, 'Certificate', {
        domainName: this.certificateDomainName,
        validation: CertificateValidation.fromDns(this.hostedZone),
      });
    } else {
      return this.props.certificate;
    }
  }

  /**
   * Creates DNS records (A and AAAA) records for {@link NextjsDomainProps.domainName}
   * and {@link NextjsDomainProps.alternateNames} if defined.
   */
  createDnsRecords(distribution: Distribution): void {
    // Create DNS record
    const recordProps: ARecordProps & AaaaRecordProps = {
      recordName: this.props.domainName,
      zone: this.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    };
    new ARecord(this, 'ARecordMain', recordProps); // IPv4
    new AaaaRecord(this, 'AaaaRecordMain', recordProps); // IPv6
    if (this.props.alternateNames?.length) {
      let i = 1;
      for (const alternateName of this.props.alternateNames) {
        new ARecord(this, 'ARecordAlt' + i, {
          ...recordProps,
          recordName: `${alternateName}.`,
        });
        new AaaaRecord(this, 'AaaaRecordAlt' + i, {
          ...recordProps,
          recordName: `${alternateName}.`,
        });
        i++;
      }
    }
  }
}
