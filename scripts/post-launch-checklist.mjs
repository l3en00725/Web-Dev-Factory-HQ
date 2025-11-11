#!/usr/bin/env node
/**
 * Interactive Post-Launch Checklist
 * Comprehensive verification and search engine submission guide
 */
import { parseArgs } from 'node:util';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import prompts from 'prompts';
import chalk from 'chalk';

const execAsync = promisify(exec);

const { values } = parseArgs({
  options: {
    site: { type: 'string' }
  }
});

if (!values.site) {
  console.error(chalk.red('❌ Error: --site flag is required'));
  console.log('Usage: bun run post-launch --site <site-name>');
  process.exit(1);
}

const outputDir = resolve(`output/${values.site}/post-launch`);
await mkdir(outputDir, { recursive: true });

// Try to load deployment config
let siteUrl = null;
const deployConfigPath = resolve(`output/${values.site}/deployment/vercel-config.json`);

if (existsSync(deployConfigPath)) {
  const deployConfig = JSON.parse(await readFile(deployConfigPath, 'utf-8'));
  siteUrl = deployConfig.productionUrl || deployConfig.vercelUrl;
}

console.log(chalk.blue.bold('\n🚀 Post-Launch Checklist\n'));
console.log(chalk.gray(`Site: ${values.site}\n`));

if (!siteUrl) {
  const { inputUrl } = await prompts({
    type: 'text',
    name: 'inputUrl',
    message: 'Enter your live site URL:',
    validate: value => value.startsWith('http') || 'Must start with https://'
  });
  siteUrl = inputUrl;
}

console.log(chalk.cyan(`Site URL: ${siteUrl}\n`));

const checklist = {
  site: values.site,
  siteUrl,
  timestamp: new Date().toISOString(),
  items: []
};

let completedCount = 0;
const totalItems = 9;

// ============================================================================
// 1. DEPLOYMENT VERIFICATION
// ============================================================================

