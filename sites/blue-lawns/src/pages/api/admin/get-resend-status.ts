import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { Resend } from 'resend';

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

  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ 
        configured: false,
        message: 'Resend API key not configured'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    
    // Try to get domains (this will fail if API key doesn't have permissions)
    // For now, we'll just verify the API key is valid by checking if we can create a client
    // Resend doesn't have a simple "verify" endpoint, so we'll return basic status
    
    return new Response(
      JSON.stringify({ 
        configured: true,
        message: 'Resend API key is configured',
        // Note: Domain verification status would require additional API calls
        // that may need specific permissions. For now, we'll just confirm the key exists.
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Resend status check error:', err);
    return new Response(
      JSON.stringify({ 
        configured: false,
        message: 'Error checking Resend status',
        error: err.message 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

