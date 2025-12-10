import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
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

  await supabase.auth.signOut();

  return redirect('/admin/login');
};

