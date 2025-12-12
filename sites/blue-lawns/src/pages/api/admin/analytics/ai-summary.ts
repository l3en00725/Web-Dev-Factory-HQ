import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Generate AI KPI Summary
 * 
 * POST /api/admin/analytics/ai-summary
 * Body: { ga4Data?, searchConsoleData?, lighthouseData? }
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

  const openaiKey = getEnv('OPENAI_API_KEY');
  if (!openaiKey) {
    console.error('[AI Summary] OpenAI API key not configured');
    return new Response(
      JSON.stringify({ 
        error: 'OpenAI API key not configured',
        details: 'Please add OPENAI_API_KEY to your .env file',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { ga4Data, searchConsoleData, lighthouseData } = body;

    // Fetch keyword data from Supabase
    let keywordData = { keywords: [], opportunities: [] };
    try {
      const { data: settingsData } = await supabase
        .from('website_settings')
        .select('settings')
        .eq('company_id', BLUE_LAWNS_COMPANY_ID)
        .single();
      
      if (settingsData?.settings?.keywordCache) {
        keywordData = settingsData.settings.keywordCache;
      }
    } catch (e) {
      console.log('[AI Summary] Could not fetch keyword data:', e);
    }

    // Check for broken links on key pages
    let brokenLinksData = null;
    try {
      brokenLinksData = await checkBrokenLinks();
    } catch (e) {
      console.log('[AI Summary] Could not check broken links:', e);
    }

    // Build KPI summary text
    const kpiSummary = buildKPISummary(ga4Data, searchConsoleData, lighthouseData, keywordData, brokenLinksData);

    if (!kpiSummary || kpiSummary.trim().length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No KPI data provided',
          details: 'Please ensure GA4, Search Console, or Lighthouse data is available',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[AI Summary] Generating analysis with KPIs:', {
      hasGA4: !!ga4Data,
      hasSearchConsole: !!searchConsoleData,
      hasLighthouse: !!lighthouseData,
      keywordsCount: keywordData.keywords?.length || 0,
      opportunitiesCount: keywordData.opportunities?.length || 0,
      brokenLinksCount: brokenLinksData?.brokenLinks?.length || 0,
    });

    // Generate AI analysis
    console.log('[AI Summary] Calling OpenAI API...');
    const system = `You are a helpful business consultant for Blue Lawns, a local landscaping company. You speak in plain English to a busy business owner, avoiding technical jargon.`;
    
    const hasBrokenLinks = brokenLinksData?.brokenLinks && brokenLinksData.brokenLinks.length > 0;
    const brokenLinksWarning = hasBrokenLinks 
      ? `\n\n⚠️ CRITICAL: Broken links were detected. These MUST be listed as the #1 priority action. Use red/warning styling: <span style="color: #dc2626; font-weight: 600;">[text]</span> for any mention of broken links.`
      : '';
    
    const prompt = `Analyze the website data below and provide a concise update.

[DATA]
${kpiSummary}

[STRICT OUTPUT RULES]
1. Main response must be under 120 words (excluding the Details section).
2. Use simple, plain English (no "optimizations", "leverage", "synergy").
3. No lists longer than 3 items.
4.${hasBrokenLinks ? ' BROKEN LINKS MUST BE ACTION #1. Highlight in red.' : ' If no broken links, mention this as a positive.'}

[REQUIRED FORMAT]

<p class="mb-4"><strong>Summary:</strong> [One single sentence on overall health${hasBrokenLinks ? '. If broken links exist, mention them prominently' : ''}].</p>

<p class="mb-2"><strong>Top 3 Actions:</strong></p>
<ul class="list-none space-y-2 pl-0 mb-4">
  <li>1.${hasBrokenLinks ? ' <strong style="color: #dc2626;">[FIX BROKEN LINKS]</strong>' : ' <strong>[Action]</strong>'}: [Why it matters]. [How to fix it].</li>
  <li>2. <strong>[Action]</strong>: [Why it matters]. [How to fix it].</li>
  <li>3. <strong>[Action]</strong>: [Why it matters]. [How to fix it].</li>
</ul>

<details class="group">
<summary class="cursor-pointer text-indigo-600 font-semibold mt-4 hover:text-indigo-800 transition-colors list-none flex items-center gap-2">
  <span>See Technical Details & Reasoning</span>
</summary>
<div class="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-600 space-y-2">
  [Include specific data points, keyword metrics, and technical SEO reasoning here. This section can include the specific keyword opportunities and where to place them.${hasBrokenLinks ? ' List all broken links with their page locations.' : ''}]
</div>
</details>${brokenLinksWarning}`;

    // NOTE: We call OpenAI directly because the ai/@ai-sdk/openai wrapper intermittently
    // returns an empty text response in this project (with NaN usage).
    const preferredModel = 'gpt-4o';
    const fallbackModel = 'gpt-4o-mini';
    const { text, meta } = await callOpenAIChatWithFallback({
      apiKey: openaiKey,
      preferredModel,
      fallbackModel,
      system,
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
      timeoutMs: 60_000,
    });

    console.log('[AI Summary] OpenAI response received:', meta);

    console.log('[AI Summary] Successfully generated summary');

    // Save to cache for persistence
    try {
      const { data: currentData } = await supabase
        .from('website_settings')
        .select('settings')
        .eq('company_id', BLUE_LAWNS_COMPANY_ID)
        .single();

      const currentSettings = currentData?.settings || {};
      const updatedSettings = {
        ...currentSettings,
        aiAnalysis: {
          content: text,
          generated_at: new Date().toISOString(),
          type: 'manual',
        },
      };

      await supabase
        .from('website_settings')
        .upsert({
          company_id: BLUE_LAWNS_COMPANY_ID,
          settings: updatedSettings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'company_id' });
    } catch (e) {
      console.log('[AI Summary] Could not cache analysis:', e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: text,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI Summary] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Check for specific OpenAI errors
    if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return new Response(
        JSON.stringify({
          error: 'OpenAI API authentication failed',
          details: 'Please check your OPENAI_API_KEY in .env file',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to generate AI summary',
        details: errorMessage,
        ...(errorStack && { stack: errorStack }),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Check for broken links on key pages
 * Returns null if check fails (non-blocking)
 */
async function checkBrokenLinks(): Promise<{ brokenLinks: Array<{ page: string; links: Array<{ url: string; status: number; text?: string }> }> } | null> {
  try {
    const siteUrl = getEnv('SITE_URL') || 'https://www.bluelawns.com';
    const keyPages = [
      '/',
      '/services',
      '/locations',
      '/contact',
      '/services/landscape-maintenance',
      '/locations/ocean-view',
    ];

    const brokenLinks: Array<{ page: string; links: Array<{ url: string; status: number; text?: string }> }> = [];
    const checkedUrls = new Set<string>(); // Avoid checking same URL multiple times

    for (const pagePath of keyPages) {
      try {
        const pageUrl = `${siteUrl}${pagePath}`;
        
        // Fetch full HTML to parse links
        const htmlResponse = await fetch(pageUrl, {
          headers: { 'User-Agent': 'Blue-Lawns-Link-Checker/1.0' },
          signal: AbortSignal.timeout(10000),
        });

        if (!htmlResponse.ok) {
          continue; // Skip if page itself doesn't load
        }

        const html = await htmlResponse.text();

        // Simple regex to extract links (avoiding cheerio dependency)
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
        const pageBrokenLinks: Array<{ url: string; status: number; text?: string }> = [];
        let match;
        let linkCount = 0;
        const maxLinksPerPage = 50; // Limit to avoid performance issues

        while ((match = linkRegex.exec(html)) !== null && linkCount < maxLinksPerPage) {
          linkCount++;
          const href = match[1];
          const linkText = match[2]?.replace(/<[^>]+>/g, '').trim().substring(0, 50) || undefined;

          // Skip anchors, javascript, mailto, tel
          if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            continue;
          }

          // Resolve relative URLs
          let absoluteUrl: string;
          if (href.startsWith('http://') || href.startsWith('https://')) {
            absoluteUrl = href;
          } else if (href.startsWith('/')) {
            absoluteUrl = `${siteUrl}${href}`;
          } else {
            // Relative path
            const basePath = pagePath.endsWith('/') ? pagePath.slice(0, -1) : pagePath.split('/').slice(0, -1).join('/') || '';
            absoluteUrl = `${siteUrl}${basePath}/${href}`;
          }

          // Skip if already checked
          if (checkedUrls.has(absoluteUrl)) {
            continue;
          }
          checkedUrls.add(absoluteUrl);

          // Check if link is valid
          try {
            const linkResponse = await fetch(absoluteUrl, {
              method: 'HEAD',
              headers: { 'User-Agent': 'Blue-Lawns-Link-Checker/1.0' },
              signal: AbortSignal.timeout(5000),
            });

            if (!linkResponse.ok && linkResponse.status !== 403) { // 403 might be intentional blocking
              pageBrokenLinks.push({
                url: absoluteUrl,
                status: linkResponse.status,
                text: linkText,
              });
            }
          } catch (linkError) {
            // Network error or timeout = broken link
            pageBrokenLinks.push({
              url: absoluteUrl,
              status: 0, // 0 = network error/timeout
              text: linkText,
            });
          }
        }

        if (pageBrokenLinks.length > 0) {
          brokenLinks.push({
            page: pagePath,
            links: pageBrokenLinks,
          });
        }
      } catch (pageError) {
        console.log(`[AI Summary] Could not check page ${pagePath}:`, pageError);
        // Continue to next page
      }
    }

    return brokenLinks.length > 0 ? { brokenLinks } : { brokenLinks: [] };
  } catch (error) {
    console.log('[AI Summary] Broken link check failed:', error);
    return null;
  }
}

function buildKPISummary(
  ga4Data: any,
  searchConsoleData: any,
  lighthouseData: any,
  keywordData?: { keywords?: any[]; opportunities?: any[] },
  brokenLinksData?: { brokenLinks: Array<{ page: string; links: Array<{ url: string; status: number; text?: string }> }> } | null
): string {
  const parts: string[] = [];

  // Add broken links section FIRST (most critical)
  if (brokenLinksData?.brokenLinks && brokenLinksData.brokenLinks.length > 0) {
    const totalBroken = brokenLinksData.brokenLinks.reduce((sum, page) => sum + page.links.length, 0);
    parts.push(`## ⚠️ BROKEN LINKS DETECTED (CRITICAL ISSUE)
- Total broken links found: ${totalBroken}
- Pages affected: ${brokenLinksData.brokenLinks.length}

${brokenLinksData.brokenLinks.map(page => {
  return `Page: ${page.page}
  Broken links (${page.links.length}):
${page.links.map(link => `  - "${link.text || link.url}" → ${link.url} (Status: ${link.status})`).join('\n')}`;
}).join('\n\n')}

⚠️ ACTION REQUIRED: Broken links hurt SEO and user experience. Fix these immediately.`);
  } else if (brokenLinksData) {
    parts.push(`## ✅ Link Health
- No broken links detected on checked pages`);
  }

  if (ga4Data) {
    parts.push(`## Google Analytics (GA4)
- Sessions: ${ga4Data.sessions || 0}
- Users: ${ga4Data.users || 0}
- Pageviews: ${ga4Data.pageviews || 0}
- New Users: ${ga4Data.newUsers || 0}
- Bounce Rate: ${ga4Data.bounceRate?.toFixed(1) || 0}%
- Avg Session Duration: ${formatDuration(ga4Data.avgSessionDuration || 0)}`);
  }

  if (searchConsoleData?.overview) {
    const ov = searchConsoleData.overview;
    parts.push(`## Search Console
- Total Clicks: ${ov.clicks || 0}
- Total Impressions: ${ov.impressions || 0}
- Average CTR: ${ov.ctr?.toFixed(2) || 0}%
- Average Position: ${ov.position?.toFixed(1) || 0}`);

    if (searchConsoleData.topQueries?.length > 0) {
      parts.push(`\nTop Search Queries:`);
      searchConsoleData.topQueries.slice(0, 5).forEach((q: any, i: number) => {
        parts.push(`${i + 1}. "${q.query}" - ${q.clicks} clicks, ${q.impressions} impressions, position ${q.position?.toFixed(1)}`);
      });
    }
  }

  if (lighthouseData?.scores) {
    const scores = lighthouseData.scores;
    parts.push(`## Lighthouse Performance
- Performance: ${scores.performance || 0}/100
- Accessibility: ${scores.accessibility || 0}/100
- Best Practices: ${scores.bestPractices || 0}/100
- SEO: ${scores.seo || 0}/100`);
  }

  // Add keyword data
  if (keywordData) {
    const keywordsWithVolume = (keywordData.keywords || []).filter((k: any) => k.volume > 0);
    const opportunities = (keywordData.opportunities || []).filter((k: any) => k.volume > 0);

    if (keywordsWithVolume.length > 0) {
      parts.push(`## Current Keywords (already on site)
${keywordsWithVolume.slice(0, 10).map((k: any) => {
  const cpc = typeof k.cpc === 'number' ? k.cpc.toFixed(2) : '0.00';
  return `- "${k.term || 'unknown'}": ${k.volume || 0} monthly searches, $${cpc} CPC, ${k.competition || 'medium'} competition`;
}).join('\n')}`);
    }

    if (opportunities.length > 0) {
      parts.push(`## Keyword Opportunities (NOT on site yet - need content)
${opportunities.slice(0, 15).map((k: any) => {
  const cpc = typeof k.cpc === 'number' ? k.cpc.toFixed(2) : '0.00';
  return `- "${k.term || 'unknown'}": ${k.volume || 0} monthly searches, $${cpc} CPC, ${k.competition || 'medium'} competition, ${k.intent || 'informational'} intent`;
}).join('\n')}

Note: These are keywords people search for but Blue Lawns doesn't have pages targeting them. Recommend where to add each.`);
    }
  }

  return parts.join('\n\n');
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

type OpenAIChatMeta = {
  model: string;
  id?: string;
  usage?: unknown;
  httpStatus?: number;
  usedFallback?: boolean;
};

async function callOpenAIChatWithFallback(opts: {
  apiKey: string;
  preferredModel: string;
  fallbackModel: string;
  system: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}): Promise<{ text: string; meta: OpenAIChatMeta }> {
  try {
    const primary = await callOpenAIChat({
      apiKey: opts.apiKey,
      model: opts.preferredModel,
      system: opts.system,
      prompt: opts.prompt,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
      timeoutMs: opts.timeoutMs,
    });
    return { ...primary, meta: { ...primary.meta, usedFallback: false } };
  } catch (err) {
    console.warn('[AI Summary] Primary model failed, retrying with fallback...', {
      preferredModel: opts.preferredModel,
      fallbackModel: opts.fallbackModel,
      error: err instanceof Error ? err.message : String(err),
    });

    const fallback = await callOpenAIChat({
      apiKey: opts.apiKey,
      model: opts.fallbackModel,
      system: opts.system,
      prompt: opts.prompt,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
      timeoutMs: opts.timeoutMs,
    });
    return { ...fallback, meta: { ...fallback.meta, usedFallback: true } };
  }
}

async function callOpenAIChat(opts: {
  apiKey: string;
  model: string;
  system: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}): Promise<{ text: string; meta: OpenAIChatMeta }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts.timeoutMs);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        temperature: opts.temperature,
        max_tokens: opts.maxTokens,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.prompt },
        ],
      }),
      signal: controller.signal,
    });

    const raw = await res.text();
    let json: any = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      // Non-JSON responses are highly unusual; surface a snippet for debugging.
      throw new Error(`OpenAI returned non-JSON response (status ${res.status}): ${raw.slice(0, 500)}`);
    }

    if (!res.ok) {
      const msg = json?.error?.message || `HTTP ${res.status}`;
      throw new Error(`OpenAI API error: ${msg}`);
    }

    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || content.trim().length === 0) {
      console.error('[AI Summary] OpenAI returned empty content. Debug:', {
        model: opts.model,
        httpStatus: res.status,
        id: json?.id,
        choices: json?.choices ? json.choices.map((c: any) => ({
          finish_reason: c.finish_reason,
          hasMessage: !!c.message,
          messageKeys: c.message ? Object.keys(c.message) : [],
          contentType: typeof c.message?.content,
          contentLength: typeof c.message?.content === 'string' ? c.message.content.length : null,
        })) : null,
        usage: json?.usage,
      });
      throw new Error('OpenAI returned empty response.');
    }

    return {
      text: content,
      meta: {
        model: json?.model || opts.model,
        id: json?.id,
        usage: json?.usage,
        httpStatus: res.status,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('AbortError') || msg.toLowerCase().includes('aborted')) {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

