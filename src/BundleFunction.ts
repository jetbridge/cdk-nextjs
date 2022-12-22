import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { dirname } from 'path';
import * as esbuild from 'esbuild';

interface BundleFunctionArgs {
  inputPath: string;
  outputFilename?: string;
  outputPath?: string;
  bundleOptions: esbuild.BuildOptions;
}

export const ESM_BUNDLE_DEFAULTS: Partial<esbuild.BuildOptions> = {
  format: 'esm',
  mainFields: ['module', 'main'],
  banner: {
    // https://github.com/evanw/esbuild/issues/1921
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
};

/**
 * Compile a function handler with esbuild.
 * @returns bundle directory path
 */
export function bundleFunction({ inputPath, outputPath, outputFilename, bundleOptions }: BundleFunctionArgs) {
  if (!outputPath) {
    if (!outputFilename) outputFilename = bundleOptions.format === 'esm' ? 'index.mjs' : 'index.js';
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-bundling-'));
    outputPath = path.join(tempDir, outputFilename);
  }

  const esbuildResult = esbuild.buildSync({
    ...bundleOptions,
    entryPoints: [inputPath],
    outfile: outputPath,
  });
  if (esbuildResult.errors.length > 0) {
    esbuildResult.errors.forEach((error) => console.error(error));
    throw new Error('There was a problem bundling the function.');
  }

  console.debug('Bundled ', inputPath, 'to', outputPath);

  return dirname(outputPath);
}
