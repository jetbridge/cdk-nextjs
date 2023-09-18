#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppPagesRouterStack } from './stack';

const app = new cdk.App();
new AppPagesRouterStack(app, 'app-pages-router-');
