import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { generateAuthUrl } from '../../../../../../packages/shared/oauth';

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * OAuth Connect Route
 * Generates Google OAuth authorization URL and redirects user to consent screen
 * 
 * GET /api/admin/oauth/google/connect
 */
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
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
    return redirect('/admin/login?redirect=/api/admin/oauth/google/connect', 302);
  }

  try {
    // Generate OAuth URL with company_id in state
    // connectionType is optional - Google OAuth will request both GA4 and Search Console scopes
    const authUrl = generateAuthUrl(BLUE_LAWNS_COMPANY_ID);

    // Redirect to Google OAuth consent screen
    return redirect(authUrl, 302);
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return redirect('/admin/settings?error=oauth_connect_failed', 302);
  }
};

