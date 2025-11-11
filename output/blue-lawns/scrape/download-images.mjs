#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import { existsSync } from 'fs';

const outputDir = './images';
if (!existsSync(outputDir)) {
  await mkdir(outputDir, { recursive: true });
}

const htmlFiles = [
  'index.html',
  'about.html',
  'contact.html',
  'services.html',
  'faq.html',
  'membership.html',
  'review.html',
  'knowledge-base.html',
  'knowledge-base-belgian-block-the-ideal-landscaping-accent-for-coastal-homes.html',
  'knowledge-base-coastal-erosion-flooding-control.html',
  'knowledge-base-essential-tips-for-vegetable-garden-success.html',
  'knowledge-base-fall-lawn-care-tips-essential-tips-for-a-beautiful-yard.html',
  'knowledge-base-trending-hardscape-designs-in-new-jerseys-landscaping-scene.html',
  'knowledge-base-winter-gardening-tips-for-coastal-landscaping.html'
];

const imageUrls = new Set();

// Extract all image URLs from HTML files
for (const file of htmlFiles) {
  try {
    const html = await readFile(file, 'utf-8');
    
    // Find all cdn.prod.website-files.com images
    const cdnMatches = html.matchAll(/https:\/\/cdn\.prod\.website-files\.com\/[^"\s]+\.(jpg|jpeg|png|webp|gif|svg)/gi);
    for (const match of cdnMatches) {
      const url = match[0].split(' ')[0]; // Take first URL if there are multiple in srcset
      imageUrls.add(url);
    }
    
    // Find other image URLs
    const srcMatches = html.matchAll(/src="([^"]+\.(jpg|jpeg|png|webp|gif|svg))"/gi);
    for (const match of srcMatches) {
      const url = match[1];
      if (url.startsWith('http')) {
        imageUrls.add(url);
      }
    }
  } catch (err) {
    console.warn(`Could not read ${file}: ${err.message}`);
  }
}

console.log(`Found ${imageUrls.size} unique images to download`);

let downloaded = 0;
let failed = 0;

for (const url of imageUrls) {
  try {
    const filename = basename(new URL(url).pathname);
    const filepath = join(outputDir, filename);
    
    // Skip if already exists
    if (existsSync(filepath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`);
      continue;
    }
    
    console.log(`📥 Downloading: ${filename}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`❌ Failed to download ${url}: ${response.status}`);
      failed++;
      continue;
    }
    
    const buffer = await response.arrayBuffer();
    await writeFile(filepath, Buffer.from(buffer));
    downloaded++;
    console.log(`✅ Downloaded: ${filename} (${(buffer.byteLength / 1024).toFixed(1)}KB)`);
    
    // Small delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (err) {
    console.warn(`❌ Error downloading ${url}: ${err.message}`);
    failed++;
  }
}

console.log(`\n✅ Download complete!`);
console.log(`   Downloaded: ${downloaded}`);
console.log(`   Failed: ${failed}`);
console.log(`   Total unique URLs: ${imageUrls.size}`);
console.log(`   Output: ${outputDir}/`);
