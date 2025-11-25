#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeText, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    schema: { type: 'string' },
    validation: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.schema || !values.validation || !values.out) {
  throw new Error('summarize-schema.mjs requires --schema, --validation, and --out');
}

const schema = await readJson(resolve(values.schema), {});
const validation = await readJson(resolve(values.validation), {});
const summary = `# Schema Summary\nGenerated: ${new Date().toISOString()}\n\nType: ${schema['@type'] ?? 'Entity'}\nStatus: ${validation.status ?? 'UNKNOWN'}\n`;
await writeText(resolve(values.out), summary);
logStep('Schema summary created');
