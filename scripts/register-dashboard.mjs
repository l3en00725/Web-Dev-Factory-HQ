#!/usr/bin/env node
// scripts/register-dashboard.mjs
// Phase 10: Register site with Central Dashboard Service
// Called after Astro site build to register site and inject DASHBOARD_UUID

import { parseArgs } from 'util';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const { values } = parseArgs({
  options: {
    site: { type: 'string', required: true },
    domain: { type: 'string' },
    'sanity-project': { type: 'string' },
    'sanity-dataset': { type: 'string', default: 'production' },
    template: { type: 'string', default: 'client-base' },
  },
  strict: false,
});

const siteName = values.site;
const siteDir = resolve(`sites/${siteName}`);

// Validate site directory exists
if (!existsSync(siteDir)) {
  console.error(`❌ Error: Site directory not found: ${siteDir}`);
  process.exit(1);
}

// Get Sanity project ID from environment or site's .env
let sanityProjectId = values['sanity-project'] || process.env.SANITY_PROJECT_ID;
if (!sanityProjectId) {
  // Try to read from site's .env.local
  const siteEnvPath = join(siteDir, '.env.local');
  if (existsSync(siteEnvPath)) {
    const envContent = readFileSync(siteEnvPath, 'utf-8');
    const match = envContent.match(/SANITY_PROJECT_ID=(.+)/);
    if (match) {
      sanityProjectId = match[1].trim();
    }
  }
}

if (!sanityProjectId) {
  console.error(`❌ Error: SANITY_PROJECT_ID not found. Set --sanity-project or SANITY_PROJECT_ID env var.`);
  process.exit(1);
}

const sanityDataset = values['sanity-dataset'] || process.env.SANITY_DATASET || 'production';
const templateName = values.template || 'client-base';
const domain = values.domain || null;

// Get dashboard API URL from root env or default
const dashboardApiUrl = process.env.DASHBOARD_API_URL || 'http://localhost:3000';

console.log(`\n📊 Registering site with Central Dashboard Service...`);
console.log(`   Site: ${siteName}`);
console.log(`   Domain: ${domain || '(placeholder)'}`);
console.log(`   Sanity: ${sanityProjectId}/${sanityDataset}`);
console.log(`   Template: ${templateName}`);
console.log(`   Dashboard API: ${dashboardApiUrl}\n`);

try {
  // Call dashboard registration endpoint
  const response = await fetch(`${dashboardApiUrl}/api/sites/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      siteName,
      domain,
      sanityProjectId,
      sanityDataset,
      templateName,
    }),
  });

      if (!response.ok) {
        console.error(`Response status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error(`Response body: ${text}`);
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          errorData = { error: 'Invalid JSON response' };
        }
        throw new Error(`Registration failed: ${errorData?.error || response.statusText}`);
      }

      const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Registration failed');
  }

  const { siteId, dashboardUuid, mock, message } = data;

  // Report registration mode
  if (mock) {
    console.log(`✅ Site registered successfully (MOCK MODE)`);
    console.log(`   ⚠️  Supabase not configured - using mock UUIDs`);
    console.log(`   Site ID: ${siteId}`);
    console.log(`   Dashboard UUID: ${dashboardUuid}`);
    console.log(`   Note: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for real registration\n`);
  } else {
    console.log(`✅ Site registered successfully!`);
    console.log(`   Site ID: ${siteId}`);
    console.log(`   Dashboard UUID: ${dashboardUuid}`);
    if (message) {
      console.log(`   ${message}\n`);
    } else {
      console.log();
    }
  }

  // Write DASHBOARD_UUID to site's .env.local
  const envLocalPath = join(siteDir, '.env.local');
  let envContent = '';
  
  if (existsSync(envLocalPath)) {
    envContent = readFileSync(envLocalPath, 'utf-8');
  }
  
  // Update or add DASHBOARD_UUID
  if (envContent.includes('DASHBOARD_UUID=')) {
    envContent = envContent.replace(
      /DASHBOARD_UUID=.*/,
      `DASHBOARD_UUID=${dashboardUuid}`
    );
  } else {
    envContent += `\n# Dashboard Service\nDASHBOARD_UUID=${dashboardUuid}\n`;
  }
  
  // Update or add DASHBOARD_API_URL
  if (envContent.includes('DASHBOARD_API_URL=')) {
    envContent = envContent.replace(
      /DASHBOARD_API_URL=.*/,
      `DASHBOARD_API_URL=${dashboardApiUrl}`
    );
  } else {
    envContent += `DASHBOARD_API_URL=${dashboardApiUrl}\n`;
  }
  
  // Ensure .env.local directory exists
  mkdirSync(siteDir, { recursive: true });
  
  // Write updated .env.local
  writeFileSync(envLocalPath, envContent, 'utf-8');
  
  console.log(`✅ Dashboard UUID written to: ${envLocalPath}`);
  console.log(`\n🎉 Phase 10 complete! Site is now registered with dashboard service.\n`);

} catch (error) {
  console.error(`\n❌ Registration failed: ${error.message}`);
  console.error(`\n💡 Make sure:`);
  console.error(`   1. Dashboard API is running at ${dashboardApiUrl}`);
  console.error(`   2. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set`);
  console.error(`   3. Database schema is deployed (run dashboard-api/db/schema.sql)\n`);
  process.exit(1);
}

