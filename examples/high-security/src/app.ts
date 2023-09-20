#!/usr/bin/env node
import { App, Aspects } from 'aws-cdk-lib';
import { HighSecurityStack } from './stack';
import { AwsSolutionsChecks } from "cdk-nag"

const app = new App();
new HighSecurityStack(app, 'hs', { env: { region: "us-east-1" } });
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
