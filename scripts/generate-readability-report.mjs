#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeText, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    outline: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out || !values.outline) {
  throw new Error('generate-readability-report.mjs requires --outline and --out');
}

const outline = await readJson(resolve(values.outline), {});
let report = `# LLM Readability Report\nGenerated: ${new Date().toISOString()}\n`;
for (const [route, headings] of Object.entries(outline)) {
  const hasH1 = headings.some((h) => h.level === 1);
  const hasFaq = headings.some((h) => /faq/i.test(h.text ?? ''));
  report += `\n## ${route}\nHeadings: ${headings.length}\nContains H1: ${hasH1 ? 'Yes' : 'No'}\nContains FAQ Section: ${hasFaq ? 'Yes' : 'No'}\n`;
}
await writeText(resolve(values.out), report);
logStep('LLM readability report created');
