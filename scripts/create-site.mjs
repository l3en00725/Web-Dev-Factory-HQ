#!/usr/bin/env node
// scripts/create-site.mjs
// Phase 11 – Multi-Site Replication Automation
// Clones an existing template site into /sites/<name> and applies basic renames.
//
// Usage:
//   bun run scripts/create-site.mjs --name my-new-site --domain https://www.mynewsite.com --from blue-lawns
//
// Notes:
// - Defaults to using `sites/blue-lawns` as the source template.
// - Does NOT modify the source template; it only reads from it.

import { parseArgs } from 'util';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync, cpSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(join(__dirname, '..'));

const { values } = parseArgs({
  options: {
    name: { type: 'string', required: true },
    domain: { type: 'string' }, // e.g. https://www.example.com
    from: { type: 'string' },   // source template site, default: blue-lawns
  },
  strict: false,
});

const siteName = values.name.trim();
const sourceSite = (values.from || 'blue-lawns').trim();
const sourceDir = resolve(join(repoRoot, 'sites', sourceSite));
const targetDir = resolve(join(repoRoot, 'sites', siteName));

// Ensure source site exists
if (!existsSync(sourceDir)) {
  console.error(`❌ Error: Source site not found: ${sourceDir}`);
  console.error('   Use --from <existing-site> to specify a valid template (default is "blue-lawns").');
  process.exit(1);
}

// Ensure target does not already exist
if (existsSync(targetDir)) {
  console.error(`❌ Error: Target site already exists: ${targetDir}`);
  process.exit(1);
}

// Compute new site URL
const defaultDomain = `https://www.${siteName}.com`;
const newSiteUrl = values.domain || defaultDomain;

console.log(`\n🏗  Creating new site from template`);
console.log(`   Source: ${sourceSite} → ${sourceDir}`);
console.log(`   Target: ${siteName} → ${targetDir}`);
console.log(`   Site URL: ${newSiteUrl}\n`);

// Helper: simple recursive directory copy (Node 18+ cpSync supports recursive, but keep explicit for clarity)
function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip dist and node_modules if present
      if (entry.name === 'dist' || entry.name === 'node_modules') continue;
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      // Skip site-specific .env.local; new site should start clean
      if (entry.name === '.env.local') continue;
      cpSync(srcPath, destPath);
    }
  }
}

copyDir(sourceDir, targetDir);

// Post-copy adjustments
// 1) astro.config.mjs: update `site` URL
const astroConfigPath = join(targetDir, 'astro.config.mjs');
if (existsSync(astroConfigPath)) {
  let astroConfig = readFileSync(astroConfigPath, 'utf-8');
  astroConfig = astroConfig.replace(
    /site:\s*".*?"/,
    `site: "${newSiteUrl}"`
  );
  writeFileSync(astroConfigPath, astroConfig, 'utf-8');
  console.log(`   ✏️  Updated site URL in astro.config.mjs → ${newSiteUrl}`);
}

// 2) dashboard page: update CLI hint for register-dashboard command
const dashboardPagePath = join(targetDir, 'src', 'pages', 'dashboard', 'index.astro');
if (existsSync(dashboardPagePath)) {
  let dashboardPage = readFileSync(dashboardPagePath, 'utf-8');
  dashboardPage = dashboardPage.replace(
    /bun run register-dashboard --site [^\s<]+/g,
    `bun run register-dashboard --site ${siteName}`
  );
  writeFileSync(dashboardPagePath, dashboardPage, 'utf-8');
  console.log(`   ✏️  Updated dashboard CLI hint for site "${siteName}"`);
}

// 3) DEPLOYMENT.md: update heading and any mentions of the old site name
const deploymentPath = join(targetDir, 'DEPLOYMENT.md');
if (existsSync(deploymentPath)) {
  let deployment = readFileSync(deploymentPath, 'utf-8');
  deployment = deployment
    .replace(/Blue Lawns\s*–\s*Deployment Checklist/gi, `${siteName} – Deployment Checklist`)
    .replace(/Blue Lawns/gi, siteName);
  writeFileSync(deploymentPath, deployment, 'utf-8');
  console.log(`   ✏️  Updated DEPLOYMENT.md for site "${siteName}"`);
}

// 4) Optional: replace any remaining "Blue Lawns" literals in .astro files under src
function replaceInAstroFiles(rootDir, search, replaceWith) {
  const entries = readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(rootDir, entry.name);
    if (entry.isDirectory()) {
      replaceInAstroFiles(fullPath, search, replaceWith);
    } else if (entry.isFile() && fullPath.endsWith('.astro')) {
      const content = readFileSync(fullPath, 'utf-8');
      if (content.includes(search)) {
        const updated = content.replace(new RegExp(search, 'g'), replaceWith);
        writeFileSync(fullPath, updated, 'utf-8');
      }
    }
  }
}

replaceInAstroFiles(join(targetDir, 'src'), 'Blue Lawns', siteName);

console.log(`\n✅ Site created successfully at: ${targetDir}`);
console.log(`   Next steps:`);
console.log(`   1. Configure environment variables for the new site (see DEPLOYMENT.md in ${siteName}).`);
console.log(`   2. Run: cd sites/${siteName} && npm install && npm run build`);
console.log(`   3. Register with dashboard (optional): bun run register-dashboard --site ${siteName}\n`);


