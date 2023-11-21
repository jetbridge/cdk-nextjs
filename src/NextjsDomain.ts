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
import { HttpsRedirect } from 'aws-cdk-lib/aws-route53-patterns';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

export interface NextjsDomainProps {
  /**
   * The domain to be assigned to the website URL (ie. domain.com).
   * Supports domains that are hosted either on [Route 53](https://aws.amazon.com/route53/) or externally.
   */
  readonly domainName: string;
  /**
   * An alternative domain to be assigned to the website URL. Visitors to the alias will be redirected to the main domain. (ie. `www.domain.com`).
   * Use this to create a `www.` version of your domain and redirect visitors to the root domain.
   */
  readonly domainAliases?: string[];
  /**
   * Specify additional names that should route to the Cloudfront Distribution. Note, certificates for these names will not be automatically generated so the `certificate` option must be specified.
   */
  readonly alternateNames?: string[];
  /**
   * Set this option if the domain is not hosted on Amazon Route 53 or is hosted on Route53 but in a different account or otherwise in a way it is unaccessible. If false, the certificate and DNS will not be automatically created.
   */
  readonly isExternalDomain?: boolean;
  /**
   * Optionally provide Route53 Hosted Zone. If not provided, then hosted zone
   * will be looked up via `HostedZone.fromLookup` with {@link NextjsDomainProps.domainName}
   * unless {@link NextjsDomainProps.isExternalDomain} is passed.
   */
  readonly hostedZone?: IHostedZone;
  /**
   * Import the certificate for the domain. By default, SST will create a certificate with the domain name. The certificate will be created in the `us-east-1` (N. Virginia) region as required by AWS CloudFront.
   * Set this option if you have an existing certificate in the `us-east-1` region in AWS Certificate Manager you want to use.
   */
  readonly certificate?: ICertificate;
}

export class NextjsDomain extends Construct {
  /**
   * Concatentation of {@link NextjsDomainProps.domainName} and {@link NextjsDomainProps.alternateNames}. Used in instantiation of CloudFront Distribution in NextjsDistribution
   */
  get domainNames(): string[] {
    const dns = [this.props.domainName];
    if (this.props.alternateNames?.length) {
      dns.push(...this.props.alternateNames);
    }
    return dns;
  }
  /**
   * Route53 Hosted Zone. If {@link NextjsDomainProps.isExternalDomain} is `true`,
   * then it will be undefined.
   */
  hostedZone?: IHostedZone;
  /**
   * ACM Certificate. If {@link NextjsDomainProps.isExternalDomain} is `true`,
   * then it will be undefined.
   */
  certificate?: ICertificate;
  private props: NextjsDomainProps;

  constructor(scope: Construct, id: string, props: NextjsDomainProps) {
    super(scope, id);
    this.props = props;
    this.validateCustomDomainSettings();
    this.hostedZone = this.getHostedZone();
    this.certificate = this.getCertificate();
  }

  private validateCustomDomainSettings() {
    if (this.props.isExternalDomain === true) {
      if (!this.props.certificate) {
        throw new Error('A valid certificate is required when "isExternalDomain" is set to "true".');
      }
      if (this.props.domainAliases?.length) {
        throw new Error(
          'Domain aliases are only supported for domains hosted on Amazon Route 53. Do not set the "customDomain.domainAliases" when "isExternalDomain" is enabled.'
        );
      }
      if (this.props.hostedZone) {
        throw new Error(
          'Hosted zones can only be configured for domains hosted on Amazon Route 53. Do not set the "customDomain.hostedZone" when "isExternalDomain" is enabled.'
        );
      }
    }
  }

  private getHostedZone(): IHostedZone | undefined {
    if (this.props.isExternalDomain) {
      return;
    } else {
      if (!this.props.hostedZone) {
        return HostedZone.fromLookup(this, 'HostedZone', {
          domainName: this.props.domainName,
        });
      } else {
        return this.props.hostedZone;
      }
    }
  }

  private getCertificate(): ICertificate | undefined {
    if (this.props.certificate) {
      return this.props.certificate;
    } else if (this.hostedZone) {
      return new Certificate(this, 'Certificate', {
        domainName: this.props.domainName,
        validation: CertificateValidation.fromDns(this.hostedZone),
      });
    } else {
      return;
    }
  }

  createDnsRecords(distribution: Distribution): void {
    if (!this.hostedZone) {
      return;
    }
    // Create DNS record
    const recordProps: ARecordProps & AaaaRecordProps = {
      recordName: this.props.domainName,
      zone: this.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    };
    new ARecord(this, 'ARecord', recordProps);
    new AaaaRecord(this, 'AaaaRecord', recordProps);
    // Create Alias redirect record
    if (this.props.domainAliases?.length) {
      new HttpsRedirect(this, 'Redirect', {
        zone: this.hostedZone,
        recordNames: this.props.domainAliases,
        targetDomain: this.props.domainName,
      });
    }
  }
}
