import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

// Hardcoded Blue Lawns company_id for MVP
const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase config check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseAnonKey?.length || 0,
    });
    return new Response(JSON.stringify({ 
      error: 'Supabase not configured. Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file.',
      debug: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      }
    }), {
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

  // Get query parameters
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const status = url.searchParams.get('status') || 'all'; // 'all', 'new', 'reviewed'
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('website_leads')
    .select('*', { count: 'exact' })
    .eq('company_id', BLUE_LAWNS_COMPANY_ID)
    .order('created_at', { ascending: false });

  // Filter by reviewed status
  if (status === 'new') {
    query = query.eq('reviewed', false);
  } else if (status === 'reviewed') {
    query = query.eq('reviewed', true);
  }

  // Get total count and paginated results
  const { data: leads, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const total = count || 0;
  const pages = Math.ceil(total / limit);

  return new Response(JSON.stringify({
    leads: leads || [],
    total,
    page,
    limit,
    pages,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

