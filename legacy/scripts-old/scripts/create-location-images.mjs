#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const locations = [
  'cape-may',
  'stone-harbor',
  'avalon',
  'ocean-city',
  'wildwood'
];

// Source images from Blue Lawns site - these are good landscape/lawn images
const sourceImages = [
  '64e2e7bda4fc44bcac726a8b_2989%201st%20(16%20of%2025)-p-1080.jpg',
  '64e2e7be30141b99cd0e4ffc_2989%201st%20(11%20of%2025)-p-1080.jpg',
  '64e2e7bed2653e49f2357c2d_2989%201st%20(18%20of%2025)-p-1080.jpg',
  '64e2e7bf1d1c34380e79a058_8904%202nd%20(1%20of%2019)-p-1080.jpg',
  '64e2e7bfe41da63fe4a61ff9_2989%201st%20(22%20of%2025)-p-1080.jpg',
];

async function main() {
  console.log('🖼️  Creating location hero images...');
  
  const imageDir = path.join(ROOT_DIR, 'sites', 'blue-lawns', 'public', 'images');
  
  for (let i = 0; i < locations.length; i++) {
    const locationSlug = locations[i];
    const sourceImage = sourceImages[i];
    const sourcePath = path.join(imageDir, sourceImage);
    const targetPath = path.join(imageDir, `blue-lawns-${locationSlug}-lawn-care-hero.webp`);
    
    // Check if source exists
    try {
      await fs.access(sourcePath);
      
      // Convert to WebP using sharp if available, otherwise just copy as jpg
      try {
        // Try using ImageMagick convert if available
        await execAsync(`convert "${sourcePath}" -quality 85 "${targetPath}"`);
        console.log(`✅ Created: blue-lawns-${locationSlug}-lawn-care-hero.webp`);
      } catch (e) {
        // If ImageMagick not available, just copy the JPG with webp extension
        // (The browser will still display it, but it's better to have something)
        const jpgTarget = path.join(imageDir, `blue-lawns-${locationSlug}-lawn-care-hero.jpg`);
        await fs.copyFile(sourcePath, jpgTarget);
        console.log(`⚠️  ImageMagick not available, created JPG: blue-lawns-${locationSlug}-lawn-care-hero.jpg`);
      }
    } catch (error) {
      console.error(`❌ Could not process ${locationSlug}: ${error.message}`);
    }
  }
  
  console.log('\n✨ Image processing complete!');
  console.log('📝 Note: For production, convert JPG images to WebP format using ImageMagick or similar tool.');
}

main().catch(console.error);

