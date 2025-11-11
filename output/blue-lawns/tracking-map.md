# Pool Lead Tracking & Routing Configuration

**Date:** November 11, 2025
**Page:** /pools landing page
**Lead Type:** Pool Lead

## Lead Routing Flow

```
User submits form on /pools
        ↓
/api/submit-pool-lead
        ↓
    ┌───┴───┐
    ↓       ↓
 Zapier   Resend Email
    ↓       ↓
Jobber   leads@ecoastpools.com
         (CC: info@bluelawns.com)
```

## Hidden Form Fields

All pool lead submissions include these tracking fields:

```javascript
{
  lead_source: "Blue Lawns",
  lead_type: "Pool Lead",
  service_interest: "Pool Maintenance",
  referral_url: "https://www.bluelawns.com/pools",
  timestamp: "2025-11-11T..."
}
```

## Environment Variables Required

### Production `.env` Configuration

```bash
# Pool Lead Routing - Ecoast Pool Service
ECOAST_POOL_EMAIL=leads@ecoastpools.com
ZAPIER_WEBHOOK_URL_POOL=https://hooks.zapier.com/hooks/catch/[YOUR_ID]/[YOUR_HOOK]

# Email Service (Resend)
RESEND_API_KEY=re_[YOUR_KEY]

# Blue Lawns Contact
CONTACT_EMAIL=info@bluelawns.com

# Analytics
GOOGLE_ANALYTICS_ID=G-MSCK89LLJ1
```

### Zapier Webhook Setup

1. **Create Zap:**
   - Trigger: Webhook - Catch Hook
   - Action 1: Jobber - Create Job Request
   - Action 2: Email - Send notification

2. **Webhook URL Pattern:**
   ```
   https://hooks.zapier.com/hooks/catch/[account_id]/[hook_id]
   ```

3. **Data Mapping:**
   - Name → Customer Name
   - Email → Customer Email
   - Phone → Customer Phone
   - Service Type → Service Category
   - Lead Type → Custom Field "Lead Type"
   - Lead Source → Custom Field "Source"

## Email Recipients

### Primary Recipient
- **Email:** leads@ecoastpools.com
- **Purpose:** Ecoast Pool Service lead inbox
- **Expected Response Time:** 24 hours

### CC Recipients
- **Email:** info@bluelawns.com
- **Purpose:** Blue Lawns tracking copy
- **Use:** Analytics and partnership reporting

## Lead Tags & Classification

### Resend Email Tags
```javascript
tags: [
  { name: 'lead_type', value: 'pool' },
  { name: 'source', value: 'blue_lawns' },
  { name: 'city', value: [user_city] }
]
```

### Jobber Custom Fields
- **Lead Type:** "Pool Lead"
- **Source:** "Blue Lawns Website"
- **Landing Page:** "/pools"
- **Service Category:** [Selected service type]

## Phone Call Tracking

### Pool Service Phone Number
```
Primary: 609-425-2954
```

**Call Tracking:**
- Use CallRail or similar for dedicated pool service number
- Forward to: Ecoast Pool Service main line
- Tag calls with: "Blue Lawns - Pool Landing Page"

### Tel Link Format
```html
<a href="tel:609-425-2954">Call 609-425-2954</a>
```

## UTM Parameters

### Outbound Links to Ecoast Site
```
https://ecoastpoolservice.com?utm_source=bluelawns&utm_medium=referral&utm_campaign=pool-landing
```

### Jobber Client Hub Link
```
https://clienthub.getjobber.com/client_hubs/c7073ac4-949a-4ae1-9cee-a723ddb9c5d1/public/work_request/new?source=bluelawns
```

## Form Validation

### Required Fields
- Name (text, required)
- Email (email, required)
- Phone (tel, required)
- City (select, required)

### Optional Fields
- Service Type (select, default: "Weekly Pool Cleaning")
- Message (textarea)

## Success/Error Handling

### Success Response
```json
{
  "success": true,
  "message": "Thank you! Your pool service request has been submitted. We'll contact you within 24 hours.",
  "lead_id": "POOL-1731349200000"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Failed to submit form. Please call us directly at 609-425-2954.",
  "details": "[error message]"
}
```

### User-Facing Messages
- **Success:** Redirect to thank you message or show success banner
- **Error:** Display phone number for immediate contact

## Testing Checklist

### Pre-Launch Tests
- [ ] Submit test form with valid data
- [ ] Verify email received at leads@ecoastpools.com
- [ ] Verify CC received at info@bluelawns.com
- [ ] Check Zapier webhook triggers successfully
- [ ] Confirm lead appears in Jobber
- [ ] Test phone number click (tel: link)
- [ ] Verify all hidden fields captured
- [ ] Test form validation (missing required fields)
- [ ] Test error handling (invalid email)

