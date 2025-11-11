#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { writeText, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    project: { type: 'string' },
    domain: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('validate-robots.mjs requires --out');
}

const content = `User-agent: *\nAllow: /\nSitemap: ${(values.domain ?? 'https://www.aveda.edu')}/sitemap.xml\n`;
await writeText(resolve(values.out), content);
logStep('robots.txt generated');
