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

  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return redirect('/admin/login?error=missing_fields');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    return redirect('/admin');
  }

  return redirect('/admin/login?error=authentication_failed');
};

