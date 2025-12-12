/**
 * Debug Env Endpoint
 * 
 * Returns which environment variables are loaded (keys only, not values).
 * Used to verify env loading is working correctly.
 * 
 * GET /api/debug-env
 */

import type { APIRoute } from 'astro';
import { getEnv, getLoadedEnvKeys } from '../../lib/env-loader';

// Prevent static prerendering - this MUST be a server function
export const prerender = false;

export const GET: APIRoute = async () => {
  console.log('[DEBUG-ENV] Endpoint called');

  // Critical env vars to check
  const criticalVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'GOOGLE_OAUTH_REDIRECT_URI',
    'RESEND_API_KEY',
    'SANITY_PROJECT_ID',
    'SANITY_DATASET',
  ];

  const envStatus: Record<string, { set: boolean; source: string }> = {};

  for (const key of criticalVars) {
    const processValue = process.env[key];
    const metaValue = (import.meta.env as Record<string, string>)[key];
    
    let source = 'NOT_SET';
    if (processValue) {
      source = 'process.env';
    } else if (metaValue) {
      source = 'import.meta.env';
    }

    envStatus[key] = {
      set: !!(processValue || metaValue),
      source,
    };
  }

  // Count total loaded
  const allKeys = getLoadedEnvKeys();
  const setCount = Object.values(envStatus).filter(v => v.set).length;

  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'unknown',
    totalEnvVars: allKeys.length,
    criticalVars: {
      total: criticalVars.length,
      set: setCount,
      missing: criticalVars.length - setCount,
    },
    status: envStatus,
    // Show which keys are loaded (not values)
    loadedKeys: allKeys.filter(k => 
      k.startsWith('SUPABASE') || 
      k.startsWith('GOOGLE') || 
      k.startsWith('SANITY') ||
      k.startsWith('RESEND')
    ),
  };

  console.log('[DEBUG-ENV] Response:', JSON.stringify(response, null, 2));

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
