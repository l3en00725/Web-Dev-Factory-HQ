#!/usr/bin/env node

/**
 * Update Hero components across service and location pages to use variant="simple"
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const patterns = [
  'src/pages/services/**/*.astro',
  'src/pages/locations/**/*.astro',
];

async function updateFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;

    // Update Hero component to add variant="simple"
    // Pattern 1: <Hero without variant
    if (content.includes('<Hero') && !content.includes('variant=')) {
      // Add variant="simple" to Hero component
      content = content.replace(
        /<Hero\s+/g,
        '<Hero\n    variant="simple"\n    '
      );
      modified = true;
    }

    // Pattern 2: Update title/subtitle to use proper props
    // This is already handled by Hero's prop normalization

    if (modified) {
      await fs.writeFile(filePath, content);
      return { success: true, file: path.relative(ROOT_DIR, filePath) };
    }

    return { success: false, file: path.relative(ROOT_DIR, filePath), reason: 'no changes needed' };
  } catch (error) {
    return { success: false, file: path.relative(ROOT_DIR, filePath), error: error.message };
  }
}

async function main() {
  console.log('🔧 Updating Hero components to use variant="simple"...\n');

  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: ROOT_DIR, absolute: true });
    files.push(...matches);
  }

  console.log(`Found ${files.length} files to check\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const result = await updateFile(file);
    if (result.success) {
      console.log(`✅ Updated: ${result.file}`);
      updated++;
    } else if (result.error) {
      console.log(`❌ Error: ${result.file} - ${result.error}`);
      errors++;
    } else {
      skipped++;
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

main().catch(console.error);

