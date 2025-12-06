// scripts/scraper/utils.mjs
// Shared utilities for scraper output formatting

import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';

/**
 * Ensure directory exists
 */
export async function ensureDir(path) {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

/**
 * Write JSON file with formatted output
 */
export async function writeJson(filePath, data) {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Normalize URL to pathname
 */
export function normalizeUrl(url, baseUrl) {
  try {
    const urlObj = new URL(url, baseUrl);
    if (urlObj.origin !== new URL(baseUrl).origin) return null;
    let path = urlObj.pathname || '/';
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path;
  } catch {
    return null;
  }
}

/**
 * Extract domain from URL
 */
export function getDomain(url) {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

