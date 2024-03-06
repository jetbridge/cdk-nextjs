#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppPagesRouterStack } from './app-pages-router-stack';

const app = new cdk.App();
new AppPagesRouterStack(app, 'app-pages-router');
