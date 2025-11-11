#!/usr/bin/env node
/**
 * Master pipeline orchestrator
 * Executes the full Web-Dev-Factory-HQ automation workflow for a given site
 */
import { parseArgs } from 'node:util';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const execAsync = promisify(exec);

const { values } = parseArgs({
  options: {
    site: { type: 'string' },
    skip: { type: 'string', multiple: true, default: [] },
    only: { type: 'string' }
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
console.log(`📊 Output: ${outputPath}\n`);

const pipeline = [
  {
    id: 'scrape',
    name: '🌐 Scrape existing site',
    cmd: `bun run scripts/crawl-site.mjs --out ${outputPath}/scrape`,
    optional: true
  },
  {
    id: 'optimize-images',
    name: '🖼️  Optimize Images',
    cmd: `bun run scripts/optimize-media.mjs --input "${outputPath}/scrape/media_assets" --output "${sitePath}/public/media" --formats avif,webp,jpg`
  },
  {
    id: 'import',
    name: '📥 Import content',
    cmd: `cd ${sitePath} && bun run scripts/import-content.mjs`
  },
  {
    id: 'schema',
    name: '🏷️  Generate schema',
    cmd: `cd ${sitePath} && bun run scripts/generate-schema.mjs`
  },
  {
    id: 'performance',
    name: '⚡ Run performance audit',
    cmd: `cd ${sitePath} && bun run scripts/summarize-performance.mjs`,
    optional: true
  },
  {
    id: 'seo',
    name: '🔍 SEO audit',
    cmd: `cd ${sitePath} && bun run scripts/generate-seo-report.mjs`,
    optional: true
  },
  {
    id: 'redirects',
    name: '🔀 Generate redirects',
    cmd: `cd ${sitePath} && bun run scripts/generate-redirects.mjs`,
    optional: true
  },
  {
    id: 'build',
    name: '🔨 Build site',
    cmd: `cd ${sitePath} && bun run build`
  }
];

// Filter pipeline based on --only or --skip flags
let stepsToRun = pipeline;
if (values.only) {
  stepsToRun = pipeline.filter(step => step.id === values.only);
  if (stepsToRun.length === 0) {
    console.error(`❌ Error: Unknown step "${values.only}"`);
    process.exit(1);
  }
} else if (values.skip.length > 0) {
  stepsToRun = pipeline.filter(step => !values.skip.includes(step.id));
}

const results = [];
let failed = false;

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
    results.push({ step: step.id, status: 'success', duration });
    
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (step.optional) {
      console.warn(`⚠️  ${step.name} failed (optional) in ${duration}s`);
      console.warn(`   ${err.message}`);
      results.push({ step: step.id, status: 'skipped', duration });
    } else {
      console.error(`❌ ${step.name} failed in ${duration}s`);
      console.error(`   ${err.message}`);
      results.push({ step: step.id, status: 'failed', duration });
      failed = true;
      break;
    }
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

const totalDuration = results.reduce((sum, r) => sum + parseFloat(r.duration), 0).toFixed(2);
console.log(`\n⏱️  Total time: ${totalDuration}s`);
console.log(`📁 Reports: ${outputPath}\n`);

if (failed) {
  console.error('❌ Pipeline failed. See errors above.');
  process.exit(1);
} else {
  console.log('✅ Pipeline completed successfully!');
  console.log(`\n🚀 Next step: Deploy with:`);
  console.log(`   bun run scripts/deploy.mjs --site ${values.site} --prod`);
}

