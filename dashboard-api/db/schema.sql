-- dashboard-api/db/schema.sql
-- Multi-tenant Supabase schema for Central Dashboard Service
-- Stores OAuth tokens, analytics connections, dashboard settings, and cached data

-- ==============================================
-- SITES TABLE
-- ==============================================
-- Stores site information and generates unique site UUIDs
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL UNIQUE,
  site_url TEXT NOT NULL,
  site_owner_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dashboard_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Sanity connection
  sanity_project_id TEXT,
  sanity_dataset TEXT DEFAULT 'production',
  -- Status flags
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ
);

CREATE INDEX idx_sites_owner ON sites(site_owner_uid);
CREATE INDEX idx_sites_dashboard_uuid ON sites(dashboard_uuid);
CREATE INDEX idx_sites_site_name ON sites(site_name);

-- ==============================================
-- ANALYTICS CONNECTIONS TABLE
-- ==============================================
-- Stores OAuth tokens for Google Analytics 4 and Search Console
-- Uses Supabase Vault for encryption or encrypted columns
CREATE TABLE IF NOT EXISTS analytics_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('ga4', 'search_console', 'google_business_profile', 'callrail', 'hubspot', 'jobber', 'service_titan')),
  
  -- GA4 specific fields
  ga4_property_id TEXT,
  ga4_measurement_id TEXT,
  
  -- Search Console specific fields
  search_console_site_url TEXT,
  
  -- OAuth token storage (encrypted via Supabase Vault)
  -- In production, use Supabase Vault or pgcrypto for encryption
  refresh_token TEXT, -- Encrypted refresh token
  access_token TEXT, -- Short-lived access token (refreshed by service)
  token_expires_at TIMESTAMPTZ,
  
  -- Connection metadata
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error')),
  sync_error TEXT,
  
  -- Additional config
  config JSONB DEFAULT '{}'::jsonb,
  
  UNIQUE(site_id, connection_type)
);

CREATE INDEX idx_analytics_connections_site ON analytics_connections(site_id);
CREATE INDEX idx_analytics_connections_type ON analytics_connections(connection_type);
CREATE INDEX idx_analytics_connections_sync_status ON analytics_connections(sync_status);

-- ==============================================
-- DASHBOARD SETTINGS TABLE
-- ==============================================
-- Stores per-site dashboard configuration (which metrics are enabled, display preferences)
CREATE TABLE IF NOT EXISTS dashboard_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Feature toggles
  show_traffic_overview BOOLEAN DEFAULT true,
  show_keyword_opportunities BOOLEAN DEFAULT true,
  show_leads_overview BOOLEAN DEFAULT true,
  show_site_health BOOLEAN DEFAULT true,
  show_ai_insights BOOLEAN DEFAULT true,
  
  -- Display preferences
  default_date_range TEXT DEFAULT '30d' CHECK (default_date_range IN ('7d', '30d', '90d', '1y', 'all')),
  refresh_interval_minutes INTEGER DEFAULT 60,
  
  -- Alert thresholds
  traffic_drop_threshold_percent DECIMAL(5,2) DEFAULT 20.0,
  keyword_opportunity_min_volume INTEGER DEFAULT 100,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_dashboard_settings_site ON dashboard_settings(site_id);

-- ==============================================
-- ANALYTICS CACHE TABLE
-- ==============================================
-- Stores cached analytics snapshots to reduce API calls
CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID REFERENCES analytics_connections(id) ON DELETE CASCADE,
  cache_type TEXT NOT NULL CHECK (cache_type IN ('ga4_traffic', 'ga4_events', 'search_console_queries', 'search_console_pages', 'keyword_research', 'leads_summary')),
  
  -- Cached data (JSONB for flexibility)
  data JSONB NOT NULL,
  
  -- Cache metadata
  date_range_start DATE,
  date_range_end DATE,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Version for cache invalidation
  cache_version INTEGER DEFAULT 1
);

CREATE INDEX idx_analytics_cache_site ON analytics_cache(site_id);
CREATE INDEX idx_analytics_cache_type ON analytics_cache(cache_type);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);
CREATE INDEX idx_analytics_cache_connection ON analytics_cache(connection_id);

-- ==============================================
-- AI INSIGHTS TABLE
-- ==============================================
-- Stores AI-generated insights and summaries per site
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  
  -- Insight metadata
  insight_type TEXT NOT NULL CHECK (insight_type IN ('traffic_analysis', 'keyword_opportunity', 'seo_recommendation', 'content_suggestion', 'performance_insight', 'lead_analysis')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  
  -- Priority and status
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'dismissed', 'implemented')),
  
  -- Source tracking
  generated_by TEXT DEFAULT 'keyword_research_agent', -- Which agent generated this
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User interaction
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  
  -- Related data references
  related_keyword_id TEXT,
  related_page_url TEXT,
  related_metric_id TEXT
);

CREATE INDEX idx_ai_insights_site ON ai_insights(site_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_status ON ai_insights(status);
CREATE INDEX idx_ai_insights_priority ON ai_insights(priority);
CREATE INDEX idx_ai_insights_generated_at ON ai_insights(generated_at DESC);

-- ==============================================
-- FUNCTIONS & TRIGGERS
-- ==============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_settings_updated_at
  BEFORE UPDATE ON dashboard_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================
-- Enable RLS on all tables
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own sites
CREATE POLICY sites_owner_policy ON sites
  FOR ALL
  USING (auth.uid() = site_owner_uid);

CREATE POLICY analytics_connections_owner_policy ON analytics_connections
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = analytics_connections.site_id
      AND sites.site_owner_uid = auth.uid()
    )
  );

CREATE POLICY dashboard_settings_owner_policy ON dashboard_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = dashboard_settings.site_id
      AND sites.site_owner_uid = auth.uid()
    )
  );

CREATE POLICY analytics_cache_owner_policy ON analytics_cache
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = analytics_cache.site_id
      AND sites.site_owner_uid = auth.uid()
    )
  );

CREATE POLICY ai_insights_owner_policy ON ai_insights
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sites
      WHERE sites.id = ai_insights.site_id
      AND sites.site_owner_uid = auth.uid()
    )
  );

