#!/usr/bin/env node

/**
 * Generate sitemap.xml
 * Includes all pages: Homepage, Services, Locations, Static pages
 * Prepared for future Location×Service matrix (100 pages)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Import data
const servicesPath = path.join(ROOT_DIR, 'src', 'content', 'services.json');
const locationsPath = path.join(ROOT_DIR, 'src', 'content', 'locations.json');
const settingsPath = path.join(ROOT_DIR, 'src', 'content', 'settings.json');

const services = JSON.parse(await fs.readFile(servicesPath, 'utf-8'));
const locations = JSON.parse(await fs.readFile(locationsPath, 'utf-8'));
const settings = JSON.parse(await fs.readFile(settingsPath, 'utf-8'));

const SITE_URL = settings.siteUrl || 'https://www.bluelawns.com';

// URL entries with priority and change frequency
const urls = [];

/**
 * Add URL to sitemap
 */
function addUrl(loc, priority, changefreq = 'weekly', lastmod = null) {
  urls.push({
    loc: loc.startsWith('http') ? loc : `${SITE_URL}${loc}`,
    priority,
    changefreq,
    lastmod: lastmod || new Date().toISOString().split('T')[0],
  });
}

// Homepage
addUrl('/', 1.0, 'weekly');

// Services
addUrl('/services', 0.9, 'weekly');
services.forEach((service) => {
  addUrl(`/services/${service.slug}`, 0.8, 'monthly');
});

// Locations
addUrl('/locations', 0.9, 'weekly');
locations.forEach((location) => {
  addUrl(`/locations/${location.slug}`, 0.8, 'monthly');
});

// Location × Service Matrix (✅ NOW ACTIVE!)
locations.forEach((location) => {
  services.forEach((service) => {
    addUrl(`/locations/${location.slug}/${service.slug}`, 0.7, 'monthly');
  });
});

// Static Pages
addUrl('/membership', 0.7, 'monthly');
addUrl('/contact', 0.9, 'weekly');

// Sort by priority (descending)
urls.sort((a, b) => b.priority - a.priority);

// Generate XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

// Save sitemap
const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
await fs.writeFile(sitemapPath, xml);

console.log('✅ Sitemap generated successfully');
console.log(`📍 Total URLs: ${urls.length}`);
console.log(`📁 Saved to: ${sitemapPath}`);
console.log('\nBreakdown:');
console.log(`  - Homepage: 1`);
console.log(`  - Service pages: ${services.length + 1}`);
console.log(`  - Location pages: ${locations.length + 1}`);
console.log(`  - Static pages: 2`);
console.log(`  - Location×Service matrix: ${locations.length * services.length}`);
console.log(`  - Total: ${urls.length}`);

