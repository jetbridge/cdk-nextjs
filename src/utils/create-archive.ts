import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export interface CreateArchiveArgs {
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
export function createArchive({ directory, zipFileName, fileGlob = '.', quiet }: CreateArchiveArgs): string {
  const zipOutDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cdk-nextjs-archive-'));

  const zipFilePath = path.join(zipOutDir, zipFileName);

  // delete existing zip file
  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath);
  }

  // run script to create zipfile, preserving symlinks for node_modules (e.g. pnpm structure)
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    // TODO: test on windows
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
    // Use spawnSync instead of execSync to avoid shell issues
    const result = spawnSync('zip', ['-ryq9', zipFilePath, fileGlob], {
      stdio: quiet ? 'ignore' : 'inherit',
      cwd: directory,
      env: { ...process.env, PATH: '/usr/bin:/bin:/usr/local/bin' },
    });

    if (result.error) {
      console.error('Failed to create zip with system zip:', result.error);
      // Fallback to full path
      const fallbackResult = spawnSync('/usr/bin/zip', ['-ryq9', zipFilePath, fileGlob], {
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

  return zipFilePath;
}
