# Contact Form Integration Decision Guide

## Quick Decision Tree

```
Does client use Jobber?
├─ YES
│  └─ Use jobber-zapier ✅ RECOMMENDED
│     (Zapier handles OAuth, includes email backup)
│
└─ NO
   ├─ Do they need CRM integration?
   │  └─ YES → Use generic form, plan custom webhook
   │
   └─ NO CRM - just need email notifications
      ├─ Use email-resend (100/day free)
      └─ Or generic (add integration later)
```

## Integration Comparison

| Integration | Setup Time | Monthly Cost | Reliability | Best For |
|-------------|-----------|--------------|-------------|----------|
| **jobber-zapier** | 10 min | $30 | ⭐⭐⭐⭐⭐ | Most Jobber users |
| **email-resend** | 5 min | $0* | ⭐⭐⭐⭐☆ | No CRM, simple needs |
| **generic** | 2 min | $0 | N/A | Placeholder for later |

*Free tiers available (Resend: 100 emails/day)

## Detailed Recommendations

### 1. Jobber via Zapier (jobber-zapier)

**Use when:**
- ✅ Client actively uses Jobber
- ✅ Want zero maintenance
- ✅ Non-technical client
- ✅ Need backup notification system
- ✅ May want to add extra automations later (Slack, Sheets, etc.)

**Pros:**
- OAuth handled automatically by Zapier
- Visual workflow editor (client can modify)
- Very reliable (99.9% uptime)
- Email backup via Resend
- Easy to extend (add Slack, Google Sheets, etc.)

**Cons:**
- $30/month ongoing cost
- Slight delay (~200-300ms)

**Setup:**
1. Create Zapier account
2. Create Zap: Webhook → Jobber
3. Sign up for Resend (email backup)
4. Add credentials to `.env`
5. Test submission

**Cost:** $30/month (Zapier) + $0 (Resend free tier)

---

### 2. Email via Resend (email-resend)

**Use when:**
- ✅ Client doesn't use any CRM
- ✅ Just needs email notifications
- ✅ Simple lead collection
- ✅ Budget-conscious

**Pros:**
- 100 emails/day free
- Clean, reliable service
- Easy API
- Quick actions in email (call, reply)

**Cons:**
- No CRM integration
- Manual lead follow-up
- Need to track leads separately

**Setup:**
1. Sign up at resend.com
2. Verify domain
3. Create API key
4. Add to `.env`
5. Test

**Cost:** $0 (free tier, 100/day)

---

### 3. Generic (generic)

**Use when:**
- ✅ Building MVP
- ✅ Client undecided on CRM
- ✅ Testing functionality
- ✅ Will add integration in Phase 2

**Current behavior:**
- Logs submissions to console
- Returns success message
- No actual integration

**Pros:**
- Zero setup
- No external dependencies
- Fast to deploy

**Cons:**
- Not production-ready
- Leads not captured
- Manual phone/email only

**Next steps:**
- Replace `submit-form.js` with chosen integration
- Or add custom webhook

**Cost:** $0

---

## Installation Commands

```bash
# Jobber via Zapier (recommended for Jobber users)
bun run install-form --site your-site --type jobber-zapier

# Email only (recommended for non-CRM users)
bun run install-form --site your-site --type email-resend

# Generic placeholder (decide later)
bun run install-form --site your-site --type generic
```

## Migration Path

**Start with Generic → Upgrade Later:**

1. Launch with `generic` form
2. Client decides on CRM
3. Re-run `bun run install-form` with new type
4. Script replaces `submit-form.js`
5. Add credentials to `.env`
6. Test and deploy

## Cost Summary

### Year 1 Costs

| Scenario | Setup | Monthly | Annual |
|----------|-------|---------|--------|
| Jobber + Zapier | Free | $30 | $360 |
| Email only | Free | $0 | $0 |
| Generic → Email (3 months later) | Free | $0 | $0 |

### When to Upgrade from Free Tier

**Resend (Email):**
- Free: 100 emails/day (3,000/month)
- Paid: $20/month for 50,000/month
- **Upgrade when:** Getting >100 forms/day

**Zapier:**
- Starter: $29.99/month (750 tasks)
- Professional: $73.50/month (2,000 tasks)
- **Upgrade when:** Getting >25 forms/day

## Support & Troubleshooting

### Common Issues

**"Form submits but nothing happens"**
- Check browser console for errors
- Verify API endpoint exists: `/api/submit-form`
- Check `.env` credentials loaded

**"Email not received"**
- Check spam folder
- Verify domain verified in Resend
- Check Resend dashboard logs

**"Zapier not triggering"**
- Check Zapier task history
- Test webhook URL directly
- Verify `.env` has correct webhook URL

### Getting Help

1. Check template README files
2. Review Resend/Zapier dashboards
3. Check server logs
4. Test with curl/Postman first

## Recommendations by Business Type

| Business Type | Recommended | Why |
|--------------|-------------|-----|
| **Home Services** (lawn, landscaping) | jobber-zapier | Most use Jobber for scheduling |
| **Beauty & Wellness** (spas, salons) | email-resend | Often use booking systems, not full CRM |
| **Professional Services** (consulting) | email-resend | Simple lead capture sufficient |
| **E-commerce** (retail) | generic → custom | Usually need Shopify/WooCommerce integration |
| **Real Estate** | email-resend | Use specialized MLS systems |

## Final Recommendation

**For 80% of Web-Dev-Factory-HQ clients:**
- Start with `email-resend` (works for everyone, costs $0)
- Upgrade to `jobber-zapier` only if client uses Jobber
- Use `generic` only during development/MVP phase

**Golden Rule:** Keep it simple. Email notifications work for most small businesses. Only add complexity (Zapier, custom CRM) when there's a clear ROI.

