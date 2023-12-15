# Nextjs Breaking Changes

## v4
- Renamed `NextjsLambda` to `NextjsServer`
- Renamed `ImageOptimizationLambda` to `NextjsImage`
- Renamed `NextjsCachePolicyProps.lambdaCachePolicy` to `NextjsCachePolicyProps.serverCachePolicy`
- Removed `NextjsOriginRequestPolicyProps.fallbackOriginRequestPolicy`
- Renamed `NextjsOriginRequestPolicyProps.lambdaOriginRequestPolicy` to `NextjsOriginRequestPolicyProps.serverOriginRequestPolicy`
- Removed `NextjsDistribution.staticCachePolicyProps`
- Renamed `NextjsDistribution.lambdaCachePolicyProps` to `NextjsDistribution.serverCachePolicyProps`
- Renamed `NextjsDistribution.lambdaOriginRequestPolicyProps` to `NextjsDistribution.serverOriginRequestPolicyProps`
- Removed `NextjsDistribution.fallbackOriginRequestPolicyProps`
- Removed `NextjsDistribution.imageOptimizationOriginRequestPolicyProps`
- NOTE: when upgrading to v4 from v3, the Lambda@Edge function will be renamed or removed. CloudFormation will fail to delete the function b/c they're replicated a take ~15 min to delete (more [here](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-delete-replicas.html)). You can either deploy CloudFormation with it's "no rollback" feature for a clean deployment or mark the Lambda@Edge function as "retain on delete".
- Remove `NextjsBuild.nextMiddlewareFnDir`
- Remove `BaseSiteEnvironmentOutputsInfo, BaseSiteReplaceProps` exports as not used anymore
- Remove `compressionLevel` to simplify configuration. We use optimal for windows or max compression for unix
- Remove `nodeEnv` because it can be configured through `environment` prop.
- Remove `sharpLayerArn` because it's not used
- Remove `projectRoot` because it's not used
- Remove `NextjsBaseProps` to simplify props
- Remove `projectRoot` as it's not being used
- Remove `tempBuildDir` as it's not being used
- Create `NextjsDomain`. Remove custom domain related props from `NextjsDistribution`.
- Add more customizable `NextjsOverrides` in favor of `NextjsDefaultsProps`. (Remove `NextjsProps.defaults`)
  - `NextjsDefaultsProps.assetDeployment` -> `NextjsOverrides.staticAssets`
  - `NextjsDefaultsProps.lambda` -> `NextjsOverrides.nextjsServer`
  - `NextjsDefaultsProps.distribution` -> `NextjsOverrides.nextjsDistribution`
- Remove `NextjsDistributionProps.originRequestPolicies` in favor of `NextjsOverrides.nextjsDistribution.*BehaviorOptions`
- Remove `NextjsDistributionProps.cachePolicies` in favor of `NextjsOverrides.nextjsDistribution.*CachePolicies`


## v3
Using open-next for building, ARM64 architecture for image handling, new build options.

## v2
SST wrapper changed, lambda/assets/distribution defaults now are in the `defaults` prop, refactored distribution settings into the new NextjsDistribution construct. If you are upgrading, you must temporarily remove the `customDomain` on your existing 1.x.x app before upgrading to >=2.x.x because the CloudFront distribution will get recreated due to refactoring, and the custom domain must be globally unique across all CloudFront distributions. Prepare for downtime.