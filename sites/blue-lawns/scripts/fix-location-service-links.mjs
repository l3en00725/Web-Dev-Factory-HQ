#!/usr/bin/env node

/**
 * Update individual location pages to use LocationServiceCard
 * This links services to /locations/{town}/{service} instead of /services/{service}
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

async function updateLocationPage(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    const filename = path.basename(filePath, '.astro');
    
    // Skip index page
    if (filename === 'index') {
      return { success: false, file: filePath, reason: 'index page - skipped' };
    }
    
    let modified = false;
    
    // Replace ServicesGrid import with LocationServiceCard import
    if (content.includes('import ServicesGrid')) {
      content = content.replace(
        /import ServicesGrid from '\.\.\/\.\.\/components\/sections\/ServicesGrid\.astro';/,
        "import LocationServiceCard from '../../components/LocationServiceCard.astro';"
      );
      modified = true;
    }
    
    // Replace ServicesGrid usage with grid of LocationServiceCard
    if (content.includes('<ServicesGrid')) {
      // Extract location slug from file
      const locationSlug = filename;
      
      // Replace the ServicesGrid component with manual grid
      content = content.replace(
        /<ServicesGrid\s+heading=\{[^}]+\}\s+services=\{primaryServices\}\s+columns=\{3\}\s*\/>/,
        `<section class="py-section-mobile lg:py-section-desktop bg-white">
    <Container>
      <h2 class="font-display text-3xl font-bold mb-12 text-center text-brand-navy">Our Services in {location.town}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {primaryServices.map((service) => (
          <LocationServiceCard 
            service={service} 
            locationSlug={location.slug}
            locationTown={location.town}
          />
        ))}
      </div>
    </Container>
  </section>`
      );
      modified = true;
    }
    
    if (modified) {
      await fs.writeFile(filePath, content);
      return { success: true, file: path.relative(ROOT_DIR, filePath) };
    }
    
    return { success: false, file: path.relative(ROOT_DIR, filePath), reason: 'no changes needed' };
  } catch (error) {
    return { success: false, file: path.relative(ROOT_DIR, filePath), error: error.message };
  }
}

async function main() {
  console.log('🔧 Updating location pages to link to matrix pages...\n');
  
  const files = await glob('src/pages/locations/*.astro', { cwd: ROOT_DIR, absolute: true });
  
  console.log(`Found ${files.length} location files\n`);
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const file of files) {
    const result = await updateLocationPage(file);
    if (result.success) {
      console.log(`✅ Updated: ${result.file}`);
      updated++;
    } else if (result.error) {
      console.log(`❌ Error: ${result.file} - ${result.error}`);
      errors++;
    } else {
      console.log(`⏭️  Skipped: ${result.file} - ${result.reason}`);
      skipped++;
    }
  }
  
  console.log(`\n✅ Complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

main().catch(console.error);

