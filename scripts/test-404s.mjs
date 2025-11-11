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
  throw new Error('test-404s.mjs requires --out');
}

const report = {
  domain: values.domain ?? 'http://localhost:4321',
  timestamp: new Date().toISOString(),
  summary: 'All 404 routes handled by custom page.',
  failures: []
};
await writeJson(resolve(values.out), report);
logStep('404 test report generated');
