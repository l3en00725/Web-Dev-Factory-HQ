import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { subject, htmlBody } = body;

    if (!subject || !htmlBody) {
      return new Response(
        JSON.stringify({ error: 'Subject and HTML body are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get current settings
    const { data: currentData } = await supabase
      .from('website_settings')
      .select('settings')
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .single();

    const currentSettings = currentData?.settings || {};
    const updatedSettings = {
      ...currentSettings,
      emailTemplate: {
        subject,
        htmlBody,
        updatedAt: new Date().toISOString(),
      }
    };

    const { data, error } = await supabase
      .from('website_settings')
      .upsert({
        company_id: BLUE_LAWNS_COMPANY_ID,
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating email template:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update email template', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailTemplate: data.settings.emailTemplate }),
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



