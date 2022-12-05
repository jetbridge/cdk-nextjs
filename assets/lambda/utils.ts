import path from 'node:path'
import fs from "node:fs"
import type { NextConfig } from 'next'

/**
 * Returns the generated nextjs server files JSON object in the ".next" folder
 */
export function getNextServerConfig() {
  const nextDir = path.join(__dirname, '.next');
  const requiredServerFilesPath = path.join(nextDir, 'required-server-files.json');
  const json = fs.readFileSync(requiredServerFilesPath, 'utf-8');
  return JSON.parse(json) as { version: number, config: NextConfig };
}