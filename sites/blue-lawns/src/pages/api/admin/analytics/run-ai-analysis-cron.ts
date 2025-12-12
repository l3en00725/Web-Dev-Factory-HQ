import type { APIRoute } from 'astro';
import { getEnv } from '../../../../lib/env-loader';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export const POST: APIRoute = async ({ request }) => {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = getEnv('CRON_SECRET') || getEnv('VERCEL_CRON_SECRET');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const openaiKey = getEnv('OPENAI_API_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!openaiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('[AI Analysis Cron] Starting weekly analysis...');

    // Fetch latest data for analysis
    const [settingsResult, lighthouseResult, leadsResult] = await Promise.all([
      supabase
        .from('website_settings')
        .select('settings')
        .eq('company_id', BLUE_LAWNS_COMPANY_ID)
        .single(),
      supabase
        .from('website_lighthouse_reports')
        .select('*')
        .eq('company_id', BLUE_LAWNS_COMPANY_ID)
        .order('created_at', { ascending: false })
        .limit(7),
      supabase
        .from('leads')
        .select('created_at, source, status')
        .eq('company_id', BLUE_LAWNS_COMPANY_ID)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const settings = settingsResult.data?.settings || {};
    const keywordCache = settings.keywordCache || { keywords: [], opportunities: [] };
    const lighthouseReports = lighthouseResult.data || [];
    const recentLeads = leadsResult.data || [];

    // Build context for AI
    const latestLighthouse = lighthouseReports[0];
    const keywordsWithVolume = (keywordCache.keywords || []).filter((k: any) => k.volume > 0);
    const opportunities = (keywordCache.opportunities || []).filter((k: any) => k.volume > 0);

    const prompt = `You are a helpful business consultant for Blue Lawns, a local landscaping company. You speak in plain English to a busy business owner, avoiding technical jargon.

Analyze the website data below and provide a concise update.

[DATA]

## Lighthouse Performance (Latest)
${latestLighthouse ? `
- Performance: ${latestLighthouse.performance_score}/100
- Accessibility: ${latestLighthouse.accessibility_score}/100
- Best Practices: ${latestLighthouse.best_practices_score}/100
- SEO: ${latestLighthouse.seo_score}/100
` : 'No Lighthouse data available'}

## Leads (Last 30 Days)
- Total leads: ${recentLeads.length}
- Sources: ${[...new Set(recentLeads.map((l: any) => l.source))].join(', ') || 'N/A'}

## Current Keywords (with search volume)
${keywordsWithVolume.slice(0, 10).map((k: any) => `- "${k.term}": ${k.volume} monthly searches, $${k.cpc} CPC, ${k.competition} competition`).join('\n') || 'No keyword data'}

## Keyword Opportunities (NOT currently on site)
${opportunities.slice(0, 15).map((k: any) => `- "${k.term}": ${k.volume} monthly searches, $${k.cpc} CPC, ${k.competition} competition, ${k.intent} intent`).join('\n') || 'No opportunities found'}

[STRICT OUTPUT RULES]
1. Main response must be under 120 words (excluding the Details section).
2. Use simple, plain English (no "optimizations", "leverage", "synergy").
3. No lists longer than 3 items.

[REQUIRED FORMAT]

<p class="mb-4"><strong>Summary:</strong> [One single sentence on overall health].</p>

<p class="mb-2"><strong>Top 3 Actions:</strong></p>
<ul class="list-none space-y-2 pl-0 mb-4">
  <li>1. <strong>[Action]</strong>: [Why it matters]. [How to fix it].</li>
  <li>2. <strong>[Action]</strong>: [Why it matters]. [How to fix it].</li>
  <li>3. <strong>[Action]</strong>: [Why it matters]. [How to fix it].</li>
</ul>

<details class="group">
<summary class="cursor-pointer text-indigo-600 font-semibold mt-4 hover:text-indigo-800 transition-colors list-none flex items-center gap-2">
  <span>See Technical Details & Reasoning</span>
</summary>
<div class="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 space-y-2">
  [Include specific data points, keyword metrics, and technical SEO reasoning here. This section can include the specific keyword opportunities and where to place them.]
</div>
</details>`;

    // Call OpenAI
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful business consultant for Blue Lawns.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || 'Analysis unavailable';

    // Store the analysis in Supabase
    const updatedSettings = {
      ...settings,
      aiAnalysis: {
        content: analysis,
        generated_at: new Date().toISOString(),
        type: 'weekly_cron',
        data_sources: {
          lighthouse: !!latestLighthouse,
          keywords: keywordsWithVolume.length,
          opportunities: opportunities.length,
          leads: recentLeads.length,
        },
      },
    };

    const { error: updateError } = await supabase
      .from('website_settings')
      .upsert({
        company_id: BLUE_LAWNS_COMPANY_ID,
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'company_id' });

    if (updateError) {
      console.error('[AI Analysis Cron] Failed to save analysis:', updateError);
    }

    console.log('[AI Analysis Cron] Weekly analysis complete');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Weekly AI analysis completed',
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI Analysis Cron] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to run AI analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET = POST;

