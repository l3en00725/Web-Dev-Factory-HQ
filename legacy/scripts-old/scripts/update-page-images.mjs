#!/usr/bin/env node

/**
 * Update Page Images Script
 * 
 * This script updates all Astro pages with optimized images from the placement map.
 */

import fs from 'fs/promises';
import path from 'path';

const PLACEMENT_MAP_PATH = path.resolve('output/blue-lawns/image-placement-map.json');
const PAGES_DIR = path.resolve('sites/blue-lawns/src/pages');
const OUTPUT_LOG = path.resolve('output/blue-lawns/page-image-updates.md');

// Page file mapping
const PAGE_FILES = {
  'index': 'index.astro',
  'services': 'services.astro',
  'pools': 'pools.astro',
  'about': 'about.astro'
};

async function main() {
  console.log('🖼️  Starting page image updates...\n');

  // Read placement map
  const placementMapContent = await fs.readFile(PLACEMENT_MAP_PATH, 'utf-8');
  const placementMap = JSON.parse(placementMapContent);

  const updates = [];

  // Update each page
  for (const [pageName, fileName] of Object.entries(PAGE_FILES)) {
    const filePath = path.join(PAGES_DIR, fileName);
    const imageData = placementMap[pageName];

    if (!imageData) {
      console.log(`⚠️  No image data for ${pageName}`);
      continue;
    }

    try {
      let content = await fs.readFile(filePath, 'utf-8');
      const originalContent = content;

      // Update hero image if specified
      if (imageData.hero && imageData.hero.length > 0) {
        const heroImg = imageData.hero[0];
        content = updateHeroImage(content, heroImg, pageName);
      }

      // Add gallery section if not exists
      if (imageData.gallery && imageData.gallery.length > 0) {
        content = addOrUpdateGallery(content, imageData.gallery, pageName);
      }

      // Only write if content changed
      if (content !== originalContent) {
        await fs.writeFile(filePath, content, 'utf-8');
        updates.push({
          page: pageName,
          file: fileName,
          heroUpdated: imageData.hero?.length > 0,
          galleryCount: imageData.gallery?.length || 0
        });
        console.log(`✅ Updated ${fileName}`);
      } else {
        console.log(`ℹ️  No changes needed for ${fileName}`);
      }

    } catch (error) {
      console.log(`❌ Error updating ${fileName}: ${error.message}`);
    }
  }

  // Generate log
  await generateLog(updates);

  console.log('\n✨ Page image updates complete!');
  console.log(`📄 Update log: ${OUTPUT_LOG}`);
}

function updateHeroImage(content, heroImg, pageName) {
  // Look for hero section and update/add hero image
  const heroSectionRegex = /<section[^>]*class="[^"]*hero[^"]*"[^>]*>([\s\S]*?)<\/section>/i;
  
  if (heroSectionRegex.test(content)) {
    // Hero section exists, check if it has an image
    const match = content.match(heroSectionRegex);
    const heroContent = match[1];
    
    if (/<img/.test(heroContent)) {
      // Replace existing img tag
      content = content.replace(
        /<img[^>]*\/>/,
        `<img src="${heroImg.src}" alt="${heroImg.alt}" class="hero__image" />`
      );
    } else {
      // Add image to hero section
      content = content.replace(
        heroSectionRegex,
        (match, heroContent) => {
          return match.replace(
            heroContent,
            `${heroContent}\n      <img src="${heroImg.src}" alt="${heroImg.alt}" class="hero__image w-full max-w-4xl mx-auto rounded-lg shadow-lg mt-8" />`
          );
        }
      );
    }
  }
  
  return content;
}

function addOrUpdateGallery(content, galleryImages, pageName) {
  const galleryId = `gallery-${pageName}`;
  
  // Generate gallery HTML
  const galleryHTML = `
  <!-- Image Gallery - Generated from SEO-optimized images -->
  <section id="${galleryId}" class="section bg-gray-50">
    <div class="section__inner">
      <h2 class="section__heading text-center mb-8">Our Work in Cape May County</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
${galleryImages.slice(0, 9).map(img => `        <div class="gallery__item overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
          <img 
            src="${img.src}" 
            alt="${img.alt}"
            class="w-full h-64 object-cover"
            loading="lazy"
          />
        </div>`).join('\n')}
      </div>
    </div>
  </section>`;

  // Check if gallery already exists
  const existingGalleryRegex = new RegExp(`<section[^>]*id="${galleryId}"[^>]*>[\\s\\S]*?</section>`, 'i');
  
  if (existingGalleryRegex.test(content)) {
    // Replace existing gallery
    content = content.replace(existingGalleryRegex, galleryHTML.trim());
  } else {
    // Add before closing </Container> or </Layout>
    const insertPoint = content.lastIndexOf('</Container>');
    if (insertPoint !== -1) {
      content = content.slice(0, insertPoint) + '\n' + galleryHTML + '\n  ' + content.slice(insertPoint);
    }
  }
  
  return content;
}

async function generateLog(updates) {
  const timestamp = new Date().toISOString();
  
  const log = `# Page Image Updates Report
**Generated:** ${timestamp}

## Summary
- **Pages Updated:** ${updates.length}
- **Total Hero Images:** ${updates.filter(u => u.heroUpdated).length}
- **Total Gallery Images:** ${updates.reduce((sum, u) => sum + u.galleryCount, 0)}

## Updated Pages
${updates.map(u => `### ${u.page} (\`${u.file}\`)
- **Hero Image:** ${u.heroUpdated ? '✅ Updated' : '❌ Not updated'}
- **Gallery Images:** ${u.galleryCount} images added`).join('\n\n')}

## Next Steps
1. Review all updated pages in the browser
2. Verify hero images display correctly
3. Test gallery responsiveness
4. Run Lighthouse audit to confirm SEO improvements

---
*Generated by update-page-images.mjs*
`;

  await fs.writeFile(OUTPUT_LOG, log, 'utf-8');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

