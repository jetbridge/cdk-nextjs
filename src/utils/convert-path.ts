/**
 * Fixes windows paths. Does not alter unix paths.
 */
export function fixPath(path: string) {
  return path.replace(/\/\//g, '/');
}
