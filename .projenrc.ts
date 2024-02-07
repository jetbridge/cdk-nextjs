import { ProjenStruct, Struct } from '@mrgrain/jsii-struct-builder';
import { BuildOptions } from 'esbuild';
import { JsonPatch, awscdk, YamlFile } from 'projen';
import { NodePackageManager, TypeScriptCompilerOptions, UpgradeDependenciesSchedule } from 'projen/lib/javascript';

const commonProjectOptions = {
  packageManager: NodePackageManager.PNPM,
  projenCommand: 'pnpm dlx projen',
  cdkVersion: '2.121.1',
  sampleCode: false,
} satisfies Partial<awscdk.AwsCdkTypeScriptAppOptions>;

const commonTscOptions: TypeScriptCompilerOptions = {
  // isolatedModules: true, // why doesn't this work?
  skipLibCheck: true,
  // esModuleInterop: true, // why doesn't this work?
};

const rootProject = new awscdk.AwsCdkConstructLibrary({
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
  // tooling config
  ...commonProjectOptions,
  eslintOptions: {
    prettier: true,
    dirs: ['src'],
    ignorePatterns: ['examples/**/*', 'e2e-tests/', 'generated-structs/'],
  },
  projenrcTs: true,
  tsconfig: { compilerOptions: { ...commonTscOptions } },
  tsconfigDev: { compilerOptions: { ...commonTscOptions }, exclude: ['examples'] },
  gitignore: ['.idea', '.DS_Store'],
  // package config
  name: 'cdk-nextjs-standalone',
  packageName: 'cdk-nextjs-standalone',
  majorVersion: 4,
  prerelease: 'beta',
  description: 'Deploy a NextJS app to AWS using CDK. Uses standalone build and output tracing.',
  keywords: ['nextjs', 'next', 'aws-cdk', 'aws', 'cdk', 'standalone', 'iac', 'infrastructure', 'cloud', 'serverless'],
  // dependency config
  jsiiVersion: '~5.3.12',
  // cannot have "deps" b/c package can be consumed by other languages so they
  // must be bundled into "bundledDeps"
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
  ],
});

new YamlFile(rootProject, 'pnpm-workspace.yaml', {
  obj: {
    packages: ['examples'],
  },
});

const commonBundlingOptions = {
  bundle: true,
  external: ['@aws-sdk/*'],
  minify: true,
  platform: 'node',
  sourcemap: true,
  target: 'node18',
} satisfies BuildOptions;

// TODO: use sign-fn-url.lambda to use convention so we don't have to manually do this?
rootProject.bundler.addBundle('./src/lambdas/nextjs-bucket-deployment.ts', commonBundlingOptions);
rootProject.bundler.addBundle('./src/lambdas/sign-fn-url.ts', commonBundlingOptions);

fixCiBuild();
createOptionalStructs();
addE2ETests();

const examplesProject = new awscdk.AwsCdkTypeScriptApp({
  defaultReleaseBranch: 'main',
  name: 'cdk-nextjs-examples',
  parent: rootProject,
  outdir: 'examples',
  licensed: false,
  deps: ['cdk-nextjs-standalone@link:..', 'cdk-nag'],
  devDeps: ['tsx'],
  ...commonProjectOptions,
});

updateExamplesCdkJson();
updateExamplesInstallTasks();

updateEslintParserProject();

rootProject.synth();
examplesProject.synth();

/**
 * @see: ./docs/contribute#bootstrap-issues
 */
function fixCiBuild() {
  const compileStep = {
    name: 'Compile JSII',
    run: `${commonProjectOptions.projenCommand} compile`,
  };
  const buildWorkflow = rootProject.tryFindObjectFile('.github/workflows/build.yml');
  buildWorkflow?.patch(JsonPatch.add('/jobs/build/steps/4', compileStep));
  const releaseWorkflow = rootProject.tryFindObjectFile('.github/workflows/release.yml');
  releaseWorkflow?.patch(JsonPatch.replace('/jobs/release/steps/5', compileStep));
  const upgradeWorkflow = rootProject.tryFindObjectFile('.github/workflows/upgrade-main.yml');
  upgradeWorkflow?.patch(JsonPatch.replace('/jobs/upgrade/steps/4', compileStep));
}

/**
 * Makes optional versions of existing AWS CDK and cdk-nextjs props. Cannot use TS utility
 * helper, `Partial<>`, because of JSII limitations.
 */
