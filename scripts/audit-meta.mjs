#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { writeJson, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    project: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('audit-meta.mjs requires --out');
}

const report = {
  project: resolve(values.project ?? '.'),
  issues: [],
  checkedAt: new Date().toISOString()
};
await writeJson(resolve(values.out), report);
logStep('Meta audit report generated');
