#!/usr/bin/env node

/**
 * Image Optimization and Renaming Script for Blue Lawns
 * 
 * This script will:
 * 1. Read the SEO renaming map CSV
 * 2. Copy images from scraped location with new SEO-friendly names
 * 3. Convert to WebP format using sharp
 * 4. Compress to 80% quality
 * 5. Generate image placement map for pages
 * 6. Log all changes
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import sharp from 'sharp';

const SOURCE_DIR = path.resolve('output/blue-lawns/scrape/media_assets_full');
const TARGET_DIR = path.resolve('sites/blue-lawns/public/images/optimized');
const CSV_PATH = path.resolve('output/blue-lawns/image-renaming-map.csv');
const OUTPUT_MAP_PATH = path.resolve('output/blue-lawns/image-placement-map.json');
const OUTPUT_LOG_PATH = path.resolve('output/blue-lawns/image-optimization-log.md');

// Service type to page mapping
const SERVICE_TO_PAGE = {
  'lawn-care': ['index', 'services'],
  'landscaping': ['services', 'index'],
  'pool': ['pools'],
  'hardscaping': ['services'],
  'erosion-control': ['services'],
  'seasonal': ['services'],
  'generic': ['index', 'services', 'about']
};

// Location to priority mapping (for hero images)
const LOCATION_PRIORITY = {
  'ocean-view': 10,
  'cape-may': 9,
  'avalon': 8,
  'stone-harbor': 7,
  'sea-isle-city': 6,
  'wildwood': 5,
  'wildwood-crest': 4,
  'north-wildwood': 3,
  'cape-may-court-house': 2,
  'rio-grande': 1
};

async function main() {
  console.log('🚀 Starting image optimization and renaming...\n');

  // Create target directory if it doesn't exist
  await fs.mkdir(TARGET_DIR, { recursive: true });

  // Read CSV file
  console.log('📖 Reading SEO renaming map...');
  const csvContent = await fs.readFile(CSV_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`Found ${records.length} images to process\n`);

  const processedImages = [];
  const errors = [];
  let successCount = 0;

  // Process each image
  for (const record of records) {
    const originalName = record['Original Name'];
    const newName = record['New Name'];
    const altText = record['Alt Text'];
    const serviceType = record['Service Type'];
    const section = record['Section'];
    const location = record['Location'];

    const sourcePath = path.join(SOURCE_DIR, originalName);
    const targetPath = path.join(TARGET_DIR, newName);

    try {
      // Check if source file exists
      if (!fsSync.existsSync(sourcePath)) {
        console.log(`⚠️  Source not found: ${originalName}`);
        errors.push({ originalName, error: 'Source file not found' });
        continue;
      }

      // Process image with sharp
      await sharp(sourcePath)
        .webp({ quality: 80 })
        .toFile(targetPath);

      const stats = await fs.stat(targetPath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      processedImages.push({
        originalName,
        newName,
        altText,
        serviceType,
        section,
        location,
        sizeKB: parseFloat(sizeKB),
        pages: SERVICE_TO_PAGE[serviceType] || ['services'],
        locationPriority: LOCATION_PRIORITY[location] || 0
      });

      successCount++;
      console.log(`✅ ${successCount}/${records.length}: ${newName} (${sizeKB} KB)`);

    } catch (error) {
      console.log(`❌ Failed: ${originalName} - ${error.message}`);
      errors.push({ originalName, error: error.message });
    }
  }

  // Generate page-specific image assignments
  console.log('\n📍 Mapping images to pages...');
  const pageImageMap = generatePageMap(processedImages);

  // Save the mapping file
  await fs.writeFile(
    OUTPUT_MAP_PATH,
    JSON.stringify(pageImageMap, null, 2),
    'utf-8'
  );

  // Generate log report
  await generateLogReport(processedImages, errors, successCount, records.length);

  console.log('\n✨ Image optimization complete!');
  console.log(`✅ Successfully processed: ${successCount}/${records.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log(`📊 Image placement map: ${OUTPUT_MAP_PATH}`);
  console.log(`📄 Optimization log: ${OUTPUT_LOG_PATH}`);
}

function generatePageMap(images) {
  const pageMap = {
    index: {
      hero: [],
      gallery: [],
      services: []
    },
    services: {
      hero: [],
      gallery: []
    },
    pools: {
      hero: [],
      gallery: []
    },
    about: {
      hero: [],
      gallery: []
    }
  };

  // Sort images by priority for hero selection
  const sortedImages = [...images].sort((a, b) => b.locationPriority - a.locationPriority);

  // Assign hero images (1 per page)
  const pagesNeedingHero = ['index', 'services', 'pools', 'about'];
  const heroAssigned = new Set();

  for (const page of pagesNeedingHero) {
    const heroImage = sortedImages.find(img => 
      img.pages.includes(page) && 
      !heroAssigned.has(img.newName) &&
      (page === 'pools' ? img.serviceType === 'pool' : true)
    );

    if (heroImage) {
      pageMap[page].hero.push({
        src: `/images/optimized/${heroImage.newName}`,
        alt: heroImage.altText,
        location: heroImage.location,
        service: heroImage.serviceType
      });
      heroAssigned.add(heroImage.newName);
    }
  }

  // Assign gallery images (remaining images)
  for (const img of images) {
    if (heroAssigned.has(img.newName)) continue;

    for (const page of img.pages) {
      if (pageMap[page]) {
        pageMap[page].gallery.push({
          src: `/images/optimized/${img.newName}`,
          alt: img.altText,
          location: img.location,
          service: img.serviceType
        });
      }
    }
  }

  // Limit gallery images per page (max 12)
  for (const page in pageMap) {
    pageMap[page].gallery = pageMap[page].gallery.slice(0, 12);
  }

  return pageMap;
}

async function generateLogReport(processed, errors, successCount, totalCount) {
  const timestamp = new Date().toISOString();
  
  const report = `# Image Optimization Report
**Generated:** ${timestamp}

## Summary
- **Total Images:** ${totalCount}
- **Successfully Processed:** ${successCount}
- **Errors:** ${errors.length}
- **Format:** WebP (80% quality)
- **Target Directory:** \`sites/blue-lawns/public/images/optimized/\`

## Statistics
- **Total Size:** ${(processed.reduce((sum, img) => sum + img.sizeKB, 0) / 1024).toFixed(2)} MB
- **Average Size:** ${(processed.reduce((sum, img) => sum + img.sizeKB, 0) / processed.length).toFixed(2)} KB

## Processed Images by Service Type
${generateServiceTypeBreakdown(processed)}

## Processed Images by Location
${generateLocationBreakdown(processed)}

${errors.length > 0 ? `## Errors\n${errors.map(e => `- **${e.originalName}**: ${e.error}`).join('\n')}` : ''}

## Next Steps
1. Review the image placement map: \`output/blue-lawns/image-placement-map.json\`
2. Update Astro page components with new image paths and alt text
3. Test all pages to ensure images load correctly
4. Run Lighthouse audit to verify performance improvements

---
*Generated by optimize-and-rename-images.mjs*
`;

  await fs.writeFile(OUTPUT_LOG_PATH, report, 'utf-8');
}

function generateServiceTypeBreakdown(images) {
  const breakdown = {};
  images.forEach(img => {
    breakdown[img.serviceType] = (breakdown[img.serviceType] || 0) + 1;
  });

  return Object.entries(breakdown)
    .map(([service, count]) => `- **${service}**: ${count} images`)
    .join('\n');
}

function generateLocationBreakdown(images) {
  const breakdown = {};
  images.forEach(img => {
    breakdown[img.location] = (breakdown[img.location] || 0) + 1;
  });

  return Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([location, count]) => `- **${location}**: ${count} images`)
    .join('\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

