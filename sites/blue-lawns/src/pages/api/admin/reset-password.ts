import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

export const prerender = false;

/**
 * Reset password with token from email
 * POST /api/admin/reset-password
 * Body: { token: string, password: string }
 */
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

  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for session (created by Supabase when user clicks the email link)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    // If no session exists, the user needs to visit the link from the email first
    // The token in the email link will create a session automatically
    if (sessionError || !sessionData?.session) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired reset token. Please request a new password reset link.',
          hint: 'Make sure you clicked the link from your email. The link must be opened in the same browser.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update password using the current session
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      console.error('[Reset Password] Error:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message || 'Failed to reset password' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password reset successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Reset Password] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to reset password' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

