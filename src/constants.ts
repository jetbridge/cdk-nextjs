import { Duration } from 'aws-cdk-lib';

export const DEFAULT_STATIC_MAX_AGE = Duration.days(30).toSeconds();
export const DEFAULT_STATIC_STALE_WHILE_REVALIDATE = Duration.days(1).toSeconds();

export const CACHE_BUCKET_KEY_PREFIX = 'cache';

export const NEXTJS_STATIC_DIR = 'assets';
export const NEXTJS_BUILD_DIR = '.open-next';
export const NEXTJS_CACHE_DIR = 'cache';
export const NEXTJS_BUILD_REVALIDATE_FN_DIR = 'revalidation-function';
export const NEXTJS_BUILD_IMAGE_FN_DIR = 'image-optimization-function';
export const NEXTJS_BUILD_SERVER_FN_DIR = 'server-function';
