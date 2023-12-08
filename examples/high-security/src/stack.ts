import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Nextjs, NextjsDistributionProps } from 'cdk-nextjs-standalone';
import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2';
import { Function as CdkFunction, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { DistributionProps, SecurityPolicyProtocol } from 'aws-cdk-lib/aws-cloudfront';

export class HighSecurityStack extends Stack {
  private nextjs: Nextjs;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const webAcl = this.createWebAcl();

    this.nextjs = new Nextjs(this, 'nextjs', {
      nextjsPath: '../../open-next/examples/app-router',
      skipBuild: false,
      defaults: {
        distribution: {
          functionUrlAuthType: FunctionUrlAuthType.AWS_IAM,
          cdk: {
            distribution: {
              webAclId: webAcl.attrArn,
            } as unknown as DistributionProps,
          },
        } satisfies Partial<NextjsDistributionProps>,
      }
    });
    this.retainEdgeFnOnDelete();

    new CfnOutput(this, "CloudFrontDistributionDomain", {
      value: this.nextjs.distribution.distributionDomain,
    });
  }

  /**
   * Don't fail on CloudFormation delete due to replicated function
   * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-delete-replicas.html
   */
  private retainEdgeFnOnDelete() {
    const edgeFn = this.nextjs.distribution?.node
      .tryFindChild("EdgeFn")
      ?.node.tryFindChild("Fn");
    if (edgeFn instanceof CdkFunction) {
      edgeFn.applyRemovalPolicy(RemovalPolicy.RETAIN);
    }
  }

  private createWebAcl() {
    return new CfnWebACL(this, "WebAcl", {
      defaultAction: {
        allow: {}, // allow if no managed rule matches
      },
      scope: "CLOUDFRONT",
      rules: [
        {
          // Set the override action to none to leave the rule group rule actions in effect
          overrideAction: { none: {} },
          name: "AWSManagedRulesCommonRuleSet",
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesCommonRuleSet",
            },
          },
          priority: 10,
          visibilityConfig: {
            cloudWatchMetricsEnabled: false,
            metricName: "AWSManagedRulesCommonRuleSetMetric",
            sampledRequestsEnabled: false,
          },
        }
      ],
      visibilityConfig: {
        cloudWatchMetricsEnabled: false,
        metricName: "WebACLMetrics",
        sampledRequestsEnabled: false,
      }
    });
  }
}
