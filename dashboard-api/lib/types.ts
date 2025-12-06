// dashboard-api/lib/types.ts
// TypeScript type definitions for dashboard API

export interface Site {
  id: string;
  site_name: string;
  site_url: string;
  site_owner_uid: string;
  dashboard_uuid: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  sanity_project_id?: string;
  sanity_dataset: string;
  is_active: boolean;
  last_synced_at?: string;
}

export interface AnalyticsConnection {
  id: string;
  site_id: string;
  connection_type: 'ga4' | 'search_console' | 'google_business_profile' | 'callrail' | 'hubspot' | 'jobber' | 'service_titan';
  ga4_property_id?: string;
  ga4_measurement_id?: string;
  search_console_site_url?: string;
  refresh_token?: string; // Encrypted
  access_token?: string; // Short-lived
  token_expires_at?: string;
  connected_at: string;
  last_synced_at?: string;
  sync_status: 'pending' | 'syncing' | 'success' | 'error';
  sync_error?: string;
  config: Record<string, any>;
}

export interface DashboardSettings {
  id: string;
  site_id: string;
  show_traffic_overview: boolean;
  show_keyword_opportunities: boolean;
  show_leads_overview: boolean;
  show_site_health: boolean;
  show_ai_insights: boolean;
  default_date_range: '7d' | '30d' | '90d' | '1y' | 'all';
  refresh_interval_minutes: number;
  traffic_drop_threshold_percent: number;
  keyword_opportunity_min_volume: number;
  created_at: string;
  updated_at: string;
  preferences: Record<string, any>;
}

export interface ConnectionStatus {
  analyticsConnected: boolean;
  searchConsoleConnected: boolean;
  keywordResearchReady: boolean;
  sanityLeadsConfigured: boolean;
}

