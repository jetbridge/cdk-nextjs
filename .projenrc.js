const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'JetBridge',
  authorAddress: 'mischa@jetbridge.com',
  cdkVersion: '2.73.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-nextjs-standalone',
  repositoryUrl: 'https://github.com/jetbridge/cdk-nextjs.git',
  authorOrganization: true,
  packageName: 'cdk-nextjs-standalone',
  description: 'Deploy a NextJS app to AWS using CDK. Uses standalone build and output tracing.',
  keywords: ['nextjs', 'next', 'aws-cdk', 'aws', 'cdk', 'standalone', 'iac', 'infrastructure', 'cloud', 'serverless'],
  eslintOptions: {
    prettier: true,
    // ignorePatterns: ['assets/**/*']
  },
  majorVersion: 3,
  // prerelease: 'pre',

  tsconfig: { compilerOptions: { noUnusedLocals: false }, include: ['assets/**/*.ts'] },
  tsconfigDev: { compilerOptions: { noUnusedLocals: false } },

  bundledDeps: [
    'cross-spawn',
    'fs-extra',
    'indent-string',
    'micromatch',
    '@aws-sdk/client-s3',
    '@types/cross-spawn',
    '@types/fs-extra',
    '@types/micromatch',
    '@types/aws-lambda',
    'esbuild@0.17.16',
    'aws-lambda',
    'serverless-http',
    'jszip',
    'glob',
    'node-fetch',
    '@aws-sdk/signature-v4',
    '@aws-crypto/sha256-js',
  ] /* Runtime dependencies of this module. */,
  devDeps: ['open-next', 'aws-sdk', 'constructs'] /* Build dependencies for this module. */,
  jestOptions: {
    jestConfig: {
      testMatch: ['<rootDir>/src/**/__tests__/**/*.ts?(x)', '<rootDir>/(test|src)/**/*(*.)@(spec|test|assets).ts?(x)'],
    },
  },

  // do not generate sample test files
  sampleCode: false,
});
// project.eslint.addOverride({
//   rules: {},
// });
// project.tsconfig.addInclude('assets/**/*.ts');
project.synth();
