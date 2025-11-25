#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { ensureDir, ensurePlaceholderImage, samplePages, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    urls: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('download-media.mjs requires --out');
}

const outDir = resolve(values.out);
await ensureDir(outDir);
const pages = samplePages();

for (const page of pages) {
  const slug = page.url === '/' ? 'home' : page.url.replace(/^\//, '').replace(/\//g, '-');
  await ensurePlaceholderImage(outDir, `${slug}.svg`);
}

await ensurePlaceholderImage(outDir, 'hero.svg');

logStep(`Placeholder media generated in ${outDir}`);
