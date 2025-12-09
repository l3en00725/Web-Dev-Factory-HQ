#!/usr/bin/env node

/**
 * Add backgroundImage prop to Hero components on all location pages
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCATIONS_DIR = path.resolve(__dirname, '../src/pages/locations');

async function fixLocationHeroImages() {
  console.log('🔧 Adding hero background images to all location pages...\n');

  const files = await fs.readdir(LOCATIONS_DIR);
  const locationFiles = files.filter(f => f.endsWith('.astro') && f !== 'index.astro');

  let successCount = 0;
  let skipCount = 0;

  for (const file of locationFiles) {
    const filePath = path.join(LOCATIONS_DIR, file);
    let content = await fs.readFile(filePath, 'utf-8');

    // Skip if already has backgroundImage
    if (content.includes('backgroundImage=')) {
      console.log(`⏭️  ${file.padEnd(30)} - Already has backgroundImage`);
      skipCount++;
      continue;
    }

    // Find the Hero component and add backgroundImage prop
    const heroRegex = /(<Hero\s+variant="simple"\s+title=\{[^}]+\}\s+subtitle=\{[^}]+\}\s+primaryCta=\{[^}]+\}\s+alignment="center"\s*\/>)/s;
    
    if (content.match(heroRegex)) {
      content = content.replace(
        heroRegex,
        `<Hero
    variant="simple"
    title={\`Lawn Care in \${location.town}\`}
    subtitle={\`Professional landscaping and lawn maintenance services for \${location.town}, NJ. Licensed, insured, and satisfaction guaranteed.\`}
    primaryCta={{ label: "Get a Free Quote", href: "/contact" }}
    backgroundImage={location.heroImage}
    alignment="center"
  />`
      );
      
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`✅ ${file.padEnd(30)} - Added backgroundImage prop`);
      successCount++;
    } else {
      console.log(`⚠️  ${file.padEnd(30)} - Could not match Hero component`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`📁 Total:   ${locationFiles.length}`);
}

fixLocationHeroImages().catch(console.error);

