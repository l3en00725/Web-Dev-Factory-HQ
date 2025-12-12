import type { APIRoute } from 'astro';
import { researchKeywordsBatch, getApiKey, discoverKeywordOpportunities } from '../../../../lib/keywords-everywhere';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';

const CACHE_TTL_DAYS = 30;
const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

interface KeywordEntry {
  term: string;
  volume: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  intent: string;
  trend?: string;
}

interface KeywordCache {
  last_updated: string | null;
  credits_used: number;
  keywords: KeywordEntry[];
  opportunities: KeywordEntry[]; // NEW: Keywords not on site but worth targeting
  metadata: {
    total_keywords: number;
    total_opportunities: number;
    refresh_count: number;
  };
}

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  // Auth check
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Check if API key is configured
    try {
      getApiKey();
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Keywords Everywhere API key not configured',
          details: 'Add KEYWORDS_EVERYWHERE_API_KEY to environment variables'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Define keywords to research
    const coreServices = [
      'lawn care',
      'landscaping',
      'hardscaping',
      'lawn fertilization',
      'snow removal'
    ];

    const locations = [
      'Avalon NJ',
      'Stone Harbor NJ',
      'Sea Isle City NJ',
      'Cape May NJ',
      'Wildwood NJ'
    ];

    const keywords: string[] = [];
    keywords.push(...coreServices);
    locations.forEach(location => {
      coreServices.forEach(service => {
        keywords.push(`${service} ${location}`);
      });
    });

    const uniqueKeywords = [...new Set(keywords)];
    console.log(`[Keywords Refresh] Researching ${uniqueKeywords.length} keywords...`);

    const results = await researchKeywordsBatch(uniqueKeywords, 'Cape May County, NJ');
    const keywordData: KeywordEntry[] = Array.from(results.entries()).map(([term, result]) => ({
      term,
      volume: result.primary.searchVolume,
      cpc: result.primary.cpc,
      competition: result.primary.competition,
      intent: result.primary.intent,
    }));

    // Discover keyword opportunities (related keywords not on site)
    console.log('[Keywords Refresh] Discovering keyword opportunities...');
    const opportunitySeeds = [
      'lawn care services near me',
      'landscaping company',
      'lawn maintenance',
      'yard work services',
      'grass cutting service',
      'lawn treatment',
      'garden maintenance',
      'outdoor landscaping'
    ];
    
    const opportunities = await discoverKeywordOpportunities(opportunitySeeds, uniqueKeywords);
    const opportunityData: KeywordEntry[] = opportunities.map(opp => ({
      term: opp.keyword,
      volume: opp.searchVolume,
      cpc: opp.cpc,
      competition: opp.competition,
      intent: opp.intent,
    }));
    
    console.log(`[Keywords Refresh] Found ${opportunityData.length} keyword opportunities`);

    // Estimate credits: primary keywords + opportunity discovery
    const estimatedCredits = (uniqueKeywords.length * 18) + (opportunitySeeds.length * 12);

    // Load existing cache from Supabase settings
    const { data: currentData } = await supabase
      .from('website_settings')
      .select('settings')
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .single();

    const currentSettings = currentData?.settings || {};
    const existingCache: KeywordCache = currentSettings.keywordCache || {
      last_updated: null,
      credits_used: 0,
      keywords: [],
      opportunities: [],
      metadata: { total_keywords: 0, total_opportunities: 0, refresh_count: 0 },
    };

    const updatedCache: KeywordCache = {
      last_updated: new Date().toISOString(),
      credits_used: existingCache.credits_used + estimatedCredits,
      keywords: keywordData,
      opportunities: opportunityData,
      metadata: {
        total_keywords: keywordData.length,
        total_opportunities: opportunityData.length,
        refresh_count: existingCache.metadata.refresh_count + 1
      }
    };

    const updatedSettings = {
      ...currentSettings,
      keywordCache: updatedCache,
    };

    // Persist cache to Supabase
    const { error: upsertError } = await supabase
      .from('website_settings')
      .upsert(
        {
          company_id: BLUE_LAWNS_COMPANY_ID,
          settings: updatedSettings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'company_id' }
      );

    if (upsertError) {
      console.error('[Keywords Refresh] Failed to store keyword cache:', upsertError);
      return new Response(
        JSON.stringify({
          error: 'Failed to store keyword cache',
          details: upsertError.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          keywords: keywordData,
          opportunities: opportunityData,
          credits_used: estimatedCredits,
          total_credits: updatedCache.credits_used,
          last_updated: updatedCache.last_updated,
          metadata: updatedCache.metadata
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Keywords Refresh] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to refresh keywords',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async ({ cookies }) => {
  // Auth check
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { data: settingsRow } = await supabase
      .from('website_settings')
      .select('settings')
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .single();

    const cache: KeywordCache | null = settingsRow?.settings?.keywordCache || null;

    if (!cache) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            keywords: [],
            opportunities: [],
            last_updated: null,
            credits_used: 0,
            is_stale: true,
            days_since_update: null,
            metadata: { total_keywords: 0, total_opportunities: 0, refresh_count: 0 },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let isStale = true;
    if (cache.last_updated) {
      const lastUpdated = new Date(cache.last_updated);
      const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      isStale = daysSinceUpdate > CACHE_TTL_DAYS;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          keywords: cache.keywords,
          opportunities: cache.opportunities || [],
          last_updated: cache.last_updated,
          credits_used: cache.credits_used,
          is_stale: isStale,
          days_since_update: cache.last_updated 
            ? Math.floor((Date.now() - new Date(cache.last_updated).getTime()) / (1000 * 60 * 60 * 24))
            : null,
          metadata: cache.metadata
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          keywords: [],
          opportunities: [],
          last_updated: null,
          credits_used: 0,
          is_stale: true,
          days_since_update: null,
          metadata: { total_keywords: 0, total_opportunities: 0, refresh_count: 0 }
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
