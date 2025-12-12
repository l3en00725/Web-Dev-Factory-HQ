import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

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
    const { data: settingsData } = await supabase
      .from('website_settings')
      .select('settings')
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .single();

    const aiAnalysis = settingsData?.settings?.aiAnalysis;

    if (!aiAnalysis) {
      return new Response(
        JSON.stringify({ success: true, analysis: null }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: aiAnalysis,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Get Cached Analysis] Error:', error);
    return new Response(
      JSON.stringify({ success: true, analysis: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

