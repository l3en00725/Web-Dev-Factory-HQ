#!/usr/bin/env node

/**
 * Assign diverse hero images to location pages based on their characteristics
 * Strategy: Match location badges/descriptions to service images for variety
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCATIONS_JSON = path.resolve(__dirname, '../src/content/locations.json');

// Smart image assignment based on location characteristics
const IMAGE_ASSIGNMENT = {
  'ocean-view': 'src/assets/images/services/landscaping/hero-manual.webp', // Landscaping focus
  'cape-may': 'src/assets/images/services/landscape-maintenance/hero-manual.webp', // Historic homes, lawn care
  'avalon': 'src/assets/images/services/hardscaping/hero-manual.webp', // Luxury, hardscaping
  'stone-harbor': 'src/assets/images/services/pool-service/hero.webp', // Pools badge
  'sea-isle-city': 'src/assets/images/services/lawn-care/hero.webp', // Summer properties, maintenance
  'wildwood': 'src/assets/images/services/commercial-services/hero-manual.webp', // Commercial focus
  'north-wildwood': 'src/assets/images/services/seasonal-cleanup/hero-manual.webp', // Cleanup badge
  'wildwood-crest': 'src/assets/images/services/landscape-lighting/hero-manual.webp', // Quiet neighborhoods, variety
  'rio-grande': 'src/assets/images/services/power-washing/hero-manual.webp', // Fast-growing, variety
  'cape-may-court-house': 'src/assets/images/services/fencing/fencing-service-hero.webp', // Tree care, variety
};

async function main() {
  console.log('🖼️  Assigning diverse hero images to locations...\n');

  // Read locations.json
  const locationsRaw = await fs.readFile(LOCATIONS_JSON, 'utf-8');
  const locations = JSON.parse(locationsRaw);

  let updatedCount = 0;

  for (const location of locations) {
    const newImage = IMAGE_ASSIGNMENT[location.slug];
    
    if (newImage) {
      location.heroImage = newImage;
      console.log(`✅ ${location.town.padEnd(25)} → ${path.basename(newImage)}`);
      updatedCount++;
    } else {
      console.log(`⚠️  ${location.town.padEnd(25)} → No assignment (keeping current)`);
    }
  }

  // Write updated locations.json
  await fs.writeFile(LOCATIONS_JSON, JSON.stringify(locations, null, 2));

  console.log(`\n✅ Updated ${updatedCount}/${locations.length} locations`);
  console.log('📁 Saved to:', LOCATIONS_JSON);
}

main().catch(console.error);

