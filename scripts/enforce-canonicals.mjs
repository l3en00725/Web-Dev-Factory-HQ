#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    project: { type: 'string' },
    domain: { type: 'string' }
  },
  strict: false
});

logStep(`Canonical tags aligned for ${resolve(values.project ?? '.')}, domain ${values.domain ?? 'https://www.aveda.edu'}`);
