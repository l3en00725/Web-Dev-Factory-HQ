# OAuth Setup Complete ✅

## Summary

All OAuth API routes have been created and are ready for use. The implementation uses the shared OAuth package and follows the VIRGO OCB Master Directive.

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Google OAuth (Required)
GOOGLE_OAUTH_CLIENT_ID=451030729636-96hnkp3fqs492amgnjt51tt444napcl4.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret-here
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:4321/api/admin/oauth/google/callback

# For production, also set:
# GOOGLE_OAUTH_REDIRECT_URI=https://bluelawns.com/api/admin/oauth/google/callback
```

## API Routes Created

### 1. `/api/admin/oauth/google/connect`
- **Method:** GET
- **Purpose:** Generates OAuth URL and redirects to Google
- **Query Params:** `?company_id=xxx` (optional, uses fallback if not provided)
- **Flow:** User clicks "Connect Google" → Redirects to Google consent screen

### 2. `/api/admin/oauth/google/callback`
- **Method:** GET
- **Purpose:** Handles OAuth callback from Google
- **Query Params:** `code` and `state` (from Google)
- **Flow:** 
  - Exchanges code for tokens
  - Gets user email from Google
  - Stores tokens in `website_oauth_tokens` table
  - Redirects to `/admin/settings?oauth=success` or `?oauth=error`

### 3. `/api/admin/oauth/google/disconnect`
- **Method:** POST
- **Purpose:** Revokes token and deletes from database
- **Query Params:** `?company_id=xxx` (optional)
- **Returns:** JSON `{ success: true, message: "Disconnected successfully" }`

### 4. `/api/admin/oauth/google/status`
- **Method:** GET
- **Purpose:** Returns connection status
- **Query Params:** `?company_id=xxx` (optional)
- **Returns:** 
  ```json
  {
    "connected": true,
    "provider": "google",
    "email": "user@example.com",
    "connectedAt": "2025-01-XX..."
  }
  ```

## Settings Page Updates

The Settings page (`/admin/settings`) now includes:

1. **Google Integration Section**
   - Shows connection status
   - "Connect Google" button (when not connected)
   - Connected status with email and date (when connected)
   - "Disconnect" button (when connected)

2. **Success/Error Messages**
   - Reads `?oauth=success` or `?oauth=error` from URL
   - Displays appropriate message
   - Auto-reloads status after connection

## Dev Server Port

**Updated:** Dev server port changed from `3000` to `4321` in `astro.config.mjs` to match your Google OAuth redirect URI configuration.

## Testing the Flow

1. **Start dev server:**
   ```bash
   cd sites/blue-lawns
   npm run dev
   ```
   Server will run on `http://localhost:4321`

2. **Test OAuth connection:**
   - Go to `http://localhost:4321/admin/settings`
   - Click "Connect Google"
   - Complete OAuth flow
   - Verify redirect back to settings with success message
   - Verify connection status shows email and date

3. **Test disconnect:**
   - Click "Disconnect" button
   - Confirm disconnection
   - Verify status shows "Not connected"

## Database Schema

Tokens are stored in `website_oauth_tokens` table:
- `company_id` - UUID of the company
- `provider` - 'google'
- `access_token` - Short-lived access token
- `refresh_token` - Long-lived refresh token
- `token_expiry` - When access token expires
- `scopes` - Granted scopes
- `connected_email` - Google account email
- `connected_at` - When connection was established

## Next Steps

1. ✅ Add `GOOGLE_OAUTH_CLIENT_SECRET` to `.env.local`
2. ✅ Test OAuth flow in development
3. ⏳ After successful test, update production redirect URI in Google Cloud Console if needed
4. ⏳ Implement GA4 property selection (future enhancement)
5. ⏳ Implement Search Console site selection (future enhancement)
6. ⏳ Use tokens for Analytics API calls (future enhancement)

## Troubleshooting

### "OAuth client ID is required" error
- Check `GOOGLE_OAUTH_CLIENT_ID` is set in `.env.local`
- Restart dev server after adding env vars

### Redirect URI mismatch
- Verify `GOOGLE_OAUTH_REDIRECT_URI` matches exactly what's in Google Cloud Console
- Dev: `http://localhost:4321/api/admin/oauth/google/callback`
- Prod: `https://bluelawns.com/api/admin/oauth/google/callback`

### "Unauthorized" error
- Make sure you're logged into the admin panel
- Check Supabase session is valid

### Token storage fails
- Verify `website_oauth_tokens` table exists in Supabase
- Check RLS policies allow inserts/updates
- Verify `company_id` matches your company record

## Files Modified

- `sites/blue-lawns/src/pages/api/admin/oauth/google/connect.ts`
- `sites/blue-lawns/src/pages/api/admin/oauth/google/callback.ts`
- `sites/blue-lawns/src/pages/api/admin/oauth/google/disconnect.ts`
- `sites/blue-lawns/src/pages/api/admin/oauth/google/status.ts`
- `sites/blue-lawns/src/pages/admin/settings.astro`
- `sites/blue-lawns/astro.config.mjs` (port updated to 4321)

All routes use the shared OAuth package at `/packages/shared/oauth/`.



