import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://bluelawns.com';
const SERVICES_JSON_PATH = 'sites/blue-lawns/src/content/services.json';
const TARGET_DIR_BASE = 'sites/blue-lawns/src/assets/images/services';

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
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

async function findServiceUrl(homepageHtml: string, keywords: string[]): Promise<string | null> {
  const $ = cheerio.load(homepageHtml);
  let targetUrl: string | null = null;

  // Prioritize exact matches in href first
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    
    // Clean href
    const cleanHref = href.toLowerCase().replace(/\/$/, '');

    for (const keyword of keywords) {
      const k = keyword.toLowerCase();
      // Check for strong match in URL
      if (cleanHref.includes(`/${k}`) || cleanHref === k) {
         targetUrl = href.startsWith('http') ? href : (href.startsWith('/') ? BASE_URL + href : BASE_URL + '/' + href);
         return false;
      }
    }
  });

  if (targetUrl) return targetUrl;

  // Fallback to text matching
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().toLowerCase();
    
    if (!href) return;

    for (const keyword of keywords) {
      const k = keyword.toLowerCase();
      if (text.includes(k)) {
        targetUrl = href.startsWith('http') ? href : (href.startsWith('/') ? BASE_URL + href : BASE_URL + '/' + href);
        return false; 
      }
    }
  });

  return targetUrl;
}

async function extractImageFromPage(html: string): Promise<string | null> {
  const $ = cheerio.load(html);
  
  // 1. OG Image
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage && !ogImage.includes('placeholder') && !ogImage.includes('logo')) {
    return ogImage.startsWith('http') ? ogImage : BASE_URL + ogImage;
  }

  // 2. Main Content Image (look for large images in content areas)
  let bestImg: string | null = null;
  const contentSelectors = ['main', 'article', '.content', '.entry-content', '#primary'];
  
  for (const selector of contentSelectors) {
    $(`${selector} img`).each((i, el) => {
      const src = $(el).attr('src');
      if (src && !src.includes('icon') && !src.includes('logo') && !src.includes('avatar')) {
         bestImg = src.startsWith('http') ? src : BASE_URL + src;
         return false; // Take first significant image
      }
    });
    if (bestImg) break;
  }

  return bestImg;
}

async function main() {
  console.log('--- Starting Smart Crawl ---');
  
  // 1. Load Homepage for Discovery
  console.log(`Fetching homepage: ${BASE_URL}`);
  const homepageHtml = await fetchHtml(BASE_URL);
  if (!homepageHtml) {
    console.error("Failed to load homepage. Aborting.");
    return;
  }

  const servicesRaw = await fs.readFile(SERVICES_JSON_PATH, 'utf-8');
  const services = JSON.parse(servicesRaw);
  let updatedCount = 0;

  for (const service of services) {
    console.log(`\nProcessing: ${service.title}`);
    
    // Keywords for discovery
    const keywords = [service.slug];
    // Add variations
    if (service.slug === 'landscape-maintenance') keywords.push('maintenance');
    if (service.slug === 'hardscaping') keywords.push('paver', 'patio');
    if (service.slug === 'commercial-services') keywords.push('commercial');
    
    // Discovery
    const serviceUrl = await findServiceUrl(homepageHtml, keywords);
    
    if (!serviceUrl) {
      console.warn(`[MISS] No link found for ${service.title}`);
      continue;
    }
    console.log(`[FOUND] Link: ${serviceUrl}`);

    // Extraction
    const serviceHtml = await fetchHtml(serviceUrl);
    if (!serviceHtml) continue;

    const imageUrl = await extractImageFromPage(serviceHtml);
    if (!imageUrl) {
      console.warn(`[MISS] No suitable image found on ${serviceUrl}`);
      continue;
    }

    // Optimization & Saving
    // Note: Filename changed to include -service-hero as per prompt
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
