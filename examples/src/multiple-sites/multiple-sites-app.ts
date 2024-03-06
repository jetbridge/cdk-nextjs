#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MultipleSitesStack } from './multiple-sites-stack';

const app = new cdk.App();
new MultipleSitesStack(app, 'multiple-sites');
