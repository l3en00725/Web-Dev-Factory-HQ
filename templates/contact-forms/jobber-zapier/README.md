# Jobber Integration via Zapier (RECOMMENDED)

## Why Zapier?

Jobber uses OAuth 2.0 authentication which is complex:
- Requires Client ID + Client Secret
- Tokens expire every 2 hours
- Needs token refresh logic

**Zapier handles all OAuth complexity automatically.**

Plus, this template includes email backup via Resend, so you get notifications even if Zapier is down.

## Setup Instructions

### 1. Create Zapier Account

Sign up at [zapier.com](https://zapier.com) (or use [Make.com](https://make.com) for a cheaper alternative)

### 2. Create New Zap

**Trigger: Webhooks by Zapier**
1. Choose "Catch Hook"
2. Copy your webhook URL: `https://hooks.zapier.com/hooks/catch/123456/abcdef/`
3. Test by sending sample data

**Action: Jobber → Create Client Request**
1. Connect your Jobber account (Zapier handles OAuth automatically)
2. Map fields:
   - **First Name:** Use Formatter → Split `name` by space (first part)
   - **Last Name:** Use Formatter → Split `name` by space (remaining parts)
   - **Email:** `email`
   - **Phone:** `phone`
   - **Request Details:** 
     ```
     Service: {{service_type}}
     
     {{message}}
     ```
3. Turn on Zap

### 3. Set Up Resend (Email Backup)

1. Sign up at [resend.com](https://resend.com) (100 emails/day free)
2. Verify your domain (or use `resend.dev` for testing)
3. Create an API key

### 4. Add Environment Variables

Add to your site's `.env` file:

```bash
# Jobber Zapier Integration
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/123456/abcdef/
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=owner@clientbusiness.com
```

### 5. Test

1. Submit a test form on your site
2. Check Zapier task history → should show "Success"
3. Check Jobber → should see new client request
4. Check email inbox → should receive notification with Quick Actions

## How It Works

### Dual Integration

1. **Primary:** Form data → Zapier webhook → Jobber (creates client request)
2. **Backup:** Form data → Resend → Email notification to business owner

If Zapier fails, email still goes through. Email includes note about Zapier status.

### Email Features

- Click-to-call link for phone
- Click-to-email reply link
- Service type highlighted
- Zapier success/failure indicator
- Timestamp

## Cost

- **Zapier Starter:** $29.99/month (750 tasks) - covers ~25 forms/day
- **Resend Free Tier:** 100 emails/day, 3,000/month
- **Make.com alternative:** $9/month (10,000 operations) - same functionality

## When to Use

✅ Client uses Jobber for service management  
✅ Want reliable, maintained integration  
✅ Non-technical client (they can edit Zap themselves)  
✅ Need backup notification system  
✅ Want to add extra actions later (Slack, Google Sheets, etc.)

## Troubleshooting

**Forms not reaching Jobber:**
1. Check Zapier task history for errors
2. Verify webhook URL is correct in `.env`
3. Test webhook directly: `curl -X POST [webhook-url] -d '{"test":"data"}'`

**Email not sending:**
1. Verify Resend API key is correct
2. Check domain verification in Resend dashboard
3. Look for errors in server logs

**Both failing:**
1. Check `.env` file is loaded properly
2. Verify environment variables in hosting platform (Vercel, etc.)
3. Check console for error messages

