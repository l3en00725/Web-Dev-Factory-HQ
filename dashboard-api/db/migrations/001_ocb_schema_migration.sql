-- Migration: OCB Schema Migration
-- Purpose: Rename existing tables to match VIRGO OCB Master Directive
-- Date: 2025-01-XX
-- 
-- This migration:
-- 1. Renames sites → companies
-- 2. Renames analytics_connections → website_oauth_tokens
-- 3. Renames dashboard_settings → website_settings
-- 4. Creates website_leads table if missing
-- 5. Updates all foreign key references
-- 6. Updates indexes
-- 7. Updates RLS policies

BEGIN;

-- ==============================================
-- STEP 1: Rename sites → companies
-- ==============================================
DO $$ 
BEGIN
  -- Check if sites table exists and companies doesn't
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sites' AND table_schema = 'public')
     AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
    ALTER TABLE sites RENAME TO companies;
    
    -- Update column names to match OCB spec
    ALTER TABLE companies RENAME COLUMN site_name TO name;
    ALTER TABLE companies RENAME COLUMN site_url TO domain;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
    
    -- Update indexes
    DROP INDEX IF EXISTS idx_sites_owner;
    DROP INDEX IF EXISTS idx_sites_dashboard_uuid;
    DROP INDEX IF EXISTS idx_sites_site_name;
    
    CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(site_owner_uid);
    CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
    CREATE INDEX IF NOT EXISTS idx_companies_dashboard_uuid ON companies(dashboard_uuid);
    
    -- Update trigger
    DROP TRIGGER IF EXISTS update_sites_updated_at ON companies;
    CREATE TRIGGER update_companies_updated_at
      BEFORE UPDATE ON companies
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ==============================================
-- STEP 2: Rename analytics_connections → website_oauth_tokens
-- ==============================================
DO $$ 
BEGIN
  -- Check if analytics_connections exists and website_oauth_tokens doesn't
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analytics_connections' AND table_schema = 'public')
     AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'website_oauth_tokens' AND table_schema = 'public') THEN
    ALTER TABLE analytics_connections RENAME TO website_oauth_tokens;
    
    -- Update column names to match OCB spec
    ALTER TABLE website_oauth_tokens RENAME COLUMN site_id TO company_id;
    ALTER TABLE website_oauth_tokens RENAME COLUMN connection_type TO provider;
    ALTER TABLE website_oauth_tokens RENAME COLUMN ga4_property_id TO ga4_property_id;
    ALTER TABLE website_oauth_tokens RENAME COLUMN ga4_measurement_id TO ga4_measurement_id;
    ALTER TABLE website_oauth_tokens RENAME COLUMN search_console_site_url TO gsc_site_url;
    ALTER TABLE website_oauth_tokens RENAME COLUMN token_expires_at TO token_expiry;
    ALTER TABLE website_oauth_tokens RENAME COLUMN connected_at TO connected_at;
    
    -- Add OCB-specific columns if missing
    ALTER TABLE website_oauth_tokens ADD COLUMN IF NOT EXISTS scopes TEXT;
    ALTER TABLE website_oauth_tokens ADD COLUMN IF NOT EXISTS connected_email TEXT;
    
    -- Update foreign key reference
    ALTER TABLE website_oauth_tokens 
      DROP CONSTRAINT IF EXISTS analytics_connections_site_id_fkey,
      ADD CONSTRAINT website_oauth_tokens_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    
    -- Update unique constraint
    DROP INDEX IF EXISTS analytics_connections_site_id_connection_type_key;
    ALTER TABLE website_oauth_tokens 
      DROP CONSTRAINT IF EXISTS analytics_connections_site_id_connection_type_key,
      ADD CONSTRAINT website_oauth_tokens_company_provider_unique 
        UNIQUE(company_id, provider);
    
    -- Update indexes
    DROP INDEX IF EXISTS idx_analytics_connections_site;
    DROP INDEX IF EXISTS idx_analytics_connections_type;
    DROP INDEX IF EXISTS idx_analytics_connections_sync_status;
    
    CREATE INDEX IF NOT EXISTS idx_website_oauth_tokens_company ON website_oauth_tokens(company_id);
    CREATE INDEX IF NOT EXISTS idx_website_oauth_tokens_provider ON website_oauth_tokens(provider);
  END IF;
END $$;

