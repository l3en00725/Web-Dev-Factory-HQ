# Zapier → Jobber Integration Setup Guide

**Date:** November 11, 2025  
**Site:** Blue Lawns  
**Lead Type:** Pool Service Leads → Ecoast Pool Service

---

## 🎯 Overview

This guide walks you through creating a Zapier webhook integration that automatically routes pool service leads from the Blue Lawns website to Jobber CRM and sends email notifications to Ecoast Pool Service.

**Integration Flow:**
```
Blue Lawns /pools form
        ↓
/api/submit-pool-lead.js
        ↓
Zapier Webhook (Catch Hook)
        ↓
    ┌───┴────┐
    ↓        ↓
Jobber CRM   Email Notification
(Create       (to Ecoast Pools)
 Client
 Request)
```

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] Active Zapier account (Free or paid plan)
- [ ] Active Jobber account with API access
- [ ] Ecoast Pool Service email address
- [ ] Blue Lawns site deployed or running locally
- [ ] Access to environment variable configuration (Vercel dashboard or local .env)

---

## 🔧 Step 1: Create the Zapier Webhook

### 1.1 Log into Zapier

1. Go to [https://zapier.com/app/zaps](https://zapier.com/app/zaps)
2. Click **"+ Create Zap"** button (top right)

### 1.2 Set Up Trigger: Webhooks by Zapier

1. **Choose App & Event:**
   - Search for: `Webhooks by Zapier`
   - Choose trigger event: **"Catch Hook"**
   - Click **Continue**

2. **Configure Webhook:**
   - Zapier will generate a unique webhook URL
   - **COPY THIS URL** - you'll need it for your `.env` file
   - Example format: `https://hooks.zapier.com/hooks/catch/12345678/abcd123/`
   - Click **Continue**

3. **Test the Trigger:**
   - Leave this tab open - we'll test it after environment setup
   - Continue to the next step

---

## 🔧 Step 2: Configure Environment Variables

### 2.1 Create Local `.env` File

1. Navigate to your project root:
   ```bash
   cd /Users/benjaminhaberman/Web-Dev-Factory-HQ
   ```

2. Copy the template:
   ```bash
   cp .env.template .env
   ```

3. Open `.env` in your editor and fill in these required values:
   ```bash
   # REQUIRED: Paste the webhook URL from Step 1.2
   ZAPIER_WEBHOOK_URL_POOL=https://hooks.zapier.com/hooks/catch/YOUR_ID/YOUR_HOOK
   
   # REQUIRED: Ecoast Pool Service email
   ECOAST_POOL_EMAIL=leads@ecoastpools.com
   
   # REQUIRED: Resend API key (get from https://resend.com/api-keys)
   RESEND_API_KEY=re_YOUR_API_KEY_HERE
   
   # REQUIRED: Blue Lawns contact email
   CONTACT_EMAIL=info@bluelawns.com
   ```

4. Save the file

### 2.2 Configure Vercel Environment Variables

If deploying to production via Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Blue Lawns project
3. Navigate to: **Settings → Environment Variables**
4. Add the following variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `ZAPIER_WEBHOOK_URL_POOL` | `https://hooks.zapier.com/hooks/catch/...` | Production, Preview, Development |
   | `ECOAST_POOL_EMAIL` | `leads@ecoastpools.com` | Production, Preview, Development |
   | `RESEND_API_KEY` | `re_YOUR_KEY` | Production, Preview, Development |
   | `CONTACT_EMAIL` | `info@bluelawns.com` | Production, Preview, Development |

5. Click **Save** for each variable

---

## 🔧 Step 3: Test the Webhook Connection

### 3.1 Run the Test Script

1. From your project root, run:
   ```bash
   bun run integrations/zapier/testWebhook.js
   ```

2. The script will send a test payload to your webhook URL

3. **Expected Output:**
   ```
   ✓ Webhook test successful!
   Status: 200
   Response: {"status": "success"}
   ```

### 3.2 Verify in Zapier

1. Return to your Zapier tab (from Step 1.2)
2. Click **"Test trigger"** button
3. You should see the test data appear:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "phone": "609-555-0123",
     "city": "Cape May",
     "lead_type": "Pool Lead",
     "lead_source": "Blue Lawns",
     "service_interest": "Pool Maintenance"
   }
   ```
4. Click **Continue**

---

## 🔧 Step 4: Set Up Action - Jobber Integration

### 4.1 Connect Jobber

1. **Choose App & Event:**
   - Search for: `Jobber`
   - Choose action event: **"Create Client Request"** (or "Create Job" if preferred)
   - Click **Continue**

2. **Connect Jobber Account:**
   - Click **"Sign in to Jobber"**
   - Authorize Zapier to access your Jobber account
   - Click **Continue**

### 4.2 Map Form Fields to Jobber

Configure the following field mappings:

| Jobber Field | Zapier Field (from webhook) | Example |
|--------------|----------------------------|---------|
| **First Name** | Split "Name" (first part) | `Test` |
| **Last Name** | Split "Name" (last part) | `User` |
| **Email** | `Email` | `test@example.com` |
| **Phone** | `Phone` | `609-555-0123` |
| **Address/City** | `City` | `Cape May` |
| **Service Address** | `City` + ", NJ" | `Cape May, NJ` |
| **Request Details** | `Message` | (form message) |
| **Custom Field: Lead Type** | `Lead Type` | `Pool Lead` |
| **Custom Field: Source** | `Lead Source` | `Blue Lawns` |
| **Custom Field: Service** | `Service Interest` | `Pool Maintenance` |
| **Tags** | Static: `Blue Lawns`, `Pool Lead` | |

**Pro Tip:** Use Zapier's **Formatter** step to split the full name into first/last if needed.

### 4.3 Test the Jobber Action

1. Click **"Test action"**
2. Zapier will create a test client request in Jobber
3. **Verify in Jobber:**
   - Go to your Jobber dashboard
   - Navigate to: **Clients → Client Requests**
   - Confirm the test entry appears with correct data
4. Click **Continue**

---

## 🔧 Step 5: Add Email Notification (Optional but Recommended)

### 5.1 Add Another Action

1. Click **"+ Add Another Action"** button
2. Search for: `Email by Zapier`
3. Choose action: **"Send Outbound Email"**
4. Click **Continue**

### 5.2 Configure Email

| Field | Value |
|-------|-------|
| **To** | `leads@ecoastpools.com` |
| **From** | `noreply@bluelawns.com` (or your verified sender) |
| **Subject** | `🏊 New Pool Lead from Blue Lawns - {{City}}` |
| **Body** | Use the template below |

**Email Body Template:**
```
New Pool Service Inquiry from Blue Lawns Website

