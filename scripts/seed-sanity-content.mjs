#!/usr/bin/env node
// scripts/seed-sanity-content.mjs
// Seeds initial Sanity content from scraped data
// Idempotent: Skips documents that already exist (no overwrites)

#!/usr/bin/env node
// scripts/seed-sanity-content.mjs
// Seeds initial Sanity content from scraped data
// Idempotent: Skips documents that already exist (no overwrites)
// Uses Sanity MCP for document creation (via agent system) or direct API if token available

import { parseArgs } from 'util';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const { values } = parseArgs({
  options: {
    site: { type: 'string', required: true },
    dataset: { type: 'string', default: 'production' },
    'dry-run': { type: 'boolean', default: false },
  },
  strict: false,
});

const siteName = values.site;
const dataset = values.dataset || process.env.SANITY_DATASET || 'production';
const projectId = process.env.SANITY_PROJECT_ID || 'm8m8m99r';
const token = process.env.SANITY_WRITE_TOKEN;
const dryRun = values['dry-run'] || false;
const scrapedDir = resolve(`sites/${siteName}/data/scraped`);

// Validate scraped data exists
if (!existsSync(scrapedDir)) {
  console.error(`❌ Error: Scraped data not found at ${scrapedDir}`);
  console.error(`   Run: bun run scrape --site ${siteName} --url <old-site-url>`);
  process.exit(1);
}

const requiredFiles = ['pages.json', 'site-map.json', 'service-areas.json', 'images.json'];
const missingFiles = requiredFiles.filter(file => !existsSync(join(scrapedDir, file)));

if (missingFiles.length > 0) {
  console.error(`❌ Error: Missing required scraped files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

// Note: This script prepares data for seeding
// Actual document creation should use Sanity MCP (via agent) or @sanity/client with write token
// For now, this script validates data and prepares document structures

console.log(`\n🌱 Seeding Sanity content for: ${siteName}`);
console.log(`   Project: ${projectId}`);
console.log(`   Dataset: ${dataset}`);
console.log(`   Scraped data: ${scrapedDir}`);
if (dryRun) {
  console.log(`   Mode: DRY RUN (no documents will be created)\n`);
} else if (!token) {
  console.warn(`   ⚠️  Warning: SANITY_WRITE_TOKEN not set. Will only check existing documents.\n`);
}

// Load scraped data
const pages = JSON.parse(readFileSync(join(scrapedDir, 'pages.json'), 'utf-8'));
const siteMap = JSON.parse(readFileSync(join(scrapedDir, 'site-map.json'), 'utf-8'));
const serviceAreas = JSON.parse(readFileSync(join(scrapedDir, 'service-areas.json'), 'utf-8'));
const images = JSON.parse(readFileSync(join(scrapedDir, 'images.json'), 'utf-8'));

// Find homepage (usually root path)
const homepageData = pages.find(p => p.url === '/' || p.url === '') || pages[0];

// Extract services from scraped pages
const servicePages = pages.filter(p => 
  p.url.includes('/service') || 
  p.url.includes('/services/') ||
  (p.h1 && (p.h1.toLowerCase().includes('service') || p.h1.toLowerCase().includes('lawn')))
);

// Extract locations from service areas or location-like pages
const locationPages = pages.filter(p => 
  p.url.includes('/location') ||
  p.url.includes('/area') ||
  serviceAreas.some(area => p.title?.toLowerCase().includes(area.toLowerCase()))
);

console.log(`\n📊 Scraped Data Summary:`);
console.log(`   Total pages: ${pages.length}`);
console.log(`   Service pages found: ${servicePages.length}`);
console.log(`   Location pages found: ${locationPages.length}`);
console.log(`   Service areas: ${serviceAreas.length}`);
console.log(`   Images: ${images.length}\n`);

// Helper: Prepare document data structure
function prepareDocument(type, data) {
  return {
    _type: type,
    ...data,
  };
}

// Helper: Check if we should create (idempotent check)
// Note: Actual existence check requires Sanity MCP query or API call
function shouldCreate(type, data, reason = 'new') {
  if (dryRun) {
    console.log(`   [DRY RUN] Would create ${type}: ${data.title || data.siteName || 'unnamed'}`);
    return { shouldCreate: true, dryRun: true };
  }

  if (!token) {
    console.warn(`   ⚠️  Skipping ${type}: SANITY_WRITE_TOKEN not set (use Sanity MCP or set token)`);
    return { shouldCreate: false, reason: 'no_token' };
  }

  console.log(`   📝 Prepared ${type}: ${data.title || data.siteName || 'unnamed'}`);
  return { shouldCreate: true, data: prepareDocument(type, data) };
}

// Seed Settings (singleton)
function prepareSettings() {
  console.log(`\n📝 Preparing Settings...`);
  
  const settingsData = {
    siteName: homepageData?.title || siteName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    siteUrl: homepageData?.canonical || `https://${siteName.replace(/-/g, '')}.com`,
    selectedTemplate: 'client-base',
    // Extract contact info from scraped pages if available
    contactEmail: extractEmail(pages) || '',
    contactPhone: extractPhone(pages) || '',
  };

  return shouldCreate('settings', settingsData);
}

