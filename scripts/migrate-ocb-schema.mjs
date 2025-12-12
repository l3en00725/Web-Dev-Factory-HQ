#!/usr/bin/env node
/**
 * OCB Schema Migration Script
 * 
 * This script migrates the database schema from the old structure to OCB:
 * - sites → companies
 * - analytics_connections → website_oauth_tokens
 * - dashboard_settings → website_settings
 * - Creates website_leads if missing
 * 
 * Usage:
 *   node scripts/migrate-ocb-schema.mjs [--dry-run]
 * 
 * Environment Variables Required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (for migrations)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkCurrentState() {
  console.log('\n📊 Checking current database state...\n');
  
  const tables = ['sites', 'companies', 'analytics_connections', 'website_oauth_tokens', 
                  'dashboard_settings', 'website_settings', 'website_leads'];
  
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
        console.error(`  ⚠️  Error checking ${table}:`, error.message);
        results[table] = { exists: false, error: error.message };
      } else {
        results[table] = { 
          exists: !error, 
          count: data?.length || 0 
        };
      }
    } catch (err) {
      results[table] = { exists: false, error: err.message };
    }
  }
  
  console.log('Current State:');
  console.table(results);
  
  return results;
}

async function executeMigration() {
  console.log('\n🔄 Executing OCB Schema Migration...\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }
  
  // Read migration SQL file
  const migrationPath = join(__dirname, '../dashboard-api/db/migrations/001_ocb_schema_migration.sql');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');
  
  if (DRY_RUN) {
    console.log('Would execute migration SQL:');
    console.log('---');
    console.log(migrationSQL.substring(0, 500) + '...');
    console.log('---\n');
    return;
  }
  
  try {
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      // RPC might not exist, try direct SQL execution via REST API
      console.log('⚠️  RPC method not available, trying alternative approach...');
      
      // Split migration into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      console.log(`Executing ${statements.length} SQL statements...`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.includes('BEGIN') || statement.includes('COMMIT')) {
          continue; // Skip transaction markers
        }
        
        try {
          // Use Supabase REST API for DDL operations
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
            },
            body: JSON.stringify({ sql: statement + ';' }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`  ❌ Statement ${i + 1} failed:`, errorText);
          } else {
            console.log(`  ✓ Statement ${i + 1} executed`);
          }
        } catch (err) {
          console.error(`  ❌ Statement ${i + 1} error:`, err.message);
        }
      }
    } else {
      console.log('✅ Migration executed successfully');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('\n💡 Tip: You may need to execute the migration SQL directly in Supabase SQL Editor');
    console.error('   File location:', migrationPath);
    process.exit(1);
  }
}

async function verifyMigration() {
  console.log('\n✅ Verifying migration...\n');
  
  const expectedTables = ['companies', 'website_oauth_tokens', 'website_settings', 'website_leads'];
  const oldTables = ['sites', 'analytics_connections', 'dashboard_settings'];
  
  const verification = {};
  
  // Check new tables exist
  for (const table of expectedTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      verification[table] = {
        exists: !error,
        count: count || 0,
        status: !error ? '✅' : '❌'
      };
    } catch (err) {
      verification[table] = {
        exists: false,
        error: err.message,
        status: '❌'
      };
    }
  }
  
  // Check old tables are gone
  for (const table of oldTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*', { head: true });
      
      verification[table] = {
        exists: !error,
        shouldExist: false,
        status: error ? '✅ (removed)' : '⚠️  (still exists)'
      };
    } catch (err) {
      verification[table] = {
        exists: false,
        shouldExist: false,
        status: '✅ (removed)'
      };
    }
  }
  
  console.log('Verification Results:');
  console.table(verification);
  
  const allGood = expectedTables.every(t => verification[t]?.exists) &&
                  oldTables.every(t => !verification[t]?.exists);
  
  if (allGood) {
    console.log('\n✅ Migration verification passed!');
  } else {
    console.log('\n⚠️  Migration verification found issues. Please review.');
  }
  
  return allGood;
}

async function main() {
  console.log('🚀 OCB Schema Migration Tool\n');
  console.log('='.repeat(50));
  
  // Step 1: Check current state
  const currentState = await checkCurrentState();
  
  // Step 2: Execute migration
  await executeMigration();
  
  if (!DRY_RUN) {
    // Step 3: Verify migration
    const verified = await verifyMigration();
    
    if (verified) {
      console.log('\n🎉 Migration completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Migration completed with warnings. Please review.');
      process.exit(1);
    }
  } else {
    console.log('\n✅ Dry run completed. Use without --dry-run to execute.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});



