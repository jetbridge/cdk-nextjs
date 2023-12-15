import { ProjenStruct, Struct } from '@mrgrain/jsii-struct-builder';
import { BuildOptions } from 'esbuild';
import { JsonPatch, awscdk } from 'projen';
import { TypeScriptCompilerOptions, UpgradeDependenciesSchedule } from 'projen/lib/javascript';
import {} from 'projen/lib/github';

const commonBundlingOptions = {
  bundle: true,
  external: ['@aws-sdk/*'],
  minify: true,
  platform: 'node',
  sourcemap: true,
  target: 'node18',
} satisfies BuildOptions;

const commonTscOptions: TypeScriptCompilerOptions = {
  // isolatedModules: true, // why doesn't this work?
  skipLibCheck: true,
  // esModuleInterop: true, // why doesn't this work?
};

const project = new awscdk.AwsCdkConstructLibrary({
  // repository config
  author: 'JetBridge',
  authorAddress: 'mischa@jetbridge.com',
  authorOrganization: true,
  defaultReleaseBranch: 'main',
  repositoryUrl: 'https://github.com/jetbridge/cdk-nextjs.git',
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.MONTHLY,
    },
  },
  // package config
  name: 'cdk-nextjs-standalone',
  packageName: 'cdk-nextjs-standalone',
  majorVersion: 4,
  prerelease: 'beta',
  minNodeVersion: '18.0.0',
  description: 'Deploy a NextJS app to AWS using CDK. Uses standalone build and output tracing.',
  keywords: ['nextjs', 'next', 'aws-cdk', 'aws', 'cdk', 'standalone', 'iac', 'infrastructure', 'cloud', 'serverless'],
  // tooling config
  eslintOptions: {
    prettier: true,
    dirs: ['src'],
    ignorePatterns: ['examples/', 'e2e-tests/', 'generated-structs/'],
  },
  projenrcTs: true,
  tsconfig: { compilerOptions: { ...commonTscOptions } },
  tsconfigDev: { compilerOptions: { ...commonTscOptions } },
  gitignore: ['.idea'],
  // dependency config
  jsiiVersion: '~5.0.0',
  cdkVersion: '2.110.0',
  bundledDeps: [] /* Runtime dependencies of this module. */,
  devDeps: [
    '@aws-crypto/sha256-js',
    '@aws-sdk/client-s3',
    '@mrgrain/jsii-struct-builder',
    '@smithy/signature-v4',
    '@types/adm-zip',
    '@types/aws-lambda',
    '@types/micromatch',
    '@types/mime-types',
    '@types/node@^18',
    'aws-lambda',
    'constructs',
    'jszip',
    'micromatch',
    'mime-types',
    'undici',
  ] /* Build dependencies for this module. */,
  // misc config
  sampleCode: false, // do not generate sample test files
});

project.bundler.addBundle('./src/lambdas/nextjs-bucket-deployment.ts', commonBundlingOptions);
project.bundler.addBundle('./src/lambdas/sign-fn-url.ts', commonBundlingOptions);

const buildWorkflow = project.tryFindObjectFile('.github/workflows/build.yml');
// https://github.com/mrgrain/jsii-struct-builder/issues/174#issuecomment-1850496788
buildWorkflow?.patch(JsonPatch.replace('/jobs/build/steps/4/run', 'npx projen compile && npx projen build'));

const getFilePath = (fileName: string) => 'src/generated-structs/' + fileName + '.ts';
new ProjenStruct(project, { name: 'OptionalFunctionProps', filePath: getFilePath('OptionalFunctionProps') })
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_lambda.FunctionProps'))
  .allOptional();
new ProjenStruct(project, { name: 'OptionalCustomResourceProps', filePath: getFilePath('OptionalCustomResourceProps') })
  .mixin(Struct.fromFqn('aws-cdk-lib.CustomResourceProps'))
  .allOptional();
new ProjenStruct(project, { name: 'OptionalS3OriginProps', filePath: getFilePath('OptionalS3OriginProps') })
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_cloudfront_origins.S3OriginProps'))
  .allOptional();
