import * as path from 'path';
import { CustomResource, Duration, Token } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { bundleFunction } from './BundleFunction';
import { NextjsBaseProps } from './NextjsBase';
import { makeTokenPlaceholder, NextjsBuild } from './NextjsBuild';

// files to rewrite CloudFormation tokens in environment variables
export const replaceTokenGlobs = ['**/*.html', '**/*.js', '**/*.cjs', '**/*.mjs', '**/*.json'];

export interface NextjsS3EnvRewriterProps extends NextjsBaseProps {
  readonly nextBuild: NextjsBuild;

  readonly s3Bucket: IBucket;
  readonly s3keys: string[]; // files to rewrite
  readonly replacements: Record<string, string>; // replace keys with values in files
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

    const { s3Bucket, s3keys, replacements, nextBuild } = props;

    if (s3keys.length === 0) return;

    // create a custom resource to find and replace tokenized strings in static files
    // must happen after deployment when tokens can be resolved
    // compile function
    const inputPath = path.resolve(__dirname, '../assets/lambda/S3StaticEnvRewriter.ts');
    const outputPath = path.join(nextBuild.tempBuildDir, 'deployment-scripts', 'S3StaticEnvRewriter.cjs');
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

    const rewriteFn = new lambda.Function(this, 'RewriteOnEventHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      memorySize: 1024,
      timeout: Duration.minutes(5),
      handler: 'S3StaticEnvRewriter.handler',
      code: lambda.Code.fromAsset(handlerDir),
      initialPolicy: [
        new iam.PolicyStatement({
          actions: ['s3:GetObject', 's3:PutObject'],
          resources: [s3Bucket.arnForObjects('*')],
        }),
      ],
    });

    // custom resource to run the rewriter after files are copied and we can resolve token values
    const provider = new cr.Provider(this, 'RewriteStaticProvider', {
      onEventHandler: rewriteFn,
    });
    new CustomResource(this, 'RewriteStatic', {
      serviceToken: provider.serviceToken,
      properties: {
        bucket: s3Bucket.bucketName,
        s3keys,
        replacements,
      },
    });
  }
}

// inline env vars for client and server code
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
