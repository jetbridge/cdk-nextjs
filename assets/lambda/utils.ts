import path from 'node:path'
import fs from "node:fs"
import type { NextConfig } from 'next'

const NEXT_DIR = path.join(__dirname, '.next');

/**
 * Returns the generated nextjs server files JSON object in the ".next" folder
 */
export function getNextServerConfig() {
  const requiredServerFilesPath = path.join(NEXT_DIR, 'required-server-files.json');
  const json = fs.readFileSync(requiredServerFilesPath, 'utf-8');
  return JSON.parse(json) as { version: number, config: NextConfig };
}
export function getStaticPages(): Set<string> {
 const set = new Set<string>

 const filePath = path.join(NEXT_DIR, 'server', 'pages-manifest.json')
 const raw = fs.readFileSync(filePath, 'utf-8')
 const pages = JSON.parse(raw) as unknown as {[key:string]: string}
 for (const p in pages) {
   if (pages[p].endsWith('.html')) {
     set.add(p)
   }
 }
 return set
}