new ProjenStruct(project, { name: 'OptionalEdgeFunctionProps', filePath: getFilePath('OptionalEdgeFunctionProps') })
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_cloudfront.experimental.EdgeFunctionProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalCloudFrontFunctionProps',
  filePath: getFilePath('OptionalCloudFrontFunctionProps'),
})
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_cloudfront.FunctionProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalDistributionProps',
  filePath: getFilePath('OptionalDistributionProps'),
})
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_cloudfront.DistributionProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalHostedZoneProviderProps',
  filePath: getFilePath('OptionalHostedZoneProviderProps'),
})
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_route53.HostedZoneProviderProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalCertificateProps',
  filePath: getFilePath('OptionalCertificateProps'),
})
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_certificatemanager.CertificateProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalARecordProps',
  filePath: getFilePath('OptionalARecordProps'),
})
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_route53.ARecordProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalAaaaRecordProps',
  filePath: getFilePath('OptionalAaaaRecordProps'),
})
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_route53.AaaaRecordProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalTablePropsV2',
  filePath: getFilePath('OptionalTablePropsV2'),
})
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_dynamodb.TablePropsV2'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalProviderProps',
  filePath: getFilePath('OptionalProviderProps'),
})
  .mixin(Struct.fromFqn('aws-cdk-lib.custom_resources.ProviderProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalAssetProps',
  filePath: getFilePath('OptionalAssetProps'),
})
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_s3_assets.AssetProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalNextjsBucketDeploymentProps',
  filePath: getFilePath('OptionalNextjsBucketDeploymentProps'),
})
  .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsBucketDeploymentProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalNextjsBuildProps',
  filePath: getFilePath('OptionalNextjsBuildProps'),
})
  .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsBuildProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalNextjsStaticAssetsProps',
  filePath: getFilePath('OptionalNextjsStaticAssetsProps'),
})
  .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsStaticAssetsProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalNextjsServerProps',
  filePath: getFilePath('OptionalNextjsServerProps'),
})
  .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsServerProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalNextjsImageProps',
  filePath: getFilePath('OptionalNextjsImageProps'),
})
  .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsImageProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalNextjsRevalidationProps',
  filePath: getFilePath('OptionalNextjsRevalidationProps'),
})
  .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsRevalidationProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalNextjsDomainProps',
  filePath: getFilePath('OptionalNextjsDomainProps'),
})
  .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsDomainProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalNextjsDistributionProps',
  filePath: getFilePath('OptionalNextjsDistributionProps'),
})
  .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsDistributionProps'))
  .allOptional();
new ProjenStruct(project, {
  name: 'OptionalNextjsInvalidationProps',
  filePath: getFilePath('OptionalNextjsInvalidationProps'),
})
  .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsInvalidationProps'))
  .allOptional();

// const e2eTestsWorkflow = project.github?.addWorkflow('e2e-tests');
// e2eTestsWorkflow?.on({ pullRequest: { branches: ['main'] } });
// e2eTestsWorkflow?.addJob('run-e2e-tests', {
//   runsOn: ['ubuntu-latest'],
//   permissions: {},
//   steps: [
//     { uses: 'actions/checkout@v3' },
//     {
//       name: 'Setup Node.js',
//       uses: 'actions/setup-node@v3',
//       with: {
//         'node-version': '18',
//       },
//     },
//     { uses: 'pnpm/action-setup@v2', with: { run_install: false } },
//     { name: 'Setup open-next git submodule', run: 'git submodule init && git submodule update' },
//     { name: 'Install dependencies', run: 'examples/install.sh' },
//     { name: 'Install Playwright Browsers', run: 'pnpx playwright install --with-deps' },
//     // TODO: cache browsers?
//     { name: 'Install CDK', run: 'pnpm add -g aws-cdk' },
//     { name: 'Deploy App Router', run: 'cdk deploy', workingDirectory: 'examples/app-router' },
//     { name: 'Deploy Pages Router', run: 'cdk deploy', workingDirectory: 'examples/app-pages-router' },
//     { name: 'Deploy App-Pages Router', run: 'cdk deploy', workingDirectory: 'examples/pages-router' },
//     {
//       uses: 'actions/upload-artifact@v3',
//       if: 'always()',
//       with: {
//         name: 'app-router-playwright-report',
//         path: 'examples/app-router/playwright-report',
//         'retention-days': 30,
//       },
//     },
//     {
//       uses: 'actions/upload-artifact@v3',
//       if: 'always()',
//       with: {
//         name: 'pages-router-playwright-report',
//         path: 'examples/pages-router/playwright-report',
//         'retention-days': 30,
//       },
//     },
//     {
//       uses: 'actions/upload-artifact@v3',
//       if: 'always()',
//       with: {
//         name: 'app-pages-router-playwright-report',
//         path: 'examples/app-pages-router/playwright-report',
//         'retention-days': 30,
//       },
//     },
//   ],
//   timeoutMinutes: 60,
// });

project.synth();