function createOptionalStructs() {
  const getFilePath = (fileName: string) => 'src/generated-structs/' + fileName + '.ts';
  new ProjenStruct(rootProject, { name: 'OptionalFunctionProps', filePath: getFilePath('OptionalFunctionProps') })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_lambda.FunctionProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalCustomResourceProps',
    filePath: getFilePath('OptionalCustomResourceProps'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.CustomResourceProps'))
    .allOptional();
  new ProjenStruct(rootProject, { name: 'OptionalS3OriginProps', filePath: getFilePath('OptionalS3OriginProps') })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_cloudfront_origins.S3OriginProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalEdgeFunctionProps',
    filePath: getFilePath('OptionalEdgeFunctionProps'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_cloudfront.experimental.EdgeFunctionProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalCloudFrontFunctionProps',
    filePath: getFilePath('OptionalCloudFrontFunctionProps'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_cloudfront.FunctionProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalDistributionProps',
    filePath: getFilePath('OptionalDistributionProps'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_cloudfront.DistributionProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalHostedZoneProviderProps',
    filePath: getFilePath('OptionalHostedZoneProviderProps'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_route53.HostedZoneProviderProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalCertificateProps',
    filePath: getFilePath('OptionalCertificateProps'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_certificatemanager.CertificateProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalARecordProps',
    filePath: getFilePath('OptionalARecordProps'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_route53.ARecordProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalAaaaRecordProps',
    filePath: getFilePath('OptionalAaaaRecordProps'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_route53.AaaaRecordProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalTablePropsV2',
    filePath: getFilePath('OptionalTablePropsV2'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_dynamodb.TablePropsV2'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalProviderProps',
    filePath: getFilePath('OptionalProviderProps'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.custom_resources.ProviderProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalAssetProps',
    filePath: getFilePath('OptionalAssetProps'),
  })
    .mixin(Struct.fromFqn('aws-cdk-lib.aws_s3_assets.AssetProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalNextjsBucketDeploymentProps',
    filePath: getFilePath('OptionalNextjsBucketDeploymentProps'),
  })
    .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsBucketDeploymentProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalNextjsBuildProps',
    filePath: getFilePath('OptionalNextjsBuildProps'),
  })
    .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsBuildProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalNextjsStaticAssetsProps',
    filePath: getFilePath('OptionalNextjsStaticAssetsProps'),
  })
    .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsStaticAssetsProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalNextjsServerProps',
    filePath: getFilePath('OptionalNextjsServerProps'),
  })
    .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsServerProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalNextjsImageProps',
    filePath: getFilePath('OptionalNextjsImageProps'),
  })
    .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsImageProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalNextjsRevalidationProps',
    filePath: getFilePath('OptionalNextjsRevalidationProps'),
  })
    .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsRevalidationProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalNextjsDomainProps',
    filePath: getFilePath('OptionalNextjsDomainProps'),
  })
    .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsDomainProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalNextjsDistributionProps',
    filePath: getFilePath('OptionalNextjsDistributionProps'),
  })
    .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsDistributionProps'))
    .allOptional();
  new ProjenStruct(rootProject, {
    name: 'OptionalNextjsInvalidationProps',
    filePath: getFilePath('OptionalNextjsInvalidationProps'),
  })
    .mixin(Struct.fromFqn('cdk-nextjs-standalone.NextjsInvalidationProps'))
    .allOptional();
}

function addE2ETests() {
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
}

function updateExamplesCdkJson() {
  const examplesCdkJson = examplesProject.tryFindObjectFile('cdk.json');
  examplesCdkJson?.patch(JsonPatch.add('/app', 'pnpm tsx src/app-router/app-router-app.ts'));
}

/**
 * PNPM Monorepo support is not natively supported by Projen. A side-effect of
 * this is projen attempts to run the install task on all sub-projects. This is
 * undesirable for PNPM because you only need to install once at rool level.
 * The below code aims to fix it.
 */
function updateExamplesInstallTasks() {
  // Why doesn't `.removeTask()` work?
  // examplesProject.tasks.removeTask('install');
  // examplesProject.tasks.removeTask('install:ci');
  const installTask = examplesProject.tasks.tryFind('install');
  const installCiTask = examplesProject.tasks.tryFind('install:ci');
  installTask?.reset();
  installCiTask?.reset();
}

/**
 * @see https://typescript-eslint.io/blog/parser-options-project-true/
 */
function updateEslintParserProject() {
  const examplesEslintJson = examplesProject.tryFindObjectFile('.eslintrc.json');
  examplesEslintJson?.patch(JsonPatch.add('/parserOptions/project', true));
}
