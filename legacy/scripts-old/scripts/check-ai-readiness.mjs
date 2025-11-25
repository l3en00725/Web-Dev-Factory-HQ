#!/usr/bin/env node
/**
 * AI Readiness Checker
 * Verifies site is optimized for AI search engines and LLMs
 */
import { parseArgs } from 'node:util';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import chalk from 'chalk';

const { values } = parseArgs({
  options: {
    site: { type: 'string' },
    url: { type: 'string' }
  }
});

if (!values.site) {
  console.error(chalk.red('❌ Error: --site flag is required'));
  console.log('Usage: bun run check:ai --site <site-name> --url <live-url>');
  process.exit(1);
}

const sitePath = resolve(`sites/${values.site}`);
const outputDir = resolve(`output/${values.site}/ai-readiness`);

await mkdir(outputDir, { recursive: true });

console.log(chalk.blue.bold('\n🤖 AI Readiness Check\n'));
console.log(chalk.gray(`Site: ${values.site}\n`));

const checks = {
  site: values.site,
  url: values.url,
  timestamp: new Date().toISOString(),
  results: [],
  score: 0,
  maxScore: 0
};

// ============================================================================
// 1. ROBOTS.TXT CHECK - AI CRAWLER ACCESS
// ============================================================================

console.log(chalk.blue('1. Checking robots.txt for AI crawler access...'));
checks.maxScore += 10;

const robotsPath = resolve(sitePath, 'public/robots.txt');
let robotsContent = '';

if (existsSync(robotsPath)) {
  robotsContent = await readFile(robotsPath, 'utf-8');
  
  const aiCrawlers = [
    'GPTBot',
    'ChatGPT-User',
    'CCBot',
    'PerplexityBot',
    'Claude-Web',
    'anthropic-ai',
    'Omgilibot'
  ];
  
  const allowedCrawlers = aiCrawlers.filter(crawler => {
    const regex = new RegExp(`User-agent:\\s*${crawler}\\s*\\nAllow:`, 'i');
    return regex.test(robotsContent);
  });
  
  if (allowedCrawlers.length >= 5) {
    console.log(chalk.green(`   ✓ AI crawlers allowed (${allowedCrawlers.length}/7)`));
    checks.results.push({ 
      check: 'ai_crawlers',
      status: 'pass',
      allowedCrawlers 
    });
    checks.score += 10;
  } else if (allowedCrawlers.length > 0) {
    console.log(chalk.yellow(`   ⚠ Some AI crawlers allowed (${allowedCrawlers.length}/7)`));
    checks.results.push({ 
      check: 'ai_crawlers',
      status: 'partial',
      allowedCrawlers 
    });
    checks.score += 5;
  } else {
    console.log(chalk.red(`   ✗ No AI crawlers explicitly allowed`));
    checks.results.push({ 
      check: 'ai_crawlers',
      status: 'fail',
      recommendation: 'Add AI crawler user-agents to robots.txt' 
    });
  }
} else {
  console.log(chalk.yellow('   ⚠ robots.txt not found'));
  checks.results.push({ 
    check: 'ai_crawlers',
    status: 'missing',
    recommendation: 'Create robots.txt with AI crawler permissions' 
  });
}

// ============================================================================
// 2. SCHEMA MARKUP CHECK
// ============================================================================

console.log(chalk.blue('2. Checking schema markup...'));
checks.maxScore += 15;

const schemaPath = resolve(sitePath, 'src/components/site-schema.json');

if (existsSync(schemaPath)) {
  const schema = JSON.parse(await readFile(schemaPath, 'utf-8'));
  
  const hasType = !!schema['@type'];
  const hasName = !!schema.name;
  const hasDescription = !!schema.description;
  const hasUrl = !!schema.url;
  const hasServiceArea = !!(schema.serviceArea || schema.areaServed);
  
  const schemaScore = [hasType, hasName, hasDescription, hasUrl, hasServiceArea]
    .filter(Boolean).length;
  
  if (schemaScore >= 4) {
    console.log(chalk.green(`   ✓ Comprehensive schema (${schemaScore}/5 key fields)`));
    checks.results.push({ 
      check: 'schema',
      status: 'pass',
      fields: { hasType, hasName, hasDescription, hasUrl, hasServiceArea }
    });
    checks.score += 15;
  } else {
    console.log(chalk.yellow(`   ⚠ Schema present but incomplete (${schemaScore}/5)`));
    checks.results.push({ 
      check: 'schema',
      status: 'partial',
      fields: { hasType, hasName, hasDescription, hasUrl, hasServiceArea }
    });
    checks.score += Math.round(15 * (schemaScore / 5));
  }
} else {
  console.log(chalk.red('   ✗ Schema file not found'));
  checks.results.push({ 
    check: 'schema',
    status: 'fail',
    recommendation: 'Generate schema markup' 
  });
}

