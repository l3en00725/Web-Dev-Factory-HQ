#!/usr/bin/env node

/**
 * Generate Image Renaming Map for Blue Lawns
 * 
 * This script scans all images and generates a CSV mapping
 * with SEO-friendly names and alt text suggestions.
 * 
 * Usage: node scripts/generate-image-map.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const MEDIA_DIR = process.argv[2] || 'sites/blue-lawns/public/media';
const OUTPUT_CSV = 'output/blue-lawns/image-renaming-map.csv';

// SEO keyword patterns
const LOCATIONS = [
  'ocean-view', 'cape-may', 'avalon', 'stone-harbor', 'sea-isle-city',
  'wildwood', 'wildwood-crest', 'north-wildwood', 'cape-may-court-house', 'rio-grande'
];

const SERVICES = {
  lawn: 'lawn-care',
  landscape: 'landscaping',
  pool: 'pool-service',
  commercial: 'commercial-landscaping',
  seasonal: 'seasonal-cleanup'
};

const SECTIONS = ['hero', 'service', 'gallery', 'about', 'team', 'before-after', 'testimonial'];

// Alt text templates
const ALT_TEMPLATES = {
  'lawn-care': (loc) => `Professional lawn care and maintenance services by Blue Lawns in ${loc}, Cape May County`,
  'landscaping': (loc) => `Custom landscaping design and installation by expert team in ${loc}, New Jersey`,
  'pool-service': (loc) => `Pool maintenance and cleaning services for residential properties in ${loc}, NJ`,
  'commercial-landscaping': (loc) => `Commercial property landscaping and grounds maintenance services in ${loc}, Cape May County`,
  'seasonal-cleanup': (loc) => `Seasonal yard cleanup and maintenance services for homes in ${loc}, New Jersey`,
  'generic': (loc) => `Blue Lawns outdoor property care and landscaping services in ${loc}, Cape May County`
};

// Detect service type from filename
function detectServiceType(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('lawn') || lower.includes('grass') || lower.includes('mow')) return 'lawn-care';
  if (lower.includes('pool') || lower.includes('swim')) return 'pool-service';
  if (lower.includes('landscape') || lower.includes('garden') || lower.includes('plant')) return 'landscaping';
  if (lower.includes('commercial') || lower.includes('business')) return 'commercial-landscaping';
  if (lower.includes('spring') || lower.includes('fall') || lower.includes('cleanup')) return 'seasonal-cleanup';
  return 'generic';
}

// Detect section from filename
function detectSection(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('hero')) return 'hero';
  if (lower.includes('service')) return 'service';
  if (lower.includes('gallery')) return 'gallery';
  if (lower.includes('about') || lower.includes('team')) return 'about';
  if (lower.includes('before') || lower.includes('after')) return 'before-after';
  if (lower.includes('testimonial') || lower.includes('review')) return 'testimonial';
  return 'service'; // default
}

// Generate SEO filename
function generateSEOFilename(originalName, index, serviceType, section) {
  const location = LOCATIONS[index % LOCATIONS.length];
  const ext = path.extname(originalName);
  return `blue-lawns-${location}-${serviceType}-${section}-${index + 1}.webp`;
}

// Generate alt text
function generateAltText(serviceType, index) {
  const location = LOCATIONS[index % LOCATIONS.length]
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  const template = ALT_TEMPLATES[serviceType] || ALT_TEMPLATES.generic;
  return template(location);
}

// Get file size
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return (stats.size / 1024).toFixed(1); // KB
  } catch (e) {
    return 'N/A';
  }
}

// Main function
async function generateImageMap() {
  console.log('🖼️  Generating Image Renaming Map...\n');

  // Create output directory
  await fs.mkdir(path.dirname(OUTPUT_CSV), { recursive: true });

  // Check if media directory exists
  if (!existsSync(MEDIA_DIR)) {
    console.error(`❌ Media directory not found: ${MEDIA_DIR}`);
    process.exit(1);
  }

  // Get all image files
  const files = await fs.readdir(MEDIA_DIR);
  const imageFiles = files.filter(f => 
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f) && 
    !f.startsWith('blue-lawns-') // Skip already optimized
  );

  console.log(`Found ${imageFiles.length} images to map\n`);

  const mappings = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const filePath = path.join(MEDIA_DIR, file);
    
    const serviceType = detectServiceType(file);
    const section = detectSection(file);
    const newFilename = generateSEOFilename(file, i, serviceType, section);
    const altText = generateAltText(serviceType, i);
    const fileSize = await getFileSize(filePath);
    const location = LOCATIONS[i % LOCATIONS.length];

    mappings.push({
      index: i + 1,
      original: file,
      new: newFilename,
      service: serviceType,
      section: section,
      location: location,
      altText: altText,
      sizekb: fileSize,
      priority: section === 'hero' ? 'HIGH' : section === 'service' ? 'MEDIUM' : 'NORMAL'
    });

    console.log(`${i + 1}. ${file}`);
    console.log(`   → ${newFilename}`);
    console.log(`   Alt: "${altText}"`);
    console.log(`   Priority: ${mappings[mappings.length - 1].priority}\n`);
  }

  // Generate CSV
  const csvHeaders = 'Index,Original Name,New Name,Service Type,Section,Location,Alt Text,Current Size (KB),Priority\n';
  const csvRows = mappings.map(m => 
    `${m.index},"${m.original}","${m.new}","${m.service}","${m.section}","${m.location}","${m.altText}",${m.sizekb},${m.priority}`
  ).join('\n');
  
  await fs.writeFile(OUTPUT_CSV, csvHeaders + csvRows);

  // Statistics
  const highPriority = mappings.filter(m => m.priority === 'HIGH').length;
  const mediumPriority = mappings.filter(m => m.priority === 'MEDIUM').length;
  const normalPriority = mappings.filter(m => m.priority === 'NORMAL').length;

  console.log('\n' + '='.repeat(70));
  console.log('✅ IMAGE MAPPING COMPLETE');
  console.log('='.repeat(70));
  console.log(`📊 Total Images: ${imageFiles.length}`);
  console.log(`🔴 High Priority: ${highPriority} (hero images)`);
  console.log(`🟡 Medium Priority: ${mediumPriority} (service images)`);
  console.log(`🟢 Normal Priority: ${normalPriority} (other images)`);
  console.log(`\n📋 CSV Report: ${OUTPUT_CSV}`);
  console.log('='.repeat(70));

  console.log('\n📝 Next Steps:');
  console.log('   1. Open the CSV in Excel/Google Sheets');
  console.log('   2. Review and adjust names/alt text as needed');
  console.log('   3. Use the CSV to batch rename images');
  console.log('   4. Compress images to WebP format');
  console.log('   5. Update references in .astro files\n');

  // Also generate a JSON version
  const jsonPath = OUTPUT_CSV.replace('.csv', '.json');
  await fs.writeFile(jsonPath, JSON.stringify(mappings, null, 2));
  console.log(`📄 JSON version: ${jsonPath}\n`);
}

generateImageMap().catch(console.error);

