# 🔐 Botpress Credentials

**Status:** ✅ Token Stored  
**Date:** November 11, 2025

---

## Stored Credentials

### Personal Access Token (PAT)
- **Locations:** 
  - ✅ `/sites/blue-lawns/.env` (site-specific)
  - ✅ `/.env` (root/project-wide)
- **Variable Name:** `BOTPRESS_PAT`
- **Token Value:** `[STORED IN .ENV - NOT COMMITTED]`
- **Status:** ✅ Configured in both locations
- **Security:** ✅ Both files are in `.gitignore` (will NOT be committed)

---

## Usage

The token is automatically loaded from the `.env` file when the application runs. 

### Accessing in Code (if needed)

```javascript
// In Node.js/server-side code
const botpressToken = process.env.BOTPRESS_PAT;

// Make authenticated API calls
fetch('https://api.botpress.cloud/v1/...', {
  headers: {
    'Authorization': `Bearer ${botpressToken}`,
    'Content-Type': 'application/json'
  }
})
```

### Accessing in Astro (if needed)

```astro
---
const botpressToken = import.meta.env.BOTPRESS_PAT;
---
```

---

## Security Notes

✅ **DO:**
- Keep the `.env` file in `.gitignore`
- Never commit tokens to version control
- Rotate tokens if they are exposed
- Use environment variables for deployment (Vercel, Netlify)

❌ **DON'T:**
- Share tokens in chat, email, or documents
- Commit `.env` file to Git
- Expose tokens in client-side code
- Use the same token across multiple environments

---

## Deployment

For production deployment, add the token to your hosting platform:

### Vercel
```bash
vercel env add BOTPRESS_PAT
# Paste token when prompted
```

### Netlify
1. Go to Site Settings → Environment Variables
2. Add `BOTPRESS_PAT` with your token value

### Other Platforms
Consult your hosting provider's documentation for adding environment variables.

---

## Token Management

### Rotating Token
If the token needs to be rotated:
1. Generate new token in Botpress Cloud dashboard
2. Update `.env` file
3. Update production environment variables
4. Redeploy application

### Revoking Token
To revoke the token:
1. Go to Botpress Cloud dashboard
2. Navigate to Settings → Personal Access Tokens
3. Revoke the token
4. Generate a new one if needed

---

## Additional Configuration

If you need to store additional Botpress credentials, add them to `.env`:

```bash
# Botpress Configuration
BOTPRESS_PAT=bp_pat_ioxVfUcssAidPfLey5FucJXYV5BiOohv71Fs
BOTPRESS_BOT_ID=your-bot-id-here
BOTPRESS_WORKSPACE_ID=your-workspace-id-here
BOTPRESS_WEBHOOK_URL=your-webhook-url-here
```

---

**⚠️ IMPORTANT:** This token provides access to your Botpress account. Keep it secure!

