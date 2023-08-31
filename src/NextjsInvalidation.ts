import { Stack } from 'aws-cdk-lib';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  AwsSdkCall,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export interface NextjsInvalidationProps {
  /**
   * ID of CloudFront Distribution to invalidate
   */
  readonly distributionId: string;
  /**
   * Constructs that should complete before invalidating CloudFront Distribution.
   *
   * Useful for assets that must be deployed/updated before invalidating.
   */
  readonly dependencies: Construct[];
}

export class NextjsInvalidation extends Construct {
  constructor(scope: Construct, id: string, props: NextjsInvalidationProps) {
    super(scope, id);
    const awsSdkCall: AwsSdkCall = {
      // make `physicalResourceId` change each time to invalidate CloudFront
      // distribution on each change
      physicalResourceId: PhysicalResourceId.of(`${props.distributionId}-${Date.now()}`),
      action: 'createInvalidation',
      service: 'CloudFront',
      parameters: {
        DistributionId: props.distributionId,
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
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [
          Stack.of(this).formatArn({
            service: 'cloudfront',
            resource: `distribution/${props.distributionId}`,
          }),
        ],
      }),
    });
    for (const dependency of props.dependencies) {
      dependency.node.addDependency(awsCustomResource);
    }
  }
}
