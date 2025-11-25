#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readdir } from 'node:fs/promises';
import { ensureDir, writeCsv, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    pages: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.pages || !values.out) {
  throw new Error('generate-route-inventory.mjs requires --pages and --out');
}

const pagesDir = resolve(values.pages);
const outFile = resolve(values.out);

const routes = await collectRoutes(pagesDir, '');
await ensureDir(outFile.substring(0, outFile.lastIndexOf('/')));
await writeCsv(outFile, [['url', 'slug'], ...routes.map((route) => [route.url, route.slug])]);

logStep(`Route inventory written to ${outFile}`);

async function collectRoutes(directory, prefix) {
  const entries = await readdir(directory, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nested = await collectRoutes(resolve(directory, entry.name), `${prefix}/${entry.name}`);
      results.push(...nested);
    } else if (entry.isFile() && entry.name.endsWith('.astro')) {
      const slug = entry.name.replace(/\.astro$/, '') === 'index' ? '' : `/${entry.name.replace(/\.astro$/, '')}`;
      const url = (`${prefix}${slug}` || '/').replace(/\/+/, '/');
      results.push({ url: url === '' ? '/' : url, slug: url === '/' ? 'home' : url.replace(/^\//, '') });
    }
  }
  return results;
}
