import type { APIRoute } from 'astro';
import { getEnv } from '../../../../lib/env-loader';

export const prerender = false;

export const GET: APIRoute = async () => {
  const apiKey = getEnv('KEYWORDS_EVERYWHERE_API_KEY');
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'KEYWORDS_EVERYWHERE_API_KEY not set' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Test with a simple, high-volume keyword
  const testKeyword = 'lawn care';
  
  try {
    // Test 1: Get keyword data
    const kwResponse = await fetch('https://api.keywordseverywhere.com/v1/get_keyword_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        kw: [testKeyword],
        country: 'us',
        currency: 'usd',
        dataSource: 'cli',
      }),
    });

    const kwData = await kwResponse.json();

    // Test 2: Get related keywords
    const relatedResponse = await fetch('https://api.keywordseverywhere.com/v1/get_related_keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        keyword: testKeyword,
        num: 10,
        country: 'us',
      }),
    });

    const relatedData = await relatedResponse.json();

    // Test 3: Check credit balance
    const creditsResponse = await fetch('https://api.keywordseverywhere.com/v1/account/credits', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const creditsData = await creditsResponse.json();

    return new Response(
      JSON.stringify({
        testKeyword,
        apiKeyPrefix: apiKey.substring(0, 10) + '...',
        credits: creditsData,
        keywordDataResponse: {
          status: kwResponse.status,
          statusText: kwResponse.statusText,
          data: kwData,
        },
        relatedKeywordsResponse: {
          status: relatedResponse.status,
          statusText: relatedResponse.statusText,
          data: relatedData,
        },
      }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'API call failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

