import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';
const TARGET_URL = 'https://www.bluelawns.com';

/**
 * Run Lighthouse Audit
 * 
 * POST /api/admin/analytics/run-lighthouse
 * Optional body: { url?: string }
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

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

      const runnerResult = await lighthouse(url, options);

      // Extract scores
      const categories = runnerResult?.lhr?.categories || {};
      const scores = {
        performance: Math.round((categories.performance?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
        seo: Math.round((categories.seo?.score || 0) * 100),
      };

      const reportData = {
        url,
        scores,
        timestamp: new Date().toISOString(),
        fullReport: runnerResult?.lhr ? {
          finalUrl: runnerResult.lhr.finalUrl,
          fetchTime: runnerResult.lhr.fetchTime,
        } : null,
      };

      // Store in database (optional - for history)
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
            report_data: reportData.fullReport,
            created_at: new Date().toISOString(),
          });
      } catch (dbError) {
        // Table might not exist yet - that's okay, just log it
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
    } finally {
      // Always kill Chrome
      await chrome.kill();
    }
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
