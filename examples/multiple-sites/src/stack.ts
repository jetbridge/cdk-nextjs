import { CfnOutput, Stack, StackProps, Token } from 'aws-cdk-lib';
import { Distribution, OriginProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from 'constructs';
import { Nextjs } from 'cdk-nextjs-standalone';

export class PagesRouterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const distribution = new Distribution(this, 'distribution', {
      defaultBehavior: {
        origin: new HttpOrigin('constructs.dev', {
          protocolPolicy: OriginProtocolPolicy.MATCH_VIEWER,
        }),
      },
    })

    const app1 = new Nextjs(this, 'app-router', {
      nextjsPath: '../../open-next/examples/app-router',
      basePath: '/app-router',
      defaults: {
        distribution: {
          cdk: { distribution }
        }
      }
    });

    const app2 = new Nextjs(this, 'pages-router', {
      nextjsPath: '../../open-next/examples/pages-router',
      basePath: '/pages-router',
      defaults: {
        distribution: {
          cdk: { distribution }
        }
      }
    });

    new CfnOutput(this, "CloudFrontDistributionDomain", {
      value: distribution.distributionDomainName,
    });
  }
}
