import { CfnOutput, Stack, StackProps, Token } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Nextjs } from 'cdk-nextjs-standalone';

export class AppPagesRouterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const nextjs = new Nextjs(this, 'nextjs', {
      nextjsPath: '../../open-next/examples/app-pages-router',
      // skipBuild: true,
    });

    new CfnOutput(this, "CloudFrontDistributionDomain", {
      value: nextjs.distribution.distributionDomain,
    });
  }
}
