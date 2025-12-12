import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Save GA4 Property and Search Console Site selection
 * 
 * POST /api/admin/analytics/save-selection
 * Body: { ga4PropertyId?: string, searchConsoleSiteUrl?: string }
 */
export const POST: APIRoute = async ({ request, cookies }) => {
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
    const body = await request.json();
    const { ga4PropertyId, searchConsoleSiteUrl } = body;

    // Update the OAuth token record with the selected property/site
    const { error: updateError } = await supabase
      .from('website_oauth_tokens')
      .update({
        ga4_property_id: ga4PropertyId || null,
        gsc_site_url: searchConsoleSiteUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .eq('provider', 'google');

    if (updateError) {
      console.error('Error saving selection:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save selection', details: updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analytics selection saved',
        ga4PropertyId,
        searchConsoleSiteUrl,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving selection:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to save selection',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
