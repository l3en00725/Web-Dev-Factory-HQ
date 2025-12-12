import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';
import { getValidAccessToken } from '@virgo/shared-oauth';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Fetch Search Console Data
 * 
 * GET /api/admin/analytics/search-console-data?startDate=2024-01-01&endDate=2024-01-31
 */
export const GET: APIRoute = async ({ request, cookies }) => {
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

  // Get date range from query params
  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate') || getDefaultStartDate();
  const endDate = url.searchParams.get('endDate') || getDefaultEndDate();

  try {
    // Get OAuth token and selected site
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('website_oauth_tokens')
      .select('*')
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .eq('provider', 'google')
      .single();

    if (tokenError || !tokenRecord) {
      return new Response(
        JSON.stringify({ error: 'Google not connected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const siteUrl = tokenRecord.gsc_site_url;
    if (!siteUrl) {
      return new Response(
        JSON.stringify({ error: 'No Search Console site selected. Please select a site in Settings.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get valid access token
    const accessToken = await getValidAccessToken(
      {
        access_token: tokenRecord.access_token,
        refresh_token: tokenRecord.refresh_token,
        token_expiry: new Date(tokenRecord.token_expiry),
      },
      async (updates) => {
        await supabase
          .from('website_oauth_tokens')
          .update({
            access_token: updates.access_token,
            token_expiry: updates.token_expiry?.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('company_id', BLUE_LAWNS_COMPANY_ID)
          .eq('provider', 'google');
      }
    );

    // Fetch Search Console data
    const [overview, topQueries, topPages] = await Promise.all([
      fetchSearchConsoleOverview(accessToken, siteUrl, startDate, endDate),
      fetchSearchConsoleQueries(accessToken, siteUrl, startDate, endDate),
      fetchSearchConsolePages(accessToken, siteUrl, startDate, endDate),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        siteUrl,
        dateRange: { startDate, endDate },
        data: {
          overview,
          topQueries,
          topPages,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching Search Console data:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch Search Console data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 3); // Search Console data has ~3 day delay
  return date.toISOString().split('T')[0];
}

async function fetchSearchConsoleOverview(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
) {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: [],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Search Console API error:', error);
    throw new Error(`Search Console API error: ${response.status}`);
  }

  const data = await response.json();
  const row = data.rows?.[0] || {};

  return {
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100, // Convert to percentage
    position: row.position || 0,
  };
}

async function fetchSearchConsoleQueries(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  limit: number = 20
) {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: limit,
        orderBy: { field: 'clicks', sortOrder: 'descending' },
      }),
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  
  return (data.rows || []).map((row: any) => ({
    query: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  }));
}

async function fetchSearchConsolePages(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  limit: number = 20
) {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: limit,
        orderBy: { field: 'clicks', sortOrder: 'descending' },
      }),
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  
  return (data.rows || []).map((row: any) => ({
    page: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: (row.ctr || 0) * 100,
    position: row.position || 0,
  }));
}
