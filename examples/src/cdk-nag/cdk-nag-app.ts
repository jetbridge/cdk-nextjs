#!/usr/bin/env node
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { CdkNagStack } from './cdk-nag-stack';

const app = new App();
const cdkNagStack = new CdkNagStack(app, 'cdk-nag', { env: { region: 'us-east-1' } });
NagSuppressions.addStackSuppressions(cdkNagStack, [
  {
    id: 'AwsSolutions-IAM4',
    appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'],
    reason: 'The Lambda Basic Execution Role does not grant excessive access',
  },
]);
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
