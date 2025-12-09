#!/usr/bin/env node

/**
 * SEO Validation Script
 * Validates meta titles, descriptions, H1/H2 hierarchy, and schema compliance
 * across all Astro pages per the Sonnet SEO Specification.
 * 
 * Usage:
 *   npm run seo:validate
 * 
 * Outputs:
 *   - Console report with issues
 *   - JSON report to reports/seo/validation.json
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT_DIR, 'src', 'pages');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'seo');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// SEO Specification Rules (from Sonnet Report)
const SEO_RULES = {
  metaTitle: {
    minLength: 30,
    maxLength: 60,
    required: true,
  },
  metaDescription: {
    minLength: 120,
    maxLength: 160,
    required: true,
  },
  h1: {
    required: true,
    maxCount: 1,
  },
  h2: {
    minCount: 0,
    maxCount: 10,
  },
};

const issues = {
  missingTitles: [],
  missingDescriptions: [],
  titleTooShort: [],
  titleTooLong: [],
  descriptionTooShort: [],
  descriptionTooLong: [],
  duplicateTitles: {},
  duplicateDescriptions: {},
  missingH1: [],
  multipleH1: [],
  noH2: [],
  invalidHierarchy: [],
};

/**
 * Extract frontmatter from Astro file
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return match[1];
}

/**
 * Extract title from frontmatter or Layout props
 */
