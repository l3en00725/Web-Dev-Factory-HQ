#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeText, samplePages, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    content: { type: 'string' },
    urls: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('summarize-crawl.mjs requires --out');
}

const contentMap = values.content ? await readJson(resolve(values.content), { pages: samplePages() }) : { pages: samplePages() };
const urlsPath = values.urls ? resolve(values.urls) : 'N/A';
const report = `# Crawl Summary\nGenerated: ${new Date().toISOString()}\n\nPages: ${contentMap.pages.length}\nURL Inventory: ${urlsPath}\n`; 
await writeText(resolve(values.out), report);

logStep(`Crawl summary generated at ${values.out}`);
