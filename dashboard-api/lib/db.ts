// dashboard-api/lib/db.ts
// Supabase database helper functions for Central Dashboard Service
// Supports both real Supabase integration and mock mode fallback

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface SiteData {
  siteName: string;
  siteUrl: string;
  sanityProjectId: string;
  sanityDataset: string;
  templateName: string;
}

export interface SiteRecord {
  id: string;
  site_name: string;
  site_url: string;
  dashboard_uuid: string;
  sanity_project_id?: string;
  sanity_dataset: string;
  created_at: string;
}

export interface RegistrationResult {
  success: boolean;
  siteId: string;
  dashboardUuid: string;
  mock?: boolean;
  message?: string;
}

/**
 * Check if Supabase is configured with required environment variables
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_URL.length > 0 &&
    process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0
  );
}

/**
 * Get Supabase client instance
 * Returns null if environment variables are not configured (mock mode)
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  } catch (error) {
    console.error('[db] Failed to create Supabase client:', error);
    return null;
  }
}

/**
 * Generate mock UUIDs for development/testing when Supabase is not configured
 */
function generateMockUuids(): { siteId: string; dashboardUuid: string } {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return {
    siteId: `mock-site-${timestamp}-${random}`,
    dashboardUuid: `dashboard-${timestamp}-${random}`,
  };
}

/**
 * Register a new site in Supabase
 * Returns mock UUIDs if Supabase is not configured
 */
export async function registerSite(siteData: SiteData): Promise<RegistrationResult> {
  const supabase = getSupabaseClient();

  // Mock mode: Return mock UUIDs
  if (!supabase) {
    console.warn('[db] Supabase not configured, using mock mode for site registration');
    const mockUuids = generateMockUuids();
    return {
      success: true,
      siteId: mockUuids.siteId,
      dashboardUuid: mockUuids.dashboardUuid,
      mock: true,
      message: 'Site registered (mock mode - Supabase not configured)',
    };
  }

  try {
    // Insert site into Supabase
    const { data, error } = await supabase
      .from('sites')
      .insert({
        site_name: siteData.siteName,
        site_url: siteData.siteUrl,
        sanity_project_id: siteData.sanityProjectId,
        sanity_dataset: siteData.sanityDataset,
        metadata: {
          template_name: siteData.templateName,
          registered_at: new Date().toISOString(),
        },
      })
      .select('id, dashboard_uuid')
      .single();

    if (error) {
      // Handle duplicate site_name error (PostgreSQL unique constraint violation)
      if (error.code === '23505' || error.message.includes('duplicate key')) {
        // Site already exists, fetch existing record
        const existing = await getSiteByName(siteData.siteName);
        if (existing) {
          return {
            success: true,
            siteId: existing.id,
            dashboardUuid: existing.dashboard_uuid,
            message: 'Site already registered',
          };
        }
      }
      throw error;
    }

    if (!data) {
      throw new Error('Site registration returned no data');
    }

    // Create default dashboard settings
    await createDefaultSettings(data.id);

    return {
      success: true,
      siteId: data.id,
      dashboardUuid: data.dashboard_uuid,
    };
  } catch (error) {
    console.error('[db] Site registration error:', error);
    throw error;
  }
}

/**
 * Get site by site_name
 * Returns null if Supabase is not configured or site not found
 */
export async function getSiteByName(siteName: string): Promise<SiteRecord | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('sites')
      .select('id, site_name, site_url, dashboard_uuid, sanity_project_id, sanity_dataset, created_at')
      .eq('site_name', siteName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned (site not found)
        return null;
      }
      throw error;
    }

    return data as SiteRecord;
  } catch (error) {
    console.error('[db] Error fetching site by name:', error);
    throw error;
  }
}

/**
 * Validate if site exists, or insert new site
 * Handles duplicate site_name gracefully by returning existing record
 */
export async function validateOrInsertSite(siteData: SiteData): Promise<RegistrationResult> {
  const supabase = getSupabaseClient();

  // Mock mode: Return mock UUIDs
  if (!supabase) {
    console.warn('[db] Supabase not configured, using mock mode');
    const mockUuids = generateMockUuids();
    return {
      success: true,
      siteId: mockUuids.siteId,
      dashboardUuid: mockUuids.dashboardUuid,
      mock: true,
      message: 'Site registered (mock mode - Supabase not configured)',
    };
  }

  try {
    // Check if site already exists
    const existing = await getSiteByName(siteData.siteName);
    if (existing) {
      return {
        success: true,
        siteId: existing.id,
        dashboardUuid: existing.dashboard_uuid,
        message: 'Site already registered',
      };
    }

    // Site doesn't exist, register it
    return await registerSite(siteData);
  } catch (error) {
    console.error('[db] validateOrInsertSite error:', error);
    throw error;
  }
}

/**
 * Create default dashboard settings for a site
 * Called after site registration
 */
export async function createDefaultSettings(siteId: string): Promise<void> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    // Mock mode: Skip settings creation
    return;
  }

  try {
    // Check if settings already exist
    const { data: existing } = await supabase
      .from('dashboard_settings')
      .select('id')
      .eq('site_id', siteId)
      .single();

    if (existing) {
      // Settings already exist, skip
      return;
    }

    // Insert default settings
    const { error } = await supabase.from('dashboard_settings').insert({
      site_id: siteId,
      // All defaults are set in schema, so we only need site_id
    });

    if (error) {
      console.error('[db] Error creating default dashboard settings:', error);
      // Don't throw - settings creation failure shouldn't break registration
    }
  } catch (error) {
    console.error('[db] createDefaultSettings error:', error);
    // Don't throw - settings creation failure shouldn't break registration
  }
}