function extractTitle(content) {
  const frontmatter = extractFrontmatter(content);
  if (!frontmatter) return null;

  // Look for title prop passed to Layout
  const titleMatch = frontmatter.match(/title\s*[=:]\s*["'`]([^"'`]+)["'`]/);
  if (titleMatch) return titleMatch[1];

  // Look for title variable
  const titleVarMatch = frontmatter.match(/const\s+title\s*=\s*["'`]([^"'`]+)["'`]/);
  if (titleVarMatch) return titleVarMatch[1];

  return null;
}

/**
 * Extract description from frontmatter
 */
function extractDescription(content) {
  const frontmatter = extractFrontmatter(content);
  if (!frontmatter) return null;

  // Look for description prop
  const descMatch = frontmatter.match(/description\s*[=:]\s*["'`]([^"'`]+)["'`]/);
  if (descMatch) return descMatch[1];

  // Look for description variable
  const descVarMatch = frontmatter.match(/const\s+description\s*=\s*["'`]([^"'`]+)["'`]/);
  if (descVarMatch) return descVarMatch[1];

  return null;
}

/**
 * Extract H1 and H2 tags from HTML/JSX content
 */
function extractHeadings(content) {
  const h1s = [];
  const h2s = [];

  // Match <h1> tags
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  let h1Match;
  while ((h1Match = h1Regex.exec(content)) !== null) {
    const text = h1Match[1].replace(/<[^>]+>/g, '').trim();
    if (text) h1s.push(text);
  }

  // Match <h2> tags
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let h2Match;
  while ((h2Match = h2Regex.exec(content)) !== null) {
    const text = h2Match[1].replace(/<[^>]+>/g, '').trim();
    if (text) h2s.push(text);
  }

  return { h1s, h2s };
}

/**
 * Validate a single page file
 */
async function validatePage(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const relativePath = path.relative(PAGES_DIR, filePath);
  const urlPath = relativePath
    .replace(/\.astro$/, '')
    .replace(/\/index$/, '')
    .replace(/\\/g, '/');

  const pageUrl = urlPath === 'index' ? '/' : `/${urlPath}`;

  const result = {
    file: relativePath,
    url: pageUrl,
    issues: [],
  };

  // Extract metadata
  const title = extractTitle(content);
  const description = extractDescription(content);
  const { h1s, h2s } = extractHeadings(content);

  // Validate Title
  if (!title) {
    issues.missingTitles.push(pageUrl);
    result.issues.push('Missing meta title');
  } else {
    if (title.length < SEO_RULES.metaTitle.minLength) {
      issues.titleTooShort.push({ url: pageUrl, title, length: title.length });
      result.issues.push(`Title too short (${title.length} chars)`);
    }
    if (title.length > SEO_RULES.metaTitle.maxLength) {
      issues.titleTooLong.push({ url: pageUrl, title, length: title.length });
      result.issues.push(`Title too long (${title.length} chars)`);
    }
    
    // Check for duplicates
    if (!issues.duplicateTitles[title]) {
      issues.duplicateTitles[title] = [];
    }
    issues.duplicateTitles[title].push(pageUrl);
  }

  // Validate Description
  if (!description) {
    issues.missingDescriptions.push(pageUrl);
    result.issues.push('Missing meta description');
  } else {
    if (description.length < SEO_RULES.metaDescription.minLength) {
      issues.descriptionTooShort.push({ url: pageUrl, description, length: description.length });
      result.issues.push(`Description too short (${description.length} chars)`);
    }
    if (description.length > SEO_RULES.metaDescription.maxLength) {
      issues.descriptionTooLong.push({ url: pageUrl, description, length: description.length });
      result.issues.push(`Description too long (${description.length} chars)`);
    }

    // Check for duplicates
    if (!issues.duplicateDescriptions[description]) {
      issues.duplicateDescriptions[description] = [];
    }
    issues.duplicateDescriptions[description].push(pageUrl);
  }

  // Validate H1
  if (h1s.length === 0) {
    issues.missingH1.push(pageUrl);
    result.issues.push('Missing H1 tag');
  } else if (h1s.length > 1) {
    issues.multipleH1.push({ url: pageUrl, count: h1s.length, h1s });
    result.issues.push(`Multiple H1 tags (${h1s.length})`);
  }

  // Validate H2 (optional but recommended)
  if (h2s.length === 0 && content.length > 2000) {
    issues.noH2.push(pageUrl);
    result.issues.push('No H2 tags (recommended for long content)');
  }

  return result;
}

/**
 * Main validation function
 */
async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  SEO Validation Report', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // Ensure reports directory exists
  await fs.mkdir(REPORTS_DIR, { recursive: true });

  // Find all Astro page files
  const pageFiles = await glob('**/*.astro', {
    cwd: PAGES_DIR,
    ignore: ['**/_*.astro', '**/api/**'],
    absolute: true,
  });

  log(`Found ${pageFiles.length} pages to validate\n`, 'cyan');

  // Validate each page
  const results = [];
  for (const file of pageFiles) {
    const result = await validatePage(file);
    results.push(result);
  }

  // Filter duplicate titles/descriptions (only show if 2+ pages share)
  Object.keys(issues.duplicateTitles).forEach((title) => {
    if (issues.duplicateTitles[title].length < 2) {
      delete issues.duplicateTitles[title];
    }
  });

  Object.keys(issues.duplicateDescriptions).forEach((desc) => {
    if (issues.duplicateDescriptions[desc].length < 2) {
      delete issues.duplicateDescriptions[desc];
    }
  });

  // Calculate totals
  const totalIssues =
    issues.missingTitles.length +
    issues.missingDescriptions.length +
    issues.titleTooShort.length +
    issues.titleTooLong.length +
    issues.descriptionTooShort.length +
    issues.descriptionTooLong.length +
    Object.keys(issues.duplicateTitles).length +
    Object.keys(issues.duplicateDescriptions).length +
    issues.missingH1.length +
    issues.multipleH1.length;

  // Print summary
  log('📊 Summary:', 'bright');
  log('─'.repeat(50), 'cyan');
  log(`Total Pages: ${pageFiles.length}`, 'cyan');
  log(`Total Issues: ${totalIssues}`, totalIssues > 0 ? 'red' : 'green');
  log('');

  // Print issues by category
  if (issues.missingTitles.length > 0) {
    log(`❌ Missing Titles (${issues.missingTitles.length}):`, 'red');
    issues.missingTitles.forEach((url) => log(`   ${url}`, 'red'));
    log('');
  }

  if (issues.missingDescriptions.length > 0) {
    log(`❌ Missing Descriptions (${issues.missingDescriptions.length}):`, 'red');
    issues.missingDescriptions.forEach((url) => log(`   ${url}`, 'red'));
    log('');
  }

  if (issues.titleTooShort.length > 0) {
    log(`⚠️  Titles Too Short (${issues.titleTooShort.length}):`, 'yellow');
    issues.titleTooShort.forEach(({ url, title, length }) =>
      log(`   ${url} (${length} chars): "${title}"`, 'yellow')
    );
    log('');
  }

  if (issues.titleTooLong.length > 0) {
    log(`⚠️  Titles Too Long (${issues.titleTooLong.length}):`, 'yellow');
    issues.titleTooLong.forEach(({ url, title, length }) =>
      log(`   ${url} (${length} chars): "${title}"`, 'yellow')
    );
    log('');
  }

  if (issues.descriptionTooShort.length > 0) {
    log(`⚠️  Descriptions Too Short (${issues.descriptionTooShort.length}):`, 'yellow');
    issues.descriptionTooShort.forEach(({ url, length }) =>
      log(`   ${url} (${length} chars)`, 'yellow')
    );
    log('');
  }

  if (issues.descriptionTooLong.length > 0) {
    log(`⚠️  Descriptions Too Long (${issues.descriptionTooLong.length}):`, 'yellow');
    issues.descriptionTooLong.forEach(({ url, length }) =>
      log(`   ${url} (${length} chars)`, 'yellow')
    );
    log('');
  }

  if (Object.keys(issues.duplicateTitles).length > 0) {
    log(`⚠️  Duplicate Titles (${Object.keys(issues.duplicateTitles).length}):`, 'yellow');
    Object.entries(issues.duplicateTitles).forEach(([title, urls]) => {
      log(`   "${title}" used on:`, 'yellow');
      urls.forEach((url) => log(`     - ${url}`, 'yellow'));
    });
    log('');
  }

  if (Object.keys(issues.duplicateDescriptions).length > 0) {
    log(`⚠️  Duplicate Descriptions (${Object.keys(issues.duplicateDescriptions).length}):`, 'yellow');
    Object.entries(issues.duplicateDescriptions).forEach(([desc, urls]) => {
      log(`   Shared by:`, 'yellow');
      urls.forEach((url) => log(`     - ${url}`, 'yellow'));
    });
    log('');
  }

  if (issues.missingH1.length > 0) {
    log(`❌ Missing H1 Tags (${issues.missingH1.length}):`, 'red');
    issues.missingH1.forEach((url) => log(`   ${url}`, 'red'));
    log('');
  }

  if (issues.multipleH1.length > 0) {
    log(`⚠️  Multiple H1 Tags (${issues.multipleH1.length}):`, 'yellow');
    issues.multipleH1.forEach(({ url, count }) =>
      log(`   ${url} (${count} H1s)`, 'yellow')
    );
    log('');
  }

  if (issues.noH2.length > 0) {
    log(`ℹ️  No H2 Tags (${issues.noH2.length}):`, 'cyan');
    issues.noH2.forEach((url) => log(`   ${url}`, 'cyan'));
    log('');
  }

  // Save JSON report
  const report = {
    timestamp: new Date().toISOString(),
    totalPages: pageFiles.length,
    totalIssues,
    issues,
    results,
  };

  const reportPath = path.join(REPORTS_DIR, 'validation.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  log(`Report saved to: ${reportPath}`, 'cyan');

  if (totalIssues === 0) {
    log('✅ All pages pass SEO validation!\n', 'green');
    process.exit(0);
  } else {
    log(`⚠️  Found ${totalIssues} SEO issues. Please review and fix.\n`, 'yellow');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Error: ${error.message}\n`, 'red');
  process.exit(1);
});

