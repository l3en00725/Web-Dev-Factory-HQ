import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { generateAuthUrl } from '@virgo/shared-oauth';
import { getEnv } from '../../../../../lib/env-loader';

// Prevent static prerendering
export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001'; // Fallback

/**
 * OAuth Connect Route
 * Generates Google OAuth authorization URL and redirects user to consent screen
 * 
 * GET /api/admin/oauth/google/connect?company_id=xxx (optional)
 */
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
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
    return redirect('/admin/login?redirect=/api/admin/oauth/google/connect', 302);
  }

  // Get company_id from query param or use fallback
  const url = new URL(request.url);
  const companyId = url.searchParams.get('company_id') || BLUE_LAWNS_COMPANY_ID;

  try {
    // Generate OAuth URL with company_id in state
    // Google OAuth will request both GA4 and Search Console scopes
    const authUrl = generateAuthUrl(companyId);

    // Redirect to Google OAuth consent screen
    return redirect(authUrl, 302);
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return redirect('/admin/settings?oauth=error&message=connect_failed', 302);
  }
};

