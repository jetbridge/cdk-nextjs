import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Nextjs } from 'cdk-nextjs-standalone';
import { Construct } from 'constructs';

export class PagesRouterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const nextjs = new Nextjs(this, 'nextjs', {
      nextjsPath: '../../open-next/examples/pages-router',
      // skipBuild: true,
    });

    new CfnOutput(this, 'CloudFrontDistributionDomain', {
      value: nextjs.distribution.distributionDomain,
    });
  }
}