-- ==============================================
-- STEP 3: Rename dashboard_settings → website_settings
-- ==============================================
DO $$ 
BEGIN
  -- Check if dashboard_settings exists and website_settings doesn't
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dashboard_settings' AND table_schema = 'public')
     AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'website_settings' AND table_schema = 'public') THEN
    ALTER TABLE dashboard_settings RENAME TO website_settings;
    
    -- Update column names to match OCB spec
    ALTER TABLE website_settings RENAME COLUMN site_id TO company_id;
    
    -- Add OCB-specific columns
    ALTER TABLE website_settings ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
    
    -- Update foreign key reference
    ALTER TABLE website_settings 
      DROP CONSTRAINT IF EXISTS dashboard_settings_site_id_fkey,
      ADD CONSTRAINT website_settings_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    
    -- Update unique constraint
    ALTER TABLE website_settings 
      DROP CONSTRAINT IF EXISTS dashboard_settings_site_id_key,
      ADD CONSTRAINT website_settings_company_id_unique UNIQUE(company_id);
    
    -- Update indexes
    DROP INDEX IF EXISTS idx_dashboard_settings_site;
    CREATE INDEX IF NOT EXISTS idx_website_settings_company ON website_settings(company_id);
    
    -- Update trigger
    DROP TRIGGER IF EXISTS update_dashboard_settings_updated_at ON website_settings;
    CREATE TRIGGER update_website_settings_updated_at
      BEFORE UPDATE ON website_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ==============================================
-- STEP 4: Create website_leads table (OCB spec)
-- ==============================================
CREATE TABLE IF NOT EXISTS website_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  message TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  -- Tracking fields
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  fbclid TEXT,
  referrer TEXT,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_leads_company ON website_leads(company_id);
CREATE INDEX IF NOT EXISTS idx_website_leads_email ON website_leads(email);
CREATE INDEX IF NOT EXISTS idx_website_leads_reviewed ON website_leads(reviewed);
CREATE INDEX IF NOT EXISTS idx_website_leads_created_at ON website_leads(created_at DESC);

-- ==============================================
-- STEP 5: Update analytics_cache foreign keys
-- ==============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analytics_cache') THEN
    ALTER TABLE analytics_cache 
      DROP CONSTRAINT IF EXISTS analytics_cache_site_id_fkey,
      ADD CONSTRAINT analytics_cache_company_id_fkey 
        FOREIGN KEY (site_id) REFERENCES companies(id) ON DELETE CASCADE;
    
    -- Note: connection_id references website_oauth_tokens now
    ALTER TABLE analytics_cache 
      DROP CONSTRAINT IF EXISTS analytics_cache_connection_id_fkey,
      ADD CONSTRAINT analytics_cache_connection_id_fkey 
        FOREIGN KEY (connection_id) REFERENCES website_oauth_tokens(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ==============================================
-- STEP 6: Update ai_insights foreign keys
-- ==============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_insights') THEN
    ALTER TABLE ai_insights 
      DROP CONSTRAINT IF EXISTS ai_insights_site_id_fkey,
      ADD CONSTRAINT ai_insights_company_id_fkey 
        FOREIGN KEY (site_id) REFERENCES companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ==============================================
-- STEP 7: Update RLS Policies
-- ==============================================
-- Drop old policies
DROP POLICY IF EXISTS sites_owner_policy ON companies;
DROP POLICY IF EXISTS analytics_connections_owner_policy ON website_oauth_tokens;
DROP POLICY IF EXISTS dashboard_settings_owner_policy ON website_settings;
DROP POLICY IF EXISTS analytics_cache_owner_policy ON analytics_cache;
DROP POLICY IF EXISTS ai_insights_owner_policy ON ai_insights;

-- Create new policies for companies
CREATE POLICY companies_owner_policy ON companies
  FOR ALL
  USING (auth.uid() = site_owner_uid);

-- Create new policies for website_oauth_tokens
CREATE POLICY website_oauth_tokens_owner_policy ON website_oauth_tokens
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = website_oauth_tokens.company_id
      AND companies.site_owner_uid = auth.uid()
    )
  );

-- Create new policies for website_settings
CREATE POLICY website_settings_owner_policy ON website_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = website_settings.company_id
      AND companies.site_owner_uid = auth.uid()
    )
  );

-- Create new policies for website_leads
ALTER TABLE website_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY website_leads_owner_policy ON website_leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = website_leads.company_id
      AND companies.site_owner_uid = auth.uid()
    )
  );

-- Update analytics_cache policy
CREATE POLICY analytics_cache_owner_policy ON analytics_cache
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = analytics_cache.site_id
      AND companies.site_owner_uid = auth.uid()
    )
  );

-- Update ai_insights policy
CREATE POLICY ai_insights_owner_policy ON ai_insights
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = ai_insights.site_id
      AND companies.site_owner_uid = auth.uid()
    )
  );

COMMIT;

-- ==============================================
-- VERIFICATION QUERIES (Run after migration)
-- ==============================================
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('companies', 'website_oauth_tokens', 'website_settings', 'website_leads');
--
-- SELECT COUNT(*) FROM companies;
-- SELECT COUNT(*) FROM website_oauth_tokens;
-- SELECT COUNT(*) FROM website_settings;
-- SELECT COUNT(*) FROM website_leads;

