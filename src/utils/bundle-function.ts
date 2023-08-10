import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { BuildOptions, buildSync } from 'esbuild';

interface BundleFunctionArgs {
  inputPath: string;
  outputFilename?: string;
  outputPath?: string;
  bundleOptions: BuildOptions;
}

/**
 * @see https://github.com/evanw/esbuild/issues/1921
 */
export const banner = `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`;

export const commonBundlingOptions = {
  bundle: true,
  external: ['@aws-sdk/*'],
  minify: true,
  platform: 'node',
  sourcemap: true,
  target: 'node18',
} satisfies BuildOptions;

/**
 * Compile a function handler with esbuild.
 * @returns bundle directory path
 */
export function bundleFunction({ inputPath, outputPath, outputFilename, bundleOptions }: BundleFunctionArgs) {
  if (!outputPath) {
    if (!outputFilename) outputFilename = bundleOptions.format === 'esm' ? 'index.mjs' : 'index.js';
    const tempDir = mkdtempSync(join(tmpdir(), 'nextjs-bundling-'));
    outputPath = join(tempDir, outputFilename);
  }

  const esbuildResult = buildSync({
    ...commonBundlingOptions,
    entryPoints: [inputPath],
    format: 'esm',
    outfile: outputPath,
    banner: {
      js: banner,
    },
    // mainFields: ['module', 'main'],
  });
  if (esbuildResult.errors.length > 0) {
    esbuildResult.errors.forEach((error) => console.error(error));
    throw new Error('There was a problem bundling the function.');
  }

  // console.debug('Bundled ', inputPath, 'to', outputPath);

  return dirname(outputPath);
}
