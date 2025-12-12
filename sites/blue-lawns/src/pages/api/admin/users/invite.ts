import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Invite a user to the admin dashboard
 * POST /api/admin/users/invite
 * Body: { email: string, role?: 'admin' | 'viewer' }
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Auth check with user's session
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(key: string) { return cookies.get(key)?.value; },
      set(key: string, value: string, options: any) { cookies.set(key, value, options); },
      remove(key: string, options: any) { cookies.delete(key, options); },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { email, role = 'viewer' } = body;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for admin operations
    if (!supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Service role key not configured - cannot send invites' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { createClient } = await import('@supabase/supabase-js');
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get site URL for redirect
    const siteUrl = getEnv('PUBLIC_SITE_URL') || 'https://www.bluelawns.com';

    // Send invite email via Supabase Auth
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/admin/login?invited=true`,
      data: {
        company_id: BLUE_LAWNS_COMPANY_ID,
        role: role,
        invited_by: session.user.email,
        invited_at: new Date().toISOString(),
      },
    });

    if (error) {
      console.error('[User Invite] Supabase error:', error);
      
      // Check for common errors
      if (error.message?.includes('already registered')) {
        return new Response(
          JSON.stringify({ error: 'This email is already registered' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: error.message || 'Failed to send invite' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[User Invite] Invite sent to:', email);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invite sent to ${email}`,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[User Invite] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to send invite',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

