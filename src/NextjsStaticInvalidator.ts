import * as fs from 'fs';
import * as path from 'path';
import { CustomResource, Duration } from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { NextjsBaseProps } from './NextjsBase';
import { NextjsBuild } from './NextjsBuild';

export interface InvalidatorLambdaProps extends NextjsBaseProps {
  /**
   * The main CloudFront distribution
   */
  readonly distribution: Distribution;
  /**
   * Built NextJS app.
   */
  readonly nextBuild: NextjsBuild;
}

const RUNTIME = lambda.Runtime.NODEJS_18_X;

export class InvalidatorLambda extends NodejsFunction {
  readonly distribution: Distribution;
  readonly nextBuild: NextjsBuild;
  constructor(scope: Construct, id: string, props: InvalidatorLambdaProps) {
    const inputPath = path.resolve(__dirname, '../assets/lambda/CloudFrontInvalidator.ts');
    super(scope, id, {
      entry: inputPath,
      runtime: RUNTIME,
      timeout: Duration.minutes(5),
    });
    this.distribution = props.distribution;
    this.nextBuild = props.nextBuild;
    this.addPolicy();
    this.invalidate(!props.isPlaceholder);
  }

  /**
   * Adds policy statement to create invalidation and wait for status
   */
  private addPolicy(): void {
    const policyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['cloudfront:GetInvalidation', 'cloudfront:CreateInvalidation'],
      resources: ['*'],
    });

    this.addToRolePolicy(policyStatement);
  }

  public invalidate(isLive: boolean) {
    const pagesManifestPath = path.join(this.nextBuild.nextStandaloneBuildDir, 'server', 'pages-manifest.json');
    const data = fs.readFileSync(pagesManifestPath, 'utf-8');
    const pages = JSON.parse(data) as { [key: string]: string };

    const paths = [];
    for (const p in pages) {
      if (p !== '/' && pages[p].endsWith('.html')) {
        paths.push(p);
      }
    }

    const resource = new CustomResource(this, 'CloudFrontStaticInvalidation', {
      serviceToken: this.functionArn,
      properties: {
        distributionId: this.distribution.distributionId,
        paths,
        waitForInvalidation: isLive,
      },
    });
    resource.node.addDependency(this.distribution);
  }
}
