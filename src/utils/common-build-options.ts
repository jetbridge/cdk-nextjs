/* eslint-disable import/no-extraneous-dependencies */
import { BuildOptions } from 'esbuild';

export const commonBundlingOptions = {
  bundle: true,
  external: ['@aws-sdk/*'],
  // format: 'esm',
  minify: true,
  platform: 'node',
  sourcemap: true,
  target: 'node18',
} satisfies BuildOptions;
