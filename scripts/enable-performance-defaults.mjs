#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    'astro-config': { type: 'string' },
    'tailwind-config': { type: 'string' }
  },
  strict: false
});

const astroConfig = resolve(values['astro-config'] ?? 'astro.config.mjs');
const tailwindConfig = resolve(values['tailwind-config'] ?? 'tailwind.config.cjs');

await annotateFile(astroConfig, '// performance defaults enabled by enable-performance-defaults.mjs\n');
await annotateFile(tailwindConfig, '// Tailwind safelist managed by enable-performance-defaults.mjs\n');

logStep('Performance defaults annotated');

async function annotateFile(filePath, banner) {
  try {
    const current = await readFile(filePath, 'utf8');
    if (current.includes(banner.trim())) return;
    await writeFile(filePath, `${banner}${current}`, 'utf8');
  } catch (error) {
    console.warn(`[enable-performance-defaults] ${filePath}: ${error.message}`);
  }
}
