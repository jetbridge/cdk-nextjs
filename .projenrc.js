const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Mischa Spiegelmock',
  authorAddress: 'me@mish.dev',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'nextjs-cdk',
  repositoryUrl: 'https://github.com/revmischa/nextjs-cdk.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();