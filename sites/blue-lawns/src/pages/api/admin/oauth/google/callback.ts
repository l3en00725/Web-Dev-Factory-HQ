import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { 
  decodeState, 
  exchangeCodeForTokens, 
  getUserInfo 
} from '@virgo/shared-oauth';

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * OAuth Callback Route
 * Handles Google OAuth callback, exchanges code for tokens, stores in database
 * 
 * GET /api/admin/oauth/google/callback?code=xxx&state=xxx
 */
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return redirect('/admin/settings?oauth=error&message=supabase_not_configured', 302);
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
    return redirect('/admin/login?redirect=/api/admin/oauth/google/callback', 302);
  }

  // Get code and state from query parameters
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return redirect(`/admin/settings?oauth=error&message=${encodeURIComponent(error)}`, 302);
  }

  if (!code || !state) {
    return redirect('/admin/settings?oauth=error&message=missing_code_or_state', 302);
  }

  try {
    // Decode state to get company_id
    const stateData = decodeState(state);
    const companyId = stateData.companyId || BLUE_LAWNS_COMPANY_ID;

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get user info (email) from Google
    let userEmail: string | undefined;
    try {
      const userInfo = await getUserInfo(tokens.access_token);
      userEmail = userInfo.email;
    } catch (err) {
      console.warn('Failed to get user info:', err);
      // Continue without email - not critical
    }

    // Calculate token expiry
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + tokens.expires_in);

    // Store tokens in website_oauth_tokens table
    const { error: dbError } = await supabase
      .from('website_oauth_tokens')
      .upsert({
        company_id: companyId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokenExpiry.toISOString(),
        scopes: tokens.scope || '',
        connected_email: userEmail,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id,provider',
      });

    if (dbError) {
      console.error('Error storing tokens:', dbError);
      return redirect('/admin/settings?oauth=error&message=token_storage_failed', 302);
    }

    // Success! Redirect back to settings page
    return redirect('/admin/settings?oauth=success', 302);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return redirect(`/admin/settings?oauth=error&message=${encodeURIComponent(errorMessage)}`, 302);
  }
};

