#!/usr/bin/env node
/**
 * Interactive Deployment Setup Guide
 * Walks through GitHub + Vercel setup process
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
  console.log('Usage: bun run setup-deployment --site <site-name>');
  process.exit(1);
}

const sitePath = resolve(`sites/${values.site}`);
const outputDir = resolve(`output/${values.site}/deployment`);

if (!existsSync(sitePath)) {
  console.error(chalk.red(`❌ Error: Site directory not found: ${sitePath}`));
  process.exit(1);
}

await mkdir(outputDir, { recursive: true });

console.log(chalk.blue.bold('\n🚀 Deployment Setup Guide\n'));
console.log(chalk.gray(`Site: ${values.site}`));
console.log(chalk.gray(`Path: ${sitePath}\n`));

const config = {
  site: values.site,
  timestamp: new Date().toISOString(),
  steps: {
    github: { completed: false },
    vercel: { completed: false },
    customDomain: { completed: false }
  }
};

// ============================================================================
// STEP 1: GITHUB REPOSITORY SETUP
// ============================================================================

console.log(chalk.blue.bold('═'.repeat(60)));
console.log(chalk.blue.bold('STEP 1: GitHub Repository Setup'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

// Check if git is initialized
let gitInitialized = false;
try {
  await execAsync('git rev-parse --git-dir', { cwd: sitePath });
  gitInitialized = true;
  console.log(chalk.green('✓ Git already initialized in this directory\n'));
} catch {
  console.log(chalk.yellow('⚠ Git not initialized yet\n'));
}

if (!gitInitialized) {
  const { initGit } = await prompts({
    type: 'confirm',
    name: 'initGit',
    message: 'Initialize git repository?',
    initial: true
  });
  
  if (initGit) {
    try {
      await execAsync('git init', { cwd: sitePath });
      console.log(chalk.green('\n✓ Git initialized\n'));
    } catch (err) {
      console.error(chalk.red(`✗ Failed to initialize git: ${err.message}\n`));
    }
  }
}

// Check for existing remote
let hasRemote = false;
let currentRemote = null;

try {
  const { stdout } = await execAsync('git remote get-url origin', { cwd: sitePath });
  currentRemote = stdout.trim();
  hasRemote = true;
  console.log(chalk.green(`✓ Git remote already configured:`));
  console.log(chalk.gray(`  ${currentRemote}\n`));
} catch {
  console.log(chalk.yellow('⚠ No git remote configured\n'));
}

if (!hasRemote) {
  console.log(chalk.white('Create a new GitHub repository:'));
  console.log(chalk.cyan('  1. Visit: https://github.com/new'));
  console.log(chalk.gray('  2. Repository name: ' + values.site));
  console.log(chalk.gray('  3. Keep it private (recommended for client sites)'));
  console.log(chalk.gray('  4. Do NOT initialize with README\n'));
  
  const { repoUrl } = await prompts({
    type: 'text',
    name: 'repoUrl',
    message: 'Enter your GitHub repository URL:',
    validate: value => {
      if (!value) return 'Repository URL is required';
      if (!value.includes('github.com')) return 'Must be a GitHub URL';
      return true;
    }
  });
  
  if (repoUrl) {
    try {
      await execAsync(`git remote add origin ${repoUrl}`, { cwd: sitePath });
      console.log(chalk.green('\n✓ Remote added successfully\n'));
      config.steps.github.repoUrl = repoUrl;
      currentRemote = repoUrl;
    } catch (err) {
      console.error(chalk.red(`✗ Failed to add remote: ${err.message}\n`));
    }
  }
}

// Check if there are any commits
let hasCommits = false;
try {
  await execAsync('git log -1', { cwd: sitePath });
  hasCommits = true;
} catch {
  console.log(chalk.yellow('No commits found. Creating initial commit...\n'));
}

if (!hasCommits && currentRemote) {
  const { makeCommit } = await prompts({
    type: 'confirm',
    name: 'makeCommit',
    message: 'Create initial commit and push to GitHub?',
    initial: true
  });
  
  if (makeCommit) {
    try {
      await execAsync('git add .', { cwd: sitePath });
      await execAsync(`git commit -m "Initial commit - ${values.site}"`, { cwd: sitePath });
      await execAsync('git branch -M main', { cwd: sitePath });
      
      console.log(chalk.blue('\nPushing to GitHub...'));
      await execAsync('git push -u origin main', { cwd: sitePath });
      
      console.log(chalk.green('\n✅ Successfully pushed to GitHub!\n'));
      config.steps.github.completed = true;
      config.steps.github.pushedAt = new Date().toISOString();
    } catch (err) {
      console.error(chalk.red(`\n✗ Push failed: ${err.message}`));
      console.log(chalk.yellow('\nYou may need to push manually:'));
      console.log(chalk.gray(`  cd ${sitePath}`));
      console.log(chalk.gray(`  git add .`));
      console.log(chalk.gray(`  git commit -m "Initial commit"`));
      console.log(chalk.gray(`  git push -u origin main\n`));
    }
  }
}

if (currentRemote) {
  config.steps.github.completed = true;
  config.steps.github.repoUrl = currentRemote;
}

// ============================================================================
// STEP 2: VERCEL PROJECT SETUP
// ============================================================================

console.log(chalk.blue.bold('\n' + '═'.repeat(60)));
console.log(chalk.blue.bold('STEP 2: Vercel Project Setup'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

console.log(chalk.white('Import your project to Vercel:\n'));
console.log(chalk.cyan('  1. Visit: https://vercel.com/new'));
console.log(chalk.gray('  2. Click "Import Git Repository"'));
console.log(chalk.gray('  3. Select your GitHub repository: ' + values.site));
console.log(chalk.gray('  4. Configure project:'));
console.log(chalk.gray('     • Framework Preset: Astro'));
console.log(chalk.gray('     • Root Directory: ./ (leave as default)'));
console.log(chalk.gray('     • Build Command: bun run build (or npm run build)'));
console.log(chalk.gray('     • Output Directory: dist'));
console.log(chalk.gray('  5. Add Environment Variables (if needed):\n'));

// Check for .env file and show which vars to add
const envPath = resolve(sitePath, '.env');
if (existsSync(envPath)) {
  const envContent = await readFile(envPath, 'utf-8');
  const envVars = envContent
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#') && line.includes('='))
    .map(line => line.split('=')[0].trim());
  
  if (envVars.length > 0) {
    console.log(chalk.yellow('     Environment variables to add in Vercel:'));
    envVars.forEach(varName => {
      if (!varName.includes('LOCAL') && !varName.includes('DEV')) {
        console.log(chalk.gray(`       • ${varName}`));
      }
    });
    console.log();
  }
}

const { vercelCreated } = await prompts({
  type: 'confirm',
  name: 'vercelCreated',
  message: 'Have you created the Vercel project?',
  initial: false
});

if (vercelCreated) {
  const { vercelUrl } = await prompts({
    type: 'text',
    name: 'vercelUrl',
    message: 'Enter your Vercel deployment URL:',
    validate: value => {
      if (!value) return 'Vercel URL is required';
      if (!value.startsWith('http')) return 'Must start with https://';
      return true;
    }
  });
  
  if (vercelUrl) {
    config.steps.vercel.completed = true;
    config.steps.vercel.url = vercelUrl;
    console.log(chalk.green(`\n✓ Vercel URL saved: ${vercelUrl}\n`));
  }
}

// ============================================================================
// STEP 3: CUSTOM DOMAIN SETUP (OPTIONAL)
// ============================================================================

console.log(chalk.blue.bold('\n' + '═'.repeat(60)));
console.log(chalk.blue.bold('STEP 3: Custom Domain Setup (Optional)'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

const { addDomain } = await prompts({
  type: 'confirm',
  name: 'addDomain',
  message: 'Do you want to add a custom domain?',
  initial: false
});

if (addDomain) {
  console.log(chalk.white('\nCustom domain configuration:\n'));
  console.log(chalk.cyan('  1. In Vercel project settings, go to "Domains"'));
  console.log(chalk.gray('  2. Click "Add Domain"'));
  console.log(chalk.gray('  3. Enter your domain (e.g., clientwebsite.com)'));
  console.log(chalk.gray('  4. Configure DNS:\n'));
  console.log(chalk.yellow('     Option A: Nameservers (Recommended)'));
  console.log(chalk.gray('       • Point your domain nameservers to Vercel'));
  console.log(chalk.gray('       • Vercel nameservers: ns1.vercel-dns.com, ns2.vercel-dns.com\n'));
  console.log(chalk.yellow('     Option B: CNAME Record'));
  console.log(chalk.gray('       • Add CNAME: www → cname.vercel-dns.com'));
  console.log(chalk.gray('       • Add A Record: @ → 76.76.21.21\n'));
  
  const { customDomain } = await prompts({
    type: 'text',
    name: 'customDomain',
    message: 'Enter your custom domain (e.g., clientwebsite.com):',
    validate: value => {
      if (!value) return true; // Allow empty
      if (value.includes('http')) return 'Enter domain only, without http://';
      return true;
    }
  });
  
  if (customDomain) {
    config.steps.customDomain.completed = true;
    config.steps.customDomain.domain = customDomain;
    config.steps.customDomain.url = `https://${customDomain}`;
    console.log(chalk.green(`\n✓ Custom domain saved: ${customDomain}\n`));
  }
}

// ============================================================================
// STEP 4: AUTO-DEPLOY WORKFLOW CONFIRMATION
// ============================================================================

console.log(chalk.blue.bold('\n' + '═'.repeat(60)));
console.log(chalk.blue.bold('STEP 4: Auto-Deploy Workflow'));
console.log(chalk.blue.bold('═'.repeat(60) + '\n'));

console.log(chalk.white('Your deployment workflow is now configured:\n'));
console.log(chalk.green('  ✓ Any push to main branch will automatically deploy'));
console.log(chalk.green('  ✓ Vercel will build and deploy changes within 1-2 minutes'));
console.log(chalk.green('  ✓ You\'ll receive deployment notifications\n'));

console.log(chalk.white('Future changes workflow:\n'));
console.log(chalk.gray('  1. Make changes to your site'));
console.log(chalk.gray('  2. cd ' + sitePath));
console.log(chalk.gray('  3. git add .'));
console.log(chalk.gray('  4. git commit -m "Description of changes"'));
console.log(chalk.gray('  5. git push'));
console.log(chalk.gray('  6. Vercel automatically deploys! 🚀\n'));

const { testDeploy } = await prompts({
  type: 'confirm',
  name: 'testDeploy',
  message: 'Would you like to test the deployment with a small change?',
  initial: false
});

if (testDeploy) {
  console.log(chalk.blue('\nMaking a test change (updating footer timestamp)...\n'));
  
  try {
    // Make a small change (add comment to package.json)
    const packagePath = resolve(sitePath, 'package.json');
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(await readFile(packagePath, 'utf-8'));
      packageJson._lastDeployTest = new Date().toISOString();
      await writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    }
    
    await execAsync('git add .', { cwd: sitePath });
    await execAsync('git commit -m "Test deployment - timestamp update"', { cwd: sitePath });
    await execAsync('git push', { cwd: sitePath });
    
    console.log(chalk.green('✅ Test change pushed to GitHub!'));
    console.log(chalk.gray('Check Vercel dashboard to see automatic deployment in progress.\n'));
  } catch (err) {
    console.error(chalk.red(`✗ Test deployment failed: ${err.message}\n`));
  }
}

// ============================================================================
// SAVE CONFIGURATION
// ============================================================================

const checklistPath = resolve(outputDir, 'setup-checklist.json');
const vercelConfigPath = resolve(outputDir, 'vercel-config.json');

await writeFile(checklistPath, JSON.stringify(config, null, 2));
await writeFile(vercelConfigPath, JSON.stringify({
  site: values.site,
  githubRepo: config.steps.github.repoUrl,
  vercelUrl: config.steps.vercel.url,
  customDomain: config.steps.customDomain.domain,
  productionUrl: config.steps.customDomain.url || config.steps.vercel.url,
  setupCompletedAt: new Date().toISOString()
}, null, 2));

console.log(chalk.green('\n' + '═'.repeat(60)));
console.log(chalk.green.bold('✅ DEPLOYMENT SETUP COMPLETE!'));
console.log(chalk.green('═'.repeat(60) + '\n'));

console.log(chalk.white('Configuration saved:'));
console.log(chalk.gray(`  • ${checklistPath}`));
console.log(chalk.gray(`  • ${vercelConfigPath}\n`));

console.log(chalk.blue.bold('📋 Next Steps:\n'));
console.log(chalk.white('1. Wait for initial Vercel deployment to complete'));
console.log(chalk.white('2. Visit your deployment URL to verify site is live'));
console.log(chalk.white('3. Run post-launch checklist:\n'));
console.log(chalk.cyan(`   bun run post-launch --site ${values.site}\n`));

if (config.steps.customDomain.domain) {
  console.log(chalk.yellow('⏳ Custom domain DNS changes can take 24-48 hours to propagate\n'));
}

