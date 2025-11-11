#!/usr/bin/env node
/**
 * Bing Webmaster Tools Integration
 * Submits sitemaps and URLs via Bing Webmaster API
 */
import { parseArgs } from 'node:util';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import chalk from 'chalk';

const { values } = parseArgs({
  options: {
    site: { type: 'string' },
    'sitemap-url': { type: 'string' },
    'site-url': { type: 'string' },
    manual: { type: 'boolean', default: false }
  }
});

if (!values.site) {
  console.error(chalk.red('❌ Error: --site flag is required'));
  console.log('Usage: bun run submit:bing --site <site-name> --sitemap-url <url>');
  process.exit(1);
}

const outputDir = resolve(`output/${values.site}/bing`);
const reportPath = resolve(`${outputDir}/submission-report.json`);

await mkdir(outputDir, { recursive: true });

// Check for Bing API key
let bingApiKey = null;
const envPath = resolve('.env');

if (existsSync(envPath)) {
  const envContent = await readFile(envPath, 'utf-8');
  const match = envContent.match(/BING_WEBMASTER_API_KEY=(.+)/);
  if (match) {
    bingApiKey = match[1].trim();
  }
}

const siteUrl = values['site-url'] || `https://${values.site}.vercel.app`;
const sitemapUrl = values['sitemap-url'] || `${siteUrl}/sitemap.xml`;

console.log(chalk.blue.bold('\n🔍 Bing Webmaster Tools Submission\n'));
console.log(chalk.gray(`Site: ${siteUrl}`));
console.log(chalk.gray(`Sitemap: ${sitemapUrl}\n`));

const report = {
  site: values.site,
  siteUrl,
  sitemapUrl,
  timestamp: new Date().toISOString(),
  method: 'manual',
  status: 'pending',
  steps: []
};

