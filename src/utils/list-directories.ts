import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * List files in directory, recursively.
 */
export function listDirectory(dir: string) {
  const fileList: string[] = [];
  const publicFiles = readdirSync(dir);
  for (const filename of publicFiles) {
    const filepath = join(dir, filename);
    const stat = statSync(filepath);
    if (stat.isDirectory()) {
      fileList.push(...listDirectory(filepath));
    } else {
      fileList.push(filepath);
    }
  }
  return fileList;
}
