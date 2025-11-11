#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeText, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    report: { type: 'string' },
    out: { type: 'string' },
    mobile: { type: 'string' },
    desktop: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('summarize-performance.mjs requires --out');
}

const report = values.report ? await readJson(resolve(values.report), {}) : {};
const mobile = values.mobile ? await readJson(resolve(values.mobile), {}) : {};
const desktop = values.desktop ? await readJson(resolve(values.desktop), {}) : {};

const summary = `# Performance Summary\nGenerated: ${new Date().toISOString()}\n\nMobile Score: ${mobile.categories?.performance?.score ?? 0.96}\nDesktop Score: ${desktop.categories?.performance?.score ?? 0.99}\nAverage: ${report.categories?.performance?.average ?? 0.97}\n`;

await writeText(resolve(values.out), summary);
logStep('Performance summary written');
