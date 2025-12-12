# Shared OAuth Package

Complete OAuth 2.0 implementation for Google services (GA4, Search Console) used across all VIRGO Web Factory sites.

## Installation

This package is part of the monorepo and can be imported directly:

```typescript
import {
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  revokeToken,
  getValidAccessToken,
} from '../../../packages/shared/oauth';
```

## Environment Variables

Required environment variables:

```bash
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=https://api.virgowebfactory.com/oauth/google/callback
```

## Usage Examples

### 1. Generate Authorization URL

```typescript
import { generateAuthUrl } from '../../../packages/shared/oauth';

const authUrl = generateAuthUrl(
  companyId, // UUID from companies table
  'ga4' // Optional: 'ga4' | 'search_console' | 'google_business_profile'
);

// Redirect user to authUrl
```

### 2. Exchange Code for Tokens

```typescript
import { exchangeCodeForTokens, getUserInfo } from '../../../packages/shared/oauth';

// In OAuth callback handler
const tokens = await exchangeCodeForTokens(code);

// Get user email
const userInfo = await getUserInfo(tokens.access_token);

// Store in database
await supabase.from('website_oauth_tokens').insert({
  company_id: companyId,
  provider: 'google',
  access_token: tokens.access_token,
  refresh_token: tokens.refresh_token,
  token_expiry: new Date(Date.now() + tokens.expires_in * 1000),
  scopes: tokens.scope,
  connected_email: userInfo.email,
});
```

### 3. Get Valid Access Token (Auto-Refresh)

```typescript
import { getValidAccessToken } from '../../../packages/shared/oauth';

// Get token from database
const storedToken = await supabase
  .from('website_oauth_tokens')
  .select('*')
  .eq('company_id', companyId)
  .eq('provider', 'google')
  .single();

// Get valid token (refreshes if needed)
const accessToken = await getValidAccessToken(
  storedToken.data,
  async (updates) => {
    // Update token in database
    await supabase
      .from('website_oauth_tokens')
      .where({ id: storedToken.data.id })
      .update(updates);
  }
);

// Use accessToken for API calls
```

### 4. Refresh Token Manually

```typescript
import { refreshAccessToken } from '../../../packages/shared/oauth';

const refreshed = await refreshAccessToken(storedToken.refresh_token);

// Update database
await supabase
  .from('website_oauth_tokens')
  .where({ id: storedToken.id })
  .update({
    access_token: refreshed.access_token,
    token_expiry: new Date(Date.now() + refreshed.expires_in * 1000),
  });
```

### 5. Disconnect (Revoke Token)

```typescript
import { revokeToken } from '../../../packages/shared/oauth';

// Revoke access token
await revokeToken(storedToken.access_token);

// Delete from database
await supabase
  .from('website_oauth_tokens')
  .where({ id: storedToken.id })
  .delete();
```

## Complete OAuth Flow Example

```typescript
import {
  generateAuthUrl,
  decodeState,
  exchangeCodeForTokens,
  getUserInfo,
  getValidAccessToken,
} from '../../../packages/shared/oauth';
import { createClient } from '@supabase/supabase-js';

// Step 1: Generate auth URL (in settings page)
export function getConnectUrl(companyId: string) {
  return generateAuthUrl(companyId, 'ga4');
}

// Step 2: Handle callback (in API route)
export async function handleCallback(code: string, state: string) {
  const { companyId } = decodeState(state);
  
  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(code);
  
  // Get user info
  const userInfo = await getUserInfo(tokens.access_token);
  
  // Store in database
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  await supabase.from('website_oauth_tokens').upsert({
    company_id: companyId,
    provider: 'google',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_expiry: new Date(Date.now() + tokens.expires_in * 1000),
    scopes: tokens.scope,
    connected_email: userInfo.email,
  }, {
    onConflict: 'company_id,provider',
  });
}

// Step 3: Use token for API calls
export async function getAnalyticsData(companyId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: token } = await supabase
    .from('website_oauth_tokens')
    .select('*')
    .eq('company_id', companyId)
    .eq('provider', 'google')
    .single();
  
  // Get valid token (auto-refreshes if needed)
  const accessToken = await getValidAccessToken(
    token,
    async (updates) => {
      await supabase
        .from('website_oauth_tokens')
        .where({ id: token.id })
        .update(updates);
    }
  );
  
  // Use accessToken for Google API calls
  const response = await fetch('https://analyticsdata.googleapis.com/v1beta/properties/...', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  return response.json();
}
```

## API Reference

### Functions

- `generateAuthUrl(companyId, connectionType?)` - Generate OAuth authorization URL
- `decodeState(state)` - Decode OAuth state parameter
- `exchangeCodeForTokens(code)` - Exchange auth code for tokens
- `refreshAccessToken(refreshToken)` - Refresh expired access token
- `revokeToken(accessToken)` - Revoke token (disconnect)
- `getUserInfo(accessToken)` - Get Google user info (email, name)
- `isTokenExpired(tokenExpiry, bufferSeconds?)` - Check if token is expired
- `getValidAccessToken(storedToken, updateCallback)` - Get valid token (auto-refresh)

### Types

- `OAuthProvider` - 'google' | 'facebook' | 'microsoft'
- `TokenResponse` - Token response from OAuth provider
- `RefreshedTokenResponse` - Refreshed token response
- `OAuthState` - Encoded state parameter
- `StoredOAuthToken` - Database token record

## Error Handling

All functions throw errors that should be caught:

```typescript
try {
  const tokens = await exchangeCodeForTokens(code);
} catch (error) {
  if (error.message.includes('invalid_grant')) {
    // Code expired or already used
  } else if (error.message.includes('invalid_client')) {
    // Client credentials invalid
  }
  // Handle other errors
}
```

## Token Refresh Strategy

Access tokens expire in 1 hour. The `getValidAccessToken()` helper automatically:
1. Checks if token is expired (or expiring within 5 minutes)
2. Refreshes if needed
3. Updates database
4. Returns valid token

Always use `getValidAccessToken()` before making API calls to ensure you have a valid token.



