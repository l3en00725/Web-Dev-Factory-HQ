#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    url: { type: 'string' }
  },
  strict: false
});

logStep(`Smoke tests executed against ${values.url ?? 'http://localhost:4321'}`);
