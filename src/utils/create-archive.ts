import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export interface CreateArchiveArgs {
  readonly directory: string;
  readonly zipFileName: string;
  readonly fileGlob?: string;
  readonly quiet?: boolean;
  readonly excludePatterns?: string[];
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
  quiet,
  excludePatterns = [],
}: CreateArchiveArgs): string {
  const zipOutDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdk-nextjs-archive-'));

  const zipFilePath = path.join(zipOutDir, zipFileName);

  // delete existing zip file
  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath);
  }

  // Prepare exclude options for zip command
  const excludeOptions: string[] = [];
  excludePatterns.forEach((pattern) => {
    excludeOptions.push('-x', pattern);
  });

  if (!quiet && excludePatterns.length > 0) {
    console.log(`[createArchive] Applying ${excludePatterns.length} exclude patterns during zip creation`);
    console.log(`[createArchive] Exclude patterns: ${excludePatterns.join(', ')}`);
  }

  // run script to create zipfile, preserving symlinks for node_modules (e.g. pnpm structure)
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    // TODO: implement exclude patterns for Windows PowerShell
    console.warn('[createArchive] Exclude patterns not yet implemented for Windows');
    const result = spawnSync(
      'powershell.exe',
      [
        '-Command',
        `Compress-Archive -Path '${directory}\\*' -DestinationPath '${zipFilePath}' -CompressionLevel Optimal`,
      ],
      {
        stdio: quiet ? 'ignore' : 'inherit',
        env: process.env,
      }
    );
    if (result.error) {
      throw result.error;
    }
  } else {
    // Build zip command with exclude patterns
    const zipArgs = ['-ryq9', zipFilePath, fileGlob, ...excludeOptions];

    if (!quiet) {
      console.log(`[createArchive] Running zip command: zip ${zipArgs.join(' ')}`);
    }

    // Use spawnSync instead of execSync to avoid shell issues
    const result = spawnSync('zip', zipArgs, {
      stdio: quiet ? 'ignore' : 'inherit',
      cwd: directory,
      env: { ...process.env, PATH: '/usr/bin:/bin:/usr/local/bin' },
    });

    if (result.error) {
      console.error('Failed to create zip with system zip:', result.error);
      // Fallback to full path
      const fallbackResult = spawnSync('/usr/bin/zip', zipArgs, {
        stdio: quiet ? 'ignore' : 'inherit',
        cwd: directory,
        env: process.env,
      });

      if (fallbackResult.error) {
        throw fallbackResult.error;
      }
    }
  }

  // check output
  if (!fs.existsSync(zipFilePath)) {
    throw new Error(
      `There was a problem generating the archive for ${directory}; the archive is missing in ${zipFilePath}.`
    );
  }

  const stats = fs.statSync(zipFilePath);
  if (!quiet) {
    console.log(`[createArchive] Created zip file: ${zipFilePath} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
  }

  return zipFilePath;
}
