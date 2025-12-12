# OCB Schema Migration Guide

## Overview

This guide walks through migrating the database schema from the old structure to the VIRGO OCB Master Directive structure.

## Migration Steps

### Step 1: Review Current State

Before migrating, check what tables currently exist in your Supabase database:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'sites', 'companies',
  'analytics_connections', 'website_oauth_tokens',
  'dashboard_settings', 'website_settings',
  'website_leads'
)
ORDER BY table_name;
```

### Step 2: Backup Database

**⚠️ CRITICAL: Always backup before running migrations!**

1. Go to Supabase Dashboard → Database → Backups
2. Create a manual backup
3. Or export schema: `pg_dump` command

### Step 3: Execute Migration

#### Option A: Via Supabase SQL Editor (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `dashboard-api/db/migrations/001_ocb_schema_migration.sql`
3. Paste into SQL Editor
4. Click "Run" to execute
5. Verify no errors

#### Option B: Via Migration Script

```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Dry run first
node scripts/migrate-ocb-schema.mjs --dry-run

# Execute migration
node scripts/migrate-ocb-schema.mjs
```

### Step 4: Verify Migration

Run these verification queries:

```sql
-- Check new tables exist
SELECT 
  'companies' as table_name, 
  COUNT(*) as row_count 
FROM companies
UNION ALL
SELECT 'website_oauth_tokens', COUNT(*) FROM website_oauth_tokens
UNION ALL
SELECT 'website_settings', COUNT(*) FROM website_settings
UNION ALL
SELECT 'website_leads', COUNT(*) FROM website_leads;

-- Check old tables are gone (should return 0 rows)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sites', 'analytics_connections', 'dashboard_settings');
```

### Step 5: Update Application Code

After migration, update all code references:

1. **Table names:**
   - `sites` → `companies`
   - `analytics_connections` → `website_oauth_tokens`
   - `dashboard_settings` → `website_settings`

2. **Column names:**
   - `site_name` → `name`
   - `site_url` → `domain`
   - `site_id` → `company_id`
   - `connection_type` → `provider`
   - `search_console_site_url` → `gsc_site_url`
   - `token_expires_at` → `token_expiry`

3. **Foreign keys:**
   - All `site_id` references → `company_id`

## Migration Details

### Table Renames

| Old Table | New Table | Notes |
|-----------|-----------|-------|
| `sites` | `companies` | Adds `slug` column |
| `analytics_connections` | `website_oauth_tokens` | Adds `scopes`, `connected_email` |
| `dashboard_settings` | `website_settings` | Adds `settings` JSONB column |
| N/A | `website_leads` | Created if missing |

### Column Mappings

#### companies (from sites)
- `site_name` → `name`
- `site_url` → `domain`
- `site_owner_uid` → `site_owner_uid` (unchanged)
- `dashboard_uuid` → `dashboard_uuid` (unchanged)
- **NEW:** `slug` (TEXT UNIQUE)

#### website_oauth_tokens (from analytics_connections)
- `site_id` → `company_id`
- `connection_type` → `provider`
- `search_console_site_url` → `gsc_site_url`
- `token_expires_at` → `token_expiry`
- **NEW:** `scopes` (TEXT)
- **NEW:** `connected_email` (TEXT)

#### website_settings (from dashboard_settings)
- `site_id` → `company_id`
- **NEW:** `settings` (JSONB) - stores business info, tracking, email templates

### Data Preservation

The migration preserves all existing data:
- ✅ All rows are maintained
- ✅ Foreign key relationships are updated
- ✅ Indexes are recreated
- ✅ RLS policies are updated

## Rollback Plan

If you need to rollback:

```sql
-- Rollback script (run in reverse order)
ALTER TABLE companies RENAME TO sites;
ALTER TABLE companies RENAME COLUMN name TO site_name;
ALTER TABLE companies RENAME COLUMN domain TO site_url;
ALTER TABLE companies DROP COLUMN IF EXISTS slug;

ALTER TABLE website_oauth_tokens RENAME TO analytics_connections;
ALTER TABLE website_oauth_tokens RENAME COLUMN company_id TO site_id;
ALTER TABLE website_oauth_tokens RENAME COLUMN provider TO connection_type;
-- ... etc
```

**Note:** Always test rollback on a staging database first!

## Troubleshooting

### Error: "relation already exists"
- The migration checks if tables exist before renaming
- If you see this, the migration may have partially run
- Check current state and manually complete remaining steps

### Error: "foreign key constraint"
- Ensure all dependent tables are updated
- The migration handles this automatically, but verify foreign keys

### Error: "permission denied"
- Ensure you're using `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- Service role key has full database access

## Post-Migration Checklist

- [ ] All tables renamed successfully
- [ ] Row counts match (no data loss)
- [ ] Foreign keys updated
- [ ] Indexes recreated
- [ ] RLS policies updated
- [ ] Application code updated
- [ ] Test admin panel functionality
- [ ] Test OAuth connections
- [ ] Test leads viewer
- [ ] Test settings page

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Postgres Logs
2. Review migration SQL for syntax errors
3. Verify environment variables are set correctly
4. Test on staging database first



