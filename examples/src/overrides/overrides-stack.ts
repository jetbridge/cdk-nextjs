import { CfnOutput, Stack, StackProps, Duration, SymlinkFollowMode } from 'aws-cdk-lib';
import { PriceClass } from 'aws-cdk-lib/aws-cloudfront';
import { Billing, Capacity } from 'aws-cdk-lib/aws-dynamodb';
import { Nextjs } from 'cdk-nextjs-standalone';
import { Construct } from 'constructs';

/**
 * This stack showcases how to use the `overrides` prop.
 */
export class OverridesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const nextjs = new Nextjs(this, 'nextjs', {
      nextjsPath: '../../open-next/examples/app-router',
      buildCommand: 'npx open-next@^2 build',
      // skipBuild: true,
      overrides: {
        nextjs: {
          nextjsBuildProps: {},
          nextjsDistributionProps: {},
          nextjsDomainProps: {},
          nextjsImageProps: {},
          nextjsInvalidationProps: {},
          nextjsRevalidationProps: {},
          nextjsServerProps: {},
          nextjsStaticAssetsProps: {},
        },
        nextjsBucketDeployment: {
          functionProps: {
            memorySize: 512,
          },
        },
        nextjsDistribution: {
          cloudFrontFunctionProps: {
            comment: 'My CloudFront Function',
          },
          distributionProps: {
            priceClass: PriceClass.PRICE_CLASS_100,
          },
          edgeFunctionProps: {
            memorySize: 256,
          },
          imageBehaviorOptions: {},
          imageCachePolicyProps: {
            maxTtl: Duration.days(30),
          },
          imageHttpOriginProps: {
            customHeaders: { 'x-custom-image-header': '1' },
          },
          s3OriginProps: {
            customHeaders: { 'x-custom-s3-header': '3' },
          },
          serverBehaviorOptions: {},
          serverCachePolicyProps: {
            maxTtl: Duration.seconds(10),
          },
          serverHttpOriginProps: {
            customHeaders: { 'x-custom-server-header': '2' },
          },
          staticBehaviorOptions: {
            smoothStreaming: true,
          },
        },
        nextjsDomain: {
          aaaaRecordProps: {
            ttl: Duration.minutes(45),
          },
          aRecordProps: {
            ttl: Duration.minutes(15),
          },
          certificateProps: {
            transparencyLoggingEnabled: true,
          },
          hostedZoneProviderProps: {},
        },
        nextjsImage: {
          functionProps: {
            memorySize: 640,
          },
        },
        nextjsInvalidation: {
          awsCustomResourceProps: {
            timeout: Duration.minutes(3),
          },
        },
        nextjsRevalidation: {
          insertCustomResourceProps: {},
          insertFunctionProps: {
            memorySize: 768,
          },
          insertProviderProps: {
            totalTimeout: Duration.minutes(1),
          },
          queueFunctionProps: {
            memorySize: 896,
          },
          queueProps: {
            visibilityTimeout: Duration.seconds(45),
          },
          tableProps: {
            billing: Billing.provisioned({
              readCapacity: Capacity.autoscaled({ maxCapacity: 10 }),
              writeCapacity: Capacity.autoscaled({ maxCapacity: 10 }),
            }),
          },
        },
        nextjsServer: {
          nextjsBucketDeploymentProps: {},
          destinationCodeAssetProps: {
            exclude: ['secrets'],
          },
          functionProps: {
            memorySize: 1024,
          },
          sourceCodeAssetProps: {
            exclude: ['secrets'],
          },
        },
        nextjsStaticAssets: {
          assetProps: {
            followSymlinks: SymlinkFollowMode.BLOCK_EXTERNAL,
          },
          bucketProps: {
            versioned: true,
          },
          nextjsBucketDeploymentProps: {},
        },
      },
    });

    new CfnOutput(this, 'CloudFrontDistributionDomain', {
      value: nextjs.distribution.distributionDomain,
    });
  }
}
