#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PagesRouterStack } from './stack';

const app = new cdk.App();
new PagesRouterStack(app, 'pr'); // pr = pages router
