#!/usr/bin/env node
/**
 * Master pipeline orchestrator
 * Executes the full Web-Dev-Factory-HQ automation workflow for a given site
 */
import { parseArgs } from 'node:util';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import chalk from 'chalk';

const execAsync = promisify(exec);

const { values } = parseArgs({
  options: {
    site: { type: 'string' },
    skip: { type: 'string', multiple: true, default: [] },
    only: { type: 'string' },
    mode: { type: 'string', default: 'full' } // 'full' or 'light'
  }
});

if (!values.site) {
  console.error('❌ Error: --site flag is required');
  console.log('Usage: bun run scripts/run-pipeline.mjs --site <site-name> [--skip <step>] [--only <step>]');
  console.log('\nAvailable steps: scrape, import, schema, performance, seo, redirects, deploy');
  process.exit(1);
}

const sitePath = resolve(`sites/${values.site}`);
const outputPath = resolve(`output/${values.site}`);

if (!existsSync(sitePath)) {
  console.error(`❌ Error: Site directory not found: ${sitePath}`);
  process.exit(1);
}

// Ensure output directory exists
await mkdir(outputPath, { recursive: true });
await mkdir(`${outputPath}/logs`, { recursive: true });

console.log(`🏗️  Running Web-Dev-Factory-HQ pipeline for: ${values.site}`);
console.log(`📁 Site: ${sitePath}`);
console.log(`📊 Output: ${outputPath}`);
console.log(`🚦 Mode: ${values.mode}\n`);

const pipeline = [
  {
    id: 'scrape',
    name: '🌐 Scrape existing site',
    cmd: `bun run scripts/crawl-site.mjs --out ${outputPath}/scrape`,
    optional: true,
    heavy: false
  },
  {
    id: 'optimize-images',
    name: '🖼️  Optimize Images',
    cmd: `bun run scripts/optimize-media.mjs --input "${outputPath}/scrape/media_assets" --output "${sitePath}/public/media" --formats avif,webp,jpg`,
    optional: false,
    heavy: true // Skip in light mode
  },
  {
    id: 'import',
    name: '📥 Import content',
    cmd: `cd ${sitePath} && bun run scripts/import-content.mjs`,
    optional: false,
    heavy: false
  },
  {
    id: 'schema',
    name: '🏷️  Generate schema',
    cmd: `cd ${sitePath} && bun run scripts/generate-schema.mjs`,
    optional: false,
    heavy: false
  },
  {
    id: 'performance',
    name: '⚡ Run performance audit',
    cmd: `cd ${sitePath} && bun run scripts/summarize-performance.mjs`,
    optional: true,
    heavy: true // Skip in light mode
  },
  {
    id: 'seo',
    name: '🔍 SEO audit',
    cmd: `cd ${sitePath} && bun run scripts/generate-seo-report.mjs`,
    optional: true,
    heavy: false
  },
  {
    id: 'redirects',
    name: '🔀 Generate redirects',
    cmd: `cd ${sitePath} && bun run scripts/generate-redirects.mjs`,
    optional: true,
    heavy: false
  },
  {
    id: 'build',
    name: '🔨 Build site',
    cmd: `cd ${sitePath} && bun run build`,
    optional: false,
    heavy: false
  }
];

// Filter pipeline based on --only, --skip, and --mode flags
let stepsToRun = pipeline;

// Apply light mode filtering first
if (values.mode === 'light') {
  const heavySteps = pipeline.filter(s => s.heavy).map(s => s.id);
  console.log(chalk.yellow(`⚡ Light mode: Skipping heavy steps: ${heavySteps.join(', ')}\n`));
  stepsToRun = pipeline.filter(step => !step.heavy);
}

// Then apply --only or --skip
if (values.only) {
  stepsToRun = stepsToRun.filter(step => step.id === values.only);
  if (stepsToRun.length === 0) {
    console.error(`❌ Error: Unknown step "${values.only}"`);
    process.exit(1);
  }
} else if (values.skip.length > 0) {
  stepsToRun = stepsToRun.filter(step => !values.skip.includes(step.id));
}

const results = [];
const skippedSteps = [];
let failed = false;
const pipelineStartTime = Date.now();

// Track skipped steps (from light mode)
if (values.mode === 'light') {
  pipeline.filter(s => s.heavy).forEach(step => {
    skippedSteps.push({ step: step.id, reason: 'light_mode', name: step.name });
  });
}

// Helper to write status after each step
async function writeStatus() {
  const statusPath = `${outputPath}/pipeline-status.json`;
  const status = {
    site: values.site,
    mode: values.mode,
    startedAt: new Date(pipelineStartTime).toISOString(),
    lastUpdated: new Date().toISOString(),
    totalSteps: stepsToRun.length,
    completedSteps: results.filter(r => r.status === 'success').length,
    failedSteps: results.filter(r => r.status === 'failed').length,
    skippedSteps: skippedSteps.length + results.filter(r => r.status === 'skipped').length,
    results: results,
    skipped: skippedSteps,
    inProgress: true
  };
  await writeFile(statusPath, JSON.stringify(status, null, 2));
}

