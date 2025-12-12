import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';
import { getValidAccessToken } from '@virgo/shared-oauth';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Fetch GA4 Analytics Data
 * 
 * GET /api/admin/analytics/ga4-data?startDate=2024-01-01&endDate=2024-01-31
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
    // Get OAuth token and selected property
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

    const propertyId = tokenRecord.ga4_property_id;
    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: 'No GA4 property selected. Please select a property in Settings.' }),
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

    // Fetch GA4 data
    const ga4Data = await fetchGA4Report(accessToken, propertyId, startDate, endDate);

    return new Response(
      JSON.stringify({
        success: true,
        propertyId,
        dateRange: { startDate, endDate },
        data: ga4Data,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching GA4 data:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch GA4 data',
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
  return new Date().toISOString().split('T')[0];
}

async function fetchGA4Report(
  accessToken: string,
  propertyId: string,
  startDate: string,
  endDate: string
) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'newUsers' },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('GA4 API error:', error);
    throw new Error(`GA4 API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Parse the response
  const row = data.rows?.[0]?.metricValues || [];
  
  return {
    sessions: parseInt(row[0]?.value || '0'),
    users: parseInt(row[1]?.value || '0'),
    pageviews: parseInt(row[2]?.value || '0'),
    bounceRate: parseFloat(row[3]?.value || '0') * 100, // Convert to percentage
    avgSessionDuration: parseFloat(row[4]?.value || '0'),
    newUsers: parseInt(row[5]?.value || '0'),
  };
}
