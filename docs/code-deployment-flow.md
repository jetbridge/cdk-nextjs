# Nextjs Code Deployment Flow

Deep dive into `Nextjs` constructs code deployment flow - how your Next.js code gets deployed into AWS.

1. `cdk deploy "**"`
1. `Nextjs` is instantiated
1. `NextjsBuild` is instantiated which runs `npx open-next build` within user's Next.js repository. This command runs `next build` which creates a .next folder with build output. Then `open-next` copies the static assets and generates a cached files (ISR), server, image optimization, revalidation, and warmer lambda function handler code. When open-next's build is run, the process's environment variables, `NextjsProps.environment`, and `Nextjs.nodeEnv` are injected into the build process. However, any unresolved tokens in `NextjsProps.environment` are replaced with placeholders that look like `{{ BUCKET_NAME }}` as they're unresolved tokens so they're value looks like `${TOKEN[Bucket.Name.1234]}`. Learn more about AWS CDK Tokens [here](https://docs.aws.amazon.com/cdk/v2/guide/tokens.html). The placeholders will be replaced later in a [CloudFormation Custom Resource](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html).
1. `NextjsStaticAssets` is instantiated which creates an S3 bucket, an `Asset` for your Next.js static assets, and a `NextjsBucketDeployment`. [Asset](https://docs.aws.amazon.com/cdk/v2/guide/assets.html) is uploaded to the S3 Bucket created during CDK Bootstrap in your AWS account (not bucket created in `NextjsStaticAssets`). `NextjsBucketDeployment` is a CloudFormation Custom Resource that downloads files from the CDK Assets Bucket, updates placeholder values, and then deploys the files to the target bucket. Placeholder values were unresolved tokens at synthesis time (because they reference values where names/ids aren't known yet) but at the time the code runs in the Custom Resource Lambda Function, those values have been resolved and are passed into custom resource through `ResourceProperties`. Only the public environment variable (NEXT_PUBLIC) placeholders are passed to `NextjsBucketDeployment.substitutionConfig` because server variables shouldn't live in static assets. Learn more about Next.js environment variables [here](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables). It's important to note the deployment order so that we don't write the static assets to the bucket until they're placeholders are replaced, otherwise we risk a user downloading a file with placeholders which would result in an error.
1. `NextjsServer` is instantiated which creates an `Asset`, `NextjsBucketDeployment`, and lambda function to run Next.js server code. `NextjsBucketDeployment` will replace all (public and private) unresolved tokens within open-next generated server function code. Additional environment variables to support cache ISR feature are added: CACHE_BUCKET_NAME, CACHE_BUCKET_KEY, CACHE_BUCKET_REGION. `NextjsServer` also bundles lambda code with `esbuild`. The same note above about the important of deployment order applies here.
1. `NextjsImage` and `NextjsRevalidation` are instantiated with `Function` utilizing bundled code output from `open-next`. We don't need to replace environment variable placeholders because they don't any.
1. `NextjsInvalidation` is instantiated to invalidate CloudFront Distribution. This construct explicitly depends upon `NextjsStaticAssets`, `NextjsServer`, `NextjsImage` so that we ensure any resources that could impact cached resources (static assets, dynamic html, images) are up to date before invalidating CloudFront Distribution's cache.

## PNPM Monorepo Symlinks
_Only applicable for PNPM Monorepos_
PNPM Monorepos use symlinks between workspace node_modules and the top level node_modules. CDK Assets do not support symlinks despite the configuration options available. Therefore, we must zip up the assets ourselves. Also, `nextjs-bucket-deployment.ts` handles symlinks to unzip and zip symlinks within Lambda Custom Resources (for ServerFnBucketDeployment).


## Conditional Build Logic

`NextjjsBuild` will use the following logic to determine if a build is required or not to proceed.

```
| bundlingRequired | skipBuild | Scenario                        | Action                                            |
|------------------|-----------|---------------------------------|---------------------------------------------------|
| true             | true      | deploy/synth with reused bundle | no build, check .open-next exists, fail if not    |
| true             | false     | regular deploy/synth            | build, .open-next will exist                      |
| false            | false     | destroy                         | no build, check if .open-next exists, if not mock |
| false            | true      | destroy with reused bundle      | no build, check if .open-next exists, if not mock |
```

*bundlingRequired* = `Stack.of(this).bundlingRequired` [see](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Stack.html#bundlingrequired)
*skipBuild* = `NextjsProps.skipBuild`


Relevant GitHub Issues:
- https://github.com/aws/aws-cdk/issues/9251
- https://github.com/Stuk/jszip/issues/386#issuecomment-634773343
