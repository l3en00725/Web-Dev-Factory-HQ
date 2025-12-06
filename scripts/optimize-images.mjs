// scripts/optimize-images.mjs
// Image Optimization Script
// Scans sites/<site>/public/legacy-images and optimizes them to WebP/AVIF
// Resizes large images > 2000px wide
// Warns on large file sizes > 250kb

import { readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, extname, basename } from 'path';
import sharp from 'sharp';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    site: { type: 'string', required: true },
  },
  strict: false,
});

const siteName = values.site;
const siteDir = join(process.cwd(), `sites/${siteName}`);
const publicDir = join(siteDir, 'public');
const legacyImagesDir = join(publicDir, 'legacy-images');

if (!existsSync(legacyImagesDir)) {
  console.log(`No legacy-images directory found at ${legacyImagesDir}. Skipping optimization.`);
  process.exit(0);
}

console.log(`Optimizing images for ${siteName} in ${legacyImagesDir}...`);

const files = readdirSync(legacyImagesDir);
const supportedExts = ['.jpg', '.jpeg', '.png'];

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (!supportedExts.includes(ext)) continue;

  const inputPath = join(legacyImagesDir, file);
  const filename = basename(file, ext);
  const outputPathWebP = join(legacyImagesDir, `${filename}.webp`);
  const outputPathAvif = join(legacyImagesDir, `${filename}.avif`);

  // Skip if already optimized
  if (existsSync(outputPathWebP) && existsSync(outputPathAvif)) continue;

  try {
    console.log(`Processing ${file}...`);
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize if too large
    if (metadata.width > 2000) {
      console.log(`  Resizing from ${metadata.width}px to 2000px`);
      image.resize(2000);
    }

    // Generate WebP
    if (!existsSync(outputPathWebP)) {
      await image
        .webp({ quality: 80 })
        .toFile(outputPathWebP);
      console.log(`  Generated WebP`);
    }

    // Generate AVIF
    if (!existsSync(outputPathAvif)) {
      await image
        .avif({ quality: 65 }) // AVIF can handle lower quality setting for same visual fidelity
        .toFile(outputPathAvif);
      console.log(`  Generated AVIF`);
    }

    // Check file sizes
    [outputPathWebP, outputPathAvif].forEach(p => {
      const stats = statSync(p);
      if (stats.size > 250 * 1024) {
        console.warn(`  ⚠️  Warning: ${basename(p)} is ${Math.round(stats.size / 1024)}KB (> 250KB)`);
      }
    });

  } catch (error) {
    console.error(`  Failed to optimize ${file}:`, error);
  }
}

console.log('✅ Image optimization complete.');

