import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Using loremflickr as Unsplash Source is deprecated
const SERVICE_BASE_URL = 'https://loremflickr.com/800/600';

const QUERY_MAP: Record<string, string> = {
  // Primary Services
  'landscape-maintenance': 'manicured lawn suburban house new jersey',
  'landscaping': 'landscaped garden flower beds pennsylvania house',
  'hardscaping': 'paver patio fire pit backyard new england', // Enforces pavers/stone
  'landscape-lighting': 'outdoor landscape lighting path lights night house',
  'pool-service': 'residential swimming pool backyard summer northeast', // Avoids resort pools
  'commercial-services': 'office building landscaping manicured lawn',

  // Secondary Services
  'lawn-care': 'green grass lawn mower stripes',
  'seasonal-cleanup': 'fall leaves rake yard autumn', // Forces Fall aesthetic
  'power-washing': 'pressure washing house siding driveway',
  'fencing': 'white vinyl fence backyard grass' // Standard NJ fence style
};

// Fallback logic if slug not found
const DEFAULT_QUERY = 'suburban backyard green grass new jersey';

const TARGET_DIR_BASE = 'sites/blue-lawns/src/assets/images/services';
const AVATAR_DIR = 'sites/blue-lawns/src/assets/images/avatars';

async function downloadImage(url: string, outputPath: string, width: number, height: number) {
  console.log(`Downloading ${url} -> ${outputPath}`);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    await sharp(buffer)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(outputPath);
      
    console.log(`Saved ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${outputPath}:`, error);
  }
}

async function main() {
  // 1. Process Services
  console.log('Processing Services with Geographic Relevance...');
  
  for (const [slug, query] of Object.entries(QUERY_MAP)) {
    // Convert spaces to commas for loremflickr tag search
    const keywords = query.replace(/ /g, ',');
    const url = `${SERVICE_BASE_URL}/${keywords}?random=${Math.random()}`;
    const outputPath = path.join(TARGET_DIR_BASE, slug, 'hero.webp');
    await downloadImage(url, outputPath, 800, 600);
  }

  // 2. Process Avatars (Keeping existing logic)
  console.log('Processing Avatars...');
  const avatarUrls = [
    'https://i.pravatar.cc/300?img=11',
    'https://i.pravatar.cc/300?img=59',
    'https://i.pravatar.cc/300?img=33'
  ];
  
  for (let i = 0; i < avatarUrls.length; i++) {
    const url = avatarUrls[i];
    const outputPath = path.join(AVATAR_DIR, `avatar-${i + 1}.webp`);
    await downloadImage(url, outputPath, 300, 300);
  }
}

main().catch(console.error);
