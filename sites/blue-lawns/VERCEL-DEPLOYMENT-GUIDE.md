# Blue Lawns - Vercel Deployment Guide

**Status:** ✅ READY FOR DEPLOYMENT  
**Date:** December 9, 2025

---

## Pre-Deployment Checklist ✅

- [x] TypeScript build errors fixed
- [x] Tailwind @apply directives removed from scoped styles
- [x] Production build successful
- [x] Vercel adapter installed and configured
- [x] Thank you page created
- [x] Contact form redirects to thank-you page
- [x] API routes tested (contact.ts, test-resend.ts)
- [x] Environment variables documented
- [x] Redirects configured for duplicate pages
- [x] Sitemap.xml verified
- [x] Robots.txt verified

---

## Deployment Methods

### Method 1: Vercel Dashboard (Recommended)

1. **Go to:** https://vercel.com/dashboard
2. **Click:** "Add New..." → "Project"
3. **Import:** Your Git repository
4. **Configure:**
   - **Root Directory:** `sites/blue-lawns`
   - **Framework Preset:** Astro
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Environment Variables:** Add these in Project Settings → Environment Variables

### Method 2: Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Navigate to project
cd /Users/benjaminhaberman/Web-Dev-Factory-HQ/Web-Dev-Factory-HQ/sites/blue-lawns

# 3. Login
vercel login

# 4. Deploy
vercel

# 5. Add environment variables
vercel env add RESEND_API_KEY
vercel env add PUBLIC_GOOGLE_PLACES_API_KEY
vercel env add CONTACT_TO_EMAIL

# 6. Deploy to production
vercel --prod
```

---

## Environment Variables Required

Add these to Vercel for **Production**, **Preview**, and **Development**:

```bash
# Email Service (Server-side)
RESEND_API_KEY=re_YcAkAxFL_G1vEpA6ftuPVvkmsZPHFG6aT
CONTACT_TO_EMAIL=info@bluelawns.com

# Google Places (Client-side - PUBLIC_ prefix required)
PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyAe6gfSogTkEDYDr3GD88RPpLouGEVfPHU

# Optional (AI Chat feature - if using)
OPENAI_API_KEY=your_openai_key_here
```

### How to Add in Vercel Dashboard

1. Project → Settings → Environment Variables
2. Click "Add New"
3. Enter Key and Value
4. Select environments: Production + Preview + Development
5. Click "Save"
6. Repeat for each variable

---

## Custom Domain Setup

### Configure www.bluelawns.com

1. **In Vercel Dashboard:**
   - Go to Project → Settings → Domains
   - Click "Add"
   - Enter: `www.bluelawns.com`
   - Click "Add"

2. **DNS Configuration:**

   Vercel will provide DNS instructions. Add these records to your domain registrar:

   **CNAME Record:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

   **A Records (for apex domain bluelawns.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600
   ```

3. **Wait for DNS propagation:** 5-60 minutes

