import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from './lib/env-loader';

export const onRequest = defineMiddleware(async (context, next) => {
  // Only protect /admin routes (except /admin/login, /admin/forgot-password, /admin/reset-password)
  const publicAdminRoutes = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];
  if (context.url.pathname.startsWith('/admin') && 
      !publicAdminRoutes.includes(context.url.pathname)) {
    
    // Use env-loader which checks both process.env and import.meta.env
    const supabaseUrl = getEnv('SUPABASE_URL');
    const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      // If Supabase not configured, allow access but show warning
      console.warn('Supabase not configured. Admin routes are unprotected.');
      return next();
    }

    // Create Supabase client with cookie handling
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(key: string) {
          return context.cookies.get(key)?.value;
        },
        set(key: string, value: string, options: any) {
          context.cookies.set(key, value, options);
        },
        remove(key: string, options: any) {
          context.cookies.delete(key, options);
        },
      },
    });

    // Check for session
    const { data: { session } } = await supabase.auth.getSession();

    // If no session, redirect to login
    if (!session) {
      return context.redirect('/admin/login');
    }

    // Attach user to locals for API routes
    context.locals.user = session.user;
    context.locals.supabase = supabase;
  }

  return next();
});



