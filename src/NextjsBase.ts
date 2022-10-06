// import * as fs from 'node:fs';
// import * as path from 'path';
// import { CfnOutput, Stack, Token } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as spawn from 'cross-spawn';
// import * as micromatch from 'micromatch';
// import { BaseSiteReplaceProps } from './BaseSite';

/**
 * Common functionality for NextJS-related CDK constructs.
 */
export abstract class NextjsBase extends Construct {
  // this can hold our resolved environment vars for the server
  protected createConfigBucket() {
    // won't work until this is fixed: https://github.com/aws/aws-cdk/issues/19257
    return undefined;
    // const bucket = new s3.Bucket(this, "ConfigBucket", { removalPolicy: RemovalPolicy.DESTROY, });
    // upload environment config to s3
    // new BucketDeployment(this, 'EnvJsonDeployment', {
    //   sources: [Source.jsonData(CONFIG_ENV_JSON_PATH, this.props.environment)],
    //   destinationBucket: bucket,
    // })
    // return bucket
  }
}

/////////////////////
// Helper Functions
/////////////////////

// export function registerSiteEnvironment() {
//   const environmentOutputs: Record<string, string> = {};
//   for (const [key, value] of Object.entries(this.props.environment || {})) {
//     const outputId = `SstSiteEnv_${key}`;
//     const output = new CfnOutput(this, outputId, { value });
//     environmentOutputs[key] = Stack.of(this).getLogicalId(output);
//   }

// FIXME: SST
// const root = this.node.root as App;
// root.registerSiteEnvironment({
//   id: this.node.id,
//   path: this.props.path,
//   stack: Stack.of(this).node.id,
//   environmentOutputs,
// } as BaseSiteEnvironmentOutputsInfo);
// }

// TODO: needed for edge function support probably
// export function _getLambdaContentReplaceValues(): BaseSiteReplaceProps[] {
//   const replaceValues: BaseSiteReplaceProps[] = [];

//   // The Next.js app can have environment variables like
//   // `process.env.API_URL` in the JS code. `process.env.API_URL` might or
//   // might not get resolved on `next build` if it is used in
//   // server-side functions, ie. getServerSideProps().
//   // Because Lambda@Edge does not support environment variables, we will
//   // use the trick of replacing "{{ _SST_NEXTJS_SITE_ENVIRONMENT_ }}" with
//   // a JSON encoded string of all environment key-value pairs. This string
//   // will then get decoded at run time.
//   const lambdaEnvs: { [key: string]: string } = {};

//   Object.entries(this.props.environment || {}).forEach(([key, value]) => {
//     const token = `{{ ${key} }}`;
//     replaceValues.push(
//       ...this.replaceTokenGlobs.map((glob) => ({
//         files: glob,
//         search: token,
//         replace: value,
//       }))
//     );
//     lambdaEnvs[key] = value;
//   });

//   replaceValues.push(
//     {
//       files: '**/*.mjs',
//       search: '"{{ _SST_NEXTJS_SITE_ENVIRONMENT_ }}"',
//       replace: JSON.stringify(lambdaEnvs),
//     },
//     {
//       files: '**/*.cjs',
//       search: '"{{ _SST_NEXTJS_SITE_ENVIRONMENT_ }}"',
//       replace: JSON.stringify(lambdaEnvs),
//     },
//     {
//       files: '**/*.js',
//       search: '"{{ _SST_NEXTJS_SITE_ENVIRONMENT_ }}"',
//       replace: JSON.stringify(lambdaEnvs),
//     }
//   );

//   return replaceValues;
// }
