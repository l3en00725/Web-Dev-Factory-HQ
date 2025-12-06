#!/usr/bin/env node
// scripts/scraper/index.mjs
// Main scraper entry point with auto-fallback logic
// Implements two-tier scraping: Tier 1 (simple) → Tier 2 (Playwright) if needed

import { scrapeSimple } from './tier1-simple.mjs';
import { scrapePlaywright } from './tier2-playwright.mjs';
import { writeJson, ensureDir } from './utils.mjs';
import { join } from 'path';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    url: { type: 'string', short: 'u' },
    mode: { type: 'string', default: 'auto' }, // 'simple', 'browser', 'auto'
    output: { type: 'string', short: 'o', default: 'data/scraped' },
    'max-pages': { type: 'string', default: '50' },
    'user-agent': { type: 'string' },
  },
  strict: false,
});

if (!values.url) {
  console.error('Error: --url is required');
  process.exit(1);
}

const sourceUrl = values.url;
const mode = values.mode || 'auto';
const outputDir = values.output || 'data/scraped';
const maxPages = parseInt(values['max-pages'] || '50', 10);
const userAgent = values['user-agent'] || 'Web-Dev-Factory-HQ Bot';

const options = { maxPages, userAgent };

async function main() {
  console.log(`\n🔍 Web-Dev-Factory Scraper`);
  console.log(`Source URL: ${sourceUrl}`);
  console.log(`Mode: ${mode}`);
  console.log(`Output: ${outputDir}\n`);
  
  await ensureDir(outputDir);
  
  let result;
  let usedTier = 'unknown';
  
  try {
    if (mode === 'browser') {
      // Force Playwright
      console.log('[Mode] Forcing Playwright (Tier 2)...');
      result = await scrapePlaywright(sourceUrl, options);
      usedTier = 'tier2-playwright';
    } else if (mode === 'simple') {
      // Force simple
      console.log('[Mode] Forcing simple HTML (Tier 1)...');
      result = await scrapeSimple(sourceUrl, options);
      usedTier = 'tier1-simple';
    } else {
      // Auto: Try Tier 1 first, fallback to Tier 2 if needed
      console.log('[Mode] Auto: Trying Tier 1 (simple HTML)...');
      result = await scrapeSimple(sourceUrl, options);
      usedTier = 'tier1-simple';
      
      // Check if Tier 1 succeeded and extracted meaningful content
      const hasContent = result.pages.length > 0 && 
        result.pages.some(p => p.h1 || p.title || p.h2s.length > 0);
      
      if (!hasContent || result.pages.length === 0) {
        console.log('[Auto] Tier 1 detected missing content, falling back to Tier 2 (Playwright)...');
        result = await scrapePlaywright(sourceUrl, options);
        usedTier = 'tier2-playwright';
      }
    }
    
    // Write output files as specified in PLAN
    const siteMap = result.pages.map(p => ({
      url: p.url,
      title: p.title,
    }));
    
    await writeJson(join(outputDir, 'site-map.json'), siteMap);
    await writeJson(join(outputDir, 'pages.json'), result.pages);
    await writeJson(join(outputDir, 'images.json'), result.images);
    await writeJson(join(outputDir, 'service-areas.json'), result.serviceAreas);
    
    console.log(`\n✅ Scraping complete (${usedTier})`);
    console.log(`   Pages: ${result.pages.length}`);
    console.log(`   Images: ${result.images.length}`);
    console.log(`   Service Areas: ${result.serviceAreas.length}`);
    console.log(`\n📁 Output files:`);
    console.log(`   ${join(outputDir, 'site-map.json')}`);
    console.log(`   ${join(outputDir, 'pages.json')}`);
    console.log(`   ${join(outputDir, 'images.json')}`);
    console.log(`   ${join(outputDir, 'service-areas.json')}\n`);
    
  } catch (error) {
    console.error(`\n❌ Scraping failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

