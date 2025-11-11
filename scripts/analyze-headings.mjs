#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { ensureDir, writeJson, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    dist: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.dist || !values.out) {
  throw new Error('analyze-headings.mjs requires --dist and --out');
}

const distDir = resolve(values.dist);
const outline = {};
const files = await readdir(distDir);
for (const file of files) {
  if (!file.endsWith('.html')) continue;
  const html = await readFile(resolve(distDir, file), 'utf8');
  const headings = [];
  const regex = /<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html))) {
    headings.push({ level: Number(match[1].replace('h', '')), text: match[2].trim() });
  }
  const route = file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`;
  outline[route] = headings;
}

await ensureDir(resolve(values.out, '..'));
await writeJson(resolve(values.out), outline);
logStep('Heading outline generated');