4. **SSL Certificate:** Auto-issued by Vercel (Let's Encrypt)

---

## Google Cloud Console Configuration

### Update API Restrictions for Production

1. **Go to:** https://console.cloud.google.com/google/maps-apis/credentials
2. **Click:** Your API key
3. **Under "Application restrictions":**
   - Select "HTTP referrers (websites)"
   - Add these referrers:
     ```
     http://localhost:4321/*
     http://127.0.0.1:4321/*
     https://www.bluelawns.com/*
     https://bluelawns.com/*
     https://*.vercel.app/*  (for preview deployments)
     ```
4. **Click:** Save
5. **Wait:** 2-3 minutes for changes to propagate

---

## Post-Deployment Testing

### Test Checklist

1. **Homepage**
   - [ ] Loads correctly
   - [ ] Hero images display
   - [ ] Navigation works
   - [ ] CTAs link correctly

2. **Contact Form**
   - [ ] Visit: https://www.bluelawns.com/contact
   - [ ] Fill out form with test data
   - [ ] Verify Google Places autocomplete works
   - [ ] Submit form
   - [ ] Verify redirect to /thank-you page
   - [ ] Check email delivery to info@bluelawns.com

3. **Google Places Autocomplete**
   - [ ] Click "Property Address" field
   - [ ] Start typing an address
   - [ ] Verify dropdown with suggestions appears
   - [ ] Select an address
   - [ ] Verify it populates the field

4. **API Routes**
   - [ ] Test: https://www.bluelawns.com/api/test-resend
   - [ ] Should return: "Test email sent"
   - [ ] Check email delivery

5. **SEO Elements**
   - [ ] Verify: https://www.bluelawns.com/sitemap.xml
   - [ ] Verify: https://www.bluelawns.com/robots.txt
   - [ ] Check meta tags with view-source
   - [ ] Test structured data: https://search.google.com/test/rich-results

6. **Service Pages**
   - [ ] Test: /services/landscaping
   - [ ] Test: /services/lawn-care
   - [ ] Verify content loads
   - [ ] Check location cards

7. **Location Pages**
   - [ ] Test: /locations/avalon
   - [ ] Test: /locations/ocean-view
   - [ ] Verify service cards display
   - [ ] Check CTAs work

8. **Redirects**
   - [ ] Test: /privacy → Should redirect to /privacy-policy
   - [ ] Test: /terms → Should redirect to /terms-of-service

9. **Mobile Testing**
   - [ ] Test responsive design on mobile
   - [ ] Test form submission on mobile
   - [ ] Verify autocomplete works on mobile

10. **Performance**
    - [ ] Run Lighthouse audit
    - [ ] Check Core Web Vitals
    - [ ] Verify images load efficiently

---

## Monitoring & Debugging

### Vercel Dashboard Logs

**Function Logs:**
- Project → Deployments → Click deployment → Functions tab
- View real-time logs for API routes
- Check for errors in `/api/contact` and `/api/chat`

**Build Logs:**
- Project → Deployments → Click deployment
- View build output
- Check for warnings or errors

### Error Tracking

**Common Issues:**

1. **Contact form not sending:**
   - Check `RESEND_API_KEY` is set correctly
   - Verify sending domain is authorized in Resend
   - Check Vercel function logs

2. **Autocomplete not working:**
   - Verify `PUBLIC_GOOGLE_PLACES_API_KEY` is set
   - Check API restrictions allow your domain
   - Check browser console for Google Maps errors

3. **Pages returning 404:**
   - Verify deployment completed successfully
   - Check Vercel routing rules
   - May need to redeploy

### Health Check URLs

After deployment, test these:
- https://www.bluelawns.com/ (Homepage)
- https://www.bluelawns.com/contact (Contact form)
- https://www.bluelawns.com/api/test-resend (Email test)
- https://www.bluelawns.com/sitemap.xml (Sitemap)
- https://www.bluelawns.com/robots.txt (Robots)

---

## Google Search Console Setup

### After Deployment

1. **Go to:** https://search.google.com/search-console
2. **Add Property:**
   - Click "Add property"
   - Select "Domain" property
   - Enter: `bluelawns.com`

3. **Verify Ownership:**
   - Method 1: DNS TXT record (recommended)
   - Method 2: HTML file upload
   - Method 3: HTML tag (add to `<head>`)

4. **Submit Sitemap:**
   - In Search Console → Sitemaps
   - Enter: `https://www.bluelawns.com/sitemap.xml`
   - Click "Submit"

5. **Request Indexing:**
   - In Search Console → URL Inspection
   - Enter homepage URL
   - Click "Request Indexing"

---

## Vercel Analytics

### Enabled Features

The Vercel adapter is configured with Web Analytics enabled:

```javascript
adapter: vercel({
  webAnalytics: {
    enabled: true
  }
})
```

**What This Provides:**
- Real-time visitor analytics
- Top pages report
- Traffic sources
- Device breakdown
- Geographic data

**Access:** Project → Analytics tab in Vercel dashboard

---

## Rollback Plan

If deployment has issues:

1. **Instant Rollback:**
   - Vercel → Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Or Redeploy:**
   ```bash
   vercel --prod
   ```

---

## Performance Optimization Recommendations

### Post-Launch

1. **Enable Vercel Image Optimization:**
   - Automatically optimizes images
   - Serves WebP/AVIF formats
   - Lazy loads images

2. **Enable Edge Caching:**
   - Static assets auto-cached
   - API routes can use edge caching headers

3. **Monitor Core Web Vitals:**
   - Use Vercel Analytics
   - Track LCP, CLS, FID
   - Optimize based on real user data

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Astro Docs:** https://docs.astro.build
- **Vercel Support:** https://vercel.com/support
- **Status Page:** https://www.vercel-status.com

---

## Final Deployment Command

```bash
cd /Users/benjaminhaberman/Web-Dev-Factory-HQ/Web-Dev-Factory-HQ/sites/blue-lawns
vercel --prod
```

**Or deploy via dashboard for better control and visibility.**

---

**Deployment Status:** ✅ READY  
**Estimated Deployment Time:** 2-3 minutes  
**First Build Time:** ~1-2 minutes

