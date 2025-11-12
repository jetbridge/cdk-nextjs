# Contribute

Hey there, we value every new contribution. Thank you! 🙏🏼

Here is a short before you get started:

1. Please make sure to create an issue first.
2. Link the bug in your pull request.
3. If first time building you must run `yarn install` and then `yarn compile`.
4. Run `yarn build` after you made your changes and before you open a pull request.

## Projen
This project uses [Projen](https://projen.io/). Don't manually update package.json or use `yarn add`. Update dependencies in .projenrc.ts then run `yarn projen`.

## JSII Struct Builder
When you want to reuse interfaces/structs from the AWS CDK library and customize them so all of their properties are optional, you cannot simply use the TypeScript utility type, [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype), because of the TypeScript [limitations](https://aws.github.io/jsii/user-guides/lib-author/typescript-restrictions/#typescript-mapped-types) of JSII. To solve this problem, this construct library uses [@mrgrain/jsii-struct-builder](https://github.com/mrgrain/jsii-struct-builder) to generate partial types. These types are defined in the .projenrc.ts files (you'll need to scroll down to see them) and are primarily used in `NextjsOverrides`. They files are in the src/generated-structs folder.

## Bootstrap Issue
`@mrgrain/jsii-struct-builder` is also used to generate optional structs of code within this repository (`OptionalNextjsBucketDeploymentProps`, etc.). In order for `@mrgrain/jsii-struct-builder` to read the source code struct to create a generate struct with optional properties, the JSII assembly must exist. If you simply run `projen build` this would fail because the JSII assembly of the source code hasn't been created yet. We can get around this issue by running `projen compile` first to create the JSII assembly, then `projen build` to use `@mrgrain/jsii-struct-builder` to create the optional version of the struct. The `.projenrc.ts` patches the build GitHub Workflow and Job to compile then build. See more [here](https://github.com/mrgrain/jsii-struct-builder/issues/174#issuecomment-1850496788).