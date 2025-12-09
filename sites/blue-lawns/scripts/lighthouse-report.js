#!/usr/bin/env node

/**
 * Lighthouse CI Report Generator
 * 
 * Runs Lighthouse audits against local dev server and generates JSON reports.
 * 
 * Usage:
 *   npm run lighthouse        (requires dev server running on :4321)
 *   npm run lighthouse:build  (starts server automatically)
 * 
 * Reports are saved to: reports/lighthouse/
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'lighthouse');
const PORT = process.env.PORT || 4321;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if dev server is running
 */
async function checkServerRunning(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Ensure reports directory exists
 */
async function ensureReportsDir() {
  try {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
    log(`✓ Reports directory ready: ${REPORTS_DIR}`, 'green');
  } catch (error) {
    log(`✗ Failed to create reports directory: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Run Lighthouse CI
 */
async function runLighthouseCI() {
  return new Promise((resolve, reject) => {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('  Running Lighthouse CI Audits', 'bright');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    const lhci = spawn('npx', ['@lhci/cli@0.12.x', 'autorun'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: true,
    });

    lhci.on('close', (code) => {
      if (code === 0) {
        log('\n✓ Lighthouse CI completed successfully', 'green');
        resolve();
      } else {
        log(`\n✗ Lighthouse CI failed with code ${code}`, 'red');
        reject(new Error(`Lighthouse CI exited with code ${code}`));
      }
    });

    lhci.on('error', (error) => {
      log(`\n✗ Failed to run Lighthouse CI: ${error.message}`, 'red');
      reject(error);
    });
  });
}

/**
 * Parse and summarize Lighthouse reports
 */
async function summarizeReports() {
  try {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('  Lighthouse Report Summary', 'bright');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    const files = await fs.readdir(REPORTS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json') && !f.includes('manifest'));

    if (jsonFiles.length === 0) {
      log('No report files found', 'yellow');
      return;
    }

    for (const file of jsonFiles) {
      const filePath = path.join(REPORTS_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const report = JSON.parse(content);

      const url = new URL(report.finalUrl || report.requestedUrl);
      const pageName = url.pathname === '/' ? 'Homepage' : url.pathname;

      log(`\n${pageName}`, 'bright');
      log('─'.repeat(50), 'cyan');

      const categories = report.categories || {};
      const scores = {
        Performance: categories.performance?.score,
        Accessibility: categories.accessibility?.score,
        'Best Practices': categories['best-practices']?.score,
        SEO: categories.seo?.score,
      };

      for (const [category, score] of Object.entries(scores)) {
        if (score === undefined) continue;

        const percentage = Math.round(score * 100);
        let color = 'green';
        let icon = '✓';

        if (percentage < 90) {
          color = 'yellow';
          icon = '⚠';
        }
        if (percentage < 50) {
          color = 'red';
          icon = '✗';
        }

        log(`  ${icon} ${category.padEnd(16)} ${percentage}`, color);
      }

      // Core Web Vitals
      const audits = report.audits || {};
      const fcp = audits['first-contentful-paint']?.numericValue;
      const lcp = audits['largest-contentful-paint']?.numericValue;
      const cls = audits['cumulative-layout-shift']?.numericValue;
      const tbt = audits['total-blocking-time']?.numericValue;

      if (fcp || lcp || cls || tbt) {
        log('\n  Core Web Vitals:', 'cyan');
        if (fcp) log(`    FCP: ${Math.round(fcp)}ms`, fcp < 1800 ? 'green' : 'yellow');
        if (lcp) log(`    LCP: ${Math.round(lcp)}ms`, lcp < 2500 ? 'green' : 'yellow');
        if (cls) log(`    CLS: ${cls.toFixed(3)}`, cls < 0.1 ? 'green' : 'yellow');
        if (tbt) log(`    TBT: ${Math.round(tbt)}ms`, tbt < 200 ? 'green' : 'yellow');
      }
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
    log(`Full reports available in: ${REPORTS_DIR}`, 'cyan');
    log('', 'reset');
  } catch (error) {
    log(`Failed to summarize reports: ${error.message}`, 'red');
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const serverUrl = `http://localhost:${PORT}`;

    log('\n🔦 Blue Lawns Lighthouse CI Runner\n', 'bright');

    // Check if server is running
    log('Checking dev server...', 'cyan');
    const isRunning = await checkServerRunning(serverUrl);

    if (!isRunning) {
      log(`\n✗ Dev server not running on ${serverUrl}`, 'red');
      log('\nPlease start the dev server first:', 'yellow');
      log('  npm run dev', 'yellow');
      log('\nOr run with automatic server start:', 'yellow');
      log('  npm run lighthouse:build\n', 'yellow');
      process.exit(1);
    }

    log(`✓ Dev server is running on ${serverUrl}`, 'green');

    // Ensure reports directory exists
    await ensureReportsDir();

    // Run Lighthouse CI
    await runLighthouseCI();

    // Summarize results
    await summarizeReports();

    log('✓ Lighthouse CI completed successfully\n', 'green');
    process.exit(0);
  } catch (error) {
    log(`\n✗ Error: ${error.message}\n`, 'red');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runLighthouseCI, summarizeReports };