// ============================================================================
// 3. SEMANTIC HTML CHECK
// ============================================================================

console.log(chalk.blue('3. Checking semantic HTML structure...'));
checks.maxScore += 10;

// Check for semantic HTML in layout files
const baseLayoutPath = resolve(sitePath, 'src/layouts/Base.astro');
let hasSemanticHTML = false;

if (existsSync(baseLayoutPath)) {
  const layoutContent = await readFile(baseLayoutPath, 'utf-8');
  
  const semanticTags = ['<header', '<nav', '<main', '<article', '<section', '<footer'];
  const foundTags = semanticTags.filter(tag => layoutContent.includes(tag));
  
  if (foundTags.length >= 4) {
    console.log(chalk.green(`   ✓ Semantic HTML used (${foundTags.length}/6 tags)`));
    checks.results.push({ 
      check: 'semantic_html',
      status: 'pass',
      foundTags 
    });
    checks.score += 10;
    hasSemanticHTML = true;
  } else {
    console.log(chalk.yellow(`   ⚠ Limited semantic HTML (${foundTags.length}/6)`));
    checks.results.push({ 
      check: 'semantic_html',
      status: 'partial',
      foundTags 
    });
    checks.score += 5;
  }
} else {
  console.log(chalk.gray('   ℹ Base layout not found, skipping check'));
  checks.results.push({ 
    check: 'semantic_html',
    status: 'skipped' 
  });
  checks.score += 10; // Don't penalize
}

// ============================================================================
// 4. HEADING HIERARCHY CHECK
// ============================================================================

console.log(chalk.blue('4. Checking heading hierarchy...'));
checks.maxScore += 10;

// Scan page files for proper heading structure
const pagesDir = resolve(sitePath, 'src/pages');
let hasProperHeadings = false;

if (existsSync(pagesDir)) {
  // Check index page as sample
  const indexPath = resolve(pagesDir, 'index.astro');
  
  if (existsSync(indexPath)) {
    const indexContent = await readFile(indexPath, 'utf-8');
    
    const hasH1 = /<h1/i.test(indexContent);
    const hasH2 = /<h2/i.test(indexContent);
    
    if (hasH1 && hasH2) {
      console.log(chalk.green('   ✓ Proper heading hierarchy (H1 → H2+)'));
      checks.results.push({ 
        check: 'heading_hierarchy',
        status: 'pass' 
      });
      checks.score += 10;
      hasProperHeadings = true;
    } else if (hasH1) {
      console.log(chalk.yellow('   ⚠ H1 present but missing subheadings'));
      checks.results.push({ 
        check: 'heading_hierarchy',
        status: 'partial' 
      });
      checks.score += 5;
    } else {
      console.log(chalk.red('   ✗ No H1 found on homepage'));
      checks.results.push({ 
        check: 'heading_hierarchy',
        status: 'fail' 
      });
    }
  } else {
    console.log(chalk.gray('   ℹ Index page not found'));
    checks.results.push({ 
      check: 'heading_hierarchy',
      status: 'skipped' 
    });
    checks.score += 10; // Don't penalize
  }
} else {
  console.log(chalk.gray('   ℹ Pages directory not found'));
  checks.results.push({ 
    check: 'heading_hierarchy',
    status: 'skipped' 
  });
  checks.score += 10; // Don't penalize
}

// ============================================================================
// 5. FAQ/Q&A CONTENT CHECK
// ============================================================================

console.log(chalk.blue('5. Checking for FAQ content...'));
checks.maxScore += 10;

// Check for FAQ-related content
if (existsSync(pagesDir)) {
  const { readdir } = await import('node:fs/promises');
  const pageFiles = await readdir(pagesDir);
  
  const hasFAQPage = pageFiles.some(f => /faq/i.test(f));
  
  if (hasFAQPage) {
    console.log(chalk.green('   ✓ FAQ page exists'));
    checks.results.push({ 
      check: 'faq_content',
      status: 'pass' 
    });
    checks.score += 10;
  } else {
    console.log(chalk.yellow('   ⚠ No dedicated FAQ page found'));
    checks.results.push({ 
      check: 'faq_content',
      status: 'recommendation',
      note: 'Consider adding FAQ page for better AI understanding' 
    });
    checks.score += 5;
  }
} else {
  checks.results.push({ 
    check: 'faq_content',
    status: 'skipped' 
  });
  checks.score += 10;
}

