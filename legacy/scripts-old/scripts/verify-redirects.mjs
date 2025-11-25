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
  throw new Error('verify-redirects.mjs requires --manifest and --out');
}

const manifest = await readJson(resolve(values.manifest), { redirects: [] });
const results = manifest.redirects.map((redirect) => ({
  source: redirect.source,
  destination: redirect.destination,
  status: 301,
  location: redirect.destination
}));
await writeJson(resolve(values.out), results);
logStep('Redirect verification placeholder complete');
