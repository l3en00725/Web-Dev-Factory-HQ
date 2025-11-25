#!/usr/bin/env node
/**
 * Sitemap Ping Script
 * Notifies search engines about updated sitemap
 */
import { parseArgs } from 'node:util';
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import chalk from 'chalk';

const { values } = parseArgs({
  options: {
    'site-url': { type: 'string' },
    site: { type: 'string' }
  }
});

if (!values['site-url']) {
  console.error(chalk.red('❌ Error: --site-url flag is required'));
  console.log('Usage: bun run ping:sitemap --site-url <url>');
  process.exit(1);
}

const siteUrl = values['site-url'];
const sitemapUrl = `${siteUrl}/sitemap.xml`;
const encodedSitemapUrl = encodeURIComponent(sitemapUrl);

console.log(chalk.blue.bold('\n🔔 Sitemap Ping Service\n'));
console.log(chalk.gray(`Sitemap: ${sitemapUrl}\n`));

const results = {
  sitemapUrl,
  timestamp: new Date().toISOString(),
  pings: []
};

// Google Ping
console.log(chalk.blue('1. Pinging Google...'));
try {
  const googlePingUrl = `https://www.google.com/ping?sitemap=${encodedSitemapUrl}`;
  const googleResponse = await fetch(googlePingUrl, { method: 'GET' });
  
  if (googleResponse.ok || googleResponse.status === 200) {
    console.log(chalk.green('   ✓ Google pinged successfully'));
    results.pings.push({ 
      engine: 'google', 
      status: 'success', 
      statusCode: googleResponse.status 
    });
  } else {
    console.log(chalk.yellow(`   ⚠ Google returned status ${googleResponse.status}`));
    results.pings.push({ 
      engine: 'google', 
      status: 'warning', 
      statusCode: googleResponse.status 
    });
  }
} catch (err) {
  console.log(chalk.red(`   ✗ Google ping failed: ${err.message}`));
  results.pings.push({ 
    engine: 'google', 
    status: 'error', 
    error: err.message 
  });
}

// Bing Ping
console.log(chalk.blue('2. Pinging Bing...'));
try {
  const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodedSitemapUrl}`;
  const bingResponse = await fetch(bingPingUrl, { method: 'GET' });
  
  if (bingResponse.ok || bingResponse.status === 200) {
    console.log(chalk.green('   ✓ Bing pinged successfully'));
    results.pings.push({ 
      engine: 'bing', 
      status: 'success', 
      statusCode: bingResponse.status 
    });
  } else {
    console.log(chalk.yellow(`   ⚠ Bing returned status ${bingResponse.status}`));
    results.pings.push({ 
      engine: 'bing', 
      status: 'warning', 
      statusCode: bingResponse.status 
    });
  }
} catch (err) {
  console.log(chalk.red(`   ✗ Bing ping failed: ${err.message}`));
  results.pings.push({ 
    engine: 'bing', 
    status: 'error', 
    error: err.message 
  });
}

// IndexNow Protocol (Optional - for instant indexing)
console.log(chalk.blue('3. IndexNow Protocol...'));
try {
  // IndexNow requires API key, so we'll just note it for manual setup
  console.log(chalk.gray('   ℹ IndexNow requires API key (optional)'));
  console.log(chalk.gray('   See: https://www.indexnow.org for setup'));
  results.pings.push({ 
    engine: 'indexnow', 
    status: 'not_configured',
    note: 'Requires API key setup'
  });
} catch (err) {
  // Skip
}

console.log();

// Save results if site parameter provided
if (values.site) {
  const outputDir = resolve(`output/${values.site}/sitemap`);
  await mkdir(outputDir, { recursive: true });
  
  const reportPath = resolve(outputDir, 'ping-results.json');
  await writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(chalk.gray(`📄 Report saved: ${reportPath}\n`));
}

// Summary
const successCount = results.pings.filter(p => p.status === 'success').length;
const totalPings = results.pings.filter(p => p.status !== 'not_configured').length;

console.log(chalk.green.bold('═'.repeat(60)));
if (successCount === totalPings) {
  console.log(chalk.green.bold('✅ All Search Engines Notified'));
} else {
  console.log(chalk.yellow.bold(`⚠ ${successCount}/${totalPings} Search Engines Notified`));
}
console.log(chalk.green.bold('═'.repeat(60) + '\n'));

console.log(chalk.blue.bold('📋 What Happens Next:\n'));
console.log(chalk.gray('• Search engines will crawl your sitemap within 24-72 hours'));
console.log(chalk.gray('• Check Search Console for crawl activity'));
console.log(chalk.gray('• Ping again after significant content updates'));
console.log(chalk.gray('• Monitor indexation status in webmaster tools\n'));

console.log(chalk.white('Note: Ping endpoints accept GET requests with sitemap URL.'));
console.log(chalk.white('They do not guarantee immediate crawling but signal updates.\n'));

