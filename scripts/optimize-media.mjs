#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts images to AVIF, WebP, and JPG formats with multiple responsive sizes
 */
import { parseArgs } from 'node:util';
import { readdir, mkdir, stat } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname, resolve } from 'node:path';
import sharp from 'sharp';
import chalk from 'chalk';

const { values } = parseArgs({
  options: {
    input: { type: 'string' },
    output: { type: 'string' },
    formats: { type: 'string', default: 'avif,webp,jpg' }
  }
});

if (!values.input || !values.output) {
  console.error(chalk.red('❌ Error: --input and --output are required'));
  console.log(chalk.gray('Usage: bun run scripts/optimize-media.mjs --input <dir> --output <dir> [--formats avif,webp,jpg]'));
  process.exit(1);
}

const inputDir = resolve(values.input);
const outputDir = resolve(values.output);
const formats = values.formats.split(',').map(f => f.trim());
const sizes = [400, 800, 1200];
const qualities = {
  avif: 80,
  webp: 85,
  jpg: 90
};

// Supported input formats
const supportedExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];

async function getAllImages(dir) {
  const images = [];
  
  if (!existsSync(dir)) {
    console.warn(chalk.yellow(`⚠ Input directory not found: ${dir}`));
    return images;
  }

  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subImages = await getAllImages(fullPath);
      images.push(...subImages);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (supportedExts.includes(ext)) {
        images.push(fullPath);
      }
    }
  }
  
  return images;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function optimizeImage(inputPath, outputDir, formats, sizes) {
  const name = basename(inputPath, extname(inputPath));
  const results = {
    avif: [],
    webp: [],
    jpg: [],
    alt: name.replace(/[-_]/g, ' '),
    width: 0,
    height: 0
  };
  
  let totalSaved = 0;
  let originalSize = 0;
  
  try {
    // Get original file size
    const stats = await stat(inputPath);
    originalSize = stats.size;
    
    // Load image and get metadata
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Set max dimensions
    const maxWidth = Math.min(metadata.width, 1200);
    results.width = maxWidth;
    results.height = Math.round((metadata.height / metadata.width) * maxWidth);
    
    // Generate optimized versions
    for (const size of sizes) {
      if (size > maxWidth) continue; // Skip sizes larger than original
      
      for (const format of formats) {
        const outputFilename = `${name}-${size}.${format}`;
        const outputPath = join(outputDir, outputFilename);
        
        let pipeline = sharp(inputPath).resize(size, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });
        
        // Apply format-specific optimization
        switch (format) {
          case 'avif':
            pipeline = pipeline.avif({ quality: qualities.avif, effort: 4 });
            break;
          case 'webp':
            pipeline = pipeline.webp({ quality: qualities.webp, effort: 4 });
            break;
          case 'jpg':
          case 'jpeg':
            pipeline = pipeline.jpeg({ quality: qualities.jpg, progressive: true, mozjpeg: true });
            break;
        }
        
        await pipeline.toFile(outputPath);
        
        // Track file size
        const outputStats = await stat(outputPath);
        totalSaved += (originalSize - outputStats.size);
        
        // Add to results
        results[format === 'jpeg' ? 'jpg' : format].push(`/media/${outputFilename}`);
      }
    }
    
    return { results, totalSaved, originalSize, success: true };
    
  } catch (error) {
    console.warn(chalk.yellow(`⚠ Failed to optimize ${basename(inputPath)}: ${error.message}`));
    return { results: null, totalSaved: 0, originalSize: 0, success: false, error: error.message };
  }
}

async function main() {
  console.log(chalk.blue.bold('\n🖼️  Image Optimization Pipeline\n'));
  console.log(chalk.gray(`Input:  ${inputDir}`));
  console.log(chalk.gray(`Output: ${outputDir}`));
  console.log(chalk.gray(`Formats: ${formats.join(', ')}`));
  console.log(chalk.gray(`Sizes: ${sizes.join(', ')}px\n`));
  
  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });
  
  // Find all images
  const images = await getAllImages(inputDir);
  
  if (images.length === 0) {
    console.log(chalk.yellow('No images found to optimize'));
    return;
  }
  
  console.log(chalk.blue(`Found ${images.length} image(s) to optimize\n`));
  
  // Image map for import-content.mjs to consume
  const imageMap = {};
  let totalSavings = 0;
  let successCount = 0;
  let skipCount = 0;
  
  // Process each image
  for (const imagePath of images) {
    const relativePath = imagePath.replace(inputDir, '').replace(/^\//, '');
    process.stdout.write(chalk.gray(`Processing ${basename(imagePath)}... `));
    
    const { results, totalSaved, originalSize, success, error } = await optimizeImage(
      imagePath,
      outputDir,
      formats,
      sizes
    );
    
    if (success && results) {
      const savedMB = totalSaved / (1024 * 1024);
      console.log(chalk.green(`✓ ${formats.length} formats, ${sizes.length} sizes (saved ${formatBytes(totalSaved)})`));
      
      // Store in image map (use original URL as key - will be replaced by scraper output)
      const originalUrl = `https://placeholder.com/images/${relativePath}`;
      imageMap[originalUrl] = results;
      
      totalSavings += totalSaved;
      successCount++;
    } else {
      console.log(chalk.yellow(`⚠ Skipped (${error || 'unknown error'})`));
      skipCount++;
    }
  }
  
  // Write image map
  const imageMapPath = join(outputDir, 'image-map.json');
  await writeFile(imageMapPath, JSON.stringify(imageMap, null, 2));
  
  // Summary
  console.log(chalk.blue('\n' + '─'.repeat(60)));
  console.log(chalk.green(`✅ Optimization complete!`));
  console.log(chalk.gray(`   Processed: ${successCount} images`));
  if (skipCount > 0) {
    console.log(chalk.yellow(`   Skipped: ${skipCount} images`));
  }
  console.log(chalk.gray(`   Total saved: ${formatBytes(totalSavings)}`));
  console.log(chalk.gray(`   Image map: ${imageMapPath}`));
  console.log(chalk.blue('─'.repeat(60) + '\n'));
}

main().catch(error => {
  console.error(chalk.red('❌ Fatal error:'), error);
  process.exit(1);
});