for (const step of stepsToRun) {
  console.log(`\n${step.name}`);
  console.log(`─`.repeat(50));
  
  const startTime = Date.now();
  
  try {
    const { stdout, stderr } = await execAsync(step.cmd, {
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('warning')) {
      console.warn('⚠️ ', stderr);
    }
    
    console.log(`✅ ${step.name} completed in ${duration}s`);
    results.push({ 
      step: step.id, 
      name: step.name,
      status: 'success', 
      duration: parseFloat(duration),
      timestamp: new Date().toISOString()
    });
    
    // Write status after each step
    await writeStatus();
    
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (step.optional) {
      console.warn(`⚠️  ${step.name} failed (optional) in ${duration}s`);
      console.warn(`   ${err.message}`);
      results.push({ 
        step: step.id, 
        name: step.name,
        status: 'skipped', 
        duration: parseFloat(duration),
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error(`❌ ${step.name} failed in ${duration}s`);
      console.error(`   ${err.message}`);
      results.push({ 
        step: step.id, 
        name: step.name,
        status: 'failed', 
        duration: parseFloat(duration),
        error: err.message,
        timestamp: new Date().toISOString()
      });
      failed = true;
    }
    
    // Write status after failure
    await writeStatus();
    
    if (failed) break;
  }
}

// Summary
console.log(`\n${'═'.repeat(50)}`);
console.log(`📊 Pipeline Summary for ${values.site}`);
console.log(`${'═'.repeat(50)}\n`);

results.forEach(result => {
  const icon = result.status === 'success' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
  console.log(`${icon} ${result.step.padEnd(15)} ${result.status.padEnd(10)} ${result.duration}s`);
});

if (skippedSteps.length > 0) {
  console.log(`\n⏭️  Skipped (light mode):`);
  skippedSteps.forEach(skipped => {
    console.log(`   ⚡ ${skipped.step.padEnd(15)} ${skipped.reason}`);
  });
}

const totalDuration = results.reduce((sum, r) => sum + parseFloat(r.duration), 0).toFixed(2);
const pipelineDuration = ((Date.now() - pipelineStartTime) / 1000).toFixed(2);
console.log(`\n⏱️  Total time: ${totalDuration}s (wall clock: ${pipelineDuration}s)`);
console.log(`📁 Reports: ${outputPath}\n`);

// Generate markdown summary
const summaryMd = `# Pipeline Summary Report

**Site:** ${values.site}  
**Mode:** ${values.mode}  
**Started:** ${new Date(pipelineStartTime).toISOString()}  
**Completed:** ${new Date().toISOString()}  
**Total Duration:** ${pipelineDuration}s  

## Results

${results.map(r => {
  const icon = r.status === 'success' ? '✅' : r.status === 'failed' ? '❌' : '⚠️';
  return `${icon} **${r.name}** - ${r.status} (${r.duration}s)${r.error ? `\n   Error: ${r.error}` : ''}`;
}).join('\n')}

${skippedSteps.length > 0 ? `\n## Skipped Steps (Light Mode)\n\n${skippedSteps.map(s => `⚡ **${s.name}** - ${s.reason}`).join('\n')}\n` : ''}

## Statistics

- **Total Steps:** ${stepsToRun.length}
- **Successful:** ${results.filter(r => r.status === 'success').length}
- **Failed:** ${results.filter(r => r.status === 'failed').length}
- **Skipped:** ${skippedSteps.length + results.filter(r => r.status === 'skipped').length}
- **Success Rate:** ${((results.filter(r => r.status === 'success').length / results.length) * 100).toFixed(1)}%

## Output Locations

- Status JSON: \`${outputPath}/pipeline-status.json\`
- Logs: \`${outputPath}/logs/\`
- Site Build: \`sites/${values.site}/dist/\`

---

*Generated by Web-Dev-Factory-HQ Pipeline v2*
`;

await writeFile(`${outputPath}/summary.md`, summaryMd);

// Final status update
const finalStatus = {
  site: values.site,
  mode: values.mode,
  startedAt: new Date(pipelineStartTime).toISOString(),
  completedAt: new Date().toISOString(),
  duration: parseFloat(pipelineDuration),
  totalSteps: stepsToRun.length,
  completedSteps: results.filter(r => r.status === 'success').length,
  failedSteps: results.filter(r => r.status === 'failed').length,
  skippedSteps: skippedSteps.length + results.filter(r => r.status === 'skipped').length,
  results: results,
  skipped: skippedSteps,
  inProgress: false,
  success: !failed
};
await writeFile(`${outputPath}/pipeline-status.json`, JSON.stringify(finalStatus, null, 2));

console.log(chalk.gray(`📄 Summary report: ${outputPath}/summary.md\n`));

if (failed) {
  console.error('❌ Pipeline failed. See errors above.');
  process.exit(1);
} else {
  console.log(chalk.green.bold('\n✅ Build Pipeline Complete!\n'));
  console.log(chalk.blue(`📦 Site built in: sites/${values.site}/dist/\n`));
  console.log(chalk.yellow.bold('Next Steps:\n'));
  console.log(chalk.gray('1. Setup Deployment:'));
  console.log(chalk.white(`   bun run setup-deployment --site ${values.site}\n`));
  console.log(chalk.gray('   This will guide you through:'));
  console.log(chalk.gray('   • GitHub repository creation'));
  console.log(chalk.gray('   • Vercel project setup'));
  console.log(chalk.gray('   • Custom domain configuration\n'));
  console.log(chalk.gray('2. After site is live, run post-launch checklist:'));
  console.log(chalk.white(`   bun run post-launch --site ${values.site}\n`));
}

