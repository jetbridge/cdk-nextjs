import { AwsCustomResource, AwsCustomResourcePolicy, AwsSdkCall } from 'aws-cdk-lib/custom-resources';
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
        resources: [`distribution/${props.distributionId}`],
      }),
    });
    for (const dependency of props.dependencies) {
      dependency.node.addDependency(awsCustomResource);
    }
  }
}
