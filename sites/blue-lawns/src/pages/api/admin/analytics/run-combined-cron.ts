import type { APIRoute } from 'astro';
import { getEnv } from '../../../../lib/env-loader';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import { discoverKeywordOpportunities } from '../../../../lib/keywords-everywhere';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';
const TARGET_URL = 'https://www.bluelawns.com';

export const POST: APIRoute = async ({ request }) => {
  // Verify Cron Request
  const authHeader = request.headers.get('authorization');
  const cronSecret = getEnv('CRON_SECRET');
  
  // Vercel Cron sends auth header: Bearer [CRON_SECRET]
  const isValidAuth = 
    (authHeader === `Bearer ${cronSecret}`) || 
    (request.headers.get('x-vercel-cron') === 'true' && !cronSecret); // Dev fallback if no secret

  if (!isValidAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');
  const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  const openaiKey = getEnv('OPENAI_API_KEY');
  const psiApiKey = getEnv('PAGESPEED_INSIGHTS_API_KEY') || getEnv('GOOGLE_PAGESPEED_API_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey || !openaiKey) {
    return new Response(
      JSON.stringify({ error: 'Missing configuration' }),
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  const today = new Date();
  const dayOfWeek = today.getUTCDay(); // Sunday - 0, Monday - 1, etc.
  
  const results = {
    lighthouse: { ran: false, success: false, error: null as any },
    aiAnalysis: { ran: false, success: false, error: null as any }
  };

  // ==========================================
  // 1. RUN LIGHTHOUSE AUDIT (Daily)
  // ==========================================
  try {
    results.lighthouse.ran = true;
    console.log('[Combined Cron] Starting Lighthouse audit via PageSpeed API...');
    
    // Fetch Desktop scores
    const desktopData = await fetchPageSpeedData(TARGET_URL, 'DESKTOP', psiApiKey);
    const mobileData = await fetchPageSpeedData(TARGET_URL, 'MOBILE', psiApiKey);

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
      url: TARGET_URL,
      scores,
      mobileScores,
      timestamp: new Date().toISOString(),
      fullReport: {
        finalUrl: desktopData.lighthouseResult?.finalUrl || TARGET_URL,
        fetchTime: desktopData.lighthouseResult?.fetchTime || new Date().toISOString(),
      },
    };

    // Store in database
    await adminClient
      .from('website_lighthouse_reports')
      .insert({
        company_id: BLUE_LAWNS_COMPANY_ID,
        url: TARGET_URL,
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
      
    results.lighthouse.success = true;
    console.log('[Combined Cron] Lighthouse audit complete:', scores);
  } catch (error) {
    console.error('[Combined Cron] Lighthouse Error:', error);
    results.lighthouse.error = error instanceof Error ? error.message : String(error);
  }

  // ==========================================
  // 2. RUN AI ANALYSIS (Weekly - Monday)
  // ==========================================
  if (dayOfWeek === 1) { // Monday
    try {
      results.aiAnalysis.ran = true;
      console.log('[Combined Cron] Starting AI Analysis...');
      
      // 1. Fetch current data
      // Get latest lighthouse report (from just now)
      const { data: lhReport } = await supabase
        .from('website_lighthouse_reports')
        .select('*')
        .eq('company_id', BLUE_LAWNS_COMPANY_ID)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      // Get keyword cache
      const { data: settingsData } = await supabase
        .from('website_settings')
        .select('settings')
        .eq('company_id', BLUE_LAWNS_COMPANY_ID)
        .single();
        
      const keywordCache = settingsData?.settings?.keywordCache || {};
      const keywords = keywordCache.keywords || [];
      const opportunities = keywordCache.opportunities || [];
      
      // Build KPI Summary
      const kpiSummary = `
Lighthouse Scores:
- Performance: ${lhReport?.performance_score || 'N/A'}
- Accessibility: ${lhReport?.accessibility_score || 'N/A'}
- SEO: ${lhReport?.seo_score || 'N/A'}
- Best Practices: ${lhReport?.best_practices_score || 'N/A'}

Keyword Tracking:
- Tracked Keywords: ${keywords.length}
- Top Keyword: ${keywords[0]?.term || 'N/A'} (Vol: ${keywords[0]?.volume || 0})

Keyword Opportunities:
${opportunities.slice(0, 5).map((k: any) => `- ${k.term} (Vol: ${k.volume}, Diff: ${k.competition})`).join('\n')}
      `;
      
      // 2. Generate AI Analysis
      const openai = new OpenAI({ apiKey: openaiKey });
      
      const system = `You are a helpful business consultant for Blue Lawns, a local landscaping company. You speak in plain English to a busy business owner, avoiding technical jargon.`;
      
      const prompt = `Analyze the website data below and provide a concise update.

[DATA]
${kpiSummary}

[STRICT OUTPUT RULES]
1. Main response must be under 120 words (excluding the Details section).
2. Use simple, plain English (no "optimizations", "leverage", "synergy").
3. No lists longer than 3 items.
4. If you see Keyword Opportunities, suggest specifically WHERE to add them (e.g., "Add 'lawn aeration' to your Services page").

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
  [Include specific data points, keyword metrics, and technical SEO reasoning here. This section can be longer.]
</div>
</details>
`;

      const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: system },
            { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini",
      });

      const analysisContent = completion.choices[0].message.content;

      // 3. Store Analysis
      await adminClient
        .from('website_ai_analysis')
        .insert({
          company_id: BLUE_LAWNS_COMPANY_ID,
          content: analysisContent,
          created_at: new Date().toISOString(),
          metadata: { 
            lighthouse_id: lhReport?.id,
            keywords_count: keywords.length
          }
        });
        
      results.aiAnalysis.success = true;
      console.log('[Combined Cron] AI Analysis complete');

    } catch (error) {
      console.error('[Combined Cron] AI Analysis Error:', error);
      results.aiAnalysis.error = error instanceof Error ? error.message : String(error);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Combined cron job executed',
      results,
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

export const GET = POST;

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
