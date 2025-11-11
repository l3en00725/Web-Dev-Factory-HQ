# Email via Resend (No CRM)

## When to Use

✅ Client doesn't use any CRM  
✅ Just needs email notifications  
✅ Budget-conscious (<100 emails/day free)  
✅ Simple workflow (no automation needed)

## Setup Instructions

### 1. Sign Up for Resend

Go to [resend.com](https://resend.com) and create an account.

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for small business contact forms

### 2. Verify Your Domain

**Option A: Production Domain (Recommended)**

1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., `clientbusiness.com`)
3. Add DNS records (TXT, MX, CNAME) provided by Resend
4. Wait for verification (usually 5-15 minutes)
5. Once verified, you can send from `website@clientbusiness.com`

**Option B: Testing with resend.dev (Quick Start)**

1. Skip domain verification
2. Send from `onboarding@resend.dev`
3. **Note:** Some email providers may flag as spam
4. Use for development only

### 3. Create API Key

1. In Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Name it (e.g., "Client Website Contact Form")
4. Select permissions: "Sending access"
5. Copy the key (starts with `re_`)

### 4. Add Environment Variables

Add to your site's `.env` file:

```bash
# Email via Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=owner@clientbusiness.com
```

**Variables:**
- `RESEND_API_KEY`: Your Resend API key
- `CONTACT_EMAIL`: Where form submissions should be sent

### 5. Update "From" Address

Edit `submit-form.js` and change:

```javascript
from: 'website@yourdomain.com',
```

To your verified domain:

```javascript
from: 'website@clientbusiness.com',
```

Or use resend.dev for testing:

```javascript
from: 'onboarding@resend.dev',
```

### 6. Test

1. Submit a test form
2. Check email inbox at `CONTACT_EMAIL`
3. Verify email includes:
   - Contact details
   - Quick action links (call, email)
   - Service type
   - Message

## Email Features

The notification email includes:

- **Contact Information:** Name, email, phone, service type
- **Quick Actions:**
  - Click-to-call phone link
  - Click-to-reply email link
  - Service type highlighted
- **Message:** Full message content
- **Timestamp:** When form was submitted

## Cost

- **Free Tier:** 100 emails/day, 3,000/month (perfect for most small businesses)
- **Paid Plans:** Start at $20/month for 50,000 emails

## Troubleshooting

**Email not arriving:**
1. Check spam/junk folder
2. Verify `CONTACT_EMAIL` is correct in `.env`
3. Check Resend dashboard logs for errors
4. Verify domain is verified (or using resend.dev)

**"Invalid API key" error:**
1. Verify `RESEND_API_KEY` is correct in `.env`
2. Check API key hasn't been revoked in Resend dashboard
3. Ensure `.env` is loaded properly

**Emails flagged as spam:**
1. Verify domain (don't use resend.dev in production)
2. Add SPF, DKIM, DMARC records as instructed by Resend
3. Use professional email copy (avoid spam trigger words)

## Alternative: SendGrid

If client prefers SendGrid over Resend, both services are similar. Resend is generally:
- Easier to set up
- Better developer experience
- More generous free tier

