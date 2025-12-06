// dashboard-api/lib/oauth/google.ts
// Google OAuth 2.0 flow for GA4 and Search Console
// Handles authorization, token exchange, and refresh

import type { Request, Response } from 'express';

/**
 * Google OAuth 2.0 configuration
 * Uses environment variables for client ID and secret
 */
export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI || '',
  scopes: [
    'https://www.googleapis.com/auth/analytics.readonly', // GA4
    'https://www.googleapis.com/auth/webmasters.readonly', // Search Console
  ],
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
};

/**
 * Generate Google OAuth authorization URL
 * 
 * @param siteId - UUID of the site requesting authorization
 * @param connectionType - 'ga4' or 'search_console'
 * @returns Authorization URL with state parameter
 */
export function generateAuthUrl(siteId: string, connectionType: 'ga4' | 'search_console'): string {
  const state = Buffer.from(JSON.stringify({ siteId, connectionType })).toString('base64');
  
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
    access_type: 'offline', // Required for refresh token
    prompt: 'consent', // Force consent to get refresh token
    state,
  });
  
  return `${GOOGLE_OAUTH_CONFIG.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access and refresh tokens
 * 
 * @param code - Authorization code from OAuth callback
 * @returns Token response with access_token and refresh_token
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}> {
  // TODO: Implement token exchange
  // POST to GOOGLE_OAUTH_CONFIG.tokenUrl with:
  // - code
  // - client_id
  // - client_secret
  // - redirect_uri
  // - grant_type: 'authorization_code'
  
  throw new Error('Token exchange not yet implemented');
}

/**
 * Refresh access token using refresh token
 * 
 * @param refreshToken - Refresh token from database
 * @returns New access token and expiration
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  // TODO: Implement token refresh
  // POST to GOOGLE_OAUTH_CONFIG.tokenUrl with:
  // - refresh_token
  // - client_id
  // - client_secret
  // - grant_type: 'refresh_token'
  
  throw new Error('Token refresh not yet implemented');
}

/**
 * OAuth callback handler
 * Processes the OAuth callback, exchanges code for tokens, stores in database
 */
export async function handleOAuthCallback(req: Request, res: Response) {
  const { code, state } = req.query;
  
  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state parameter' });
  }
  
  try {
    // Decode state to get siteId and connectionType
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const { siteId, connectionType } = stateData;
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code as string);
    
    // TODO: Store tokens in analytics_connections table
    // - Encrypt refresh_token (use Supabase Vault or pgcrypto)
    // - Store access_token (short-lived, will be refreshed)
    // - Set token_expires_at
    // - Update sync_status to 'pending'
    
    // Redirect to dashboard with success message
    res.redirect(`/dashboard?siteId=${siteId}&connected=${connectionType}`);
  } catch (error) {
    res.status(500).json({
      error: 'OAuth callback failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

