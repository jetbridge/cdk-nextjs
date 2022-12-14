import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export const DEFAULT_STATIC_MAX_AGE = Duration.days(30).toSeconds();
export const DEFAULT_STATIC_STALE_WHILE_REVALIDATE = Duration.days(1).toSeconds();

export const LAMBDA_RUNTIME = Runtime.NODEJS_16_X;
