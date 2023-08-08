import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export const DEFAULT_STATIC_MAX_AGE = Duration.days(30).toSeconds();
export const DEFAULT_STATIC_STALE_WHILE_REVALIDATE = Duration.days(1).toSeconds();

export const LAMBDA_RUNTIME = Runtime.NODEJS_18_X;

/**
 * 1536mb costs 1.5x but runs twice as fast for most scenarios.
 * @see {@link https://dev.to/dashbird/4-tips-for-aws-lambda-optimization-for-production-3if1}
 */
export const DEFAULT_LAMBA_MEMORY = 1536;

export const CACHE_BUCKET_KEY_PREFIX = '_cache';

export const NEXTJS_STATIC_DIR = 'assets';
export const NEXTJS_BUILD_DIR = '.open-next';
export const NEXTJS_CACHE_DIR = 'cache';
export const NEXTJS_BUILD_MIDDLEWARE_FN_DIR = 'middleware-function';
export const NEXTJS_BUILD_REVALIDATE_FN_DIR = 'revalidation-function';
export const NEXTJS_BUILD_IMAGE_FN_DIR = 'image-optimization-function';
export const NEXTJS_BUILD_SERVER_FN_DIR = 'server-function';
