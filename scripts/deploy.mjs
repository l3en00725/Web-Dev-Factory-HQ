#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const execAsync = promisify(exec);

const { values } = parseArgs({
  options: {
    site: { type: 'string' },
    prod: { type: 'boolean', default: false },
    preview: { type: 'boolean', default: false }
  }
});

if (!values.site) {
  console.error('❌ Error: --site flag is required');
  console.log('Usage: bun run scripts/deploy.mjs --site <site-name> [--prod]');
  process.exit(1);
}

const sitePath = resolve(`sites/${values.site}`);

if (!existsSync(sitePath)) {
  console.error(`❌ Error: Site directory not found: ${sitePath}`);
  process.exit(1);
}

if (!existsSync(`${sitePath}/package.json`)) {
  console.error(`❌ Error: No package.json found in ${sitePath}`);
  process.exit(1);
}

console.log(`📦 Deploying ${values.site} from ${sitePath}...`);

try {
  // Build the site first
  console.log('🔨 Building site...');
  const buildCmd = `cd ${sitePath} && bun run build`;
  const { stdout: buildOutput, stderr: buildError } = await execAsync(buildCmd);
  
  if (buildError && !buildError.includes('warning')) {
    console.error('❌ Build failed:', buildError);
    process.exit(1);
  }
  
  console.log('✅ Build successful');
  
  // Deploy to Vercel
  const prodFlag = values.prod ? '--prod' : '';
  const previewFlag = values.preview ? '--preview' : '';
  const deployCmd = `vercel ${prodFlag} ${previewFlag} --cwd ${sitePath}`;
  
  console.log(`🚀 Deploying to Vercel${values.prod ? ' (production)' : ' (preview)'}...`);
  
  const { stdout: deployOutput } = await execAsync(deployCmd);
  
  console.log(deployOutput);
  console.log(`✅ Successfully deployed ${values.site}`);
  
  // Extract deployment URL from output
  const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    console.log(`\n🌐 Deployment URL: ${urlMatch[0]}`);
  }
  
} catch (err) {
  console.error(`❌ Deployment failed: ${err.message}`);
  process.exit(1);
}

