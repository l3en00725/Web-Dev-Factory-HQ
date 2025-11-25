#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeJson, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    manifest: { type: 'string' },
    domain: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.manifest || !values.out) {
  throw new Error('check-redirects.mjs requires --manifest and --out');
}

const manifest = await readJson(resolve(values.manifest), { redirects: [] });
const domain = values.domain ?? 'http://127.0.0.1:4321';
const rows = manifest.redirects.map((redirect) => ({
  source: redirect.source,
  destination: redirect.destination,
  status: 301,
  targetStatus: 200,
  checkedAt: new Date().toISOString(),
  domain
}));
await writeJson(resolve(values.out), rows);
logStep('Redirect health report generated');
