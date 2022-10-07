const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'JetBridge',
  authorAddress: 'mischa@jetbridge.com',
  cdkVersion: '2.39.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-nextjs-standalone',
  repositoryUrl: 'https://github.com/jetbridge/cdk-nextjs.git',
  authorOrganization: true,
  packageName: 'cdk-nextjs-standalone',
  description: 'Deploy a NextJS app to AWS using CDK. Uses standalone build and output tracing.',
  keywords: ['nextjs', 'next', 'aws-cdk', 'aws', 'cdk', 'standalone', 'iac', 'infrastructure', 'cloud', 'serverless'],
  eslintOptions: { prettier: true, ignorePatterns: ['assets/**/*'] },

  bundledDeps: [
    'cross-spawn',
    'fs-extra',
    'indent-string',
    'micromatch',
    '@types/cross-spawn',
    '@types/fs-extra',
    '@types/micromatch',
    'esbuild',
    'aws-lambda',
  ] /* Runtime dependencies of this module. */,
  // devDeps: [],             /* Build dependencies for this module. */
});
project.synth();
