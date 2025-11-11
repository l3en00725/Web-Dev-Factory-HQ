#!/usr/bin/env node
import { readFile, readdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { load } from 'cheerio';

const scrapeDir = './output/blue-lawns/scrape';
const outputCsv = './output/blue-lawns/seo-backup.csv';

const seoData = [];

// Read all HTML files
const files = await readdir(scrapeDir);
const htmlFiles = files.filter(f => f.endsWith('.html'));

console.log(`📊 Extracting SEO data from ${htmlFiles.length} HTML files...`);

for (const file of htmlFiles) {
  try {
    const html = await readFile(join(scrapeDir, file), 'utf-8');
    const $ = load(html);
    
    // Determine URL from filename
    let url = '/';
    if (file !== 'index.html') {
      url = '/' + file.replace('.html', '').replace(/-/g, '/');
    }
    
    // Extract SEO elements
    const title = $('title').first().text().trim();
    const description = $('meta[name="description"]').attr('content')?.trim() || '';
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';
    const ogDescription = $('meta[property="og:description"]').attr('content')?.trim() || '';
    
    // Extract headings
    const h1 = $('h1').first().text().trim();
    const h2List = [];
    $('h2').each((i, el) => {
      const text = $(el).text().trim();
      if (text) h2List.push(text);
    });
    const h2 = h2List.slice(0, 3).join(' | '); // First 3 H2s
    
    seoData.push({
      url,
      file,
      title,
      description,
      canonical,
      ogTitle,
      ogDescription,
      h1,
      h2
    });
    
    console.log(`  ✅ ${file}: ${title.substring(0, 50)}...`);
  } catch (err) {
    console.warn(`  ⚠️  Failed to process ${file}: ${err.message}`);
  }
}

// Generate CSV
const headers = ['url', 'file', 'title', 'description', 'canonical', 'og_title', 'og_description', 'h1', 'h2'];
const csvRows = [headers.join(',')];

for (const row of seoData) {
  const values = [
    `"${row.url}"`,
    `"${row.file}"`,
    `"${row.title.replace(/"/g, '""')}"`,
    `"${row.description.replace(/"/g, '""')}"`,
    `"${row.canonical}"`,
    `"${row.ogTitle.replace(/"/g, '""')}"`,
    `"${row.ogDescription.replace(/"/g, '""')}"`,
    `"${row.h1.replace(/"/g, '""')}"`,
    `"${row.h2.replace(/"/g, '""')}"`
  ];
  csvRows.push(values.join(','));
}

await writeFile(outputCsv, csvRows.join('\n'), 'utf-8');

console.log(`\n✅ SEO backup complete!`);
console.log(`   Pages analyzed: ${seoData.length}`);
console.log(`   Output: ${outputCsv}`);
console.log(`\n📋 Sample data:`);
seoData.slice(0, 3).forEach(row => {
  console.log(`   ${row.url}`);
  console.log(`   Title: ${row.title}`);
  console.log(`   H1: ${row.h1}`);
  console.log('');
});