═══════════════════════════════════════
LEAD INFORMATION
═══════════════════════════════════════

Name: {{Name}}
Email: {{Email}}
Phone: {{Phone}}
City: {{City}}
Service Requested: {{Service Interest}}

═══════════════════════════════════════
MESSAGE
═══════════════════════════════════════

{{Message}}

═══════════════════════════════════════
TRACKING INFORMATION
═══════════════════════════════════════

Lead Source: {{Lead Source}}
Lead Type: {{Lead Type}}
Referral URL: {{Referral URL}}
Timestamp: {{Timestamp}}

═══════════════════════════════════════
NEXT STEPS
═══════════════════════════════════════

1. Contact the customer within 24 hours
2. This lead has been automatically added to Jobber
3. View in Jobber: [Link to Jobber dashboard]

This lead came from the Blue Lawns pool service landing page.
```

### 5.3 Test Email Action

1. Click **"Test action"**
2. Check that test email is received at `leads@ecoastpools.com`
3. Click **Continue**

---

## 🔧 Step 6: Name and Activate Zap

### 6.1 Name Your Zap

1. Click on "Untitled Zap" at the top
2. Rename to: **"Blue Lawns Pool Leads → Jobber + Email"**

### 6.2 Turn On the Zap

1. Click **"Publish"** button (top right)
2. Confirm the Zap is now **ON** (toggle should be green)

---

## 🧪 Step 7: End-to-End Testing

### 7.1 Test via Live Form

1. Navigate to: `http://localhost:4321/pools` (or your production URL)
2. Fill out the pool service request form with test data:
   - Name: `John Test`
   - Email: `john@test.com`
   - Phone: `609-555-1234`
   - City: `Cape May`
   - Service: `Weekly Pool Cleaning`
   - Message: `This is a test submission`
3. Click **Submit**

### 7.2 Verify Success

Check all three destinations:

**✅ 1. Form Response**
- Should see success message: "Thank you! Your pool service request has been submitted."

