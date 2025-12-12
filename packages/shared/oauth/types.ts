/**
 * OAuth Types and Interfaces
 * Shared types for OAuth implementations across all VIRGO sites
 */

/**
 * OAuth Provider Types
 */
export type OAuthProvider = 'google' | 'facebook' | 'microsoft';

/**
 * Token Response from OAuth provider
 */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // Seconds until expiration
  token_type: string;
  scope?: string;
}

/**
 * Refreshed Token Response (no refresh_token in response)
 */
export interface RefreshedTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

/**
 * OAuth Configuration
 */
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

/**
 * OAuth State (encoded in state parameter)
 */
export interface OAuthState {
  companyId: string;
  provider: OAuthProvider;
  connectionType?: 'ga4' | 'search_console' | 'google_business_profile';
}

/**
 * Stored OAuth Token (database record)
 */
export interface StoredOAuthToken {
  id: string;
  company_id: string;
  provider: OAuthProvider;
  access_token: string;
  refresh_token: string;
  token_expiry: Date;
  scopes?: string;
  ga4_property_id?: string;
  ga4_measurement_id?: string;
  gsc_site_url?: string;
  connected_email?: string;
  connected_at: Date;
  updated_at: Date;
}

/**
 * OAuth Connection Status
 */
export interface OAuthConnectionStatus {
  connected: boolean;
  provider: OAuthProvider;
  expiresAt?: Date;
  email?: string;
  needsRefresh: boolean;
}



