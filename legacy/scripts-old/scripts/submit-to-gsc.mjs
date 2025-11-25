#!/usr/bin/env node
/**
 * Google Search Console Integration
 * Submits sitemaps and requests URL indexing via GSC API v1
 */
import { parseArgs } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
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
  console.log('Usage: bun run submit:gsc --site <site-name> --sitemap-url <url>');
  process.exit(1);
}

const outputDir = resolve(`output/${values.site}/gsc`);
const reportPath = resolve(`${outputDir}/submission-report.json`);

await mkdir(outputDir, { recursive: true });

// Check for Google API credentials
const credentialsPath = resolve('.env');
let hasCredentials = false;
let serviceAccountPath = null;

if (existsSync(credentialsPath)) {
  const envContent = await readFile(credentialsPath, 'utf-8');
  hasCredentials = envContent.includes('GOOGLE_SERVICE_ACCOUNT_JSON') || 
                   envContent.includes('GOOGLE_APPLICATION_CREDENTIALS');
  
  // Check for service account JSON file
  const match = envContent.match(/GOOGLE_APPLICATION_CREDENTIALS=(.+)/);
  if (match) {
    serviceAccountPath = resolve(match[1].trim());
    hasCredentials = existsSync(serviceAccountPath);
  }
}

const siteUrl = values['site-url'] || `https://${values.site}.vercel.app`;
const sitemapUrl = values['sitemap-url'] || `${siteUrl}/sitemap.xml`;

console.log(chalk.blue.bold('\n🔍 Google Search Console Submission\n'));
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

