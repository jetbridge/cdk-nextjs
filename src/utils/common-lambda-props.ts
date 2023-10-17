import { Duration, PhysicalName, Stack } from 'aws-cdk-lib';
import { Architecture, FunctionProps, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export function getCommonFunctionProps(scope: Construct): Omit<FunctionProps, 'code' | 'handler'> {
  return {
    architecture: Architecture.ARM_64,
    /**
     * 1536mb costs 1.5x but runs twice as fast for most scenarios.
     * @see {@link https://dev.to/dashbird/4-tips-for-aws-lambda-optimization-for-production-3if1}
     */
    memorySize: 1536,
    runtime: Runtime.NODEJS_18_X,
    timeout: Duration.seconds(10),
    // prevents "Resolution error: Cannot use resource in a cross-environment
    // fashion, the resource's physical name must be explicit set or use
    // PhysicalName.GENERATE_IF_NEEDED."
    functionName: Stack.of(scope).region !== 'us-east-1' ? PhysicalName.GENERATE_IF_NEEDED : undefined,
  };
}
