#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MultipleSitesStack } from './stack';

const app = new cdk.App();
new MultipleSitesStack(app, 'multi');
