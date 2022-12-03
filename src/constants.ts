import { Duration } from 'aws-cdk-lib';

export const DEFAULT_STATIC_MAX_AGE = Duration.days(30).toSeconds();
export const DEFAULT_STATIC_STALE_WHILE_REVALIDATE = Duration.days(1).toSeconds();
