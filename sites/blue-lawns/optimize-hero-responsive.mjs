#!/usr/bin/env node
/**
 * Generate responsive hero image sizes for mobile optimization
 * Creates: 600px (mobile), 1000px (tablet), 1400px (desktop)
 * Target: Mobile <50KB, aggressive compression
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const INPUT_PATH = join(__dirname, 'src/assets/images/general/hero-main.jpg');

const SIZES = [
  { width: 600, name: 'hero-main-600', targetKB: 50 },
  { width: 1000, name: 'hero-main-1000', targetKB: 100 },
  { width: 1400, name: 'hero-main-1400', targetKB: 150 },
];

async function optimizeResponsive() {
  console.log('🖼️  Generating responsive hero images...\n');
  
  const originalSize = statSync(INPUT_PATH).size;
  console.log(`📊 Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB\n`);
  
  const image = sharp(INPUT_PATH);
  const metadata = await image.metadata();
  const aspectRatio = metadata.height / metadata.width;
  
  console.log(`📐 Original dimensions: ${metadata.width}x${metadata.height}px`);
  console.log(`📐 Aspect ratio: ${aspectRatio.toFixed(3)}\n`);
  
  for (const size of SIZES) {
    const height = Math.round(size.width * aspectRatio);
    const outputAvif = join(__dirname, `src/assets/images/general/${size.name}.avif`);
    const outputWebp = join(__dirname, `src/assets/images/general/${size.name}.webp`);
    
    console.log(`\n📱 Generating ${size.width}px (${size.name})...`);
    
    // Mobile gets aggressive compression, desktop gets better quality
    const quality = size.width === 600 ? 40 : size.width === 1000 ? 50 : 60;
    
    // Generate AVIF
    await image
      .clone()
      .resize(size.width, height, {
        fit: 'cover',
        position: 'center'
      })
      .avif({
        quality: quality,
        effort: 6
      })
      .toFile(outputAvif);
    
    const avifSize = statSync(outputAvif).size;
    const avifKB = (avifSize / 1024).toFixed(2);
    const status = avifSize < size.targetKB * 1024 ? '✅' : '⚠️';
    
    console.log(`  ${status} AVIF: ${avifKB}KB (target: <${size.targetKB}KB)`);
    
    // Generate WebP fallback
    await image
      .clone()
      .resize(size.width, height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: quality + 10, // WebP needs slightly higher quality
        effort: 6
      })
      .toFile(outputWebp);
    
    const webpSize = statSync(outputWebp).size;
    const webpKB = (webpSize / 1024).toFixed(2);
    console.log(`  ✅ WebP: ${webpKB}KB`);
  }
  
  console.log('\n✨ Responsive hero images generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Update Hero.astro to use srcset with these sizes');
  console.log('   2. Set sizes="(max-width: 768px) 100vw, 50vw"');
}

optimizeResponsive().catch(console.error);




