/**
 * OAuth Provider Configurations
 * Centralized configuration for all OAuth providers
 */

import type { OAuthConfig, OAuthProvider } from './types';

/**
 * Get environment variable from either import.meta.env (Astro) or process.env (Node.js)
 */
function getEnvVar(key: string): string {
  // Check import.meta.env first (Astro/Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = (import.meta.env as any)[key];
    if (value) {
      console.log(`[OAuth] Found ${key} in import.meta.env`);
      return value;
    }
    console.log(`[OAuth] ${key} not found in import.meta.env`);
  }
  
  // Fallback to process.env (Node.js)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value) {
      console.log(`[OAuth] Found ${key} in process.env`);
      return value;
    }
    console.log(`[OAuth] ${key} not found in process.env`);
  }
  
  console.warn(`[OAuth] ${key} not found in any environment`);
  return '';
}

/**
 * Get OAuth configuration for a provider
 */
export function getOAuthConfig(provider: OAuthProvider): OAuthConfig {
  switch (provider) {
    case 'google':
      const clientId = getEnvVar('GOOGLE_OAUTH_CLIENT_ID');
      const clientSecret = getEnvVar('GOOGLE_OAUTH_CLIENT_SECRET');
      const redirectUri = getEnvVar('GOOGLE_OAUTH_REDIRECT_URI');
      
      console.log('[OAuth] Google config loaded:', {
        clientId: clientId ? `${clientId.substring(0, 10)}...` : 'MISSING',
        clientSecret: clientSecret ? '***' : 'MISSING',
        redirectUri: redirectUri || 'MISSING',
      });
      
      return {
        clientId,
        clientSecret,
        redirectUri,
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

