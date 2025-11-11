#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { writeJson, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    domain: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('request-gsc-verification.mjs requires --out');
}

const report = {
  domain: values.domain ?? 'example.com',
  status: 'success',
  token: 'gsc-placeholder-token',
  verifiedAt: new Date().toISOString()
};
await writeJson(resolve(values.out), report);
logStep('GSC verification placeholder created');