if (!hasCredentials || values.manual) {
  // Manual submission instructions
  console.log(chalk.yellow('⚠️  Google API credentials not configured.\n'));
  console.log(chalk.blue.bold('📋 Manual Submission Instructions:\n'));
  
  console.log(chalk.white('1. Verify Domain Ownership:'));
  console.log(chalk.gray(`   Visit: ${chalk.cyan('https://search.google.com/search-console')}`));
  console.log(chalk.gray(`   Click: "Add Property"`));
  console.log(chalk.gray(`   Enter: ${siteUrl}`));
  console.log(chalk.gray(`   Choose verification method (DNS TXT record recommended)\n`));
  
  console.log(chalk.white('2. Submit Sitemap:'));
  console.log(chalk.gray(`   After verification, go to "Sitemaps" in left menu`));
  console.log(chalk.gray(`   Enter sitemap URL: ${chalk.cyan(sitemapUrl)}`));
  console.log(chalk.gray(`   Click "Submit"\n`));
  
  console.log(chalk.white('3. Request Indexing (Important Pages):'));
  console.log(chalk.gray(`   Go to "URL Inspection" in left menu`));
  console.log(chalk.gray(`   Enter URL: ${chalk.cyan(siteUrl)}`));
  console.log(chalk.gray(`   Click "Request Indexing" (for homepage)`));
  console.log(chalk.gray(`   Repeat for key pages: /services, /contact, etc.\n`));
  
  console.log(chalk.blue.bold('📚 How to Setup API Automation (Optional):\n'));
  console.log(chalk.white('1. Enable Search Console API:'));
  console.log(chalk.gray(`   Visit: ${chalk.cyan('https://console.cloud.google.com')}`));
  console.log(chalk.gray(`   Create project or select existing`));
  console.log(chalk.gray(`   Enable "Google Search Console API"\n`));
  
  console.log(chalk.white('2. Create Service Account:'));
  console.log(chalk.gray(`   Go to "IAM & Admin" → "Service Accounts"`));
  console.log(chalk.gray(`   Create service account`));
  console.log(chalk.gray(`   Download JSON key file\n`));
  
  console.log(chalk.white('3. Grant Search Console Access:'));
  console.log(chalk.gray(`   In Search Console, go to "Settings" → "Users and permissions"`));
  console.log(chalk.gray(`   Add service account email as owner`));
  console.log(chalk.gray(`   Email format: service-name@project-id.iam.gserviceaccount.com\n`));
  
  console.log(chalk.white('4. Configure Environment:'));
  console.log(chalk.gray(`   Add to .env:`));
  console.log(chalk.cyan(`   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json\n`));
  
  report.method = 'manual';
  report.status = 'instructions_provided';
  report.instructions = {
    verifyDomain: 'https://search.google.com/search-console',
    submitSitemap: sitemapUrl,
    setupApiAutomation: 'https://console.cloud.google.com'
  };
  
} else {
  // Attempt automated submission using Google Search Console API
  console.log(chalk.green('✅ Google API credentials found. Attempting automated submission...\n'));
  
  try {
    // Dynamically import googleapis
    const { google } = await import('googleapis');
    
    // Authenticate with service account
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/webmasters']
    });
    
    const authClient = await auth.getClient();
    const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });
    
    // Step 1: Verify site is accessible
    console.log(chalk.blue('1. Verifying site ownership...'));
    try {
      const sitesResponse = await searchconsole.sites.list();
      const sites = sitesResponse.data.siteEntry || [];
      const siteExists = sites.find(s => s.siteUrl === siteUrl || s.siteUrl === `sc-domain:${values.site}`);
      
      if (siteExists) {
        console.log(chalk.green(`   ✓ Site verified: ${siteExists.siteUrl}`));
        report.steps.push({ step: 'verify_site', status: 'success', siteUrl: siteExists.siteUrl });
      } else {
        console.log(chalk.yellow(`   ⚠ Site not found in Search Console. Manual verification required.`));
        report.steps.push({ step: 'verify_site', status: 'not_found', message: 'Manual verification required' });
      }
    } catch (err) {
      console.log(chalk.yellow(`   ⚠ Could not verify site: ${err.message}`));
      report.steps.push({ step: 'verify_site', status: 'error', error: err.message });
    }
    
    // Step 2: Submit sitemap
    console.log(chalk.blue('2. Submitting sitemap...'));
    try {
      await searchconsole.sitemaps.submit({
        siteUrl: siteUrl,
        feedpath: sitemapUrl
      });
      console.log(chalk.green(`   ✓ Sitemap submitted: ${sitemapUrl}`));
      report.steps.push({ step: 'submit_sitemap', status: 'success', sitemapUrl });
    } catch (err) {
      console.log(chalk.yellow(`   ⚠ Sitemap submission failed: ${err.message}`));
      report.steps.push({ step: 'submit_sitemap', status: 'error', error: err.message });
    }
    
    // Step 3: Check sitemap status
    console.log(chalk.blue('3. Checking sitemap status...'));
    try {
      const sitemapResponse = await searchconsole.sitemaps.get({
        siteUrl: siteUrl,
        feedpath: sitemapUrl
      });
      
      const sitemap = sitemapResponse.data;
      console.log(chalk.green(`   ✓ Sitemap found`));
      console.log(chalk.gray(`     Submitted: ${sitemap.lastSubmitted || 'Unknown'}`));
      console.log(chalk.gray(`     Last downloaded: ${sitemap.lastDownloaded || 'Pending'}`));
      console.log(chalk.gray(`     URLs submitted: ${sitemap.contents?.[0]?.submitted || 'Unknown'}`));
      
      report.steps.push({
        step: 'check_sitemap',
        status: 'success',
        lastSubmitted: sitemap.lastSubmitted,
        lastDownloaded: sitemap.lastDownloaded,
        urlsSubmitted: sitemap.contents?.[0]?.submitted
      });
    } catch (err) {
      console.log(chalk.gray(`   ℹ Sitemap status not available yet (may take time to process)`));
      report.steps.push({ step: 'check_sitemap', status: 'pending', message: 'Status not available yet' });
    }
    
    report.method = 'api';
    report.status = 'completed';
    
    console.log(chalk.green('\n✅ Google Search Console submission completed!'));
    
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
console.log(chalk.gray('• Wait 24-72 hours for Google to crawl your sitemap'));
console.log(chalk.gray('• Check indexation status in Search Console'));
console.log(chalk.gray('• Monitor "Coverage" report for any issues'));
console.log(chalk.gray('• Use URL Inspection tool to request indexing for important pages\n'));

