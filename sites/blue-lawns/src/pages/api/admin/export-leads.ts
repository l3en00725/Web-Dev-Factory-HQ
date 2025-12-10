import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

// Hardcoded Blue Lawns company_id for MVP
const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export const GET: APIRoute = async ({ request, cookies }) => {
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

  // Get all leads
  const { data: leads, error } = await supabase
    .from('website_leads')
    .select('*')
    .eq('company_id', BLUE_LAWNS_COMPANY_ID)
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Convert to CSV
  const headers = ['Name', 'Email', 'Phone', 'Address', 'Message', 'Reviewed', 'Created At'];
  const rows = (leads || []).map(lead => [
    lead.name || '',
    lead.email || '',
    lead.phone || '',
    lead.address || '',
    (lead.message || '').replace(/"/g, '""'), // Escape quotes
    lead.reviewed ? 'Yes' : 'No',
    new Date(lead.created_at).toLocaleString(),
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="blue-lawns-leads-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
};

