const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Mischa Spiegelmock',
  authorAddress: 'me@mish.dev',
  cdkVersion: '2.39.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-nextjs',
  repositoryUrl: 'https://github.com/jetbridge/nextjs-cdk.git',
  authorOrganization: 'JetBridge',
  packageName: 'cdk-nextjs-standalone',
  description: 'Deploy a NextJS app to AWS using CDK. Uses standalone build and output tracing.',
  keywords: ['nextjs', 'aws', 'cdk', 'standalone', 'next'],

  bundledDeps: [
    'chalk',
    'cross-spawn',
    'fs-extra',
    'indent-string',
    'micromatch',
    '@types/cross-spawn',
    '@types/fs-extra',
    '@types/micromatch',
    'esbuild',
  ] /* Runtime dependencies of this module. */,
  // devDeps: [],             /* Build dependencies for this module. */
  eslintOptions: { prettier: true, ignorePatterns: ['src/Functions/**/*'] },
});
project.synth();
