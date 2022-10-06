import * as path from 'path';
import { Duration } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Function, FunctionProps } from 'aws-cdk-lib/aws-lambda';
import * as s3Assets from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import * as esbuild from 'esbuild';
import * as fs from 'fs-extra';
import * as micromatch from 'micromatch';
import { listDirectory } from './NextjsAssetsDeployment';
import { NextjsBaseProps } from './NextjsBase';
import { createArchive, NextjsBuild, replaceTokenGlobs } from './NextjsBuild';
import { NextjsLayer } from './NextjsLayer';

export type EnvironmentVars = Record<string, string>;

export interface NextjsLambdaProps extends Partial<FunctionProps>, NextjsBaseProps {
  readonly build: NextjsBuild;
}

/**
 * Build a lambda function from a NextJS application to handle server-side rendering, API routes, and image optimization.
 */
export class NextJsLambda extends Function {
  // protected awsCliLayer: AwsCliLayer;

  constructor(scope: Construct, id: string, props: NextjsLambdaProps) {
    const { build } = props;

    // bundle server handler
    // delete default nextjs handler if it exists
    const defaultServerPath = path.join(build.nextStandaloneDir, props.nextjsPath, 'server.js');
    if (fs.existsSync(defaultServerPath)) {
      fs.unlinkSync(defaultServerPath);
    }

    // rewrite env var placeholders
    if (props.environment) rewriteEnvVars(props.environment, build.nextStandaloneDir);

    // build our server handler in build.nextStandaloneDir
    const serverHandler = path.resolve(__dirname, '../assets/lambda/NextJsHandler.ts');
    // server should live in the same dir as the nextjs app to access deps properly
    const serverPath = path.join(props.nextjsPath, 'server.cjs');
    const esbuildResult = esbuild.buildSync({
      entryPoints: [serverHandler],
      bundle: true,
      minify: false,
      sourcemap: true,
      target: 'node16',
      platform: 'node',
      external: ['sharp', 'next'],
      format: 'cjs', // hope one day we can use esm
      outfile: path.join(build.nextStandaloneDir, serverPath),
    });
    if (esbuildResult.errors.length > 0) {
      esbuildResult.errors.forEach((error) => console.error(error));
      throw new Error('There was a problem bundling the server.');
    }

    // zip up the standalone directory
    const zipOutDir = path.resolve(
      path.join(
        props.tempBuildDir ? path.resolve(path.join(props.tempBuildDir, `standalone`)) : fs.mkdtempSync('standalone-')
      )
    );
    const zipFilePath = createArchive({
      directory: build.nextStandaloneDir,
      zipFileName: 'standalone.zip',
      zipOutDir,
      fileGlob: '*',
    });

    // build native deps layer
    const nextLayer = new NextjsLayer(scope, 'NextjsLayer', {});

    // upload the lambda package to S3
    const s3asset = new s3Assets.Asset(scope, 'MainFnAsset', { path: zipFilePath });
    const code = props.isPlaceholder
      ? lambda.Code.fromInline(
          "module.exports.handler = async () => { return { statusCode: 200, body: 'SST placeholder site' } }"
        )
      : lambda.Code.fromBucket(s3asset.bucket, s3asset.s3ObjectKey);

    // build the lambda function
    super(scope, id, {
      ...props,
      memorySize: props.memorySize || 1024,
      timeout: props.timeout ?? Duration.seconds(10),
      runtime: props.runtime ?? lambda.Runtime.NODEJS_16_X,
      handler: path.join(props.nextjsPath, 'server.handler'),
      layers: [nextLayer],
      code,
      environment: {
        ...props.environment,
        ...(props.nodeEnv ? { NODE_ENV: props.nodeEnv } : {}),
        // TODO: shove env config into S3
        // ...(this.configBucket
        //   ? {
        //       NEXTJS_SITE_CONFIG_BUCKET_NAME: this.configBucket.bucketName,
        //       NEXTJS_SITE_CONFIG_ENV_JSON_PATH: CONFIG_ENV_JSON_PATH,
        //     }
        //   : {}),
      },
    });
  }

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

// replace env vars in the built NextJS server source
function rewriteEnvVars(environment: EnvironmentVars, nextStandaloneDir: string) {
  // undo inlining of NEXT_PUBLIC_ env vars for server code
  // https://github.com/vercel/next.js/issues/40827
  const replaceValues = getNextPublicEnvReplaceValues(environment);

  // traverse server dirs
  const searchDir = nextStandaloneDir;
  if (!fs.existsSync(searchDir)) return;

  listDirectory(searchDir).forEach((file) => {
    const relativePath = path.relative(searchDir, file);
    if (!micromatch.isMatch(relativePath, replaceTokenGlobs, { dot: true })) {
      return;
    }

    // matches file search pattern
    // do replacements
    let fileContent = fs.readFileSync(file, 'utf8');
    Object.entries(replaceValues).forEach(([key, value]) => {
      console.log(`Replacing ${key} with ${value} in ${file}`);
      fileContent = fileContent.replace(key, value);
    });
    fs.writeFileSync(file, fileContent);
  });
}

// replace inlined public env vars with calls to process.env
export function getNextPublicEnvReplaceValues(environment: EnvironmentVars): EnvironmentVars {
  return Object.fromEntries(
    Object.entries(environment || {})
      .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
      .map(([key]) => [`"{{ ${key} }}"`, `process.env.${key}`]) // will need to replace with actual value for edge functions
  );
}

/////////////////////
// FOR SST AND EDGE FUNCTIONS
// TO BE CLEANED UP LATER
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
