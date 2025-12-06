// scripts/generate-redirects.mjs
// Generates redirects for Vercel (vercel.json) or Netlify (_redirects)
// Based on scraped artifacts map (oldUrl -> newUrl)

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    site: { type: 'string', required: true },
  },
  strict: false,
});

const siteName = values.site;
const siteDir = resolve(`sites/${siteName}`);
const scrapedDir = join(siteDir, 'data', 'scraped');
const redirectMapPath = join(scrapedDir, 'redirect-map.json');

if (!existsSync(redirectMapPath)) {
  console.log(`No redirect map found at ${redirectMapPath}. Skipping redirect generation.`);
  process.exit(0);
}

console.log(`Generating redirects for ${siteName}...`);

const redirectMap = JSON.parse(readFileSync(redirectMapPath, 'utf-8'));
const redirects = [];
const sourceMap = new Map(); // Track collisions
const destinationMap = new Map(); // Track reverse collisions

// Parse redirect map (supports both simple { "/old": "/new" } and detailed { "/old": { "destination": "/new", "status": 301 } })
Object.entries(redirectMap).forEach(([oldPath, config]) => {
  let destination, status = 301; // Default to 301 permanent
  
  if (typeof config === 'string') {
    destination = config;
  } else if (config && typeof config === 'object') {
    destination = config.destination || config.url;
    status = config.status || config.code || 301;
  } else {
    return; // Skip invalid entries
  }

  if (!destination || oldPath === destination) return;

  // Validate status code
  if (![301, 302, 410].includes(status)) {
    console.warn(`⚠️  Invalid status code ${status} for ${oldPath}, defaulting to 301`);
    status = 301;
  }

  // Check for collisions
  if (sourceMap.has(oldPath)) {
    console.warn(`⚠️  Collision: Multiple redirects from ${oldPath}`);
  }
  sourceMap.set(oldPath, destination);

  // Check for circular redirects
  if (destinationMap.has(destination) && sourceMap.has(destination)) {
    console.warn(`⚠️  Potential circular redirect: ${oldPath} → ${destination} → ${sourceMap.get(destination)}`);
  }
  destinationMap.set(destination, oldPath);

  // Format for Vercel
  if (status === 410) {
    // 410 Gone - no destination needed
    redirects.push({
      source: oldPath,
      statusCode: 410,
    });
  } else {
    redirects.push({
      source: oldPath,
      destination: destination,
      permanent: status === 301,
      statusCode: status,
    });
  }
});

// Generate vercel.json
const vercelConfigPath = join(siteDir, 'vercel.json');
let vercelConfig = {};

if (existsSync(vercelConfigPath)) {
  vercelConfig = JSON.parse(readFileSync(vercelConfigPath, 'utf-8'));
}

vercelConfig.redirects = redirects;

writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));

console.log(`✅ Generated ${redirects.length} redirects in vercel.json`);
console.log(`   - 301 Permanent: ${redirects.filter(r => r.statusCode === 301).length}`);
console.log(`   - 302 Temporary: ${redirects.filter(r => r.statusCode === 302).length}`);
console.log(`   - 410 Gone: ${redirects.filter(r => r.statusCode === 410).length}`);

