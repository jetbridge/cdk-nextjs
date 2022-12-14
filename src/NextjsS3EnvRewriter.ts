import * as path from 'path';
import { App, CustomResource, Duration, Token } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { bundleFunction } from './BundleFunction';
import { LAMBDA_RUNTIME } from './constants';
import { NextjsBaseProps } from './NextjsBase';
import { makeTokenPlaceholder, NextjsBuild } from './NextjsBuild';

// files to rewrite CloudFormation tokens in environment variables
export const replaceTokenGlobs = ['**/*.html', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.json'];

export interface RewriteReplacementsConfig {
  readonly env?: Record<string, string>; // replace keys with values in files
  readonly jsonS3Bucket?: IBucket;
  readonly jsonS3Key?: string;
}
export interface RewriterParams {
  readonly s3Bucket: IBucket;
  readonly s3keys: string[]; // files to rewrite
  readonly replacementConfig: RewriteReplacementsConfig;
  readonly debug?: boolean;
  readonly cloudfrontDistributionId?: string;
}

export interface NextjsS3EnvRewriterProps extends NextjsBaseProps, RewriterParams {
  readonly nextBuild: NextjsBuild;
}

/**
 * Rewrites variables in S3 objects after a deployment happens to
 * replace CloudFormation tokens with their values.
 * These values are not resolved at build time because they are
 * only known at deploy time.
 */
export class NextjsS3EnvRewriter extends Construct {
  constructor(scope: Construct, id: string, props: NextjsS3EnvRewriterProps) {
    super(scope, id);

    const { s3Bucket, s3keys, replacementConfig, nextBuild, debug, cloudfrontDistributionId } = props;

    if (s3keys.length === 0) return;

    const app = App.of(this) as App;

    // create a custom resource to find and replace tokenized strings in static files
    // must happen after deployment when tokens can be resolved
    // compile function
    const inputPath = path.resolve(__dirname, '../assets/lambda/S3EnvRewriter.ts');
    const outputPath = path.join(nextBuild.tempBuildDir, 'deployment-scripts', 'S3EnvRewriter.cjs');
    const handlerDir = bundleFunction({
      inputPath,
      outputPath,
      bundleOptions: {
        bundle: true,
        sourcemap: true,
        external: ['aws-sdk'],
        target: 'node16',
        platform: 'node',
        format: 'cjs',
      },
    });

    // rewriter lambda function
    const rewriteFn = new lambda.Function(this, 'RewriteOnEventHandler', {
      runtime: LAMBDA_RUNTIME,
      memorySize: 1024,
      timeout: Duration.minutes(5),
      handler: 'S3EnvRewriter.handler',
      code: lambda.Code.fromAsset(handlerDir),
      initialPolicy: [
        new iam.PolicyStatement({
          actions: ['s3:GetObject', 's3:PutObject'],
          resources: [s3Bucket.arnForObjects('*')],
        }),
        ...(cloudfrontDistributionId
          ? [
              new iam.PolicyStatement({
                actions: ['cloudfront:CreateInvalidation'],
                resources: [`arn:aws:cloudfront::${app.account}:distribution/${cloudfrontDistributionId}`],
              }),
            ]
          : []),
      ],
    });
    // grant permission to read env var config if provided
    if (replacementConfig.jsonS3Bucket && replacementConfig.jsonS3Key) {
      const bucket: IBucket =
        typeof replacementConfig.jsonS3Bucket === 'string'
          ? Bucket.fromBucketName(this, 'EnvConfigBucket', replacementConfig.jsonS3Bucket)
          : replacementConfig.jsonS3Bucket;
      rewriteFn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['s3:GetObject'],
          resources: [bucket.arnForObjects(replacementConfig.jsonS3Key)],
        })
      );
    }

    // custom resource to run the rewriter after files are copied and we can resolve token values
    const provider = new cr.Provider(this, 'RewriteStaticProvider', {
      onEventHandler: rewriteFn,
    });
    // params for the rewriter function
    const properties = {
      bucket: s3Bucket.bucketName,
      s3keys,
      replacementConfig: {
        ...replacementConfig,
        jsonS3Bucket: replacementConfig.jsonS3Bucket?.bucketName,
      },
      debug,
      cloudfrontDistributionId,
    };
    new CustomResource(this, 'RewriteStatic', {
      serviceToken: provider.serviceToken,
      properties,
    });
  }
}

// inline env vars for client and server code
// these are values to replace in built code after it's deployed to S3/lambda
export function getS3ReplaceValues(environment: Record<string, string>, publicOnly: boolean): Record<string, string> {
  const replacements: Record<string, string> = {};

  Object.entries(environment || {})
    .filter(([, value]) => Token.isUnresolved(value))
    .filter(([key]) => !publicOnly || key.startsWith('NEXT_PUBLIC_')) // don't replace server-only env vars
    .forEach(([key, value]) => {
      const token = makeTokenPlaceholder(key);
      replacements[token] = value.toString();
    });

  return replacements;
}
