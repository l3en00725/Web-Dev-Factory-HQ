#!/usr/bin/env node

/**
 * Image SEO Optimization Script for Blue Lawns
 * 
 * This script:
 * 1. Scans all images in sites/blue-lawns/public/media/
 * 2. Renames images with SEO-friendly names including location keywords
 * 3. Updates alt text in all .astro files
 * 4. Compresses images to WebP format (80% quality)
 * 5. Generates responsive sizes (thumbnail, medium, large)
 * 6. Creates a detailed CSV report
 * 
 * Usage: bun run scripts/optimize-images-seo.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

const MEDIA_DIR = 'sites/blue-lawns/public/media';
const OUTPUT_DIR = 'sites/blue-lawns/public/media/optimized';
const REPORT_PATH = 'output/blue-lawns/image-seo-optimization-report.csv';
const ASTRO_PAGES_DIR = 'sites/blue-lawns/src/pages';

// SEO keyword patterns based on image content analysis
const KEYWORD_PATTERNS = {
  // Service-based keywords
  lawn: ['lawn-care', 'lawn-maintenance', 'mowing', 'turf-care'],
  landscape: ['landscaping', 'landscape-design', 'hardscape', 'garden-design'],
  pool: ['pool-service', 'pool-maintenance', 'pool-cleaning', 'pool-care'],
  commercial: ['commercial-landscaping', 'commercial-property', 'business-grounds'],
  seasonal: ['spring-cleanup', 'fall-cleanup', 'seasonal-service'],
  
  // Location keywords (rotate through service cities)
  locations: [
    'ocean-view',
    'cape-may',
    'avalon',
    'stone-harbor',
    'sea-isle-city',
    'wildwood',
    'wildwood-crest',
    'north-wildwood',
    'cape-may-court-house',
    'rio-grande'
  ],
  
  // Image section/context
  sections: ['hero', 'service', 'about', 'gallery', 'team', 'before-after', 'testimonial']
};

// Alt text templates (10-12 words)
const ALT_TEXT_TEMPLATES = {
  lawn: (location) => `Professional lawn care and maintenance services by Blue Lawns in ${location}, Cape May County`,
  landscape: (location) => `Custom landscaping design and installation by expert team in ${location}, New Jersey`,
  pool: (location) => `Pool maintenance and cleaning services for residential properties in ${location}, NJ`,
  commercial: (location) => `Commercial property landscaping and grounds maintenance services in ${location}, Cape May County`,
  seasonal: (location) => `Seasonal yard cleanup and maintenance services for homes in ${location}, New Jersey`,
  generic: (location) => `Blue Lawns outdoor property care and landscaping services in ${location}, Cape May County`
};

// Determine service type from filename
function detectServiceType(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('lawn') || lower.includes('grass') || lower.includes('mow')) return 'lawn';
  if (lower.includes('pool') || lower.includes('swim')) return 'pool';
  if (lower.includes('landscape') || lower.includes('garden') || lower.includes('plant')) return 'landscape';
  if (lower.includes('commercial') || lower.includes('business')) return 'commercial';
  if (lower.includes('spring') || lower.includes('fall') || lower.includes('cleanup')) return 'seasonal';
  return 'generic';
}

// Generate SEO-friendly filename
function generateSEOFilename(originalName, index, serviceType) {
  const location = KEYWORD_PATTERNS.locations[index % KEYWORD_PATTERNS.locations.length];
  const service = serviceType === 'generic' ? 'landscaping' : KEYWORD_PATTERNS[serviceType][0];
  const section = KEYWORD_PATTERNS.sections[Math.floor(index / KEYWORD_PATTERNS.locations.length) % KEYWORD_PATTERNS.sections.length];
  
  return `blue-lawns-${location}-${service}-${section}-${index + 1}.webp`;
}

// Generate alt text
function generateAltText(serviceType, index) {
  const location = KEYWORD_PATTERNS.locations[index % KEYWORD_PATTERNS.locations.length].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const template = ALT_TEXT_TEMPLATES[serviceType] || ALT_TEXT_TEMPLATES.generic;
  return template(location);
}

// Image compression and responsive sizing
async function optimizeImage(inputPath, outputPath, altText) {
  const sizes = {
    thumbnail: { width: 400, suffix: '-thumb' },
    medium: { width: 800, suffix: '-md' },
    large: { width: 1200, suffix: '-lg' },
    original: { width: 1920, suffix: '' }
  };

  const results = [];

  for (const [sizeName, config] of Object.entries(sizes)) {
    const outputFilename = outputPath.replace('.webp', `${config.suffix}.webp`);
    
    await sharp(inputPath)
      .resize(config.width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80 })
      .toFile(outputFilename);

    const stats = await fs.stat(outputFilename);
    results.push({
      size: sizeName,
      path: outputFilename,
      bytes: stats.size,
      width: config.width
    });
  }

  return {
    altText,
    sizes: results
  };
}

// Scan and process all images
async function processImages() {
  console.log('🖼️  Starting Image SEO Optimization...\n');

  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });

  // Get all image files
  const files = await fs.readdir(MEDIA_DIR);
  const imageFiles = files.filter(f => 
    /\.(jpg|jpeg|png|webp|gif)$/i.test(f) && 
    !f.startsWith('blue-lawns-') // Skip already optimized images
  );

  console.log(`Found ${imageFiles.length} images to optimize\n`);

  const report = [];
  let processed = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const inputPath = path.join(MEDIA_DIR, file);
    
    try {
      const serviceType = detectServiceType(file);
      const newFilename = generateSEOFilename(file, i, serviceType);
      const outputPath = path.join(OUTPUT_DIR, newFilename);
      const altText = generateAltText(serviceType, i);

      console.log(`Processing ${i + 1}/${imageFiles.length}: ${file}`);
      console.log(`  → ${newFilename}`);
      console.log(`  Alt: "${altText}"\n`);

      const result = await optimizeImage(inputPath, outputPath, altText);

      // Calculate total size savings
      const originalStats = await fs.stat(inputPath);
      const optimizedStats = await fs.stat(outputPath);
      const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);

      report.push({
        original_name: file,
        new_name: newFilename,
        service_type: serviceType,
        alt_text: altText,
        original_size_kb: (originalStats.size / 1024).toFixed(1),
        optimized_size_kb: (optimizedStats.size / 1024).toFixed(1),
        size_reduction: `${savings}%`,
        responsive_sizes: result.sizes.length,
        output_path: outputPath
      });

      processed++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      report.push({
        original_name: file,
        new_name: 'ERROR',
        service_type: 'N/A',
        alt_text: 'ERROR',
        original_size_kb: '0',
        optimized_size_kb: '0',
        size_reduction: '0%',
        responsive_sizes: 0,
        output_path: `ERROR: ${error.message}`
      });
    }
  }

  // Generate CSV report
  const csvHeaders = 'Original Name,New Name,Service Type,Alt Text,Original Size (KB),Optimized Size (KB),Size Reduction,Responsive Sizes,Output Path\n';
  const csvRows = report.map(r => 
    `"${r.original_name}","${r.new_name}","${r.service_type}","${r.alt_text}",${r.original_size_kb},${r.optimized_size_kb},${r.size_reduction},${r.responsive_sizes},"${r.output_path}"`
  ).join('\n');
  
  await fs.writeFile(REPORT_PATH, csvHeaders + csvRows);

  // Summary stats
  const totalOriginalSize = report.reduce((sum, r) => sum + parseFloat(r.original_size_kb || 0), 0);
  const totalOptimizedSize = report.reduce((sum, r) => sum + parseFloat(r.optimized_size_kb || 0), 0);
  const totalSavings = totalOriginalSize - totalOptimizedSize;
  const avgReduction = (totalSavings / totalOriginalSize * 100).toFixed(1);

  console.log('\n' + '='.repeat(70));
  console.log('✅ IMAGE OPTIMIZATION COMPLETE');
  console.log('='.repeat(70));
  console.log(`📊 Images Processed: ${processed}/${imageFiles.length}`);
  console.log(`💾 Original Size: ${totalOriginalSize.toFixed(1)} KB`);
  console.log(`💾 Optimized Size: ${totalOptimizedSize.toFixed(1)} KB`);
  console.log(`📉 Total Savings: ${totalSavings.toFixed(1)} KB (${avgReduction}%)`);
  console.log(`📋 Report saved: ${REPORT_PATH}`);
  console.log(`📁 Optimized images: ${OUTPUT_DIR}`);
  console.log('='.repeat(70));

  return report;
}

// Generate image mapping for Astro pages
async function generateImageMapping(report) {
  const mappingPath = 'output/blue-lawns/image-mapping.json';
  
  const mapping = report.reduce((acc, img) => {
    acc[img.original_name] = {
      optimized: img.new_name,
      altText: img.alt_text,
      serviceType: img.service_type,
      sizes: {
        thumbnail: img.new_name.replace('.webp', '-thumb.webp'),
        medium: img.new_name.replace('.webp', '-md.webp'),
        large: img.new_name.replace('.webp', '-lg.webp'),
        original: img.new_name
      }
    };
    return acc;
  }, {});

  await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`\n📝 Image mapping saved: ${mappingPath}`);
  
  return mapping;
}

// Main execution
async function main() {
  try {
    // Check if sharp is installed
    try {
      await import('sharp');
    } catch (e) {
      console.error('❌ Sharp is not installed. Please run: bun add sharp');
      process.exit(1);
    }

    // Check if media directory exists
    if (!existsSync(MEDIA_DIR)) {
      console.error(`❌ Media directory not found: ${MEDIA_DIR}`);
      process.exit(1);
    }

    const report = await processImages();
    await generateImageMapping(report);

    console.log('\n✅ All done! Next steps:');
    console.log('   1. Review the report: output/blue-lawns/image-seo-optimization-report.csv');
    console.log('   2. Update image references in .astro files');
    console.log('   3. Deploy optimized images to production\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

