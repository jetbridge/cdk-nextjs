const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Mischa Spiegelmock',
  authorAddress: 'me@mish.dev',
  cdkVersion: '2.39.0',
  defaultReleaseBranch: 'master',
  name: 'cdk-nextjs-standalone',
  repositoryUrl: 'https://github.com/jetbridge/nextjs-cdk.git',
  authorOrganization: 'JetBridge',
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
