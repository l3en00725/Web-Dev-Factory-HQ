#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { writeJson, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    business: { type: 'string' },
    location: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.business || !values.out) {
  throw new Error('detect-schema-model.mjs requires --business and --out');
}

const model = {
  '@context': 'https://schema.org',
  '@type': values.business,
  name: 'Aveda Institute',
  description: 'Aveda Institute placeholder schema model.',
  url: 'https://www.aveda.edu',
  address: {
    streetAddress: '123 Botanical Way',
    addressLocality: 'Minneapolis',
    addressRegion: 'MN',
    postalCode: '55401',
    addressCountry: 'US'
  }
};

await writeJson(resolve(values.out), model);
logStep(`Schema model generated for ${values.business}`);
