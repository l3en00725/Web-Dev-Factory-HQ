# Generic Contact Form (No Integration)

## Purpose

Placeholder form that collects data but doesn't integrate with any service yet.

Use this when:
- Client hasn't decided on CRM yet
- Building MVP to collect leads manually
- Will add integration later
- Testing form functionality without external dependencies

## Current Behavior

- Form collects: name, email, phone, service type, message
- Logs submission to server console
- Returns success message to user
- **Does NOT:**
  - Send emails
  - Create CRM records
  - Store data persistently

## Installation

```bash
bun run install-form --site your-site --type generic
```

No environment variables required.

## To Add Integration Later

### Option 1: Upgrade to Email Notifications

1. Run installation script again:
   ```bash
   bun run install-form --site your-site --type email-resend
   ```
2. This will replace `submit-form.js` with email integration
3. Add Resend API key to `.env`

### Option 2: Upgrade to Jobber + Zapier

1. Run installation script again:
   ```bash
   bun run install-form --site your-site --type jobber-zapier
   ```
2. Set up Zapier webhook (see jobber-zapier README)
3. Add credentials to `.env`

### Option 3: Custom Integration

Edit `src/pages/api/submit-form.js` and add your own logic:

**Example: Send to Custom Webhook**

```javascript
await fetch('https://your-custom-webhook.com/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

**Example: Save to Supabase**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
);

await supabase.from('contact_submissions').insert({
  name: data.name,
  email: data.email,
  phone: data.phone,
  service_type: data.service_type,
  message: data.message,
  submitted_at: new Date().toISOString()
});
```

**Example: Send to Slack**

```javascript
await fetch(import.meta.env.SLACK_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: `New contact form submission from ${data.name}`,
    blocks: [
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${data.name}` },
          { type: 'mrkdwn', text: `*Email:*\n${data.email}` },
          { type: 'mrkdwn', text: `*Phone:*\n${data.phone}` },
          { type: 'mrkdwn', text: `*Service:*\n${data.service_type || 'Not specified'}` }
        ]
      }
    ]
  })
});
```

## When to Use

✅ Building MVP quickly  
✅ Client undecided on CRM  
✅ Testing form before launching  
✅ Will add integration in Phase 2

❌ Don't use for production without adding integration  
❌ Don't use if client needs immediate lead notifications

