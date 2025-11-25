#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { writeText, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    _: { type: 'string', multiple: true }
  },
  allowPositionals: true,
  strict: false
});

const file = values._?.[0];
if (!file) {
  throw new Error('inline-preload-fonts.mjs requires a file path argument');
}

await writeText(resolve(file), `<!-- Font preload managed by inline-preload-fonts.mjs at ${new Date().toISOString()} -->`);
logStep('Inline font preload placeholder inserted');
