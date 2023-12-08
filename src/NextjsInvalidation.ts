import { Stack } from 'aws-cdk-lib';
import { IDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  AwsCustomResource,
  AwsSdkCall,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { NextjsOverrides } from './NextjsOverrides';

export interface NextjsInvalidationProps {
  /**
   * CloudFront Distribution to invalidate
   */
  readonly distribution: IDistribution;
  /**
   * Constructs that should complete before invalidating CloudFront Distribution.
   *
   * Useful for assets that must be deployed/updated before invalidating.
   */
  readonly dependencies: Construct[];
  /**
   * Overrides
   */
  readonly overrides?: NextjsOverrides['nextjsInvalidation'];
}

export class NextjsInvalidation extends Construct {
  constructor(scope: Construct, id: string, props: NextjsInvalidationProps) {
    super(scope, id);
    const awsSdkCall: AwsSdkCall = {
      // make `physicalResourceId` change each time to invalidate CloudFront
      // distribution on each change
      physicalResourceId: PhysicalResourceId.of(`${props.distribution.distributionId}-${Date.now()}`),
      action: 'CreateInvalidationCommand',
      service: '@aws-sdk/client-cloudfront',
      parameters: {
        DistributionId: props.distribution.distributionId,
        InvalidationBatch: {
          CallerReference: new Date().toISOString(),
          Paths: {
            Quantity: 1,
            Items: ['/*'],
          },
        },
      },
    };
    const awsCustomResource = new AwsCustomResource(this, 'AwsCR', {
      onCreate: awsSdkCall,
      onUpdate: awsSdkCall,
      policy: AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          actions: ['cloudfront:CreateInvalidation'],
          resources: [
            Stack.of(this).formatArn({
              resource: `distribution/${props.distribution.distributionId}`,
              service: 'cloudfront',
              region: '',
            }),
          ],
        }),
      ]),
    });
    for (const dependency of props.dependencies) {
      dependency.node.addDependency(awsCustomResource);
    }
  }
}