// ============================================================================
// 6. LIVE URL CHECK (if provided)
// ============================================================================

if (values.url) {
  console.log(chalk.blue('6. Checking live URL...'));
  checks.maxScore += 5;
  
  try {
    const response = await fetch(values.url);
    const html = await response.text();
    
    // Check for schema in HTML
    const hasSchemaInHTML = html.includes('application/ld+json');
    
    if (hasSchemaInHTML) {
      console.log(chalk.green('   ✓ Schema present in live HTML'));
      checks.results.push({ 
        check: 'live_schema',
        status: 'pass' 
      });
      checks.score += 5;
    } else {
      console.log(chalk.yellow('   ⚠ Schema not found in live HTML'));
      checks.results.push({ 
        check: 'live_schema',
        status: 'warning' 
      });
    }
  } catch (err) {
    console.log(chalk.gray(`   ℹ Could not fetch live URL: ${err.message}`));
    checks.results.push({ 
      check: 'live_schema',
      status: 'error',
      error: err.message 
    });
    checks.score += 5; // Don't penalize
  }
}

// ============================================================================
// GENERATE REPORT
// ============================================================================

const percentage = Math.round((checks.score / checks.maxScore) * 100);
checks.percentage = percentage;
checks.grade = percentage >= 90 ? 'A' : 
                percentage >= 80 ? 'B' : 
                percentage >= 70 ? 'C' : 
                percentage >= 60 ? 'D' : 'F';

console.log();
console.log(chalk.green.bold('═'.repeat(60)));
console.log(chalk.green.bold('AI READINESS SCORE'));
console.log(chalk.green.bold('═'.repeat(60) + '\n'));

const gradeColor = checks.grade === 'A' ? chalk.green :
                   checks.grade === 'B' ? chalk.cyan :
                   checks.grade === 'C' ? chalk.yellow :
                   chalk.red;

console.log(gradeColor.bold(`   ${checks.score}/${checks.maxScore} points (${percentage}%) - Grade: ${checks.grade}\n`));

// Recommendations
const recommendations = checks.results
  .filter(r => r.recommendation)
  .map(r => r.recommendation);

if (recommendations.length > 0) {
  console.log(chalk.yellow.bold('📋 Recommendations:\n'));
  recommendations.forEach(rec => {
    console.log(chalk.gray(`   • ${rec}`));
  });
  console.log();
}

// Generate markdown report
const reportContent = `# AI Readiness Report

**Site:** ${values.site}  
**URL:** ${values.url || 'N/A'}  
**Checked:** ${new Date().toISOString()}  
**Score:** ${checks.score}/${checks.maxScore} (${percentage}%)  
**Grade:** ${checks.grade}

## Checks Performed

${checks.results.map(r => {
  const statusEmoji = r.status === 'pass' ? '✅' : 
                     r.status === 'partial' ? '⚠️' : 
                     r.status === 'fail' ? '❌' :
                     r.status === 'skipped' ? '⏭️' : 'ℹ️';
  return `- **${r.check}**: ${statusEmoji} ${r.status}`;
}).join('\n')}

## Recommendations

${recommendations.length > 0 ? recommendations.map(r => `- ${r}`).join('\n') : 'No specific recommendations. Site is well-optimized for AI!'}

## What This Means

Your site's AI readiness affects how well AI search engines and chatbots can:
- Understand your business and services
- Extract accurate information to answer user queries
- Recommend your business in AI-generated responses
- Index and rank your content in AI search results

### Target Platforms
- **ChatGPT**: Uses GPTBot crawler
- **Perplexity AI**: Uses PerplexityBot crawler
- **Claude**: Uses Claude-Web crawler (Anthropic)
- **Bing Chat**: Uses Bing crawler (MSN Bot)
- **Google Bard**: Uses Google crawler

## Next Steps

${percentage >= 90 ? '✅ Excellent! Your site is well-optimized for AI discovery.' : ''}
${percentage < 90 ? '1. Review recommendations above\n2. Update robots.txt to allow AI crawlers\n3. Add or improve schema markup\n4. Create FAQ content with natural language\n5. Re-run this check after improvements' : ''}

---

Generated by Web-Dev-Factory-HQ AI Readiness Checker
`;

const reportPath = resolve(outputDir, 'report.md');
const jsonPath = resolve(outputDir, 'results.json');

await writeFile(reportPath, reportContent);
await writeFile(jsonPath, JSON.stringify(checks, null, 2));

console.log(chalk.white('Reports saved:'));
console.log(chalk.gray(`  • ${reportPath}`));
console.log(chalk.gray(`  • ${jsonPath}\n`));

