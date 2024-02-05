#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PagesRouterStack } from './pages-router-stack';

const app = new cdk.App();
new PagesRouterStack(app, 'pages-router');
