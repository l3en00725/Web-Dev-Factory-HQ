#!/usr/bin/env node
// scripts/scrape-old-site.mjs
// Wrapper script to scrape old site and output to site-specific folder

import { parseArgs } from 'util';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { spawn } from 'child_process';

const { values } = parseArgs({
  options: {
    site: { type: 'string', required: true },
    url: { type: 'string', required: true },
    mode: { type: 'string' }, // 'simple', 'browser', 'auto'
    'max-pages': { type: 'string' },
  },
  strict: false,
});

const siteName = values.site;
const sourceUrl = values.url;
const siteDir = resolve(`sites/${siteName}`);
const outputDir = join(siteDir, 'data', 'scraped');

// Validate site folder exists
if (!existsSync(siteDir)) {
  console.error(`❌ Error: Site folder not found: ${siteDir}`);
  process.exit(1);
}

console.log(`\n🔍 Scraping old site for: ${siteName}`);
console.log(`   Source URL: ${sourceUrl}`);
console.log(`   Output: ${outputDir}\n`);

// Build scraper command
const scraperArgs = [
  'run',
  'scripts/scraper/index.mjs',
  '--url', sourceUrl,
  '--output', outputDir,
];

if (values.mode) scraperArgs.push('--mode', values.mode);
if (values['max-pages']) scraperArgs.push('--max-pages', values['max-pages']);

// Execute scraper
const scraper = spawn('bun', scraperArgs, {
  stdio: 'inherit',
  cwd: process.cwd(),
});

scraper.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ Scraping complete for ${siteName}`);
    console.log(`   Data saved to: ${outputDir}\n`);
  } else {
    console.error(`\n❌ Scraping failed with exit code ${code}\n`);
    process.exit(code);
  }
});

