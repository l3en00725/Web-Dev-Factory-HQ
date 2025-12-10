#!/usr/bin/env node
/**
 * Optimize before/after images for better page weight
 * Target: Reduce 3.3MB + 1.4MB = 4.7MB to ~400KB total
 */

import sharp from 'sharp';
import { statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BEFORE_INPUT = join(__dirname, 'src/assets/images/general/before-yard.jpg');
const AFTER_INPUT = join(__dirname, 'src/assets/images/general/after-yard.jpg');

const BEFORE_AVIF = join(__dirname, 'src/assets/images/general/before-yard.avif');
const BEFORE_WEBP = join(__dirname, 'src/assets/images/general/before-yard-optimized.webp');

const AFTER_AVIF = join(__dirname, 'src/assets/images/general/after-yard.avif');
const AFTER_WEBP = join(__dirname, 'src/assets/images/general/after-yard-optimized.webp');

async function optimizeImage(inputPath, outputAvif, outputWebp, label) {
  console.log(`\n🔄 Optimizing ${label}...`);
  
  const originalSize = statSync(inputPath).size;
  console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
  
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  // Target width (4:3 aspect, reasonable for lazy-loaded images)
  const targetWidth = 1200;
  
  // Generate AVIF
  await image
    .clone()
    .resize(targetWidth, null, { fit: 'inside', withoutEnlargement: true })
    .avif({ quality: 65, effort: 6 })
    .toFile(outputAvif);
  
  const avifSize = statSync(outputAvif).size;
  console.log(`   AVIF: ${(avifSize / 1024).toFixed(2)}KB`);
  
  // Generate WebP
  await image
    .clone()
    .resize(targetWidth, null, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75, effort: 6 })
    .toFile(outputWebp);
  
  const webpSize = statSync(outputWebp).size;
  console.log(`   WebP: ${(webpSize / 1024).toFixed(2)}KB`);
  
  const reduction = ((originalSize - avifSize) / originalSize * 100).toFixed(1);
  console.log(`   Reduction: ${reduction}%`);
  
  return { avifSize, webpSize };
}

async function main() {
  console.log('🖼️  Optimizing before/after images...\n');
  
  const before = await optimizeImage(BEFORE_INPUT, BEFORE_AVIF, BEFORE_WEBP, 'before-yard.jpg');
  const after = await optimizeImage(AFTER_INPUT, AFTER_AVIF, AFTER_WEBP, 'after-yard.jpg');
  
  const totalOriginal = statSync(BEFORE_INPUT).size + statSync(AFTER_INPUT).size;
  const totalNew = before.avifSize + after.avifSize;
  
  console.log(`\n✅ Complete!`);
  console.log(`   Total before: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Total after: ${(totalNew / 1024).toFixed(2)}KB`);
  console.log(`   Savings: ${((totalOriginal - totalNew) / 1024 / 1024).toFixed(2)}MB (${((totalOriginal - totalNew) / totalOriginal * 100).toFixed(1)}%)`);
}

main().catch(console.error);

