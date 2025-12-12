import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Get current GA4 Property and Search Console Site selection
 * 
 * GET /api/admin/analytics/get-selection
 */
export const GET: APIRoute = async ({ cookies }) => {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(key: string) { return cookies.get(key)?.value; },
      set(key: string, value: string, options: any) { cookies.set(key, value, options); },
      remove(key: string, options: any) { cookies.delete(key, options); },
    },
  });

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get OAuth token record with selected property/site
    const { data: tokenRecord, error } = await supabase
      .from('website_oauth_tokens')
      .select('ga4_property_id, gsc_site_url, connected_email')
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .eq('provider', 'google')
      .single();

    if (error || !tokenRecord) {
      return new Response(
        JSON.stringify({ 
          connected: false,
          ga4PropertyId: null,
          searchConsoleSiteUrl: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        connected: true,
        connectedEmail: tokenRecord.connected_email,
        ga4PropertyId: tokenRecord.ga4_property_id || null,
        searchConsoleSiteUrl: tokenRecord.gsc_site_url || null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting selection:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get selection',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