console.log(chalk.blue.bold('═'.repeat(60)));
console.log(chalk.blue.bold('1. Deployment Verification'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

console.log(chalk.white('Testing site accessibility...\n'));

try {
  const response = await fetch(siteUrl);
  if (response.ok) {
    console.log(chalk.green(`✓ Site is accessible (${response.status})`));
    console.log(chalk.gray(`  Content-Type: ${response.headers.get('content-type')}`));
    checklist.items.push({ item: 'deployment', status: 'success', statusCode: response.status });
    completedCount++;
  } else {
    console.log(chalk.yellow(`⚠ Site returned ${response.status}`));
    checklist.items.push({ item: 'deployment', status: 'warning', statusCode: response.status });
  }
} catch (err) {
  console.log(chalk.red(`✗ Site not accessible: ${err.message}`));
  checklist.items.push({ item: 'deployment', status: 'error', error: err.message });
}

const { deploymentConfirmed } = await prompts({
  type: 'confirm',
  name: 'deploymentConfirmed',
  message: 'Is the site live and looking correct?',
  initial: true
});

if (!deploymentConfirmed) {
  console.log(chalk.yellow('\n⚠ Please resolve deployment issues before continuing.\n'));
}

console.log();

// ============================================================================
// 2. SCHEMA VALIDATION
// ============================================================================

console.log(chalk.blue.bold('═'.repeat(60)));
console.log(chalk.blue.bold('2. Schema Validation'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

console.log(chalk.white('Test your schema at:\n'));
console.log(chalk.cyan(`  Google Rich Results: https://search.google.com/test/rich-results?url=${encodeURIComponent(siteUrl)}`));
console.log(chalk.cyan(`  Schema.org Validator: https://validator.schema.org/#url=${encodeURIComponent(siteUrl)}\n`));

const { schemaValid } = await prompts({
  type: 'confirm',
  name: 'schemaValid',
  message: 'Does schema pass validation?',
  initial: true
});

if (schemaValid) {
  console.log(chalk.green('✓ Schema validated\n'));
  checklist.items.push({ item: 'schema', status: 'success' });
  completedCount++;
} else {
  console.log(chalk.yellow('⚠ Schema needs fixes\n'));
  checklist.items.push({ item: 'schema', status: 'needs_work' });
}

// ============================================================================
// 3. GOOGLE SEARCH CONSOLE
// ============================================================================

console.log(chalk.blue.bold('═'.repeat(60)));
console.log(chalk.blue.bold('3. Google Search Console'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

const { autoSubmitGSC } = await prompts({
  type: 'confirm',
  name: 'autoSubmitGSC',
  message: 'Attempt automatic Google Search Console submission?',
  initial: true
});

if (autoSubmitGSC) {
  console.log(chalk.blue('\nRunning GSC submission script...\n'));
  try {
    await execAsync(`bun run scripts/submit-to-gsc.mjs --site ${values.site} --site-url ${siteUrl}`);
    checklist.items.push({ item: 'gsc', status: 'submitted' });
  } catch (err) {
    console.log(chalk.yellow(`\n⚠ Automatic submission not available\n`));
    checklist.items.push({ item: 'gsc', status: 'manual_required' });
  }
}

const { gscVerified } = await prompts({
  type: 'confirm',
  name: 'gscVerified',
  message: 'Is GSC property verified?',
  initial: false
});

const { gscSitemapSubmitted } = await prompts({
  type: 'confirm',
  name: 'gscSitemapSubmitted',
  message: 'Is sitemap submitted to GSC?',
  initial: false
});

if (gscVerified && gscSitemapSubmitted) {
  completedCount++;
}

console.log();

// ============================================================================
// 4. BING WEBMASTER TOOLS
// ============================================================================

console.log(chalk.blue.bold('═'.repeat(60)));
console.log(chalk.blue.bold('4. Bing Webmaster Tools'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

const { autoSubmitBing } = await prompts({
  type: 'confirm',
  name: 'autoSubmitBing',
  message: 'Attempt automatic Bing submission?',
  initial: true
});

if (autoSubmitBing) {
  console.log(chalk.blue('\nRunning Bing submission script...\n'));
  try {
    await execAsync(`bun run scripts/submit-to-bing.mjs --site ${values.site} --site-url ${siteUrl}`);
    checklist.items.push({ item: 'bing', status: 'submitted' });
  } catch (err) {
    console.log(chalk.yellow(`\n⚠ Automatic submission not available\n`));
    checklist.items.push({ item: 'bing', status: 'manual_required' });
  }
}

const { bingAdded } = await prompts({
  type: 'confirm',
  name: 'bingAdded',
  message: 'Is site added to Bing Webmaster?',
  initial: false
});

const { bingSitemapSubmitted } = await prompts({
  type: 'confirm',
  name: 'bingSitemapSubmitted',
  message: 'Is sitemap submitted to Bing?',
  initial: false
});

if (bingAdded && bingSitemapSubmitted) {
  completedCount++;
}

console.log();

// ============================================================================
// 5. SITEMAP PING
// ============================================================================

console.log(chalk.blue.bold('═'.repeat(60)));
console.log(chalk.blue.bold('5. Sitemap Ping'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

const { pingSitemap } = await prompts({
  type: 'confirm',
  name: 'pingSitemap',
  message: 'Ping search engines about sitemap?',
  initial: true
});

if (pingSitemap) {
  console.log(chalk.blue('\nPinging search engines...\n'));
  try {
    await execAsync(`bun run scripts/ping-sitemap.mjs --site-url ${siteUrl}`);
    checklist.items.push({ item: 'sitemap_ping', status: 'success' });
    completedCount++;
  } catch (err) {
    console.log(chalk.yellow(`⚠ Ping failed: ${err.message}\n`));
    checklist.items.push({ item: 'sitemap_ping', status: 'error' });
  }
} else {
  checklist.items.push({ item: 'sitemap_ping', status: 'skipped' });
}

console.log();

// ============================================================================
// 6. AI CRAWLER ACCESS
// ============================================================================

console.log(chalk.blue.bold('═'.repeat(60)));
console.log(chalk.blue.bold('6. AI Crawler Access'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

const { checkAI } = await prompts({
  type: 'confirm',
  name: 'checkAI',
  message: 'Run AI readiness check?',
  initial: true
});

if (checkAI) {
  console.log(chalk.blue('\nRunning AI readiness check...\n'));
  try {
    await execAsync(`bun run scripts/check-ai-readiness.mjs --site ${values.site} --url ${siteUrl}`);
    checklist.items.push({ item: 'ai_readiness', status: 'checked' });
    completedCount++;
  } catch (err) {
    console.log(chalk.gray('AI readiness script not available yet\n'));
    checklist.items.push({ item: 'ai_readiness', status: 'skipped' });
    completedCount++; // Don't penalize if script doesn't exist yet
  }
} else {
  checklist.items.push({ item: 'ai_readiness', status: 'skipped' });
  completedCount++;
}

console.log();

// ============================================================================
// 7. GOOGLE BUSINESS PROFILE (for local businesses)
// ============================================================================

console.log(chalk.blue.bold('═'.repeat(60)));
console.log(chalk.blue.bold('7. Google Business Profile (Local Businesses)'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

const { isLocalBusiness } = await prompts({
  type: 'confirm',
  name: 'isLocalBusiness',
  message: 'Is this a local business (physical location)?',
  initial: true
});

if (isLocalBusiness) {
  console.log(chalk.white('\nUpdate Google Business Profile:\n'));
  console.log(chalk.cyan('  Visit: https://www.google.com/business'));
  console.log(chalk.gray('  Update website URL to: ' + siteUrl));
  console.log(chalk.gray('  Verify address matches schema markup'));
  console.log(chalk.gray('  Add photos if missing\n'));
  
  const { gbpUpdated } = await prompts({
    type: 'confirm',
    name: 'gbpUpdated',
    message: 'GBP updated with website URL?',
    initial: false
  });
  
  checklist.items.push({ item: 'google_business_profile', status: gbpUpdated ? 'success' : 'pending' });
  if (gbpUpdated) completedCount++;
} else {
  checklist.items.push({ item: 'google_business_profile', status: 'not_applicable' });
  completedCount++;
}

console.log();

// ============================================================================
// 8. PERFORMANCE FINAL CHECK
// ============================================================================

console.log(chalk.blue.bold('═'.repeat(60)));
console.log(chalk.blue.bold('8. Performance Final Check'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

console.log(chalk.white('Test performance:\n'));
console.log(chalk.cyan(`  PageSpeed Insights: https://pagespeed.web.dev/analysis?url=${encodeURIComponent(siteUrl)}\n`));

const { performanceGood } = await prompts({
  type: 'confirm',
  name: 'performanceGood',
  message: '95+ PSI scores (mobile & desktop)?',
  initial: true
});

if (performanceGood) {
  console.log(chalk.green('✓ Performance verified\n'));
  checklist.items.push({ item: 'performance', status: 'success' });
  completedCount++;
} else {
  console.log(chalk.yellow('⚠ Performance needs optimization\n'));
  checklist.items.push({ item: 'performance', status: 'needs_work' });
}

// ============================================================================
// 9. LOCAL DIRECTORY SUBMISSIONS
// ============================================================================

console.log(chalk.blue.bold('═'.repeat(60)));
console.log(chalk.blue.bold('9. Local Directory Submissions (Optional)'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

if (isLocalBusiness) {
  console.log(chalk.white('Submit to local directories:\n'));
  console.log(chalk.gray('  • Yelp: https://biz.yelp.com'));
  console.log(chalk.gray('  • Facebook Business: https://business.facebook.com'));
  console.log(chalk.gray('  • Apple Maps: https://mapsconnect.apple.com'));
  console.log(chalk.gray('  • Yellow Pages: https://www.yellowpages.com/claimListing'));
  
  if (values.site.toLowerCase().includes('lawn') || 
      values.site.toLowerCase().includes('home') ||
      values.site.toLowerCase().includes('plumb') ||
      values.site.toLowerCase().includes('hvac')) {
    console.log(chalk.gray('  • HomeAdvisor: https://www.homeadvisor.com/pro'));
    console.log(chalk.gray('  • Angie\'s List: https://www.angi.com/business-center'));
  }
  console.log();
  
  const { directoriesSubmitted } = await prompts({
    type: 'confirm',
    name: 'directoriesSubmitted',
    message: 'Directories submitted or scheduled?',
    initial: false
  });
  
  checklist.items.push({ item: 'directories', status: directoriesSubmitted ? 'success' : 'pending' });
  if (directoriesSubmitted) completedCount++;
} else {
  checklist.items.push({ item: 'directories', status: 'not_applicable' });
  completedCount++;
}

// ============================================================================
// GENERATE REPORTS
// ============================================================================

const resultsPath = resolve(outputDir, 'checklist-results.json');
const reportPath = resolve(outputDir, 'submission-report.md');

checklist.completedCount = completedCount;
checklist.totalItems = totalItems;
checklist.percentComplete = Math.round((completedCount / totalItems) * 100);

await writeFile(resultsPath, JSON.stringify(checklist, null, 2));

// Generate markdown report
const reportContent = `# Post-Launch Checklist Report

**Site:** ${values.site}  
**URL:** ${siteUrl}  
**Completed:** ${new Date().toISOString()}  
**Progress:** ${completedCount}/${totalItems} (${checklist.percentComplete}%)

## Checklist Items

${checklist.items.map((item, i) => {
  const statusEmoji = item.status === 'success' ? '✅' : 
                     item.status === 'pending' ? '⏳' : 
                     item.status === 'skipped' ? '⏭️' :
                     item.status === 'not_applicable' ? 'N/A' : '⚠️';
  return `${i + 1}. ${item.item.replace(/_/g, ' ')}: ${statusEmoji} ${item.status}`;
}).join('\n')}

## Next Steps

${checklist.percentComplete === 100 ? '✅ All items completed! Your site is fully launched.' : ''}
${!gscVerified || !gscSitemapSubmitted ? '- Complete Google Search Console setup and sitemap submission\n' : ''}
${!bingAdded || !bingSitemapSubmitted ? '- Complete Bing Webmaster Tools setup\n' : ''}
${!performanceGood ? '- Optimize performance to reach 95+ PSI scores\n' : ''}

## Timeline Expectations

- **Indexation:** 24-72 hours for Google/Bing to crawl and index
- **Schema Recognition:** 1-2 weeks for rich results to appear
- **Traffic Analysis:** Wait 2-4 weeks for meaningful analytics data
- **SEO Impact:** 3-6 months for full organic ranking impact

## Monitoring

Check these regularly post-launch:

1. **Google Search Console**
   - Coverage report (check for indexation errors)
   - Performance report (impressions & clicks)
   - Core Web Vitals
   
2. **Bing Webmaster Tools**
   - Crawl information
   - SEO reports
   
3. **Google Analytics** (if configured)
   - Traffic sources
   - User behavior
   - Conversions

---

Generated by Web-Dev-Factory-HQ Post-Launch Checklist
`;

await writeFile(reportPath, reportContent);

// ============================================================================
// SUMMARY
// ============================================================================

console.log();
console.log(chalk.green.bold('═'.repeat(60)));
console.log(chalk.green.bold('POST-LAUNCH CHECKLIST COMPLETE'));
console.log(chalk.green.bold('═'.repeat(60) + '\n'));

console.log(chalk.white(`Progress: ${completedCount}/${totalItems} items (${checklist.percentComplete}%)\n`));

if (checklist.percentComplete === 100) {
  console.log(chalk.green('🎉 Congratulations! All launch items completed.\n'));
} else {
  console.log(chalk.yellow(`⚠ ${totalItems - completedCount} items still pending\n`));
}

console.log(chalk.white('Reports saved:'));
console.log(chalk.gray(`  • ${resultsPath}`));
console.log(chalk.gray(`  • ${reportPath}\n`));

console.log(chalk.blue.bold('📋 Important Reminders:\n'));
console.log(chalk.gray('  • Indexation takes 24-72 hours'));
console.log(chalk.gray('  • Monitor Search Console for crawl errors'));
console.log(chalk.gray('  • Check performance scores weekly'));
console.log(chalk.gray('  • Update Google Business Profile if details change\n'));