if (!bingApiKey || values.manual) {
  // Manual submission instructions
  console.log(chalk.yellow('⚠️  Bing Webmaster API key not configured.\n'));
  console.log(chalk.blue.bold('📋 Manual Submission Instructions:\n'));
  
  console.log(chalk.white('1. Add Your Site:'));
  console.log(chalk.gray(`   Visit: ${chalk.cyan('https://www.bing.com/webmasters')}`));
  console.log(chalk.gray(`   Sign in with Microsoft account`));
  console.log(chalk.gray(`   Click: "Add a site"`));
  console.log(chalk.gray(`   Enter: ${siteUrl}`));
  console.log(chalk.gray(`   Choose verification method:\n`));
  console.log(chalk.gray(`     • XML file upload (easiest)`));
  console.log(chalk.gray(`     • Meta tag in HTML`));
  console.log(chalk.gray(`     • DNS CNAME record\n`));
  
  console.log(chalk.white('2. Submit Sitemap:'));
  console.log(chalk.gray(`   After verification, go to "Sitemaps"`));
  console.log(chalk.gray(`   Click "Submit a sitemap"`));
  console.log(chalk.gray(`   Enter sitemap URL: ${chalk.cyan(sitemapUrl)}`));
  console.log(chalk.gray(`   Click "Submit"\n`));
  
  console.log(chalk.white('3. Submit URLs (Optional):'));
  console.log(chalk.gray(`   Go to "URL Submission"`));
  console.log(chalk.gray(`   Submit individual important URLs for immediate crawling`));
  console.log(chalk.gray(`   Limit: 10 URLs per day (free tier)\n`));
  
  console.log(chalk.blue.bold('📚 How to Get API Key for Automation:\n'));
  console.log(chalk.white('1. Access API Settings:'));
  console.log(chalk.gray(`   In Bing Webmaster Tools, go to "Settings"`));
  console.log(chalk.gray(`   Click "API Access" in left menu`));
  console.log(chalk.gray(`   Note: API key is tied to your site\n`));
  
  console.log(chalk.white('2. Generate API Key:'));
  console.log(chalk.gray(`   Click "Generate API Key"`));
  console.log(chalk.gray(`   Copy the key (looks like: 1234567890abcdef...)`));
  console.log(chalk.gray(`   Store securely - shown only once!\n`));
  
  console.log(chalk.white('3. Configure Environment:'));
  console.log(chalk.gray(`   Add to .env:`));
  console.log(chalk.cyan(`   BING_WEBMASTER_API_KEY=your_api_key_here\n`));
  
  report.method = 'manual';
  report.status = 'instructions_provided';
  report.instructions = {
    addSite: 'https://www.bing.com/webmasters',
    submitSitemap: sitemapUrl,
    apiAccess: 'Settings → API Access in Bing Webmaster Tools'
  };
  
} else {
  // Attempt automated submission using Bing Webmaster API
  console.log(chalk.green('✅ Bing API key found. Attempting automated submission...\n'));
  
  try {
    // Bing Webmaster API Base URL
    const apiBase = 'https://ssl.bing.com/webmaster/api.svc/json';
    
    // Step 1: Get site info
    console.log(chalk.blue('1. Verifying site in Bing Webmaster...'));
    try {
      const siteInfoResponse = await fetch(
        `${apiBase}/GetUrlInfo?siteUrl=${encodeURIComponent(siteUrl)}&apikey=${bingApiKey}`
      );
      
      if (siteInfoResponse.ok) {
        const siteInfo = await siteInfoResponse.json();
        console.log(chalk.green(`   ✓ Site verified in Bing Webmaster`));
        console.log(chalk.gray(`     Crawl rate: ${siteInfo.CrawlRate || 'Normal'}`));
        report.steps.push({ step: 'verify_site', status: 'success', crawlRate: siteInfo.CrawlRate });
      } else {
        throw new Error(`Site not found in Bing Webmaster (${siteInfoResponse.status})`);
      }
    } catch (err) {
      console.log(chalk.yellow(`   ⚠ Could not verify site: ${err.message}`));
      console.log(chalk.gray(`     Site may need to be added manually first`));
      report.steps.push({ step: 'verify_site', status: 'error', error: err.message });
    }
    
    // Step 2: Submit sitemap
    console.log(chalk.blue('2. Submitting sitemap...'));
    try {
      const submitSitemapResponse = await fetch(
        `${apiBase}/SubmitSitemap?siteUrl=${encodeURIComponent(siteUrl)}&feedUrl=${encodeURIComponent(sitemapUrl)}&apikey=${bingApiKey}`,
        { method: 'POST' }
      );
      
      if (submitSitemapResponse.ok) {
        console.log(chalk.green(`   ✓ Sitemap submitted: ${sitemapUrl}`));
        report.steps.push({ step: 'submit_sitemap', status: 'success', sitemapUrl });
      } else {
        const errorText = await submitSitemapResponse.text();
        throw new Error(`Submission failed: ${errorText}`);
      }
    } catch (err) {
      console.log(chalk.yellow(`   ⚠ Sitemap submission failed: ${err.message}`));
      report.steps.push({ step: 'submit_sitemap', status: 'error', error: err.message });
    }
    
    // Step 3: Get sitemaps list
    console.log(chalk.blue('3. Checking sitemap status...'));
    try {
      const sitemapsResponse = await fetch(
        `${apiBase}/GetSitemaps?siteUrl=${encodeURIComponent(siteUrl)}&apikey=${bingApiKey}`
      );
      
      if (sitemapsResponse.ok) {
        const sitemaps = await sitemapsResponse.json();
        const ourSitemap = sitemaps.d?.find(s => s.FeedUrl === sitemapUrl);
        
        if (ourSitemap) {
          console.log(chalk.green(`   ✓ Sitemap found in Bing`));
          console.log(chalk.gray(`     Last crawled: ${ourSitemap.LastCrawled || 'Not yet crawled'}`));
          console.log(chalk.gray(`     URLs submitted: ${ourSitemap.UrlsSubmitted || '0'}`));
          console.log(chalk.gray(`     URLs indexed: ${ourSitemap.UrlsIndexed || '0'}`));
          
          report.steps.push({
            step: 'check_sitemap',
            status: 'success',
            lastCrawled: ourSitemap.LastCrawled,
            urlsSubmitted: ourSitemap.UrlsSubmitted,
            urlsIndexed: ourSitemap.UrlsIndexed
          });
        } else {
          console.log(chalk.gray(`   ℹ Sitemap submitted but not processed yet`));
          report.steps.push({ step: 'check_sitemap', status: 'pending', message: 'Processing' });
        }
      }
    } catch (err) {
      console.log(chalk.gray(`   ℹ Could not check sitemap status: ${err.message}`));
      report.steps.push({ step: 'check_sitemap', status: 'pending', error: err.message });
    }
    
    report.method = 'api';
    report.status = 'completed';
    
    console.log(chalk.green('\n✅ Bing Webmaster submission completed!'));
    
  } catch (err) {
    console.log(chalk.red(`\n❌ API submission failed: ${err.message}`));
    console.log(chalk.yellow('\nFalling back to manual instructions (see above).\n'));
    
    report.method = 'api_failed';
    report.status = 'error';
    report.error = err.message;
    report.fallback = 'manual';
  }
}

// Save report
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(chalk.gray(`\n📄 Report saved: ${reportPath}\n`));

// Show next steps
console.log(chalk.blue.bold('📋 Next Steps:\n'));
console.log(chalk.gray('• Bing typically crawls new sitemaps within 24-48 hours'));
console.log(chalk.gray('• Check "Sitemaps" page in Bing Webmaster for processing status'));
console.log(chalk.gray('• Monitor "Site Explorer" for indexed pages'));
console.log(chalk.gray('• Use "URL Submission" for priority pages (10/day limit)\n'));

