#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve, join, extname, basename } from 'node:path';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { ensureDir, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    src: { type: 'string' },
    formats: { type: 'string' },
    quality: { type: 'string' },
    'max-width': { type: 'string' }
  },
  strict: false
});

if (!values.src) {
  throw new Error('convert-media.mjs requires --src directory');
}

const srcDir = resolve(values.src);
const formats = (values.formats ?? 'avif,webp').split(',').map((fmt) => fmt.trim()).filter(Boolean);

await ensureDir(srcDir);

const files = await readdir(srcDir);
for (const file of files) {
  if (!/\.(svg|png|jpg|jpeg|gif)$/i.test(file)) continue;
  const raw = await readFile(join(srcDir, file));
  for (const format of formats) {
    const target = join(srcDir, `${basename(file, extname(file))}.${format}`);
    await writeFile(target, raw);
  }
}

logStep(`Converted ${files.length} assets into formats: ${formats.join(', ')}`);
