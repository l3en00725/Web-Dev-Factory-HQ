import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

export const prerender = false;

/**
 * Request password reset email
 * POST /api/admin/forgot-password
 * Body: { email: string }
 */
export const POST: APIRoute = async ({ request, cookies }) => {
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

  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get site URL from request origin (works for multiple sites sharing the same database)
    // This ensures each site redirects to its own domain
    const requestOrigin = request.headers.get('origin') || request.headers.get('referer');
    let siteUrl = import.meta.env.PUBLIC_SITE_URL;
    
    // If we have an origin/referer, use that (for multi-site support)
    if (requestOrigin) {
      try {
        const url = new URL(requestOrigin);
        siteUrl = `${url.protocol}//${url.host}`;
      } catch (e) {
        // Fallback to env var if origin parsing fails
        console.warn('[Forgot Password] Failed to parse origin, using env var');
      }
    }
    
    // Fallback to hardcoded URL if nothing else works (backwards compatibility)
    if (!siteUrl) {
      siteUrl = 'https://www.bluelawns.com';
    }
    
    // Request password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/admin/reset-password`,
    });

    if (error) {
      console.error('[Forgot Password] Error:', error);
      // Don't reveal if email exists or not (security best practice)
      // Always return success to prevent email enumeration
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'If an account exists with that email, a password reset link has been sent.'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Forgot Password] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send reset email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