### Post-Launch Monitoring
- [ ] Monitor first 10 lead submissions
- [ ] Check email delivery rates
- [ ] Verify Zapier success rate
- [ ] Review lead quality and completeness
- [ ] Track response times from Ecoast
- [ ] Monitor phone call volume

## Analytics & Reporting

### Google Analytics Events
```javascript
// Form submission event
gtag('event', 'form_submit', {
  'form_name': 'pool_service_request',
  'lead_type': 'pool',
  'value': 1
});

// Phone click event
gtag('event', 'phone_click', {
  'phone_number': '609-425-2954',
  'lead_type': 'pool'
});
```

### Key Metrics to Track
1. **Form Submissions:** Total pool lead forms submitted
2. **Conversion Rate:** Visitors → Form Submissions
3. **Email Delivery Rate:** Forms submitted → Emails delivered
4. **Response Time:** Form submission → First contact
5. **Close Rate:** Leads → Booked services
6. **Revenue Attribution:** Pool leads → Revenue generated

## Lead Scoring

### High-Priority Leads
- Service Type: "Weekly Pool Cleaning", "Year-round Care"
- City: Avalon, Stone Harbor (high-value areas)
- Message length: >50 characters (detailed inquiry)

### Medium-Priority Leads
- Service Type: "Pool Opening/Closing", "Equipment Care"
- City: Other Cape May County cities
- Message: Brief or standard inquiry

### Follow-Up Recommendations
- **High Priority:** Contact within 4 hours
- **Medium Priority:** Contact within 24 hours
- **All Leads:** Follow up within 48 hours maximum

## Troubleshooting

### Common Issues

**Issue:** Emails not being received
- **Check:** RESEND_API_KEY is valid
- **Check:** Email addresses are correct
- **Check:** Resend domain verified

**Issue:** Zapier not triggering
- **Check:** ZAPIER_WEBHOOK_URL_POOL is set
- **Check:** Webhook URL is correct
- **Check:** Zap is turned on

**Issue:** Form submission fails
- **Check:** API route is deployed
- **Check:** All required environment variables set
- **Check:** Server logs for error details

### Support Contacts
- **Technical Issues:** Web developer
- **Ecoast Pool Service:** [Contact information]
- **Blue Lawns:** info@bluelawns.com

---

## Summary

✅ Pool landing page created with Ecoast branding
✅ Form routes to leads@ecoastpools.com
✅ Hidden fields tag leads as "Pool Lead" from "Blue Lawns"
✅ Multiple routing methods (Email + Zapier + Jobber)
✅ Phone tracking number implemented
✅ Analytics and conversion tracking ready

**Next Steps:**
1. Configure production environment variables
2. Set up Zapier webhook
3. Test form end-to-end
4. Train Ecoast team on lead handling
5. Monitor first week of leads closely

---

*Last Updated: November 11, 2025*
*Documentation for Blue Lawns /pools landing page*

---

## 🤖 Automated Integration Setup

**Status:** ✅ Code Complete | ⏳ Configuration Pending

### Integration Scripts Created

Three automated tools have been created to streamline the Zapier → Jobber integration:

#### 1. Setup Guide (`integrations/zapier/SETUP-GUIDE.md`)
Comprehensive step-by-step guide for:
- Creating Zapier webhook
- Configuring Jobber integration
- Setting up email notifications
- Testing end-to-end flow
- Production deployment checklist

#### 2. Test Script (`integrations/zapier/testWebhook.js`)
Automated testing tool that:
- Validates environment configuration
- Sends test payload to Zapier webhook
- Verifies webhook connection
- Logs test results
- Provides troubleshooting guidance

**Usage:**
```bash
bun run integrations/zapier/testWebhook.js
```

#### 3. Quick Start Script (`integrations/zapier/quickstart.sh`)
Interactive setup assistant that:
- Checks environment configuration
- Creates .env file from template
- Validates required variables
- Runs webhook test automatically
- Provides next steps guidance

**Usage:**
```bash
bash integrations/zapier/quickstart.sh
```

### Configuration Mapping

All integration details documented in:
```
integrations/config/zapier-map.json
```

This includes:
- Webhook configuration
- Field mappings
- Destination services
- Tracking fields
- Monitoring targets
- Status tracking

### Required Next Steps

**⏳ Manual Configuration Required:**

Zapier does not provide a public API for creating Zaps programmatically. The following must be done manually:

