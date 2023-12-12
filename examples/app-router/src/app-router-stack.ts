import { CfnOutput, Stack, StackProps, Token } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Nextjs } from 'cdk-nextjs-standalone';

/**
 * This stack showcases how to use cdk-nextjs with Next.js App Router
 */
export class AppRouterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const nextjs = new Nextjs(this, 'nextjs', {
      nextjsPath: '../../open-next/examples/app-router',
      buildCommand: 'npx open-next@^2 build',
      // skipBuild: true,
    });

    new CfnOutput(this, "CloudFrontDistributionDomain", {
      value: nextjs.distribution.distributionDomain,
    });
  }
}
