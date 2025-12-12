import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { revokeToken } from '@virgo/shared-oauth';
import { getEnv } from '../../../../../lib/env-loader';

// Prevent static prerendering
export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001'; // Fallback

/**
 * OAuth Disconnect Route
 * Revokes OAuth token and deletes from database
 * 
 * POST /api/admin/oauth/google/disconnect
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

  // Get company_id from query param or use fallback
  // TODO: In future, get company_id from session user metadata
  const url = new URL(request.url);
  const companyId = url.searchParams.get('company_id') || BLUE_LAWNS_COMPANY_ID;

  try {
    // Get current token from database
    const { data: token, error: fetchError } = await supabase
      .from('website_oauth_tokens')
      .select('*')
      .eq('company_id', companyId)
      .eq('provider', 'google')
      .single();

    if (fetchError || !token) {
      return new Response(
        JSON.stringify({ error: 'No OAuth connection found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Revoke token with Google
    try {
      await revokeToken(token.access_token);
    } catch (revokeError) {
      // Log but continue - token might already be revoked
      console.warn('Token revocation warning:', revokeError);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('website_oauth_tokens')
      .delete()
      .eq('company_id', companyId)
      .eq('provider', 'google');

    if (deleteError) {
      console.error('Error deleting token:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to disconnect', details: deleteError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Disconnected successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Disconnect error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to disconnect', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

