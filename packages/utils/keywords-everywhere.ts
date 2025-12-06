// packages/utils/keywords-everywhere.ts
// Keywords Everywhere API wrapper utility
// Safely wraps KE API calls using KEYWORDS_EVERYWHERE_API_KEY environment variable

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  cpc: number; // Cost per click in USD
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
}

export interface RelatedKeyword extends KeywordData {
  relationship: 'related' | 'semantic' | 'pasf'; // PASF = People Also Search For
}

export interface KeywordResearchResult {
  primary: KeywordData;
  secondary: KeywordData[];
  semantic: KeywordData[];
  pasf: KeywordData[]; // People Also Search For
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
  baseUrl?: string;
  timeout?: number;
}

/**
 * Get Keywords Everywhere API key from environment
 * @throws Error if KEYWORDS_EVERYWHERE_API_KEY is not set
 */
export function getApiKey(): string {
  const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'KEYWORDS_EVERYWHERE_API_KEY environment variable is required. ' +
      'Set it in your .env file or environment configuration.'
    );
  }
  return apiKey;
}

/**
 * Research keywords for a given term
 * @param keyword - Primary keyword to research
 * @param location - Optional location modifier (e.g., "Cape May, NJ")
 * @param service - Optional service context (e.g., "lawn care")
 */
export async function researchKeyword(
  keyword: string,
  location?: string,
  service?: string
): Promise<KeywordResearchResult> {
  const apiKey = getApiKey();
  const config: KeywordsEverywhereConfig = {
    apiKey,
    baseUrl: process.env.KEYWORDS_EVERYWHERE_BASE_URL || 'https://api.keywordseverywhere.com/v1',
    timeout: 30000, // 30 seconds
  };

  // Build search query with location/service modifiers
  const searchQuery = location 
    ? `${keyword} ${location}` 
    : service 
    ? `${service} ${keyword}`
    : keyword;

  try {
    // Primary keyword research
    const primaryData = await fetchPrimaryKeyword(config, searchQuery);
    
    // Related keywords (semantic + PASF)
    const relatedKeywords = await fetchRelatedKeywords(config, searchQuery);
    
    // Cluster by intent
    const clusters = clusterKeywordsByIntent([
      primaryData,
      ...relatedKeywords.semantic,
      ...relatedKeywords.pasf,
    ]);

    return {
      primary: primaryData,
      secondary: relatedKeywords.semantic.slice(0, 10), // Top 10 semantic
      semantic: relatedKeywords.semantic,
      pasf: relatedKeywords.pasf,
      clusters,
      metadata: {
        location,
        service,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw new Error(
      `Keywords Everywhere API error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Research keywords for multiple terms (batch)
 * Useful for researching all services or locations at once
 */
export async function researchKeywordsBatch(
  keywords: string[],
  location?: string
): Promise<Map<string, KeywordResearchResult>> {
  const results = new Map<string, KeywordResearchResult>();
  
  // Process in parallel with rate limiting consideration
  const batchSize = 5; // Process 5 at a time to avoid rate limits
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(keyword => researchKeyword(keyword, location))
    );
    
    batch.forEach((keyword, index) => {
      results.set(keyword, batchResults[index]);
    });
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < keywords.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Fetch primary keyword data from KE API
 */
async function fetchPrimaryKeyword(
  config: KeywordsEverywhereConfig,
  query: string
): Promise<KeywordData> {
  const url = `${config.baseUrl}/get_keyword_data`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      keyword: query,
      country: 'US', // Default to US, can be made configurable
      currency: 'USD',
    }),
    signal: AbortSignal.timeout(config.timeout || 30000),
  });

  if (!response.ok) {
    throw new Error(`KE API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Map KE API response to our KeywordData interface
  // Note: Actual KE API response structure may vary - adjust as needed
  return {
    keyword: data.keyword || query,
    searchVolume: data.search_volume || 0,
    competition: mapCompetition(data.competition || data.competition_index),
    cpc: data.cpc || 0,
    intent: inferIntent(query, data),
  };
}

/**
 * Fetch related keywords (semantic + PASF)
 */
async function fetchRelatedKeywords(
  config: KeywordsEverywhereConfig,
  query: string
): Promise<{ semantic: KeywordData[]; pasf: KeywordData[] }> {
  const url = `${config.baseUrl}/get_related_keywords`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      keyword: query,
      country: 'US',
    }),
    signal: AbortSignal.timeout(config.timeout || 30000),
  });

  if (!response.ok) {
    throw new Error(`KE API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Separate semantic and PASF keywords
  const semantic: KeywordData[] = (data.semantic_keywords || []).map((kw: any) => ({
    keyword: kw.keyword,
    searchVolume: kw.search_volume || 0,
    competition: mapCompetition(kw.competition),
    cpc: kw.cpc || 0,
    intent: inferIntent(kw.keyword, kw),
  }));

  const pasf: KeywordData[] = (data.pasf_keywords || data.people_also_search_for || []).map((kw: any) => ({
    keyword: kw.keyword,
    searchVolume: kw.search_volume || 0,
    competition: mapCompetition(kw.competition),
    cpc: kw.cpc || 0,
    intent: inferIntent(kw.keyword, kw),
  }));

  return { semantic, pasf };
}

/**
 * Map KE competition value to our enum
 */
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

/**
 * Infer search intent from keyword and data
 */
function inferIntent(keyword: string, data: any): KeywordData['intent'] {
  const kw = keyword.toLowerCase();
  
  // Transactional indicators
  if (kw.includes('buy') || kw.includes('price') || kw.includes('cost') || 
      kw.includes('quote') || kw.includes('hire') || kw.includes('near me')) {
    return 'transactional';
  }
  
  // Commercial indicators
  if (kw.includes('best') || kw.includes('top') || kw.includes('review') || 
      kw.includes('compare') || kw.includes('vs')) {
    return 'commercial';
  }
  
  // Navigational indicators
  if (kw.includes('website') || kw.includes('login') || kw.includes('contact')) {
    return 'navigational';
  }
  
  // Default to informational
  return 'informational';
}

/**
 * Cluster keywords by intent
 */
function clusterKeywordsByIntent(keywords: KeywordData[]): KeywordResearchResult['clusters'] {
  const clusters = new Map<string, KeywordData[]>();
  
  keywords.forEach(kw => {
    const intent = kw.intent;
    if (!clusters.has(intent)) {
      clusters.set(intent, []);
    }
    clusters.get(intent)!.push(kw);
  });
  
  return Array.from(clusters.entries()).map(([intent, keywords]) => ({
    intent,
    keywords,
  }));
}

/**
 * Validate API key format (basic check)
 */
export function validateApiKey(apiKey: string): boolean {
  // Basic validation - adjust based on actual KE API key format
  return apiKey.length > 10 && /^[A-Za-z0-9_-]+$/.test(apiKey);
}

