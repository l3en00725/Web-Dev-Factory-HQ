# ⚡ Zapier Integration - Quick Start Card

**Blue Lawns → Ecoast Pool Service Lead Routing**

---

## 🚀 30-Minute Setup

### Prerequisites
- [ ] Zapier account (free tier OK)
- [ ] Jobber account with API access
- [ ] Resend API key ([get here](https://resend.com/api-keys))

---

## Step 1: Run Quick Start (2 min)

```bash
cd /Users/benjaminhaberman/Web-Dev-Factory-HQ
bash integrations/zapier/quickstart.sh
```

This will:
- ✓ Create .env from template
- ✓ Validate configuration
- ✓ Run automated tests

---

## Step 2: Create Zapier Webhook (15-20 min)

1. **Go to:** https://zapier.com/app/zaps
2. **Click:** "+ Create Zap"
3. **Trigger Setup:**
   - App: "Webhooks by Zapier"
   - Event: "Catch Hook"
   - **COPY THE WEBHOOK URL** ← You'll need this!

4. **Add to .env:**
   ```bash
   ZAPIER_WEBHOOK_URL_POOL=https://hooks.zapier.com/hooks/catch/YOUR_ID/YOUR_HOOK
   ```

5. **Test Trigger:**
   ```bash
   bun run integrations/zapier/testWebhook.js
   ```
   - Go back to Zapier
   - Click "Test trigger"
   - Should see test data appear

6. **Action 1: Jobber**
   - App: "Jobber"
   - Event: "Create Client Request"
   - **Field Mapping:**
     - First Name: Split Name (first)
     - Last Name: Split Name (last)
     - Email: Email
     - Phone: Phone
     - City: City
     - Service Address: City + ", NJ"
     - Request Details: Message
     - Custom: Lead Type = "Pool Lead"
     - Custom: Lead Source = "Blue Lawns"
     - Tags: "Blue Lawns", "Pool Lead"

7. **Action 2 (Optional): Email**
   - App: "Email by Zapier"
   - Event: "Send Outbound Email"
   - To: leads@ecoastpools.com
   - Subject: "🏊 New Pool Lead from Blue Lawns - {{City}}"

8. **Name Zap:** "Blue Lawns Pool Leads → Jobber"

9. **Turn ON the Zap** ← Important!

---

## Step 3: Configure Environment (5 min)

### Local Development (.env)
```bash
ZAPIER_WEBHOOK_URL_POOL=https://hooks.zapier.com/hooks/catch/...
ECOAST_POOL_EMAIL=leads@ecoastpools.com
RESEND_API_KEY=re_your_key_here
CONTACT_EMAIL=info@bluelawns.com
```

### Vercel Production
1. https://vercel.com/dashboard
2. Select Blue Lawns project
3. Settings → Environment Variables
4. Add all 4 variables above
5. Select: Production, Preview, Development

---

## Step 4: Test End-to-End (10 min)

### 4.1 Test Webhook
```bash
bun run integrations/zapier/testWebhook.js
```

**Expected:** ✓ Webhook test successful! Status: 200

### 4.2 Test Form
1. Start dev server:
   ```bash
   cd sites/blue-lawns
   bun run dev
   ```

2. Go to: http://localhost:4321/pools

3. Fill out form with test data:
   - Name: John Test
   - Email: john@test.com
   - Phone: 609-555-1234
   - City: Cape May
   - Message: Test submission

4. Submit form

### 4.3 Verify Success
- [ ] Form shows success message
- [ ] Check Zapier Task History: https://zapier.com/app/history
- [ ] Check Jobber: Clients → Client Requests
- [ ] Check Email: leads@ecoastpools.com inbox

---

## 📊 Monitoring

### Daily Checks
- Zapier Task History: https://zapier.com/app/history
- Resend Dashboard: https://resend.com/emails
- Jobber Leads: Check quality and completeness

### Set Up Alerts
1. Zapier: Settings → Notifications → Enable "Zap Errors"
2. Email to: info@bluelawns.com

---

## 🆘 Troubleshooting

### Issue: Webhook test fails
```bash
# Check .env file
cat .env | grep ZAPIER

# Verify URL format
# Should start with: https://hooks.zapier.com/
```

### Issue: Zapier not triggering
1. Verify Zap is ON: https://zapier.com/app/zaps
2. Check webhook URL in .env matches Zapier
3. Look at Zapier Task History for errors

### Issue: Jobber not creating request
1. Check Jobber connection in Zapier
2. Verify field mappings
3. Test Jobber action in Zapier manually

### Issue: Email not received
1. Check spam folder
2. Verify RESEND_API_KEY in .env
3. Check Resend dashboard for delivery status

---

## 📚 Full Documentation

**Need more details?**
- **Complete Guide:** `integrations/zapier/SETUP-GUIDE.md` (600+ lines)
- **Integration Summary:** `output/blue-lawns/ZAPIER-INTEGRATION-SUMMARY.md`
- **Tracking Map:** `output/blue-lawns/tracking-map.md`

---

## ✅ Completion Checklist

**Setup:**
- [ ] Ran `bash integrations/zapier/quickstart.sh`
- [ ] Created Zapier webhook
- [ ] Added webhook URL to .env
- [ ] Configured Jobber action
- [ ] Added email action (optional)
- [ ] Turned ON Zap
- [ ] Added env vars to Vercel

**Testing:**
- [ ] Ran `bun run integrations/zapier/testWebhook.js`
- [ ] Test data appeared in Zapier
- [ ] Submitted test form
- [ ] Lead appeared in Jobber
- [ ] Email received at leads@ecoastpools.com

**Monitoring:**
- [ ] Enabled Zapier error alerts
- [ ] Bookmarked Zapier Task History
- [ ] Bookmarked Resend dashboard
- [ ] Set calendar reminder for weekly checks

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Webhook Success Rate | ≥ 99% |
| Email Delivery | ≥ 98% |
| Form Conversion | 3-5% |
| Response Time | < 24h |
| Lead-to-Customer | 3-5% |

---

## 💡 Pro Tips

1. **Test in Zapier First** - Always test each step in Zapier before testing live form
2. **Monitor First 10 Leads** - Watch closely for any data issues
3. **Use Test Mode** - Zapier has a test mode to avoid creating real Jobber entries during setup
4. **Save Webhook URL** - Store it somewhere safe in case .env gets lost
5. **Different Webhooks** - Use separate webhooks for dev/staging/production

---

## 📞 Support

**Technical Issues:**
- Test Script Logs: `output/blue-lawns/webhook-test-log.json`
- Setup Guide: `integrations/zapier/SETUP-GUIDE.md`

**Service Support:**
- Zapier Help: https://help.zapier.com/
- Jobber Support: https://support.getjobber.com/
- Resend Docs: https://resend.com/docs

---

## ⏱️ Time Breakdown

| Task | Time |
|------|------|
| Run quick start | 2 min |
| Create Zapier webhook | 15-20 min |
| Configure environment | 5 min |
| Test integration | 10 min |
| **Total** | **32-37 min** |

---

**Last Updated:** November 11, 2025  
**Version:** 1.0  
**Status:** Ready for Configuration ✅

---

**🚀 Ready to start? Run this command:**

```bash
bash integrations/zapier/quickstart.sh
```

