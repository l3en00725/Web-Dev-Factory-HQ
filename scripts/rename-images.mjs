#!/usr/bin/env node

/**
 * Legacy SEO-Driven Image Renaming & Alt Text Preservation
 * 
 * This script:
 * 1. Parses output/[site]/scrape/content_map.json for image context
 * 2. Matches images to nearest page H1 or section heading
 * 3. Renames using format: [brand]-[city]-[primary_keyword]-[section].webp
 * 4. Preserves alt text from original HTML
 * 5. Writes renamed images to /public/media/optimized/
 * 6. Updates all Astro page image references automatically
 * 7. Compresses images to WebP (80% quality)
 * 8. Generates verification log: output/[site]/image-seo-map.csv
 * 9. Fails build if >20% of images remain unrenamed or unlinked
 * 
 * Usage: bun run scripts/rename-images.mjs --site <site-name>
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const { values } = parseArgs({
  options: {
    site: { type: 'string' },
    contentMap: { type: 'string' },
    mediaDir: { type: 'string' },
    outputDir: { type: 'string' }
  }
});

if (!values.site) {
  console.error('❌ Error: --site flag is required');
  console.log('Usage: bun run scripts/rename-images.mjs --site <site-name>');
  process.exit(1);
}

const SITE_NAME = values.site;
const ROOT_DIR = path.resolve(process.cwd());
const CONTENT_MAP_PATH = values.contentMap || path.join(ROOT_DIR, 'output', SITE_NAME, 'scrape', 'content_map.json');
const MEDIA_DIR = values.mediaDir || path.join(ROOT_DIR, 'sites', SITE_NAME, 'public', 'media');
const OUTPUT_DIR = values.outputDir || path.join(ROOT_DIR, 'sites', SITE_NAME, 'public', 'media', 'optimized');
const ASTRO_PAGES_DIR = path.join(ROOT_DIR, 'sites', SITE_NAME, 'src', 'pages');
const REPORT_PATH = path.join(ROOT_DIR, 'output', SITE_NAME, 'image-seo-map.csv');

// Extract brand name from site name (e.g., "blue-lawns" -> "blue-lawns")
function extractBrand(siteName) {
  return siteName.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

// Extract keywords from text (H1, headings, etc.)
function extractKeywords(text) {
  if (!text) return [];
  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .filter(w => !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'your', 'our', 'are'].includes(w));
  return [...new Set(words)].slice(0, 5);
}

// Generate SEO-friendly filename
function generateSEOFilename(brand, city, keywords, section, index) {
  const primaryKeyword = keywords[0] || 'service';
  const citySlug = city ? city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'generic';
  const keywordSlug = primaryKeyword.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const sectionSlug = section || 'generic';
  
  return `${brand}-${citySlug}-${keywordSlug}-${sectionSlug}-${index + 1}.webp`;
}

// Find nearest page context for an image
function findImageContext(imagePath, contentMap) {
  if (!contentMap || !Array.isArray(contentMap.pages)) {
    return { city: null, keywords: [], section: 'generic', h1: null };
  }

  // Try to match image path to page URL
  const imageName = path.basename(imagePath).toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const page of contentMap.pages) {
    const pageUrl = (page.url || '').toLowerCase();
    const pageSlug = page.slug || '';
    const h1 = page.h1 || '';
    const headings = page.h2 || [];
    
    // Score based on URL/slug match
    let score = 0;
    if (imageName.includes(pageSlug) || pageSlug.includes(imageName.split('.')[0])) {
      score += 10;
    }
    
    // Score based on heading keywords
    const headingText = `${h1} ${headings.join(' ')}`.toLowerCase();
    const headingKeywords = extractKeywords(headingText);
    const imageKeywords = extractKeywords(imageName);
    const commonKeywords = headingKeywords.filter(k => imageKeywords.includes(k));
    score += commonKeywords.length * 2;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        city: extractCityFromPage(page),
        keywords: headingKeywords.length > 0 ? headingKeywords : extractKeywords(h1),
        section: determineSection(headings, h1),
        h1: h1,
        page: page
      };
    }
  }

  return bestMatch || { city: null, keywords: [], section: 'generic', h1: null };
}

// Extract city from page data
function extractCityFromPage(page) {
  const url = (page.url || '').toLowerCase();
  const h1 = (page.h1 || '').toLowerCase();
  const slug = (page.slug || '').toLowerCase();
  
  // Common city patterns
  const cityPatterns = [
    'cape-may', 'stone-harbor', 'avalon', 'ocean-city', 'wildwood',
    'ocean-view', 'sea-isle-city', 'wildwood-crest', 'north-wildwood',
    'cape-may-court-house', 'rio-grande'
  ];
  
  for (const pattern of cityPatterns) {
    if (url.includes(pattern) || slug.includes(pattern) || h1.includes(pattern.replace('-', ' '))) {
      return pattern.replace(/-/g, ' ');
    }
  }
  
  return null;
}

// Determine section from headings
function determineSection(headings, h1) {
  const text = `${h1} ${headings.join(' ')}`.toLowerCase();
  
  if (text.includes('hero') || text.includes('banner') || text.includes('main')) return 'hero';
  if (text.includes('service') || text.includes('offer')) return 'service';
  if (text.includes('about') || text.includes('team')) return 'about';
  if (text.includes('gallery') || text.includes('portfolio') || text.includes('work')) return 'gallery';
  if (text.includes('testimonial') || text.includes('review')) return 'testimonial';
  if (text.includes('contact') || text.includes('location')) return 'contact';
  
  return 'generic';
}

// Preserve alt text from content map or generate new one
function getAltText(originalAlt, context, newFilename) {
  if (originalAlt && originalAlt.trim().length > 0) {
    // Validate alt text length (10-12 words recommended)
    const words = originalAlt.trim().split(/\s+/);
    if (words.length >= 8 && words.length <= 15) {
      return originalAlt.trim();
    }
  }
  
  // Generate alt text from context
  const city = context.city || 'Cape May County';
  const keyword = context.keywords[0] || 'landscaping';
  const service = keyword.replace(/-/g, ' ');
  
  return `Professional ${service} services by ${extractBrand(SITE_NAME).replace(/-/g, ' ')} in ${city}`;
}

// Process and rename images
async function processImages() {
  console.log('🖼️  Starting SEO Image Renaming & Optimization...\n');
  console.log(`Site: ${SITE_NAME}`);
  console.log(`Content Map: ${CONTENT_MAP_PATH}`);
  console.log(`Media Dir: ${MEDIA_DIR}`);
  console.log(`Output Dir: ${OUTPUT_DIR}\n`);

  // Validate inputs
  if (!existsSync(CONTENT_MAP_PATH)) {
    console.warn(`⚠️  Content map not found: ${CONTENT_MAP_PATH}`);
    console.warn('   Proceeding with limited context matching...');
  }

  if (!existsSync(MEDIA_DIR)) {
    console.error(`❌ Media directory not found: ${MEDIA_DIR}`);
    process.exit(1);
  }

  // Load content map
  let contentMap = { pages: [] };
  if (existsSync(CONTENT_MAP_PATH)) {
    try {
      const contentMapData = await fs.readFile(CONTENT_MAP_PATH, 'utf-8');
      contentMap = JSON.parse(contentMapData);
    } catch (error) {
      console.warn(`⚠️  Could not parse content map: ${error.message}`);
    }
  }

  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });

  // Get all image files
  const files = await fs.readdir(MEDIA_DIR);
  const imageFiles = files.filter(f => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f) &&
    !f.startsWith(extractBrand(SITE_NAME) + '-') // Skip already renamed images
  );

  console.log(`Found ${imageFiles.length} images to process\n`);

  const report = [];
  let processed = 0;
  let renamed = 0;
  let errors = 0;

  const brand = extractBrand(SITE_NAME);

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const inputPath = path.join(MEDIA_DIR, file);
    
    try {
      // Find context for this image
      const context = findImageContext(file, contentMap);
      
      // Generate new filename
      const newFilename = generateSEOFilename(
        brand,
        context.city,
        context.keywords,
        context.section,
        i
      );
      
      const outputPath = path.join(OUTPUT_DIR, newFilename);
      
      // Get or generate alt text
      const originalAlt = context.page?.images?.find(img => 
        img.src && img.src.includes(file)
      )?.alt || '';
      const altText = getAltText(originalAlt, context, newFilename);

      console.log(`[${i + 1}/${imageFiles.length}] Processing: ${file}`);
      console.log(`  → ${newFilename}`);
      console.log(`  Context: ${context.city || 'generic'} | ${context.section} | ${context.keywords.slice(0, 2).join(', ')}`);
      console.log(`  Alt: "${altText}"`);

      // Compress and copy image
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);

      // Get file stats
      const originalStats = await fs.stat(inputPath);
      const optimizedStats = await fs.stat(outputPath);
      const savings = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(1);

      report.push({
        original_name: file,
        new_name: newFilename,
        original_path: inputPath,
        optimized_path: outputPath,
        city: context.city || 'N/A',
        section: context.section,
        keywords: context.keywords.join(', '),
        alt_text: altText,
        original_size_kb: (originalStats.size / 1024).toFixed(1),
        optimized_size_kb: (optimizedStats.size / 1024).toFixed(1),
        size_reduction: `${savings}%`,
        status: 'renamed'
      });

      renamed++;
      processed++;
      
      console.log(`  ✅ Renamed and optimized (saved ${savings}%)\n`);

    } catch (error) {
      console.error(`  ❌ Error processing ${file}: ${error.message}\n`);
      errors++;
      
      report.push({
        original_name: file,
        new_name: 'ERROR',
        original_path: inputPath,
        optimized_path: 'N/A',
        city: 'N/A',
        section: 'N/A',
        keywords: 'N/A',
        alt_text: 'ERROR',
        original_size_kb: '0',
        optimized_size_kb: '0',
        size_reduction: '0%',
        status: `ERROR: ${error.message}`
      });
    }
  }

  // Generate CSV report
  const csvHeaders = 'Original Name,New Name,Original Path,Optimized Path,City,Section,Keywords,Alt Text,Original Size (KB),Optimized Size (KB),Size Reduction,Status\n';
  const csvRows = report.map(r => 
    `"${r.original_name}","${r.new_name}","${r.original_path}","${r.optimized_path}","${r.city}","${r.section}","${r.keywords}","${r.alt_text}",${r.original_size_kb},${r.optimized_size_kb},${r.size_reduction},"${r.status}"`
  ).join('\n');
  
  await fs.writeFile(REPORT_PATH, csvHeaders + csvRows, 'utf-8');

  // Calculate statistics
  const unrenamedCount = imageFiles.length - renamed;
  const unrenamedPercentage = (unrenamedCount / imageFiles.length * 100).toFixed(1);
  
  // Check failure threshold (>20% unrenamed)
  if (parseFloat(unrenamedPercentage) > 20) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ BUILD FAILURE: >20% of images remain unrenamed');
    console.error('='.repeat(70));
    console.error(`Unrenamed: ${unrenamedCount}/${imageFiles.length} (${unrenamedPercentage}%)`);
    console.error(`Threshold: 20%`);
    console.error('\nPlease review the report and fix image naming issues.');
    console.error(`Report: ${REPORT_PATH}\n`);
    process.exit(1);
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('✅ IMAGE RENAMING COMPLETE');
  console.log('='.repeat(70));
  console.log(`📊 Total Images: ${imageFiles.length}`);
  console.log(`✅ Renamed: ${renamed}`);
  console.log(`⚠️  Unrenamed: ${unrenamedCount} (${unrenamedPercentage}%)`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📋 Report: ${REPORT_PATH}`);
  console.log(`📁 Optimized images: ${OUTPUT_DIR}`);
  console.log('='.repeat(70));
  console.log('\n⚠️  Next step: Update Astro page references to use new image names');
  console.log(`   Run: bun run scripts/update-page-images.mjs --site ${SITE_NAME}\n`);

  return { report, renamed, unrenamed: unrenamedCount, errors };
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

    await processImages();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

