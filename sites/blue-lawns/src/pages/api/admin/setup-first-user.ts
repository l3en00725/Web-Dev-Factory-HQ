import type { APIRoute } from 'astro';
import { getEnv } from '../../../../lib/env-loader';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

/**
 * One-time setup endpoint to create the first admin user
 * Call: POST /api/admin/setup-first-user
 * Body: { email: string, password: string }
 * 
 * SECURITY: This endpoint checks for a setup secret to prevent unauthorized use.
 * Set SETUP_SECRET in environment variables (can be anything, just needs to match).
 */
export const POST: APIRoute = async ({ request }) => {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const setupSecret = getEnv('SETUP_SECRET') || getEnv('VERCEL_CRON_SECRET');

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check if setup secret is provided
  const authHeader = request.headers.get('authorization');
  if (!setupSecret || !authHeader || authHeader !== `Bearer ${setupSecret}`) {
    return new Response(
      JSON.stringify({ 
        error: 'Unauthorized. Set SETUP_SECRET in environment variables and include it in Authorization header.',
        hint: 'curl -X POST https://your-site.com/api/admin/setup-first-user -H "Authorization: Bearer YOUR_SETUP_SECRET" -H "Content-Type: application/json" -d \'{"email":"your@email.com","password":"yourpassword"}\''
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if any users exist
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password, email_confirm: true }
      );

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'User already exists, password updated',
          user: {
            id: existingUser.id,
            email: existingUser.email,
          },
          loginUrl: '/admin/login'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm so user can login immediately
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully!',
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at,
        },
        loginUrl: '/admin/login',
        credentials: {
          email,
          password: '[HIDDEN - Use the password you provided]'
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create user',
        details: err.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

