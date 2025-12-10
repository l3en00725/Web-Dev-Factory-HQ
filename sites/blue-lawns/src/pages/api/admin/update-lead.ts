import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

// Hardcoded Blue Lawns company_id for MVP
const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create Supabase client with cookie handling
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
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { id, reviewed } = body;

  if (!id || typeof reviewed !== 'boolean') {
    return new Response(JSON.stringify({ error: 'Missing id or reviewed status' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update lead
  const { data, error } = await supabase
    .from('website_leads')
    .update({ reviewed })
    .eq('id', id)
    .eq('company_id', BLUE_LAWNS_COMPANY_ID)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, lead: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

