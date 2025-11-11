#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeText, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    redirects: { type: 'string' },
    dns: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('compile-migration-checklist.mjs requires --out');
}

const redirects = values.redirects ? await readJson(resolve(values.redirects), {}) : {};
const dns = values.dns ? await readJson(resolve(values.dns), {}) : {};
const content = `# Migration Checklist\nGenerated: ${new Date().toISOString()}\n\n- Redirect failures: ${redirects.failures?.length ?? 0}\n- DNS verified: ${dns.status ?? 'unknown'}\n- Analytics configured: pending\n`;
await writeText(resolve(values.out), content);
logStep('Migration checklist compiled');
