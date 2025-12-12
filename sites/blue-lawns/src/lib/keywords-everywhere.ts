// sites/blue-lawns/src/lib/keywords-everywhere.ts
// Keywords Everywhere API wrapper (site-local to avoid Vite SSR importing outside project root)
import { getEnv } from './env-loader';

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  cpc: number; // USD
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
}

export interface KeywordResearchResult {
  primary: KeywordData;
  secondary: KeywordData[];
  semantic: KeywordData[];
  pasf: KeywordData[];
  clusters: {
    intent: string;
    keywords: KeywordData[];
  }[];
  metadata: {
    location?: string;
    service?: string;
    timestamp: string;
  };
}

export interface KeywordsEverywhereConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}

export function getApiKey(): string {
  const apiKey = getEnv('KEYWORDS_EVERYWHERE_API_KEY');
  if (!apiKey) {
    throw new Error('KEYWORDS_EVERYWHERE_API_KEY environment variable is required.');
  }
  return apiKey;
}

export async function researchKeyword(
  keyword: string,
  location?: string,
  service?: string
): Promise<KeywordResearchResult> {
  const apiKey = getApiKey();
  const config: KeywordsEverywhereConfig = {
    apiKey,
    baseUrl: getEnv('KEYWORDS_EVERYWHERE_BASE_URL', 'https://api.keywordseverywhere.com/v1'),
    timeout: 30000,
  };

  const searchQuery =
    location ? `${keyword} ${location}` : service ? `${service} ${keyword}` : keyword;

  const primaryData = await fetchPrimaryKeyword(config, searchQuery);
  const relatedKeywords = await fetchRelatedKeywords(config, searchQuery);

  const clusters = clusterKeywordsByIntent([
    primaryData,
    ...relatedKeywords.semantic,
    ...relatedKeywords.pasf,
  ]);

  return {
    primary: primaryData,
    secondary: relatedKeywords.semantic.slice(0, 10),
    semantic: relatedKeywords.semantic,
    pasf: relatedKeywords.pasf,
    clusters,
    metadata: {
      location,
      service,
      timestamp: new Date().toISOString(),
    },
  };
}

export async function researchKeywordsBatch(
  keywords: string[],
  location?: string
): Promise<Map<string, KeywordResearchResult>> {
  const results = new Map<string, KeywordResearchResult>();
  const batchSize = 5;

  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((kw) => researchKeyword(kw, location)));

    batch.forEach((kw, idx) => {
      results.set(kw, batchResults[idx]);
    });

    if (i + batchSize < keywords.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

async function fetchPrimaryKeyword(config: KeywordsEverywhereConfig, query: string): Promise<KeywordData> {
  const url = `${config.baseUrl}/get_keyword_data`;
  // KE API requires lowercase country codes and kw as array
  const requestBody = {
    kw: [query],
    country: 'us',
    currency: 'usd',
    dataSource: 'cli', // Use clickstream data for more accurate results
  };
  console.log('[KE] Request:', url, JSON.stringify(requestBody));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(config.timeout),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `KE API error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`
    );
  }

  const data = await response.json();
  console.log('[KE] Raw API response:', JSON.stringify(data).slice(0, 1000));
  
  // KE returns { data: [ { keyword, vol, cpc: { value, currency }, competition, trend } ] }
  const row = normalizeFirstRow(data);
  console.log('[KE] Parsed row:', JSON.stringify(row));
  
  // Extract values - cpc can be an object { value, currency } or a number
  const cpcValue = typeof row.cpc === 'object' && row.cpc !== null 
    ? (row.cpc.value ?? 0) 
    : (row.cpc ?? 0);
  
  return {
    keyword: row.keyword || row.kw || query,
    searchVolume: row.vol ?? row.search_volume ?? row.searchVolume ?? row.volume ?? 0,
    competition: mapCompetition(row.competition ?? row.comp ?? 0),
    cpc: cpcValue,
    intent: inferIntent(query, row),
  };
}

