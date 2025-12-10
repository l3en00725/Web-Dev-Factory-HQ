/**
 * Google OAuth 2.0 Implementation
 * Complete OAuth flow for Google services (GA4, Search Console)
 * 
 * Functions:
 * - generateAuthUrl: Builds OAuth authorization URL
 * - exchangeCodeForTokens: Exchanges auth code for tokens
 * - refreshAccessToken: Refreshes expired access token
 * - revokeToken: Revokes access (disconnect)
 * - getValidAccessToken: Gets valid token (refreshes if needed)
 */

import type { TokenResponse, RefreshedTokenResponse, OAuthState, StoredOAuthToken } from './types';
import { getOAuthConfig, validateOAuthConfig } from './providers';

/**
 * Get Google OAuth configuration
 */
function getGoogleConfig() {
  const config = getOAuthConfig('google');
  validateOAuthConfig(config);
  return config;
}

/**
 * Generate Google OAuth authorization URL
 * 
 * @param companyId - UUID of the company requesting authorization
 * @param connectionType - Optional: 'ga4', 'search_console', or 'google_business_profile'
 * @returns Authorization URL with encoded state parameter
 */
export function generateAuthUrl(
  companyId: string,
  connectionType?: 'ga4' | 'search_console' | 'google_business_profile'
): string {
  const config = getGoogleConfig();
  
  const state: OAuthState = {
    companyId,
    provider: 'google',
    connectionType,
  };
  
  const encodedState = Buffer.from(JSON.stringify(state)).toString('base64');
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline', // Required for refresh token
    prompt: 'consent', // Force consent to get refresh token
    state: encodedState,
  });
  
  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Decode OAuth state parameter
 */
export function decodeState(state: string): OAuthState {
  try {
    const decoded = Buffer.from(state, 'base64').toString('utf-8');
    return JSON.parse(decoded) as OAuthState;
  } catch (error) {
    throw new Error('Invalid OAuth state parameter');
  }
}

/**
 * Exchange authorization code for access and refresh tokens
 * 
 * @param code - Authorization code from OAuth callback
 * @returns Token response with access_token, refresh_token, and expiration
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const config = getGoogleConfig();
  
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Token exchange failed: ${error.error || response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.access_token || !data.refresh_token) {
    throw new Error('Invalid token response: missing access_token or refresh_token');
  }
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in || 3600, // Default 1 hour
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
  };
}

/**
 * Refresh access token using refresh token
 * 
 * @param refreshToken - Refresh token from database
 * @returns New access token and expiration time
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshedTokenResponse> {
  const config = getGoogleConfig();
  
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    
    // If refresh token is invalid/expired, throw specific error
    if (response.status === 400) {
      throw new Error('Refresh token is invalid or expired. Please reconnect.');
    }
    
    throw new Error(`Token refresh failed: ${error.error || response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.access_token) {
    throw new Error('Invalid refresh response: missing access_token');
  }
  
  return {
    access_token: data.access_token,
    expires_in: data.expires_in || 3600, // Default 1 hour
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
  };
}

/**
 * Revoke OAuth token (disconnect)
 * 
 * @param accessToken - Access token to revoke
 */
export async function revokeToken(accessToken: string): Promise<void> {
  const revokeUrl = 'https://oauth2.googleapis.com/revoke';
  
  const response = await fetch(revokeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      token: accessToken,
    }),
  });
  
  // Google returns 200 even if token is already revoked
  if (!response.ok && response.status !== 200) {
    const error = await response.text();
    throw new Error(`Token revocation failed: ${error || response.statusText}`);
  }
}

/**
 * Get user info from Google (email, etc.)
 * Useful for storing connected_email in database
 */
export async function getUserInfo(accessToken: string): Promise<{
  email: string;
  name?: string;
  picture?: string;
}> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Check if token is expired or will expire soon
 * 
 * @param tokenExpiry - Token expiration timestamp
 * @param bufferSeconds - Buffer time in seconds (default: 300 = 5 minutes)
 */
export function isTokenExpired(tokenExpiry: Date, bufferSeconds: number = 300): boolean {
  const now = new Date();
  const expiry = new Date(tokenExpiry);
  const buffer = new Date(expiry.getTime() - bufferSeconds * 1000);
  
  return now >= buffer;
}

/**
 * Get valid access token, refreshing if necessary
 * 
 * This is a helper function that:
 * 1. Checks if token is expired (or expiring soon)
 * 2. Refreshes if needed
 * 3. Updates database with new token
 * 4. Returns valid access token
 * 
 * @param storedToken - Token record from database
 * @param updateTokenCallback - Callback to update token in database
 * @returns Valid access token
 */
export async function getValidAccessToken(
  storedToken: StoredOAuthToken,
  updateTokenCallback: (token: Partial<StoredOAuthToken>) => Promise<void>
): Promise<string> {
  // Check if token needs refresh
  if (isTokenExpired(storedToken.token_expiry)) {
    try {
      // Refresh the token
      const refreshed = await refreshAccessToken(storedToken.refresh_token);
      
      // Calculate new expiry
      const newExpiry = new Date();
      newExpiry.setSeconds(newExpiry.getSeconds() + refreshed.expires_in);
      
      // Update database
      await updateTokenCallback({
        access_token: refreshed.access_token,
        token_expiry: newExpiry,
        updated_at: new Date(),
      });
      
      return refreshed.access_token;
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Token is still valid
  return storedToken.access_token;
}

