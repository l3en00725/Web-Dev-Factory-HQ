#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    domain: { type: 'string' },
    timeout: { type: 'string' }
  },
  strict: false
});

const domain = values.domain ?? 'example.com';
const timeout = Number(values.timeout ?? 900);
logStep(`Simulated DNS wait for ${domain} with timeout ${timeout}s`);