1. **Create Zapier Account** (if not exists)
   - Sign up at: https://zapier.com/sign-up
   - Free plan supports this integration

2. **Create Webhook Zap**
   - Follow: `integrations/zapier/SETUP-GUIDE.md`
   - Estimated time: 15-20 minutes
   - Steps:
     - Create trigger: Webhooks by Zapier → Catch Hook
     - Copy webhook URL to .env
     - Configure action: Jobber → Create Client Request
     - Map all fields per guide
     - Add email notification (optional)
     - Turn ON the Zap

3. **Configure Environment Variables**
   - Local: Copy `env.template` to `.env`
   - Production: Add to Vercel dashboard
   - Required:
     - `ZAPIER_WEBHOOK_URL_POOL`
     - `ECOAST_POOL_EMAIL`
     - `RESEND_API_KEY`
     - `CONTACT_EMAIL`

4. **Test Integration**
   - Run: `bun run integrations/zapier/testWebhook.js`
   - Verify webhook receives data in Zapier
   - Complete Zap configuration
   - Test form on /pools page
   - Verify lead appears in Jobber

### Integration Status

| Component | Status | Notes |
|-----------|--------|-------|
| API Endpoint | ✅ Complete | `/api/submit-pool-lead.js` |
| Form Page | ✅ Complete | `/pools.astro` |
| Test Script | ✅ Complete | `testWebhook.js` |
| Setup Guide | ✅ Complete | 600+ lines of documentation |
| Quick Start | ✅ Complete | Interactive shell script |
| Config Map | ✅ Complete | JSON schema for integration |
| Env Template | ✅ Complete | `env.template` |
| Zapier Webhook | ⏳ Pending | Manual setup required |
| Jobber Config | ⏳ Pending | After Zapier setup |
| End-to-End Test | ⏳ Pending | After configuration |

### Estimated Time to Complete

- **Zapier Setup:** 15-20 minutes
- **Environment Config:** 5 minutes
- **Testing & Verification:** 10 minutes
- **Total:** ~30-35 minutes

### Support Resources

**Documentation:**
- `integrations/zapier/SETUP-GUIDE.md` - Complete setup walkthrough
- `integrations/config/zapier-map.json` - Integration specifications
- `output/blue-lawns/tracking-map.md` - This document

**Scripts:**
- `integrations/zapier/testWebhook.js` - Test webhook connection
- `integrations/zapier/quickstart.sh` - Interactive setup

**External Resources:**
- [Zapier Help Center](https://help.zapier.com/)
- [Jobber API Docs](https://developer.getjobber.com/)
- [Resend Documentation](https://resend.com/docs)

---

**Next Action:** Follow `integrations/zapier/SETUP-GUIDE.md` to configure Zapier webhook

*Automated setup tools created: November 11, 2025*

---

## ✅ Webhook Configured & Tested

**Date:** November 11, 2025  
**Status:** ACTIVE ✅  
**Webhook URL:** `https://hooks.zapier.com/hooks/catch/4454012/u86hwqk/`

### Test Results

**Test Performed:** November 11, 2025  
**Method:** Direct HTTP POST with test payload  
**Result:** ✅ SUCCESS

**Response:**
```json
{
  "attempt": "019a7467-a3e7-2c98-b140-1c6cf76ddf0e",
  "id": "019a7467-a3e7-2c98-b140-1c6cf76ddf0e",
  "request_id": "019a7467-a3e7-2c98-b140-1c6cf76ddf0e",
  "status": "success"
}
```

**Test Payload Sent:**
- Name: Test User
- Email: test@example.com
- Phone: 609-555-0123
- City: Cape May
- Service: Weekly Pool Cleaning
- Lead Type: Pool Lead
- Lead Source: Blue Lawns
- Test Mode: true

### Next Steps

1. ✅ Webhook configured and responding
2. ⏳ Check Zapier dashboard for test data: https://zapier.com/app/history
3. ⏳ Configure Jobber action in Zapier (see SETUP-GUIDE.md)
4. ⏳ Add environment variables to Vercel dashboard
5. ⏳ Test live form submission at /pools page
6. ⏳ Monitor first 10 real leads

### Vercel Environment Variables Needed

Add these to your Vercel dashboard (Project Settings → Environment Variables):

```bash
ZAPIER_WEBHOOK_URL_POOL=https://hooks.zapier.com/hooks/catch/4454012/u86hwqk/
ECOAST_POOL_EMAIL=leads@ecoastpools.com
RESEND_API_KEY=<your_resend_key>
CONTACT_EMAIL=info@bluelawns.com
```

**Important:** Set for all environments (Production, Preview, Development)
