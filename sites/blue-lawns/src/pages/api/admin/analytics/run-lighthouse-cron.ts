import type { APIRoute } from 'astro';
import { getEnv } from '../../../../lib/env-loader';
import { createClient } from '@supabase/supabase-js';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';
const TARGET_URL = 'https://www.bluelawns.com';

/**
 * Cron Job: Run Lighthouse Audit Every 24 Hours
 * 
 * This endpoint is called automatically by Vercel Cron
 * No authentication required (protected by Vercel Cron secret)
 * 
 * POST /api/admin/analytics/run-lighthouse-cron
 */
export const POST: APIRoute = async ({ request }) => {
  // Verify this is coming from Vercel Cron (security)
  const authHeader = request.headers.get('authorization');
  const cronSecret = getEnv('CRON_SECRET') || getEnv('VERCEL_CRON_SECRET');
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Lighthouse Cron] Supabase not configured');
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('[Lighthouse Cron] Starting scheduled audit for:', TARGET_URL);

    // Launch Chrome
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    });

    try {
      // Run Lighthouse
      const options = {
        logLevel: 'info' as const,
        output: 'json' as const,
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port: chrome.port,
      };

      const runnerResult = await lighthouse(TARGET_URL, options);

      // Extract scores
      const categories = runnerResult?.lhr?.categories || {};
      const scores = {
        performance: Math.round((categories.performance?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
        seo: Math.round((categories.seo?.score || 0) * 100),
      };

      // Store in database
      const { error: dbError } = await supabase
        .from('website_lighthouse_reports')
        .insert({
          company_id: BLUE_LAWNS_COMPANY_ID,
          url: TARGET_URL,
          performance_score: scores.performance,
          accessibility_score: scores.accessibility,
          best_practices_score: scores.bestPractices,
          seo_score: scores.seo,
          report_data: runnerResult?.lhr ? {
            finalUrl: runnerResult.lhr.finalUrl,
            fetchTime: runnerResult.lhr.fetchTime,
          } : null,
          created_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('[Lighthouse Cron] Database error:', dbError);
        // Don't fail the cron job if DB write fails
      }

      console.log('[Lighthouse Cron] Audit complete:', scores);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Lighthouse audit completed',
          scores,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } finally {
      // Always kill Chrome
      await chrome.kill();
    }
  } catch (error) {
    console.error('[Lighthouse Cron] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to run Lighthouse audit',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Also allow GET for manual testing
export const GET = POST;
