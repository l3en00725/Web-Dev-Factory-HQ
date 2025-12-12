import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '../../../../lib/env-loader';
import { getValidAccessToken } from '@virgo/shared-oauth';

export const prerender = false;

const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

/**
 * List GA4 Properties and Search Console Sites
 * Returns all properties/sites the connected Google account has access to
 * 
 * GET /api/admin/analytics/list-properties
 */
export const GET: APIRoute = async ({ cookies }) => {
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
    // Get OAuth token from database
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('website_oauth_tokens')
      .select('*')
      .eq('company_id', BLUE_LAWNS_COMPANY_ID)
      .eq('provider', 'google')
      .single();

    if (tokenError || !tokenRecord) {
      return new Response(
        JSON.stringify({ error: 'Google not connected. Please connect Google first.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get valid access token (refresh if needed)
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

    // Fetch GA4 properties
    console.log('[list-properties] Fetching GA4 properties...');
    const ga4Properties = await fetchGA4Properties(accessToken);
    console.log('[list-properties] GA4 properties found:', ga4Properties.length);
    
    // Fetch Search Console sites
    console.log('[list-properties] Fetching Search Console sites...');
    const searchConsoleSites = await fetchSearchConsoleSites(accessToken);
    console.log('[list-properties] Search Console sites found:', searchConsoleSites.length);

    return new Response(
      JSON.stringify({
        success: true,
        ga4Properties,
        searchConsoleSites,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error listing properties:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to list properties',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Fetch GA4 properties from Google Analytics Admin API
 */
async function fetchGA4Properties(accessToken: string): Promise<Array<{
  propertyId: string;
  displayName: string;
  websiteUrl?: string;
}>> {
  try {
    // First, list all account summaries (this is the better endpoint)
    console.log('[GA4] Fetching account summaries...');
    const summariesResponse = await fetch(
      'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!summariesResponse.ok) {
      const error = await summariesResponse.text();
      console.error('[GA4] Account summaries error:', summariesResponse.status, error);
      
      // Fallback: try the accounts endpoint
      console.log('[GA4] Trying accounts endpoint...');
      const accountsResponse = await fetch(
        'https://analyticsadmin.googleapis.com/v1beta/accounts',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      
      if (!accountsResponse.ok) {
        const accError = await accountsResponse.text();
        console.error('[GA4] Accounts error:', accountsResponse.status, accError);
        return [];
      }
      
      const accountsData = await accountsResponse.json();
      console.log('[GA4] Accounts response:', JSON.stringify(accountsData));
      return [];
    }

    const summariesData = await summariesResponse.json();
    console.log('[GA4] Account summaries response:', JSON.stringify(summariesData).substring(0, 500));
    
    const allProperties: Array<{ propertyId: string; displayName: string; websiteUrl?: string }> = [];
    
    const accountSummaries = summariesData.accountSummaries || [];
    console.log('[GA4] Found', accountSummaries.length, 'account summaries');
    
    for (const account of accountSummaries) {
      const propertySummaries = account.propertySummaries || [];
      console.log('[GA4] Account', account.displayName, 'has', propertySummaries.length, 'properties');
      
      for (const prop of propertySummaries) {
        // Extract property ID from name (e.g., "properties/123456789" -> "123456789")
        const propertyId = prop.property?.replace('properties/', '') || '';
        
        allProperties.push({
          propertyId,
          displayName: prop.displayName || `Property ${propertyId}`,
        });
      }
    }

    return allProperties;
  } catch (error) {
    console.error('[GA4] Error fetching properties:', error);
    return [];
  }
}

/**
 * Fetch Search Console sites from Google Search Console API
 */
async function fetchSearchConsoleSites(accessToken: string): Promise<Array<{
  siteUrl: string;
  permissionLevel: string;
}>> {
  try {
    const response = await fetch(
      'https://www.googleapis.com/webmasters/v3/sites',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Search Console sites error:', error);
      return [];
    }

    const data = await response.json();
    const sites = data.siteEntry || [];

    return sites.map((site: any) => ({
      siteUrl: site.siteUrl,
      permissionLevel: site.permissionLevel,
    }));
  } catch (error) {
    console.error('Error fetching Search Console sites:', error);
    return [];
  }
}
