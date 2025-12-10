// dashboard-api/lib/oauth/google.ts
// DEPRECATED: Use @virgo/shared-oauth instead
// This file is kept for backward compatibility but re-exports from shared package

/**
 * @deprecated Import from '@virgo/shared-oauth' or '../../../../packages/shared/oauth' instead
 */
export {
  generateAuthUrl,
  decodeState,
  exchangeCodeForTokens,
  refreshAccessToken,
  revokeToken,
  getUserInfo,
  isTokenExpired,
  getValidAccessToken,
} from '../../../packages/shared/oauth';

// Re-export types
export type {
  OAuthProvider,
  TokenResponse,
  RefreshedTokenResponse,
  OAuthState,
  StoredOAuthToken,
} from '../../../packages/shared/oauth';

