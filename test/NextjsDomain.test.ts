import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { NextjsDomain } from '../src/NextjsDomain';

function setup(region?: string) {
  const stack = new Stack(new App(), 'Stack', region ? { env: { account: '123456789012', region } } : undefined);
  const hostedZone = HostedZone.fromHostedZoneAttributes(stack, 'Zone', {
    hostedZoneId: 'Z123',
    zoneName: 'example.com',
  });
  return { stack, hostedZone };
}

describe('NextjsDomain certificate region', () => {
  test('creates a certificate in us-east-1', () => {
    const { stack, hostedZone } = setup('us-east-1');
    new NextjsDomain(stack, 'Domain', { domainName: 'example.com', hostedZone });
    Template.fromStack(stack).resourceCountIs('AWS::CertificateManager::Certificate', 1);
  });

  test('creates a certificate in an environment-agnostic stack', () => {
    const { stack, hostedZone } = setup();
    new NextjsDomain(stack, 'Domain', { domainName: 'example.com', hostedZone });
    Template.fromStack(stack).resourceCountIs('AWS::CertificateManager::Certificate', 1);
  });

  test('throws when it would create a certificate outside us-east-1', () => {
    const { stack, hostedZone } = setup('eu-west-1');
    expect(() => new NextjsDomain(stack, 'Domain', { domainName: 'example.com', hostedZone })).toThrow(
      /stack region is eu-west-1/
    );
  });

  test('accepts a provided certificate outside us-east-1', () => {
    const { stack, hostedZone } = setup('eu-west-1');
    const certificate = Certificate.fromCertificateArn(
      stack,
      'Cert',
      'arn:aws:acm:us-east-1:123456789012:certificate/abc'
    );
    new NextjsDomain(stack, 'Domain', { domainName: 'example.com', hostedZone, certificate });
    Template.fromStack(stack).resourceCountIs('AWS::CertificateManager::Certificate', 0);
  });
});
