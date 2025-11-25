#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { writeText, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('inject-critical-css.mjs requires --out');
}

await writeText(resolve(values.out), `/* Critical CSS placeholder */
:root {
  color-scheme: light;
}
`);

logStep('Critical CSS stub generated');
