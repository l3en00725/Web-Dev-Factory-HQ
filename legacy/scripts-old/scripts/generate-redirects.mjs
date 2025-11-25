#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { ensureDir, writeJson, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    legacy: { type: 'string' },
    inventory: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.legacy || !values.inventory || !values.out) {
  throw new Error('generate-redirects.mjs requires --legacy, --inventory, --out');
}

const legacyRows = await readCsv(resolve(values.legacy));
const inventoryRows = await readCsv(resolve(values.inventory));
const map = new Map(inventoryRows.map((row) => [row.slug, row.url]));
const redirects = [];
const unmatched = [];
for (const row of legacyRows) {
  const target = map.get(row.slug);
  if (target) {
    redirects.push({ source: row.url, destination: target, permanent: true });
  } else {
    unmatched.push(row);
  }
}
const manifest = { redirects, generatedAt: new Date().toISOString() };
await writeJson(resolve(values.out), manifest);

const unmatchedPath = resolve('reports/migration/redirect_unmatched.csv');
await ensureDir(unmatchedPath.substring(0, unmatchedPath.lastIndexOf('/')));
const csvLines = ['url,slug', ...unmatched.map((row) => `${row.url},${row.slug}`)];
await writeFile(unmatchedPath, `${csvLines.join('\n')}\n`, 'utf8');

logStep(`Redirect manifest created with ${redirects.length} entries`);

async function readCsv(path) {
  const text = await readFile(path, 'utf8');
  return text
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, slug = ''] = line.split(',');
      return { url: url.trim(), slug: slug.trim() };
    });
}
