import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { Resend } from 'resend';

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
  if (!session || !session.user?.email) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Resend API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
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

    const resend = new Resend(RESEND_API_KEY);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Blue Lawns Website <no-reply@bluelawns.com>',
      to: session.user.email,
      subject: `[TEST] ${subject}`,
      html: htmlBody,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send test email', details: emailError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test email sent successfully',
        emailId: emailData?.id 
      }),
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