async function fetchRelatedKeywords(
  config: KeywordsEverywhereConfig,
  query: string
): Promise<{ semantic: KeywordData[]; pasf: KeywordData[] }> {
  const url = `${config.baseUrl}/get_related_keywords`;
  // KE /get_related_keywords requires `keyword` (string) and `num` (number of results)
  const requestBody = {
    keyword: query,
    num: 10,
    country: 'us', // lowercase
  };
  console.log('[KE] Related keywords request:', url, JSON.stringify(requestBody));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(config.timeout),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `KE API error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`
    );
  }

  const data = await response.json();
  console.log('[KE] Related keywords response:', JSON.stringify(data).slice(0, 1000));
  
  const payload: any = normalizePayload(data);

  const semanticSource = payload.related_keywords || payload.relatedKeywords || payload.semantic_keywords || payload.semanticKeywords || [];
  const pasfSource = payload.pasf_keywords || payload.pasfKeywords || payload.people_also_search_for || payload.peopleAlsoSearchFor || [];

  const mapKeyword = (kw: any): KeywordData => {
    const cpcValue = typeof kw.cpc === 'object' && kw.cpc !== null 
      ? (kw.cpc.value ?? 0) 
      : (kw.cpc ?? 0);
    return {
      keyword: kw.keyword || kw.kw || '',
      searchVolume: kw.vol ?? kw.search_volume ?? kw.searchVolume ?? 0,
      competition: mapCompetition(kw.competition ?? kw.comp ?? 0),
      cpc: cpcValue,
      intent: inferIntent(kw.keyword || kw.kw || '', kw),
    };
  };

  const semanticMapped: KeywordData[] = (semanticSource || []).map(mapKeyword);
  const pasf: KeywordData[] = (pasfSource || []).map(mapKeyword);

  return { semantic: semanticMapped, pasf };
}

function mapCompetition(value: number | string): 'low' | 'medium' | 'high' {
  if (typeof value === 'number') {
    if (value < 0.33) return 'low';
    if (value < 0.66) return 'medium';
    return 'high';
  }
  const normalized = String(value).toLowerCase();
  if (normalized.includes('low')) return 'low';
  if (normalized.includes('high')) return 'high';
  return 'medium';
}

function inferIntent(keyword: string, _data: any): KeywordData['intent'] {
  const kw = keyword.toLowerCase();
  if (kw.includes('buy') || kw.includes('price') || kw.includes('cost') || kw.includes('quote') || kw.includes('hire') || kw.includes('near me')) {
    return 'transactional';
  }
  if (kw.includes('best') || kw.includes('top') || kw.includes('review') || kw.includes('compare') || kw.includes('vs')) {
    return 'commercial';
  }
  if (kw.includes('website') || kw.includes('login') || kw.includes('contact')) {
    return 'navigational';
  }
  return 'informational';
}

function clusterKeywordsByIntent(keywords: KeywordData[]): KeywordResearchResult['clusters'] {
  const clusters = new Map<string, KeywordData[]>();
  keywords.forEach((kw) => {
    if (!clusters.has(kw.intent)) clusters.set(kw.intent, []);
    clusters.get(kw.intent)!.push(kw);
  });
  return Array.from(clusters.entries()).map(([intent, kws]) => ({ intent, keywords: kws }));
}

function normalizePayload(data: any): any {
  if (!data) return {};
  if (data.data) return data.data;
  return data;
}

function normalizeFirstRow(data: any): any {
  if (!data) return {};
  if (Array.isArray(data)) return data[0] || {};
  if (Array.isArray(data.data)) return data.data[0] || {};
  if (data.data && typeof data.data === 'object') return data.data;
  return data;
}

/**
 * Fetch just the keyword names from related keywords endpoint
 * (This endpoint only returns names, not metrics)
 */
