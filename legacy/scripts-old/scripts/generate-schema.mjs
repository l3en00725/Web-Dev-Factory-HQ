#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeJson, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    model: { type: 'string' },
    business: { type: 'string' },
    content: { type: 'string' },
    out: { type: 'string' },
    'price-range': { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('generate-schema.mjs requires --out');
}

const base = values.model ? await readJson(resolve(values.model), { '@context': 'https://schema.org' }) : {
  '@context': 'https://schema.org',
  '@type': values.business ?? 'Organization'
};
const content = values.content ? await readJson(resolve(values.content), { pages: [] }) : { pages: [] };

// Infer price range from business type if not specified
const inferPriceRange = (businessType) => {
  const type = (businessType || '').toLowerCase();
  if (type.includes('lawn') || type.includes('landscap')) return '$$';
  if (type.includes('plumb') || type.includes('hvac') || type.includes('electric')) return '$$$';
  if (type.includes('premium') || type.includes('luxury')) return '$$$$';
  if (type.includes('budget') || type.includes('affordable')) return '$';
  return '$$'; // Default moderate pricing
};

const schema = {
  ...base,
  name: base.name ?? 'Aveda Institute',
  description: base.description ?? 'Aveda Institute sample schema for automation workflows.',
  url: base.url ?? 'https://www.aveda.edu',
  areaServed: content.pages?.map((page) => page.title).slice(0, 5) ?? []
};

// Add priceRange for LocalBusiness types
if (schema['@type'] === 'LocalBusiness' || schema['@type']?.includes('LocalBusiness')) {
  schema.priceRange = values['price-range'] || base.priceRange || inferPriceRange(values.business);
}

await writeJson(resolve(values.out), schema);
logStep(`Schema written to ${values.out}`);
