import { awscdk } from 'projen';
import { TypeScriptCompilerOptions, UpgradeDependenciesSchedule } from 'projen/lib/javascript';
import { commonBundlingOptions } from './src/utils/common-build-options';

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
    ignorePatterns: ['examples/', 'e2e-tests/'],
  },
  projenrcTs: true,
  tsconfig: { compilerOptions: { ...commonTscOptions } },
  tsconfigDev: { compilerOptions: { ...commonTscOptions } },
  // dependency config
  jsiiVersion: '~5.0.0',
  cdkVersion: '2.93.0',
  bundledDeps: ['esbuild'] /* Runtime dependencies of this module. */,
  devDeps: [
    '@aws-crypto/sha256-js',
    '@aws-sdk/client-s3',
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
