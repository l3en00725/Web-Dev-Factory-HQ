/**
 * OAuth Provider Configurations
 * Centralized configuration for all OAuth providers
 */

import type { OAuthConfig, OAuthProvider } from './types';

/**
 * Get OAuth configuration for a provider
 */
export function getOAuthConfig(provider: OAuthProvider): OAuthConfig {
  switch (provider) {
    case 'google':
      return {
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
    
    case 'facebook':
      // Future implementation
      throw new Error('Facebook OAuth not yet implemented');
    
    case 'microsoft':
      // Future implementation
      throw new Error('Microsoft OAuth not yet implemented');
    
    default:
      throw new Error(`Unknown OAuth provider: ${provider}`);
  }
}

/**
 * Validate OAuth configuration
 */
export function validateOAuthConfig(config: OAuthConfig): void {
  if (!config.clientId) {
    throw new Error('OAuth client ID is required');
  }
  if (!config.clientSecret) {
    throw new Error('OAuth client secret is required');
  }
  if (!config.redirectUri) {
    throw new Error('OAuth redirect URI is required');
  }
  if (config.scopes.length === 0) {
    throw new Error('At least one OAuth scope is required');
  }
}

