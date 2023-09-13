import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { CompressionLevel } from '../NextjsBase';

export interface CreateArchiveArgs {
  readonly compressionLevel?: CompressionLevel;
  readonly directory: string;
  readonly zipFileName: string;
  readonly fileGlob?: string;
  readonly quiet?: boolean;
}

/**
 * Zip up a directory and return path to zip file
 *
 * Cannot rely on native CDK zipping b/c it disregards symlinks which is necessary
 * for PNPM monorepos. See more here: https://github.com/aws/aws-cdk/issues/9251
 */
export function createArchive({
  directory,
  zipFileName,
  fileGlob = '.',
  compressionLevel = 1,
  quiet,
}: CreateArchiveArgs): string {
  const zipOutDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdk-nextjs-archive-'));
  const zipFilePath = path.join(zipOutDir, zipFileName);

  // delete existing zip file
  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath);
  }

  // run script to create zipfile, preserving symlinks for node_modules (e.g. pnpm structure)
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    const psCompressionLevel = compressionLevel === 0 ? 'NoCompression' : 'Fastest';
    // TODO: test on windows
    execSync(
      `Compress-Archive -Path '${directory}\\*' -DestinationPath '${zipFilePath}' -CompressionLevel ${psCompressionLevel}`,
      { stdio: 'inherit' }
    );
  } else {
    execSync(`zip -ryq${compressionLevel} '${zipFilePath}' ${fileGlob}`, {
      stdio: quiet ? 'ignore' : 'inherit',
      cwd: directory,
    });
  }
  // check output
  if (!fs.existsSync(zipFilePath)) {
    throw new Error(
      `There was a problem generating the archive for ${directory}; the archive is missing in ${zipFilePath}.`
    );
  }

  return zipFilePath;
}
