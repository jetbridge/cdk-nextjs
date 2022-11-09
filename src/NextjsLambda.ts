import * as os from 'os';
import * as path from 'path';
import { Duration, RemovalPolicy, Token } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Function, FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as s3Assets from 'aws-cdk-lib/aws-s3-assets';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as fs from 'fs-extra';
import { bundleFunction } from './BundleFunction';
import { CONFIG_ENV_JSON_PATH } from './Nextjs';
import { NextjsBaseProps } from './NextjsBase';
import { createArchive, NextjsBuild } from './NextjsBuild';
import { NextjsLayer } from './NextjsLayer';
import { getS3ReplaceValues, NextjsS3EnvRewriter } from './NextjsS3EnvRewriter';

export type EnvironmentVars = Record<string, string>;

function getEnvironment(props: NextjsLambdaProps): { [name: string]: string } {
  const environmentVariables: { [name: string]: string } = {
    ...props.environment,
    ...props.function?.environment,
    ...(props.nodeEnv ? { NODE_ENV: props.nodeEnv } : {}),
  };

  return environmentVariables;
}

export interface NextjsLambdaProps extends NextjsBaseProps {
  /**
   * Built nextJS application.
   */
  readonly nextBuild: NextjsBuild;

  /**
   * Override function properties.
   */
  readonly function?: FunctionOptions;
}

const RUNTIME = lambda.Runtime.NODEJS_16_X;

/**
 * Build a lambda function from a NextJS application to handle server-side rendering, API routes, and image optimization.
 */
export class NextJsLambda extends Construct {
  configBucket: Bucket;
  lambdaFunction: Function;

  constructor(scope: Construct, id: string, props: NextjsLambdaProps) {
    super(scope, id);
    const { nextBuild, function: functionOptions } = props;

    // bundle server handler
    // delete default nextjs handler if it exists
    const defaultServerPath = path.join(nextBuild.nextStandaloneDir, props.nextjsPath, 'server.js');
    if (fs.existsSync(defaultServerPath)) {
      fs.unlinkSync(defaultServerPath);
    }

    // build our server handler in build.nextStandaloneDir
    const serverHandler = path.resolve(__dirname, '../assets/lambda/NextJsHandler.ts');
    // server should live in the same dir as the nextjs app to access deps properly
    const serverPath = path.join(props.nextjsPath, 'server.cjs');
    bundleFunction({
      inputPath: serverHandler,
      outputPath: path.join(nextBuild.nextStandaloneDir, serverPath),
      bundleOptions: {
        bundle: true,
        minify: false,
        sourcemap: true,
        target: 'node16',
        platform: 'node',
        external: ['sharp', 'next'],
        format: 'cjs', // hope one day we can use esm
      },
    });

    // zip up the standalone directory
    const zipOutDir = path.resolve(
      props.tempBuildDir
        ? path.resolve(path.join(props.tempBuildDir, `standalone`))
        : fs.mkdtempSync(path.join(os.tmpdir(), 'standalone-'))
    );
    const zipFilePath = createArchive({
      directory: nextBuild.nextStandaloneDir,
      zipFileName: 'standalone.zip',
      zipOutDir,
      fileGlob: '*',
      quiet: props.quiet,
    });
    if (!zipFilePath) throw new Error('Failed to create archive for lambda function code');

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
    const environment = getEnvironment(props);
    const fn = new Function(scope, 'ServerHandler', {
      memorySize: functionOptions?.memorySize || 1024,
      timeout: functionOptions?.timeout ?? Duration.seconds(10),
      runtime: RUNTIME,
      handler: path.join(props.nextjsPath, 'server.handler'),
      layers: [nextLayer],
      code,
      environment,

      ...functionOptions,
    });
    this.lambdaFunction = fn;

    // put JSON file with env var replacements in S3
    const [configBucket, configDeployment] = this.createConfigBucket(props);
    this.configBucket = configBucket;

    // replace env var placeholders in the lambda package with resolved values
    const rewriter = new NextjsS3EnvRewriter(this, 'LambdaCodeRewriter', {
      ...props,
      s3Bucket: s3asset.bucket,
      s3keys: [s3asset.s3ObjectKey],
      replacementConfig: {
        // use json file in S3 for replacement values
        // this can contain backend secrets so better to not have them in custom resource logs
        jsonS3Bucket: configDeployment.deployedBucket,
        jsonS3Key: CONFIG_ENV_JSON_PATH,
      },
      debug: true, // enable for more verbose output from the rewriter function
    });
    rewriter.node.addDependency(s3asset);

    // in order to create this dependency, the lambda function needs to be a child of the current construct
    // meaning we can't inherit from Function
    fn.node.addDependency(rewriter); // don't deploy lambda until rewriter is done - we are sort of 'intercepting' the deployment package
  }

  // this can hold our resolved environment vars for the server
  protected createConfigBucket(props: NextjsLambdaProps) {
    // won't work until this is fixed: https://github.com/aws/aws-cdk/issues/19257
    const bucket = new Bucket(this, 'NextjsConfigBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // convert environment vars to SSM parameters
    // (workaround for the above issue)
    const env = getEnvironment(props); // env vars
    const replacements = getS3ReplaceValues(env, false); // get placeholder => replacement values
    const replacementParams: EnvironmentVars = {}; // JSON file with replacements to be uploaded to S3
    Object.entries(replacements).forEach(([key, value]) => {
      // is it a token?
      if (typeof value === 'undefined') return;
      if (!value || !Token.isUnresolved(value)) {
        replacementParams[key] = value;
        return;
      }

      // create param
      const param = new StringParameter(this, `Config('${key}')`, {
        stringValue: value,
      });

      // add to env JSON
      replacementParams[key] = param.stringValue;
    });

    // upload environment config to s3
    const deployment = new BucketDeployment(this, 'EnvJsonDeployment', {
      sources: [
        // serialize as JSON to S3 object
        Source.jsonData(CONFIG_ENV_JSON_PATH, replacementParams),
      ],
      destinationBucket: bucket,
    });
    return [bucket, deployment] as const;
  }
}
