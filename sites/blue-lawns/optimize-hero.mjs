#!/usr/bin/env node
/**
 * Optimize hero image for LCP performance
 * Target: <250KB, AVIF + WebP fallback
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const INPUT_PATH = join(__dirname, 'src/assets/images/general/hero-main.jpg');
const OUTPUT_AVIF = join(__dirname, 'src/assets/images/general/hero-main.avif');
const OUTPUT_WEBP = join(__dirname, 'src/assets/images/general/hero-main.webp');

async function optimizeHero() {
  console.log('🖼️  Optimizing hero image for LCP...\n');
  
  const originalSize = statSync(INPUT_PATH).size;
  console.log(`📊 Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
  
  const image = sharp(INPUT_PATH);
  const metadata = await image.metadata();
  
  console.log(`📐 Dimensions: ${metadata.width}x${metadata.height}px\n`);
  
  // Target width for hero (desktop max-width is typically 1920px)
  const targetWidth = 1920;
  
  // Generate AVIF (best compression)
  console.log('🔄 Generating AVIF...');
  await image
    .clone()
    .resize(targetWidth, null, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .avif({ 
      quality: 75,  // Higher quality for hero LCP
      effort: 6     // More compression effort
    })
    .toFile(OUTPUT_AVIF);
  
  const avifSize = statSync(OUTPUT_AVIF).size;
  console.log(`✅ AVIF: ${(avifSize / 1024).toFixed(2)}KB (${((avifSize / originalSize) * 100).toFixed(1)}% of original)`);
  
  // Generate WebP fallback
  console.log('🔄 Generating WebP...');
  await image
    .clone()
    .resize(targetWidth, null, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .webp({ 
      quality: 80,  // Slightly higher for fallback
      effort: 6
    })
    .toFile(OUTPUT_WEBP);
  
  const webpSize = statSync(OUTPUT_WEBP).size;
  console.log(`✅ WebP: ${(webpSize / 1024).toFixed(2)}KB (${((webpSize / originalSize) * 100).toFixed(1)}% of original)\n`);
  
  // Check if under 250KB target
  const isAvifOptimal = avifSize < 250 * 1024;
  const isWebpOptimal = webpSize < 250 * 1024;
  
  console.log('🎯 Target: <250KB');
  console.log(`   AVIF: ${isAvifOptimal ? '✅ PASS' : '❌ FAIL'} (${(avifSize / 1024).toFixed(2)}KB)`);
  console.log(`   WebP: ${isWebpOptimal ? '✅ PASS' : '⚠️  OK'} (${(webpSize / 1024).toFixed(2)}KB)\n`);
  
  console.log('✨ Optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update Hero.astro to use hero-main.avif');
  console.log('   2. Add preload link in Base.astro');
  console.log('   3. Test LCP improvement');
}

optimizeHero().catch(console.error);



