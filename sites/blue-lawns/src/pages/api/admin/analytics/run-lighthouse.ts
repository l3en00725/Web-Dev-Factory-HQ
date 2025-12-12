import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';
const TARGET_URL = 'https://www.bluelawns.com';

/**
 * Run Lighthouse Audit using Google PageSpeed Insights API
 * 
 * POST /api/admin/analytics/run-lighthouse
 * Optional body: { url?: string }
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');
  const apiKey = getEnv('PAGESPEED_INSIGHTS_API_KEY') || getEnv('GOOGLE_PAGESPEED_API_KEY'); // Check both names just in case

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(key: string) { return cookies.get(key)?.value; },
      set(key: string, value: string, options: any) { cookies.set(key, value, options); },
      remove(key: string, options: any) { cookies.delete(key, options); },
    },
  });

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get URL from request body or use default
    const body = await request.json().catch(() => ({}));
    const url = body.url || TARGET_URL;

    console.log('[Lighthouse] Starting audit for:', url);

    // Fetch Desktop scores
    const desktopData = await fetchPageSpeedData(url, 'DESKTOP', apiKey);
    
    // Fetch Mobile scores (optional - but good to have)
    const mobileData = await fetchPageSpeedData(url, 'MOBILE', apiKey);

    // Use desktop scores for the main display (matching previous behavior)
    // but we can store mobile too if needed
    const scores = {
      performance: Math.round((desktopData.lighthouseResult?.categories?.performance?.score || 0) * 100),
      accessibility: Math.round((desktopData.lighthouseResult?.categories?.accessibility?.score || 0) * 100),
      bestPractices: Math.round((desktopData.lighthouseResult?.categories?.['best-practices']?.score || 0) * 100),
      seo: Math.round((desktopData.lighthouseResult?.categories?.seo?.score || 0) * 100),
    };

    const mobileScores = {
       performance: Math.round((mobileData.lighthouseResult?.categories?.performance?.score || 0) * 100),
       accessibility: Math.round((mobileData.lighthouseResult?.categories?.accessibility?.score || 0) * 100),
       bestPractices: Math.round((mobileData.lighthouseResult?.categories?.['best-practices']?.score || 0) * 100),
       seo: Math.round((mobileData.lighthouseResult?.categories?.seo?.score || 0) * 100),
    };

    const reportData = {
      url,
      scores,
      mobileScores, // Sending back mobile scores too
      timestamp: new Date().toISOString(),
      fullReport: {
        finalUrl: desktopData.lighthouseResult?.finalUrl || url,
        fetchTime: desktopData.lighthouseResult?.fetchTime || new Date().toISOString(),
      },
    };

    // Store in database
    try {
      await supabase
        .from('website_lighthouse_reports')
        .insert({
          company_id: BLUE_LAWNS_COMPANY_ID,
          url,
          performance_score: scores.performance,
          accessibility_score: scores.accessibility,
          best_practices_score: scores.bestPractices,
          seo_score: scores.seo,
          report_data: { 
             ...reportData.fullReport,
             mobileScores 
          },
          created_at: new Date().toISOString(),
        });
    } catch (dbError) {
      console.warn('[Lighthouse] Could not store in database:', dbError);
    }

    console.log('[Lighthouse] Audit complete:', scores);

    return new Response(
      JSON.stringify({
        success: true,
        data: reportData,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Lighthouse] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to run Lighthouse audit',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

async function fetchPageSpeedData(url: string, strategy: 'DESKTOP' | 'MOBILE', apiKey?: string) {
  let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO`;
  
  if (apiKey) {
    apiUrl += `&key=${apiKey}`;
  }

  const response = await fetch(apiUrl);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PageSpeed API failed (${response.status}): ${errorText}`);
  }
  
  return await response.json();
}

