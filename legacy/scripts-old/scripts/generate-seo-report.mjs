#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeText, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    meta: { type: 'string' },
    links: { type: 'string' },
    redirects: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('generate-seo-report.mjs requires --out');
}

const meta = values.meta ? await readJson(resolve(values.meta), {}) : {};
const links = values.links ? await readJson(resolve(values.links), {}) : {};
const report = `# SEO Post-Launch Checklist\nGenerated: ${new Date().toISOString()}\n\nMeta issues: ${meta.issues?.length ?? 0}\nOrphan pages: ${links.orphanPages?.length ?? 0}\nRedirect manifest: ${values.redirects ?? 'N/A'}\n`;
await writeText(resolve(values.out), report);
logStep('SEO report created');
