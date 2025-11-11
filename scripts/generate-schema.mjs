#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readJson, writeJson, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    model: { type: 'string' },
    business: { type: 'string' },
    content: { type: 'string' },
    out: { type: 'string' }
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

const schema = {
  ...base,
  name: base.name ?? 'Aveda Institute',
  description: base.description ?? 'Aveda Institute sample schema for automation workflows.',
  url: base.url ?? 'https://www.aveda.edu',
  areaServed: content.pages?.map((page) => page.title).slice(0, 5) ?? []
};

await writeJson(resolve(values.out), schema);
logStep(`Schema written to ${values.out}`);