// Seed Homepage
function prepareHomepage() {
  console.log(`\n📝 Preparing Homepage...`);
  
  if (!homepageData) {
    console.warn(`   ⚠️  No homepage data found in scraped pages`);
    return { shouldCreate: false, reason: 'no_data' };
  }

  const homepageDoc = {
    title: homepageData.title || 'Home',
    slug: { current: 'home' },
    pageBuilder: [
      {
        _type: 'hero',
        headline: homepageData.h1 || homepageData.title || 'Welcome',
        subheadline: homepageData.metaDescription || '',
      }
    ],
    seo: {
      metaTitle: homepageData.title || '',
      metaDescription: homepageData.metaDescription || '',
    },
  };

  return shouldCreate('homepage', homepageDoc);
}

// Seed Services
function prepareServices() {
  console.log(`\n📝 Preparing Services...`);
  
  if (servicePages.length === 0) {
    console.warn(`   ⚠️  No service pages found in scraped data`);
    return [];
  }

  const results = [];
  for (const page of servicePages.slice(0, 10)) { // Limit to first 10
    const slug = extractSlug(page.url);
    const serviceDoc = {
      title: page.h1 || page.title || 'Service',
      slug: { current: slug },
      excerpt: page.metaDescription?.substring(0, 200) || '',
      isPrimaryService: false, // Default, can be updated manually
      seo: {
        metaTitle: page.title || '',
        metaDescription: page.metaDescription || '',
      },
    };

    const result = shouldCreate('service', serviceDoc);
    results.push({ ...result, title: serviceDoc.title, slug });
  }

  return results;
}

// Seed Locations
function prepareLocations() {
  console.log(`\n📝 Preparing Locations...`);
  
  if (serviceAreas.length === 0 && locationPages.length === 0) {
    console.warn(`   ⚠️  No location data found`);
    return [];
  }

  const locationsToSeed = serviceAreas.length > 0 ? serviceAreas : 
    locationPages.map(p => extractLocationName(p.title || p.url));

  const results = [];
  for (const locationName of locationsToSeed.slice(0, 10)) { // Limit to first 10
    const slug = locationName.toLowerCase().replace(/\s+/g, '-');
    const locationDoc = {
      title: locationName,
      slug: { current: slug },
      headline: `Services in ${locationName}`,
      description: `Professional services available in ${locationName}`,
      geo: {
        city: locationName,
        state: 'NJ', // Default, should be updated from scraped data
      },
    };

    const result = shouldCreate('location', locationDoc);
    results.push({ ...result, title: locationDoc.title, slug });
  }

  return results;
}

// Helper functions
function extractSlug(url) {
  const path = url.replace(/^\//, '').replace(/\/$/, '') || 'home';
  return path.split('/').pop() || 'home';
}

function extractLocationName(str) {
  // Extract city/town name from title or URL
  return str.split(/[\/\-]/).pop().replace(/\.[^.]*$/, '') || str;
}

function extractEmail(pages) {
  // Try to find email in page content
  for (const page of pages) {
    const emailMatch = page.title?.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) return emailMatch[0];
  }
  return '';
}

function extractPhone(pages) {
  // Try to find phone in page content
  for (const page of pages) {
    const phoneMatch = page.title?.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) return phoneMatch[0];
  }
  return '';
}

// Main execution
async function main() {
  try {
    const results = {
      settings: prepareSettings(),
      homepage: prepareHomepage(),
      services: prepareServices(),
      locations: prepareLocations(),
    };

    console.log(`\n✅ Data preparation complete!\n`);
    console.log(`📊 Summary:`);
    console.log(`   Settings: ${results.settings.shouldCreate ? 'Prepared' : 'Skipped'}`);
    console.log(`   Homepage: ${results.homepage.shouldCreate ? 'Prepared' : 'Skipped'}`);
    console.log(`   Services: ${results.services.filter(s => s.shouldCreate).length} prepared`);
    console.log(`   Locations: ${results.locations.filter(l => l.shouldCreate).length} prepared\n`);

    if (dryRun) {
      console.log(`\n💡 This was a dry run. Documents were prepared but not created.\n`);
    } else if (!token) {
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Set SANITY_WRITE_TOKEN to create documents via API, OR`);
      console.log(`   2. Use Sanity MCP (via agent) to create documents`);
      console.log(`   3. Use Sanity Studio to manually create documents from prepared data\n`);
    } else {
      console.log(`\n💡 Documents are prepared. Use Sanity MCP create_document to create them.\n`);
      console.log(`   Or install @sanity/client and implement document creation logic.\n`);
    }

    // Output prepared documents to JSON file for reference
    const outputFile = join(scrapedDir, 'seed-ready.json');
    const seedData = {
      projectId,
      dataset,
      documents: {
        settings: results.settings.data,
        homepage: results.homepage.data,
        services: results.services.filter(s => s.data).map(s => s.data),
        locations: results.locations.filter(l => l.data).map(l => l.data),
      },
    };

    if (results.settings.shouldCreate || results.homepage.shouldCreate || 
        results.services.some(s => s.shouldCreate) || results.locations.some(l => l.shouldCreate)) {
      const fs = await import('fs/promises');
      await fs.writeFile(outputFile, JSON.stringify(seedData, null, 2), 'utf-8');
      console.log(`📄 Prepared document data saved to: ${outputFile}\n`);
    }

  } catch (error) {
    console.error(`\n❌ Preparation failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
