import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as esbuild from 'esbuild';

interface BundleFunctionArgs {
  inputPath: string;
  outputFilename?: string;
  outputPath?: string;
  bundleOptions: esbuild.BuildOptions;
}

/**
 * Compile a function handler with esbuild.
 * @returns app bundle directory path
 */
export function bundleFunction({ inputPath, outputPath, outputFilename, bundleOptions }: BundleFunctionArgs) {
  if (!outputPath) {
    if (!outputFilename) outputFilename = 'index.js';
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

  return outputPath;
}
