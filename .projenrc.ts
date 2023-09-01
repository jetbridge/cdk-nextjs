import { awscdk } from 'projen';
import { TypeScriptCompilerOptions, UpgradeDependenciesSchedule } from 'projen/lib/javascript';
import { commonBundlingOptions } from './src/utils/common-build-options';

const commonTscOptions: TypeScriptCompilerOptions = {
  isolatedModules: true, // why doesn't this work?
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
    'adm-zip',
    'aws-lambda',
    'constructs',
    'micromatch',
    'mime-types',
    'undici',
  ] /* Build dependencies for this module. */,
  // misc config
  sampleCode: false, // do not generate sample test files
});

project.bundler.addBundle('./src/lambdas/nextjs-bucket-deployment.ts', commonBundlingOptions);
project.bundler.addBundle('./src/lambdas/sign-fn-url.ts', commonBundlingOptions);

project.synth();
