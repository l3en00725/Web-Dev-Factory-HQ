import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { isTokenExpired } from '../../../../../../packages/shared/oauth';

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * OAuth Status Route
 * Returns connection status for current company
 * 
 * GET /api/admin/oauth/google/status
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(key: string) {
        return cookies.get(key)?.value;
      },
      set(key: string, value: string, options: any) {
        cookies.set(key, value, options);
      },
      remove(key: string, options: any) {
        cookies.delete(key, options);
      },
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
    // Get OAuth token from database
    const { data: token, error } = await supabase
      .from('website_oauth_tokens')
      .select('*')
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .eq('provider', 'google')
      .single();

    if (error || !token) {
      // No connection found
      return new Response(
        JSON.stringify({
          connected: false,
          provider: 'google',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if token is expired
    const tokenExpiry = new Date(token.token_expiry);
    const needsRefresh = isTokenExpired(tokenExpiry);

    return new Response(
      JSON.stringify({
        connected: true,
        provider: 'google',
        email: token.connected_email || null,
        connectedAt: token.connected_at,
        expiresAt: token.token_expiry,
        needsRefresh,
        scopes: token.scopes || '',
        ga4PropertyId: token.ga4_property_id || null,
        ga4MeasurementId: token.ga4_measurement_id || null,
        gscSiteUrl: token.gsc_site_url || null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Status check error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to check status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

