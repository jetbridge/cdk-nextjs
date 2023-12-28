import { execSync } from 'node:child_process';
import { Dirent, cpSync, existsSync, mkdtempSync, readdirSync, renameSync, rmSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
  const zipOutDir = mkdtempSync(join(tmpdir(), 'cdk-nextjs-archive-'));
  const zipFilePath = join(zipOutDir, zipFileName);

  if (existsSync(zipFilePath)) {
    // delete existing zip file
    unlinkSync(zipFilePath);
  }

  const isWindows = process.platform === 'win32';
  // needed for PNPM
  if (isWindows) {
    const nodeModulesDir = join(directory, 'node_modules');
    const files = readdirSync(nodeModulesDir, { recursive: true, withFileTypes: true });
    if (files.some((f) => f.isSymbolicLink())) {
      // Compress-Archive doesn't support resolving symlinks like `zip` command
      // does with -y option. Therefore, we need to resolve symlinks then compress.
      resolveSymlinks(files);
    }
    execSync(`Compress-Archive -Path '${directory}\\*' -DestinationPath '${zipFilePath}' -CompressionLevel Optimal`, {
      stdio: 'inherit',
      shell: 'powershell.exe',
    });
  } else {
    execSync(`zip -ryq9 '${zipFilePath}' ${fileGlob}`, {
      stdio: quiet ? 'ignore' : 'inherit',
      cwd: directory,
    });
  }
  // check output
  if (!existsSync(zipFilePath)) {
    throw new Error(
      `There was a problem generating the archive for ${directory}; the archive is missing in ${zipFilePath}.`
    );
  }

  return zipFilePath;
}

/**
 * Resolve symlinks
 */
function resolveSymlinks(files: Dirent[]) {
  for (const file of files) {
    if (file.isSymbolicLink()) {
      const tmpDir = mkdtempSync(join(tmpdir(), `${file.name}-`));
      // cannot do `cpSync` to resolve symlinks in-place so must use temp dir
      const path = join(file.path, file.name);
      cpSync(path, tmpDir, { recursive: true, dereference: true, force: true });
      rmSync(path, { recursive: true });
      renameSync(tmpDir, path);
    }
  }
}
