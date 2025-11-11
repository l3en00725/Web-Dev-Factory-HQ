#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeText, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    redirects: { type: 'string' },
    deployment: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.redirects || !values.out) {
  throw new Error('generate-indexation-report.mjs requires --redirects and --out');
}

const redirects = await readJson(resolve(values.redirects), []);
const failures = redirects.filter((row) => row.status !== 301 || row.targetStatus !== 200);
const content = `# Indexation Report\nGenerated: ${new Date().toISOString()}\nDeployment: ${values.deployment ?? 'local preview'}\nRedirects Checked: ${redirects.length}\nFailures: ${failures.length}\n`;
await writeText(resolve(values.out), content);
logStep('Indexation report created');
