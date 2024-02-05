import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Function as CdkFunction, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2';
import { NagSuppressions } from 'cdk-nag';
import { Nextjs } from 'cdk-nextjs-standalone';
import { Construct } from 'constructs';

export class CdkNagStack extends Stack {
  private nextjs: Nextjs;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const webAcl = this.createWebAcl();

    this.nextjs = new Nextjs(this, 'nextjs', {
      nextjsPath: '../open-next/examples/app-router',
      skipBuild: true,
      overrides: {
        nextjs: {
          nextjsDistributionProps: {
            functionUrlAuthType: FunctionUrlAuthType.AWS_IAM,
          },
        },
        nextjsDistribution: {
          distributionProps: {
            webAclId: webAcl.attrArn,
          },
        },
      },
    });
    this.retainEdgeFnOnDelete();
    this.suppressNags();

    new CfnOutput(this, 'CloudFrontDistributionDomain', {
      value: this.nextjs.distribution.distributionDomain,
    });
  }

  /**
   * Don't fail on CloudFormation delete due to replicated function
   * @link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-delete-replicas.html
   */
  private retainEdgeFnOnDelete() {
    const edgeFn = this.nextjs.distribution?.node
      .tryFindChild('EdgeFn')
      ?.node.tryFindChild('Fn');
    if (edgeFn instanceof CdkFunction) {
      edgeFn.applyRemovalPolicy(RemovalPolicy.RETAIN);
    }
  }

  private createWebAcl() {
    return new CfnWebACL(this, 'WebAcl', {
      defaultAction: {
        allow: {}, // allow if no managed rule matches
      },
      scope: 'CLOUDFRONT',
      rules: [
        {
          // Set the override action to none to leave the rule group rule actions in effect
          overrideAction: { none: {} },
          name: 'AWSManagedRulesCommonRuleSet',
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
            },
          },
          priority: 10,
          visibilityConfig: {
            cloudWatchMetricsEnabled: false,
            metricName: 'AWSManagedRulesCommonRuleSetMetric',
            sampledRequestsEnabled: false,
          },
        },
      ],
      visibilityConfig: {
        cloudWatchMetricsEnabled: false,
        metricName: 'WebACLMetrics',
        sampledRequestsEnabled: false,
      },
    });
  }

  private suppressNags() {
    const staticAssetsBucket = this.nextjs.node
      .findChild('StaticAssets')
      .node.findChild('Bucket')
      .node.findChild('Resource');
    NagSuppressions.addResourceSuppressions(staticAssetsBucket, [
      {
        id: 'AwsSolutions-S1',
        reason: 'Server access logs not needed on Next.js bucket',
      },
    ]);
    const bucketDeployment = this.nextjs.node
      .findChild('StaticAssets')
      .node.tryFindChild('BucketDeployment');
    if (bucketDeployment) {
      // bucket deployment is undefined on cdk destroy
      const bucketDeploymentFnPolicy = bucketDeployment.node
        .findChild('Fn')
        .node.findChild('ServiceRole')
        .node.findChild('DefaultPolicy')
        .node.findChild('Resource');
      NagSuppressions.addResourceSuppressions(bucketDeploymentFnPolicy, [
        {
          id: 'AwsSolutions-IAM5',
          reason:
            'Bucket Deployment lambda can access any object in code asset bucket',
        },
      ]);
    }
    const serverFnPolicy = this.nextjs.node
      .findChild('Server')
      .node.findChild('Fn')
      .node.findChild('ServiceRole')
      .node.findChild('DefaultPolicy')
      .node.findChild('Resource');
    NagSuppressions.addResourceSuppressions(serverFnPolicy, [
      {
        id: 'AwsSolutions-IAM5',
        reason:
          'Next.js server function can read/write any object in Next.js bucket',
      },
    ]);
    const serverBucketDeploymentFnPolicy = this.nextjs.node
      .findChild('Server')
      .node.findChild('BucketDeployment')
      .node.findChild('Fn')
      .node.findChild('ServiceRole')
      .node.findChild('DefaultPolicy')
      .node.findChild('Resource');
    NagSuppressions.addResourceSuppressions(serverBucketDeploymentFnPolicy, [
      {
        id: 'AwsSolutions-IAM5',
        reason:
          'Next.js server bucket deployment function can read/write any object code asset bucket',
      },
    ]);
    const imgFnPolicy = this.nextjs.node
      .findChild('Image')
      .node.findChild('ServiceRole')
      .node.findChild('DefaultPolicy')
      .node.findChild('Resource');
    NagSuppressions.addResourceSuppressions(imgFnPolicy, [
      {
        id: 'AwsSolutions-IAM5',
        reason:
          'Next.js Image Optimization Function can access any object in Next.js bucket',
      },
    ]);
    const distribution = this.nextjs.node
      .findChild('Distribution')
      .node.findChild('Distribution')
      .node.findChild('Resource');
    NagSuppressions.addResourceSuppressions(distribution, [
      {
        id: 'AwsSolutions-CFR4',
        reason: 'See: https://github.com/cdklabs/cdk-nag/issues/1320',
      },
      {
        id: 'AwsSolutions-CFR3',
        reason: 'Logging not needed for Distribution',
      },
    ]);
    const revalidationQueue = this.nextjs.node
      .findChild('Revalidation')
      .node.findChild('Queue')
      .node.findChild('Resource');
    NagSuppressions.addResourceSuppressions(revalidationQueue, [
      {
        id: 'AwsSolutions-SQS3',
        reason: "Revalidation Queue doesn't need DLQ.",
      },
    ]);
  }
}
