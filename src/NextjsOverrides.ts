import { BehaviorOptions, CachePolicyProps } from 'aws-cdk-lib/aws-cloudfront';
import { HttpOriginProps } from 'aws-cdk-lib/aws-cloudfront-origins';
import { OptionalCloudFrontFunctionProps } from './optional-cdk-props/OptionalCloudFrontFunctionProps';
import { OptionalCustomResourceProps } from './optional-cdk-props/OptionalCustomResourceProps';
import { OptionalDistributionProps } from './optional-cdk-props/OptionalDistributionProps';
import { OptionalEdgeFunctionProps } from './optional-cdk-props/OptionalEdgeFunctionProps';
import { OptionalFunctionProps } from './optional-cdk-props/OptionalFunctionProps';
import { OptionalS3OriginProps } from './optional-cdk-props/OptionalS3OriginProps';

export interface NextjsOverrides {
  nextjsBucketDeployment: {
    functionProps: OptionalFunctionProps;
    customResourceProps: OptionalCustomResourceProps;
  };
  nextjsDistribution: {
    cloudFrontFunctionProps: OptionalCloudFrontFunctionProps;
    distributionProps: OptionalDistributionProps;
    edgeFunctionProps: OptionalEdgeFunctionProps;
    imageBehaviorOptions: BehaviorOptions;
    imageCachePolicyProps: CachePolicyProps;
    imageHttpOriginProps: HttpOriginProps;
    serverBehaviorOptions: BehaviorOptions;
    serverCachePolicyProps: CachePolicyProps;
    serverHttpOriginProps: HttpOriginProps;
    staticBehaviorOptions: BehaviorOptions;
    s3OriginProps: OptionalS3OriginProps;
  };
  nextjsDomain: {};
  nextjsImage: {};
  nextjsInvalidation: {};
  nextjsRevalidation: {};
  nextjsServer: {};
  nextjsStaticAssets: {};
}
