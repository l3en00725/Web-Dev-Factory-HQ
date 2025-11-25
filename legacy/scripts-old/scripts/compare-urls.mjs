#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readFile, writeJson, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    old: { type: 'string' },
    new: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.old || !values.new || !values.out) {
  throw new Error('compare-urls.mjs requires --old, --new, --out');
}

const legacy = new Set(await readCsv(resolve(values.old)));
const modern = new Set(await readCsv(resolve(values.new)));
const missing = [...legacy].filter((url) => !modern.has(url));
await writeJson(resolve(values.out), { missing, totalLegacy: legacy.size, totalNew: modern.size });
logStep('URL comparison report generated');

async function readCsv(path) {
  try {
    const text = await readFile(path, 'utf8');
    return text
      .split('\n')
      .slice(1)
      .map((line) => line.split(',')[0]?.trim())
      .filter(Boolean);
  } catch (error) {
    console.warn(`[compare-urls] ${error.message}`);
    return [];
  }
}
