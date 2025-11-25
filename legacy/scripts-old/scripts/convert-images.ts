#!/usr/bin/env bun
import { readdir, copyFile } from 'node:fs/promises';
import { resolve, join, extname, basename } from 'node:path';

const src = process.argv[2] ?? 'public';
const formats = ['webp', 'avif'];
const directory = resolve(src);

const files = await readdir(directory);
for (const file of files) {
  if (!/\.(png|jpg|jpeg)$/i.test(file)) continue;
  for (const format of formats) {
    const target = join(directory, `${basename(file, extname(file))}.${format}`);
    await copyFile(join(directory, file), target);
  }
}

console.log(`[convert-images] Generated placeholder conversions for ${files.length} files in ${directory}`);
