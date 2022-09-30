const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Mischa Spiegelmock',
  authorAddress: 'me@mish.dev',
  cdkVersion: '2.39.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-nextjs',
  repositoryUrl: 'https://github.com/revmischa/nextjs-cdk.git',

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
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */

  eslintOptions: { prettier: true },
});
project.synth();