async function fetchRelatedKeywordNames(
  config: KeywordsEverywhereConfig,
  query: string
): Promise<string[]> {
  const url = `${config.baseUrl}/get_related_keywords`;
  const requestBody = {
    keyword: query,
    num: 10,
    country: 'us',
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(config.timeout),
  });

  if (!response.ok) {
    throw new Error(`KE API error: ${response.status}`);
  }

  const data = await response.json();
  
  // The API returns { data: ["keyword1", "keyword2", ...] }
  if (Array.isArray(data.data)) {
    return data.data.filter((item: any) => typeof item === 'string');
  }
  
  return [];
}

/**
 * Fetch keyword metrics for a batch of keywords
 */
async function fetchKeywordDataBatch(
  config: KeywordsEverywhereConfig,
  keywords: string[]
): Promise<KeywordData[]> {
  if (keywords.length === 0) return [];
  
  const url = `${config.baseUrl}/get_keyword_data`;
  const requestBody = {
    kw: keywords.slice(0, 100), // API limit is 100
    country: 'us',
    currency: 'usd',
    dataSource: 'cli',
  };
  
  console.log(`[KE] Fetching metrics for ${keywords.length} keywords...`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(config.timeout),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`KE API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  console.log(`[KE] Batch response:`, JSON.stringify(data).slice(0, 500));
  
  // The API returns { data: [ { keyword, vol, cpc, competition, trend } ] }
  const results: KeywordData[] = [];
  
  if (Array.isArray(data.data)) {
    for (const row of data.data) {
      const cpcValue = typeof row.cpc === 'object' && row.cpc !== null 
        ? (row.cpc.value ?? 0) 
        : (row.cpc ?? 0);
      
      results.push({
        keyword: row.keyword || '',
        searchVolume: row.vol ?? 0,
        competition: mapCompetition(row.competition ?? 0),
        cpc: cpcValue,
        intent: inferIntent(row.keyword || '', row),
      });
    }
  }
  
  console.log(`[KE] Parsed ${results.length} keywords, ${results.filter(r => r.searchVolume > 0).length} with volume`);
  
  return results;
}

/**
 * Discover keyword opportunities by fetching related/trending keywords
 * for seed terms, then getting their metrics
 */
export async function discoverKeywordOpportunities(
  seedKeywords: string[],
  existingKeywords: string[] = []
): Promise<KeywordData[]> {
  const apiKey = getApiKey();
  const config: KeywordsEverywhereConfig = {
    apiKey,
    baseUrl: getEnv('KEYWORDS_EVERYWHERE_BASE_URL', 'https://api.keywordseverywhere.com/v1'),
    timeout: 30000,
  };

  const existingSet = new Set(existingKeywords.map(k => k.toLowerCase()));
  const allRelatedKeywords: string[] = [];

  // Step 1: Collect related keyword NAMES from all seeds
  for (const seed of seedKeywords) {
    try {
      const related = await fetchRelatedKeywordNames(config, seed);
      
      // Filter out keywords we already target
      for (const kwName of related) {
        const kwLower = kwName.toLowerCase();
        if (!existingSet.has(kwLower) && !allRelatedKeywords.includes(kwLower)) {
          allRelatedKeywords.push(kwName);
        }
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`[KE] Error fetching related for "${seed}":`, error);
    }
  }

  console.log(`[KE] Found ${allRelatedKeywords.length} unique related keywords`);

  if (allRelatedKeywords.length === 0) {
    return [];
  }

  // Step 2: Get metrics for these keywords (batch of up to 100)
  const keywordsToLookup = allRelatedKeywords.slice(0, 50); // Limit to save credits
  
  try {
    const opportunities = await fetchKeywordDataBatch(config, keywordsToLookup);
    
    // Sort by volume and return
    return opportunities
      .filter(kw => kw.searchVolume > 0)
      .sort((a, b) => b.searchVolume - a.searchVolume);
  } catch (error) {
    console.error('[KE] Error fetching keyword metrics:', error);
    return [];
  }
}

