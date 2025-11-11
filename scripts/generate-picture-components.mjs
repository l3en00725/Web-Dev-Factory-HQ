#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve, join, extname, basename } from 'node:path';
import { readdir } from 'node:fs/promises';
import { ensureDir, writeText, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    dir: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.dir || !values.out) {
  throw new Error('generate-picture-components.mjs requires --dir and --out');
}

const mediaDir = resolve(values.dir);
const outDir = resolve(values.out);
await ensureDir(outDir);

const files = await readdir(mediaDir);
for (const file of files) {
  if (!/\.(avif|webp|png|jpg|jpeg|svg)$/i.test(file)) continue;
  const name = basename(file, extname(file));
  const componentPath = join(outDir, `${name}.astro`);
  const component = `---
const { alt = '${name.replace(/-/g, ' ')}', class: className = '' } = Astro.props;
---
<picture class={className}>
  <img src={"/media/${file}"} alt={alt} loading="lazy" decoding="async" />
</picture>
`;
  await writeText(componentPath, component);
}

logStep(`Generated picture components in ${outDir}`);
