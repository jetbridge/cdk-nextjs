import { CfnOutput, Stack, StackProps, Token } from 'aws-cdk-lib';
import { Distribution, OriginProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from 'constructs';
import { Nextjs } from 'cdk-nextjs-standalone';

/*
  NOTE: in order for the below stack to work, you need to
  - Update ../../open-next/examples/app-router/next.config.js to have a
  `basePath: "/app-router"` and `assetPrefix: "/app-router"`
  - Update ../../open-next/examples/pages-router/next.config.js to have a
  `basePath: "/pages-router"` and `assetPrefix: "/app-router"`
*/

export class MultipleSitesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const distribution = new Distribution(this, 'distribution', {
      defaultBehavior: {
        origin: new HttpOrigin('constructs.dev', {
          protocolPolicy: OriginProtocolPolicy.MATCH_VIEWER,
        }),
      },
    })

    new Nextjs(this, 'app-router', {
      nextjsPath: '../../open-next/examples/app-router',
      basePath: '/app-router',
      distribution
    });

    new Nextjs(this, 'pages-router', {
      nextjsPath: '../../open-next/examples/pages-router',
      basePath: '/pages-router',
      distribution
    });

    new CfnOutput(this, "CloudFrontDistributionDomain", {
      value: distribution.distributionDomainName,
    });
  }
}
