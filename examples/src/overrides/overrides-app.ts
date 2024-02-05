#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { OverridesStack } from './overrides-stack';

const app = new cdk.App();
new OverridesStack(app, 'overrides');
