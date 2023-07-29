import * as os from 'os';
import * as path from 'path';
import { Duration, PhysicalName, RemovalPolicy, Stack, Token } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Function, FunctionOptions } from 'aws-cdk-lib/aws-lambda';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import * as s3Assets from 'aws-cdk-lib/aws-s3-assets';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import * as fs from 'fs-extra';
import { LAMBDA_RUNTIME } from './constants';
import { CONFIG_ENV_JSON_PATH } from './Nextjs';
import { NextjsBaseProps } from './NextjsBase';
import { createArchive, NextjsBuild } from './NextjsBuild';
import { getS3ReplaceValues, NextjsS3EnvRewriter } from './NextjsS3EnvRewriter';

export type EnvironmentVars = Record<string, string>;

function getEnvironment(props: NextjsLambdaProps): { [name: string]: string } {
  const environmentVariables: { [name: string]: string } = {
    ...props.environment,
    ...props.lambda?.environment,
    ...(props.nodeEnv ? { NODE_ENV: props.nodeEnv } : {}),
    ...{
      CACHE_BUCKET_NAME: props.cacheBucket?.bucketName || '',
      // Note we don't need a CACHE_BUCKET_KEY_PREFIX because we're using a separate bucket for cache
      // @see: https://github.com/serverless-stack/sst/blob/master/packages/sst/src/constructs/NextjsSite.ts#L158
      // TODO: refactor this or pass in the region
      // CACHE_BUCKET_REGION: Stack.of(this).region,
    },
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
  readonly lambda?: FunctionOptions;

  /**
   * The S3 bucket holding application cache.
   */
  readonly cacheBucket: IBucket;
}

/**
 * Build a lambda function from a NextJS application to handle server-side rendering, API routes, and image optimization.
 */
export class NextJsLambda extends Construct {
  configBucket?: Bucket;
  lambdaFunction: Function;

  constructor(scope: Construct, id: string, props: NextjsLambdaProps) {
    super(scope, id);
    const { nextBuild, lambda: functionOptions, isPlaceholder } = props;

    // zip up build.nextServerFnDir
    const zipOutDir = path.resolve(
      props.tempBuildDir
        ? path.resolve(path.join(props.tempBuildDir, `standalone`))
        : fs.mkdtempSync(path.join(os.tmpdir(), 'standalone-'))
    );

    const zipFilePath = createArchive({
      directory: nextBuild.nextServerFnDir,
      zipFileName: 'serverFn.zip',
      zipOutDir,
      quiet: props.quiet,
    });
    if (!zipFilePath) throw new Error('Failed to create archive for lambda function code');

    // upload the lambda package to S3
    const s3asset = new s3Assets.Asset(scope, 'MainFnAsset', { path: zipFilePath });
    const code = isPlaceholder
      ? lambda.Code.fromInline(
          "module.exports.handler = async () => { return { statusCode: 200, body: 'SST placeholder site' } }"
        )
      : lambda.Code.fromBucket(s3asset.bucket, s3asset.s3ObjectKey);

    // build the lambda function
    const environment = getEnvironment(props);
    const fn = new Function(scope, 'ServerHandler', {
      memorySize: functionOptions?.memorySize || 1024,
      timeout: functionOptions?.timeout ?? Duration.seconds(10),
      runtime: LAMBDA_RUNTIME,
      handler: path.join('index.handler'),
      code,
      environment,
      // prevents "Resolution error: Cannot use resource in a cross-environment
      // fashion, the resource's physical name must be explicit set or use
      // PhysicalName.GENERATE_IF_NEEDED."
      functionName: Stack.of(this).region !== 'us-east-1' ? PhysicalName.GENERATE_IF_NEEDED : undefined,
      ...functionOptions,
    });
    this.lambdaFunction = fn;

    // todo: once we figure out the correct S3 bucket, make sure permissions are appropriate.
    props.cacheBucket.grantReadWrite(fn);

    // rewrite env var placeholders in server code
    const replacementParams = this._getReplacementParams(environment);
    if (!isPlaceholder && Object.keys(replacementParams).length) {
      // put JSON file with env var replacements in S3
      const [configBucket, configDeployment] = this.createConfigBucket(replacementParams);
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
  }

  private _getReplacementParams(env: Record<string, string>) {
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
    return replacementParams;
  }

  // this can hold our resolved environment vars for the server
  protected createConfigBucket(replacementParams: Record<string, string>) {
    // won't work until this is fixed: https://github.com/aws/aws-cdk/issues/19257
    const bucket = new Bucket(this, 'NextjsConfigBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
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
