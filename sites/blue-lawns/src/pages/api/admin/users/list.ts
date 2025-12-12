import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * List all users with access to this dashboard
 * GET /api/admin/users/list
 */
export const GET: APIRoute = async ({ cookies }) => {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Auth check
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
    if (!supabaseServiceKey) {
      // Return just the current user if no service key
      return new Response(
        JSON.stringify({
          success: true,
          users: [{
            id: session.user.id,
            email: session.user.email,
            role: 'admin',
            created_at: session.user.created_at,
            last_sign_in: session.user.last_sign_in_at,
            is_current: true,
          }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { createClient } = await import('@supabase/supabase-js');
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users (for now, we show all users - in production you'd filter by company_id)
    const { data: { users }, error } = await adminClient.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    // Filter to users with this company_id in metadata, or all users for now
    const companyUsers = (users || [])
      .filter(user => {
        const metadata = user.user_metadata || {};
        // Include if no company_id set (legacy) or matches our company
        return !metadata.company_id || metadata.company_id === BLUE_LAWNS_COMPANY_ID;
      })
      .map(user => ({
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'admin',
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
        invited_by: user.user_metadata?.invited_by,
        is_current: user.id === session.user.id,
      }));

    return new Response(
      JSON.stringify({
        success: true,
        users: companyUsers,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Users List] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to list users',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

