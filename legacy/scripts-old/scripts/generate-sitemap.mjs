#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeText, samplePages, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    project: { type: 'string' },
    domain: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('generate-sitemap.mjs requires --out');
}

const domain = values.domain ?? 'https://www.aveda.edu';
const pages = samplePages();
const urls = pages
  .map((page) => `  <url>\n    <loc>${domain}${page.url}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </url>`)  
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
await writeText(resolve(values.out), xml);
logStep('Sitemap generated');
