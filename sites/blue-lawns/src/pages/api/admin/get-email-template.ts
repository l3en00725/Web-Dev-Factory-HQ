import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export const GET: APIRoute = async ({ request, cookies }) => {
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('settings')
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .single();

    if (error) {
      console.error('Error fetching email template:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch email template', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailTemplate = data?.settings?.emailTemplate || {
      subject: 'Thank you for contacting Blue Lawns',
      htmlBody: '<h1>Thank you for your inquiry!</h1><p>We have received your message and will get back to you soon.</p>'
    };

    return new Response(
      JSON.stringify({ emailTemplate }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

