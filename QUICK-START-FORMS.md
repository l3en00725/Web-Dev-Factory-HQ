# Contact Forms Quick Start Guide

## 🚀 30-Second Setup

### For Jobber Users
```bash
bun run install-form --site your-site --type jobber-zapier
```
Then:
1. Create Zapier webhook → Jobber
2. Sign up for Resend (email backup)
3. Add credentials to `.env`

### For Everyone Else
```bash
bun run install-form --site your-site --type email-resend
```
Then:
1. Sign up at resend.com
2. Verify domain
3. Add API key to `.env`

---

## 📋 Decision Matrix

| If client... | Use template | Monthly cost |
|--------------|--------------|--------------|
| Uses Jobber | `jobber-zapier` | $30 (Zapier) |
| No CRM, just email | `email-resend` | $0 (free tier) |
| Undecided | `generic` | $0 |

---

## 🎯 Installation Steps

### Step 1: Install Form
```bash
bun run install-form --site your-site
```
Choose form type when prompted.

### Step 2: Add to Page
```astro
---
import ContactForm from '@/components/ContactForm.astro';
---

<ContactForm />
```

### Step 3: Configure .env
```bash
# For jobber-zapier:
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/...
RESEND_API_KEY=re_xxxxx
CONTACT_EMAIL=owner@business.com

# For email-resend:
RESEND_API_KEY=re_xxxxx
CONTACT_EMAIL=owner@business.com

# For generic:
# No config needed
```

### Step 4: Test
```bash
cd sites/your-site
bun run dev
```
Submit test form, verify email/Jobber.

---

## 🔧 Environment Variables

### Jobber + Zapier
```bash
ZAPIER_WEBHOOK_URL=   # From Zapier "Catch Hook" trigger
RESEND_API_KEY=       # From resend.com dashboard
CONTACT_EMAIL=        # Where emails are sent
```

### Email Only
```bash
RESEND_API_KEY=       # From resend.com dashboard
CONTACT_EMAIL=        # Where emails are sent
```

### Generic
No environment variables required (placeholder form).

---

## 📧 Email Features

All email templates include:

**Quick Actions Box:**
- 📞 Click-to-call phone link
- ✉️ Click-to-reply email link
- Service type highlighted

**Email Content:**
- Contact details (name, email, phone)
- Service requested
- Message
- Timestamp
- Zapier success indicator (jobber-zapier only)

---

## 🎨 Customization

### Change Form Fields
Edit: `sites/your-site/src/components/ContactForm.astro`

```astro
<!-- Add custom field -->
<div>
  <label for="budget" class="block text-sm font-medium mb-2 text-gray-700">
    Budget Range
  </label>
  <select id="budget" name="budget" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
    <option value="under-5k">Under $5,000</option>
    <option value="5k-10k">$5,000 - $10,000</option>
    <option value="over-10k">Over $10,000</option>
  </select>
</div>
```

### Change Email Template
Edit: `sites/your-site/src/pages/api/submit-form.js`

Update the `emailHtml` string with your custom HTML.

---

## 🔄 Upgrade Path

### Generic → Email
```bash
bun run install-form --site your-site --type email-resend
```
Replaces `submit-form.js`, adds credentials to `.env`.

### Generic → Jobber
```bash
bun run install-form --site your-site --type jobber-zapier
```
Replaces `submit-form.js`, adds credentials to `.env`.

### Email → Jobber
```bash
bun run install-form --site your-site --type jobber-zapier
```
Adds Zapier webhook, keeps existing Resend config.

---

## 🆘 Troubleshooting

### "Form submits but nothing happens"
1. Check browser console for errors
2. Verify `.env` loaded: `console.log(import.meta.env.RESEND_API_KEY)`
3. Check API route exists: `ls src/pages/api/submit-form.js`

### "Email not received"
1. Check spam folder
2. Verify domain verified in Resend dashboard
3. Check Resend logs: resend.com → Logs
4. Test with curl:
   ```bash
   curl -X POST http://localhost:4321/api/submit-form \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","phone":"555-555-5555"}'
   ```

### "Zapier not triggering"
1. Check Zapier task history: zapier.com → Tasks
2. Verify webhook URL correct in `.env`
3. Test webhook directly:
   ```bash
   curl -X POST "your-zapier-webhook-url" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com"}'
   ```

---

## 💰 Pricing Summary

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Resend** | 100 emails/day | $20/mo for 50k |
| **Zapier** | 100 tasks/month (free trial) | $30/mo for 750 tasks |
| **Make.com** (Zapier alt) | 1,000 operations/mo | $9/mo for 10k ops |

**Recommendation:** Start with email-resend (free), upgrade to Zapier only if client uses Jobber.

---

## 📚 More Info

- **Full Decision Guide:** `templates/contact-forms/DECISION-GUIDE.md`
- **Implementation Details:** `IMPLEMENTATION-SUMMARY.md`
- **Template READMEs:** `templates/contact-forms/[type]/README.md`

