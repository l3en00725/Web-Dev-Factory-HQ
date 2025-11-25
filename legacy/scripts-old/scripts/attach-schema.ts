#!/usr/bin/env bun
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

const { values } = parseArgs({
  options: {
    layout: { type: 'string' },
    schema: { type: 'string' }
  },
  strict: false
});

if (!values.layout || !values.schema) {
  throw new Error('attach-schema.ts requires --layout and --schema');
}

const layoutPath = resolve(values.layout);
const schemaRelative = values.schema.startsWith('.') ? values.schema : `../${values.schema.replace(/^src\//, '')}`;

let source = await readFile(layoutPath, 'utf8');
if (!source.includes('application/ld+json')) {
  const injection = `<script type="application/ld+json">{JSON.stringify(await import('${schemaRelative}').then(m => m.default ?? m))}</script>`;
  source = source.replace('</head>', `  ${injection}\n</head>`);
  await writeFile(layoutPath, source, 'utf8');
}

console.log('[attach-schema] Layout updated with schema script tag');
