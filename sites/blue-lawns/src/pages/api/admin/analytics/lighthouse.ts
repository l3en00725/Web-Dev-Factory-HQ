import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Get Latest Lighthouse Results
 * 
 * GET /api/admin/analytics/lighthouse
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
    // Get latest Lighthouse report from database
    const { data: report, error } = await supabase
      .from('website_lighthouse_reports')
      .select('*')
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !report) {
      // No reports yet - return empty
      return new Response(
        JSON.stringify({
          success: true,
          data: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          url: report.url,
          scores: {
            performance: report.performance_score,
            accessibility: report.accessibility_score,
            bestPractices: report.best_practices_score,
            seo: report.seo_score,
          },
          timestamp: report.created_at,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Lighthouse] Error fetching results:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch Lighthouse results',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