**✅ 2. Zapier Dashboard**
- Go to: [Zapier Task History](https://zapier.com/app/history)
- Confirm task shows as **Success**
- Check execution time (should be < 5 seconds)

**✅ 3. Jobber**
- Go to: **Clients → Client Requests**
- Confirm new entry for "John Test" appears
- Verify all custom fields populated correctly

**✅ 4. Email**
- Check inbox: `leads@ecoastpools.com`
- Confirm email received with all form data
- Check CC: `info@bluelawns.com` also received

### 7.3 Troubleshooting Failed Tests

**If form submission fails:**
```bash
# Check server logs
cd sites/blue-lawns
bun run dev

# Check console for errors
# Look for: "Pool lead submission error"
```

**If Zapier doesn't trigger:**
- Verify webhook URL in `.env` matches Zapier exactly
- Check Zapier Task History for error details
- Ensure Zap is turned ON

**If Jobber doesn't create request:**
- Check Jobber API connection status in Zapier
- Verify field mappings are correct
- Check Jobber permissions (API access enabled)

---

## 📊 Step 8: Monitor & Validate

### 8.1 First 10 Leads

Monitor the first 10 real leads closely:

1. **Check Zapier Task History daily:**
   - URL: [https://zapier.com/app/history](https://zapier.com/app/history)
   - Look for any failed tasks
   - Review error messages

2. **Verify Jobber data quality:**
   - Ensure all fields populated correctly
   - Check for duplicate entries
   - Verify lead tagging is consistent

3. **Track response times:**
   - From form submission → Email received
   - From lead received → First contact
   - Target: < 24 hours

### 8.2 Set Up Zapier Alerts

1. In Zapier, go to: **Settings → Notifications**
2. Enable: **"Zap Errors"** (get notified if Zap fails)
3. Set alert email to: `info@bluelawns.com`

---

## 📈 Success Metrics

Track these KPIs for the integration:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Webhook Success Rate** | ≥ 99% | Zapier Task History |
| **Email Delivery Rate** | ≥ 98% | Email service logs |
| **Jobber Creation Rate** | 100% | Manual verification |
| **Average Response Time** | < 24h | Jobber activity logs |
| **Lead Conversion Rate** | 3-5% | Jobber closed jobs |

---

## 🔒 Security Best Practices

1. **Never commit webhook URLs to Git:**
   - Always use environment variables
   - Add `.env` to `.gitignore`

2. **Rotate webhook URLs periodically:**
   - Every 6-12 months
   - Update `.env` and Vercel accordingly

3. **Limit webhook access:**
   - Only share with authorized team members
   - Use Zapier's IP allowlist if available

4. **Monitor for abuse:**
   - Check Zapier task volume
   - Set up rate limiting in Astro API route if needed

---

## 📝 Maintenance Checklist

### Weekly
- [ ] Check Zapier Task History for errors
- [ ] Verify email delivery rate
- [ ] Review Jobber lead quality

### Monthly
- [ ] Validate all field mappings still correct
- [ ] Check for Zapier/Jobber API changes
- [ ] Review lead conversion metrics
- [ ] Update documentation if workflow changes

### Quarterly
- [ ] Review webhook security
- [ ] Optimize Zap steps if possible
- [ ] Test full integration end-to-end
- [ ] Train new team members on system

---

## 🆘 Support & Resources

### Zapier Resources
- [Zapier Help Center](https://help.zapier.com/)
- [Webhooks by Zapier Documentation](https://zapier.com/apps/webhook/help)
- [Jobber Integration Guide](https://zapier.com/apps/jobber/integrations)

### Project Resources
- **Test Script:** `/integrations/zapier/testWebhook.js`
- **API Route:** `/sites/blue-lawns/src/pages/api/submit-pool-lead.js`
- **Tracking Documentation:** `/output/blue-lawns/tracking-map.md`

### Contact
- **Technical Issues:** Web development team
- **Zapier Account:** [Account owner email]
- **Jobber Support:** [support@getjobber.com](mailto:support@getjobber.com)

---

## ✅ Setup Complete!

Once you've completed all steps above, your integration is live and ready to route pool service leads from Blue Lawns to Ecoast Pool Service via Jobber.

**Next Steps:**
1. Monitor first 10 leads closely
2. Train Ecoast team on Jobber workflow
3. Set up performance dashboard
4. Document any issues or improvements needed

---

*Last Updated: November 11, 2025*  
*Version: 1.0*  
*Integration: Blue Lawns → Zapier → Jobber*

