#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppRouterStack } from './stack';

const app = new cdk.App();
new AppRouterStack(app, 'ar'); // ar = app router
