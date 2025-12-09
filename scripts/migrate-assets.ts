import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import * as cheerio from 'cheerio';

// --- CONFIGURATION ---

// INSTRUCTION FOR USER: Please fill in the real URLs from your old site below.
// If a URL is missing or incorrect, the script will skip that service.
// We have pre-filled some based on discovery.
const URL_MAP: Record<string, string> = {
  // Slug : Old Site URL
  
  // 'landscape-maintenance': 'https://bluelawns.com/landscape-maintenance', // 404 - Please update
  // 'landscaping': 'https://bluelawns.com/landscaping', // 404 - Please update
  // 'hardscaping': 'https://bluelawns.com/patios-walkways', // 404 - Please update
  // 'landscape-lighting': 'https://bluelawns.com/landscape-lighting', // 404 - Please update
  
  // 'pool-service': 'https://www.ecoastpoolservice.com', // Found via homepage link but images are icons/logos
  
  // 'commercial-services': 'https://bluelawns.com/commercial', // 404 - Please update
  // 'lawn-care': 'https://bluelawns.com/lawn-care', // 404 - Please update
  // 'seasonal-cleanup': 'https://bluelawns.com/seasonal-cleanup', // 404 - Please update
  // 'power-washing': 'https://bluelawns.com/power-washing', // 404 - Please update
  
  'fencing': 'http://bluefencingnj.com/', // Confirmed working
};

const BASE_URL = 'https://bluelawns.com';
const SERVICES_JSON_PATH = 'sites/blue-lawns/src/content/services.json';
const TARGET_DIR_BASE = 'sites/blue-lawns/src/assets/images/services';

// --- UTILITIES ---

async function fetchHtml(url: string): Promise<string | null> {
  try {
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`HTTP ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.warn(`Failed to fetch ${url}:`, e);
    return null;
  }
}

async function downloadAndProcessImage(url: string, outputPath: string): Promise<boolean> {
  try {
    console.log(`Downloading image: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const buffer = await res.arrayBuffer();

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    const image = sharp(Buffer.from(buffer));
    
    await image
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    console.log(`Saved: ${outputPath}`);
    return true;
  } catch (e) {
    console.error(`Failed to process image from ${url}:`, e);
    return false;
  }
}

async function extractImageFromPage(html: string, baseUrl: string): Promise<string | null> {
  const $ = cheerio.load(html);
  
  // 1. OG Image
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage && !ogImage.includes('placeholder') && !ogImage.includes('logo')) {
    return ogImage.startsWith('http') ? ogImage : new URL(ogImage, baseUrl).toString();
  }

  // 2. Main Content Image (look for large images in content areas)
  let bestImg: string | null = null;
  // Expanded selectors to catch more potential image containers
  const contentSelectors = ['main', 'article', '.content', '.entry-content', '#primary', 'body', '.hero', '#hero'];
  
  for (const selector of contentSelectors) {
    $(`${selector} img`).each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        const lowerSrc = src.toLowerCase();
        if (!lowerSrc.includes('icon') && 
            !lowerSrc.includes('logo') && 
            !lowerSrc.includes('avatar') && 
            !lowerSrc.includes('pixel')) {
             // Resolve relative URLs
             try {
                const fullSrc = src.startsWith('http') ? src : new URL(src, baseUrl).toString();
                // Basic size check by extension or assumption - we take the first "real" looking image
                bestImg = fullSrc;
                return false; // Break loop
             } catch (e) {
                // Invalid URL, skip
             }
        }
      }
    });
    if (bestImg) break;
  }

  return bestImg;
}

// --- MAIN ---

async function main() {
  console.log('--- Starting Explicit Map Asset Migration ---');

  const servicesRaw = await fs.readFile(SERVICES_JSON_PATH, 'utf-8');
  const services = JSON.parse(servicesRaw);
  let updatedCount = 0;

  for (const service of services) {
    console.log(`\nProcessing: ${service.title} (${service.slug})`);
    
    const targetUrl = URL_MAP[service.slug];
    
    if (!targetUrl) {
      console.log(`[SKIP] No URL mapped for ${service.slug}. (Update URL_MAP to fix)`);
      continue;
    }

    // Fetch Page
    const pageHtml = await fetchHtml(targetUrl);
    if (!pageHtml) {
      console.warn(`[FAIL] Could not load page: ${targetUrl}`);
      continue;
    }

    // Extract Image
    const imageUrl = await extractImageFromPage(pageHtml, targetUrl);
    if (!imageUrl) {
      console.warn(`[MISS] No suitable image found on ${targetUrl}`);
      continue;
    }

    // Optimization & Saving
    const outputPath = path.join(TARGET_DIR_BASE, service.slug, `${service.slug}-service-hero.webp`);
    const success = await downloadAndProcessImage(imageUrl, outputPath);

    if (success) {
      // Data Update
      service.heroImage = `src/assets/images/services/${service.slug}/${service.slug}-service-hero.webp`;
      service.alt = `${service.title} by Blue Lawns in Cape May County`;
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    await fs.writeFile(SERVICES_JSON_PATH, JSON.stringify(services, null, 2));
    console.log(`\nSUCCESS: Updated ${updatedCount} services in ${SERVICES_JSON_PATH}`);
  } else {
    console.log('\nNo updates made.');
  }
}

main().catch(console.error);
