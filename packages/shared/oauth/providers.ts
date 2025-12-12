/**
 * OAuth Provider Configurations
 * Centralized configuration for all OAuth providers
 */

import type { OAuthConfig, OAuthProvider } from './types';

/**
 * Get environment variable - checks process.env first (populated by dotenv),
 * then falls back to import.meta.env (Vite/Astro).
 * 
 * IMPORTANT: process.env MUST be populated by the caller before using this module.
 * In Astro, this is done in astro.config.mjs before any imports.
 */
function getEnvVar(key: string): string {
  // Check process.env first (Node.js / dotenv)
  // This is the primary source when dotenv has loaded the .env file
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }
  
  // Fallback to import.meta.env (Vite/Astro build-time)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = (import.meta.env as any)[key];
    if (value) {
      return value;
    }
  }
  
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
      
      // Log once for debugging (minimal)
      console.log('[OAuth] Google config:', 
        clientId ? '✓ clientId' : '✗ clientId',
        clientSecret ? '✓ secret' : '✗ secret',
        redirectUri ? '✓ redirect' : '✗ redirect'
      );
      
      return {
        clientId,
        clientSecret,
        redirectUri,
        scopes: [
          'https://www.googleapis.com/auth/analytics.readonly', // GA4 Data API
          'https://www.googleapis.com/auth/analytics.edit', // GA4 Admin API (list properties)
          'https://www.googleapis.com/auth/webmasters.readonly', // Search Console
          'https://www.googleapis.com/auth/userinfo.email', // User email
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

