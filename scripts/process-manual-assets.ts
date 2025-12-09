import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIRS = [
  'sites/blue-lawns/src/assets/images', 
  'sites/blue-lawns',
  'sites/blue-lawns/public/images' // Added fallback
]; 
const TARGET_BASE = 'sites/blue-lawns/src/assets/images/services';
const SERVICES_JSON = 'sites/blue-lawns/src/content/services.json';

// Map specific filenames (without extension) to slugs
const MANUAL_MAP: Record<string, string> = {
  'commercial': 'commercial-services',
  'pool-maintenance': 'pool-service',
  'pool': 'pool-service',
  'maintenance': 'landscape-maintenance',
  'lighting': 'landscape-lighting',
  'cleanup': 'seasonal-cleanup',
  'seasonal-clean-up': 'seasonal-cleanup',
  'seasonal-cleanup': 'seasonal-cleanup',
  'powerwashing': 'power-washing',
  'pressure-washing': 'power-washing',
  'fence': 'fencing',
  'lawn': 'lawn-care',
  'hardscape': 'hardscaping',
  'pavers': 'hardscaping',
};

async function main() {
  console.log('--- Starting Manual Asset Processing ---');

  // 1. Load Services
  const servicesRaw = await fs.readFile(SERVICES_JSON, 'utf-8');
  const services = JSON.parse(servicesRaw);
  const slugs = services.map((s: any) => s.slug);
  let updatedCount = 0;

  // 2. Find Candidates
  const candidates: { path: string; slug: string }[] = [];
  const processedSlugs = new Set(); // Prevent duplicates

  for (const dir of SOURCE_DIRS) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;

        const name = path.parse(file).name.toLowerCase();
        let matchedSlug: string | undefined = slugs.find((s: string) => s === name); // Exact match

        if (!matchedSlug) {
            matchedSlug = MANUAL_MAP[name]; // Manual map match
        }
        
        if (matchedSlug && !processedSlugs.has(matchedSlug)) {
          candidates.push({ path: path.join(dir, file), slug: matchedSlug });
          processedSlugs.add(matchedSlug);
        }
      }
    } catch (e) {
      // dir might not exist or empty
      console.warn(`Could not read dir: ${dir}`);
    }
  }

  console.log(`Found ${candidates.length} candidate images.`);

  // 3. Process
  for (const candidate of candidates) {
    console.log(`Processing ${candidate.path} -> ${candidate.slug}`);
    
    const targetDir = path.join(TARGET_BASE, candidate.slug);
    const targetFile = path.join(targetDir, 'hero-manual.webp');
    
    await fs.mkdir(targetDir, { recursive: true });

    try {
        const image = sharp(candidate.path);
        const metadata = await image.metadata();

        await image
            .resize(1200, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(targetFile);
            
        // Update JSON
        const service = services.find((s: any) => s.slug === candidate.slug);
        if (service) {
            service.heroImage = `src/assets/images/services/${candidate.slug}/hero-manual.webp`;
            service.alt = `${service.title} services by Blue Lawns in Cape May County`;
            updatedCount++;
        }
        
        console.log(`✅ Optimized & Mapped: ${candidate.slug}`);
    } catch (e) {
        console.error(`Failed to process ${candidate.path}:`, e);
    }
  }

  // 4. Save JSON
  if (updatedCount > 0) {
    await fs.writeFile(SERVICES_JSON, JSON.stringify(services, null, 2));
    console.log(`\nSUCCESS: Updated ${updatedCount} services in services.json`);
  } else {
    console.log('\nNo matching manual assets found to process.');
  }
}

main().catch(console.error);

