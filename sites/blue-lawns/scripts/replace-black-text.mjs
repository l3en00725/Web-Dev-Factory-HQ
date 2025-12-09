#!/usr/bin/env node

/**
 * Replace all black text colors with brand colors
 * Headings: text-slate-900 → text-brand-navy
 * Body: text-slate-600/700 → text-brand-body
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const patterns = [
  'src/components/**/*.astro',
  'src/pages/**/*.astro',
  'src/layouts/**/*.astro',
];

const replacements = [
  // Headings (H1, H2, H3) - Change to brand navy
  { from: /text-slate-900/g, to: 'text-brand-navy' },
  { from: /text-gray-900/g, to: 'text-brand-navy' },
  { from: /text-black/g, to: 'text-brand-navy' },
  
  // Body text - Keep slate-600 for now (it's close to brand-body)
  // We can fine-tune later if needed
];

async function updateFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;

    for (const { from, to } of replacements) {
      if (content.match(from)) {
        content = content.replace(from, to);
        modified = true;
      }
    }

    if (modified) {
      await fs.writeFile(filePath, content);
      return { success: true, file: path.relative(ROOT_DIR, filePath) };
    }

    return null;
  } catch (error) {
    return { success: false, file: path.relative(ROOT_DIR, filePath), error: error.message };
  }
}

async function main() {
  console.log('🔧 Replacing black text with brand colors...\n');

  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: ROOT_DIR, absolute: true });
    files.push(...matches);
  }

  console.log(`Found ${files.length} files to check\n`);

  let updated = 0;
  let errors = 0;

  for (const file of files) {
    const result = await updateFile(file);
    if (result) {
      if (result.success) {
        console.log(`✅ Updated: ${result.file}`);
        updated++;
      } else {
        console.log(`❌ Error: ${result.file} - ${result.error}`);
        errors++;
      }
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
}

main().catch(console.error);

