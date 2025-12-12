#!/usr/bin/env node
/**
 * Aggressive hero image optimization for LCP
 * Target: <250KB, multiple quality tests
 */

import sharp from 'sharp';
import { statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const INPUT_PATH = join(__dirname, 'src/assets/images/general/hero-main.jpg');
const OUTPUT_AVIF = join(__dirname, 'src/assets/images/general/hero-main.avif');
const OUTPUT_WEBP = join(__dirname, 'src/assets/images/general/hero-main-optimized.webp');

async function optimizeAggressively() {
  console.log('🖼️  Aggressive hero optimization for <250KB target...\n');
  
  const originalSize = statSync(INPUT_PATH).size;
  console.log(`📊 Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB\n`);
  
  const image = sharp(INPUT_PATH);
  const metadata = await image.metadata();
  
  console.log(`📐 Original dimensions: ${metadata.width}x${metadata.height}px`);
  
  // Test different widths and qualities
  const tests = [
    { width: 1600, quality: 65, format: 'avif', label: 'AVIF 1600px Q65' },
    { width: 1600, quality: 55, format: 'avif', label: 'AVIF 1600px Q55' },
    { width: 1400, quality: 65, format: 'avif', label: 'AVIF 1400px Q65' },
    { width: 1600, quality: 75, format: 'webp', label: 'WebP 1600px Q75' },
    { width: 1600, quality: 70, format: 'webp', label: 'WebP 1600px Q70' },
  ];
  
  let bestAvif = null;
  let bestWebp = null;
  
  console.log('\n🧪 Testing compression levels:\n');
  
  for (const test of tests) {
    const tempOutput = join(__dirname, `src/assets/images/general/test-${test.format}-${test.width}-${test.quality}.tmp`);
    
    const processor = image.clone().resize(test.width, null, {
      fit: 'inside',
      withoutEnlargement: true
    });
    
    if (test.format === 'avif') {
      await processor.avif({ quality: test.quality, effort: 6 }).toFile(tempOutput);
    } else {
      await processor.webp({ quality: test.quality, effort: 6 }).toFile(tempOutput);
    }
    
    const size = statSync(tempOutput).size;
    const sizeKB = (size / 1024).toFixed(2);
    const isUnder250 = size < 250 * 1024;
    
    console.log(`   ${isUnder250 ? '✅' : '❌'} ${test.label}: ${sizeKB}KB`);
    
    // Track best options
    if (test.format === 'avif' && isUnder250 && (!bestAvif || size < bestAvif.size)) {
      bestAvif = { ...test, size, path: tempOutput };
    }
    if (test.format === 'webp' && isUnder250 && (!bestWebp || size < bestWebp.size)) {
      bestWebp = { ...test, size, path: tempOutput };
    }
  }
  
  // If no option under 250KB, use the smallest ones
  if (!bestAvif || !bestWebp) {
    console.log('\n⚠️  No configuration under 250KB. Using smallest sizes...');
    
    // Generate with most aggressive settings
    await image
      .clone()
      .resize(1400, null, { fit: 'inside', withoutEnlargement: true })
      .avif({ quality: 50, effort: 6 })
      .toFile(OUTPUT_AVIF);
    
    await image
      .clone()
      .resize(1600, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 68, effort: 6 })
      .toFile(OUTPUT_WEBP);
    
    const avifSize = statSync(OUTPUT_AVIF).size;
    const webpSize = statSync(OUTPUT_WEBP).size;
    
    console.log(`\n📦 Generated:`);
    console.log(`   AVIF: ${(avifSize / 1024).toFixed(2)}KB (1400px, Q50)`);
    console.log(`   WebP: ${(webpSize / 1024).toFixed(2)}KB (1600px, Q68)`);
  } else {
    console.log('\n✨ Best options found!');
    console.log(`   AVIF: ${bestAvif.label} - ${(bestAvif.size / 1024).toFixed(2)}KB`);
    console.log(`   WebP: ${bestWebp.label} - ${(bestWebp.size / 1024).toFixed(2)}KB`);
    
    // Copy best versions
    const { rename } = await import('fs/promises');
    await rename(bestAvif.path, OUTPUT_AVIF);
    await rename(bestWebp.path, OUTPUT_WEBP);
  }
  
  console.log('\n✅ Optimization complete!');
  console.log(`\n📁 Output files:`);
  console.log(`   - src/assets/images/general/hero-main.avif`);
  console.log(`   - src/assets/images/general/hero-main-optimized.webp`);
}

optimizeAggressively().catch(console.error);



