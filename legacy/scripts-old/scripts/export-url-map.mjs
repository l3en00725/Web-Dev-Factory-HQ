#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { writeCsv, samplePages, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    domain: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('export-url-map.mjs requires --out');
}

const rows = samplePages().map((page) => ({ url: (values.domain ?? 'https://www.aveda.edu') + page.url, slug: page.url.replace(/^\//, '') || 'home' }));
await writeCsv(resolve(values.out), [['url', 'slug'], ...rows.map((row) => [row.url, row.slug])]);
logStep('Legacy URL map exported');
