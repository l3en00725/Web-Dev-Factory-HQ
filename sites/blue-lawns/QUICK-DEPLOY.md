# Blue Lawns - Quick Deployment Guide

**Status:** ✅ READY TO DEPLOY  
**Time Required:** 10 minutes

---

## 🚀 Deploy to Vercel (3 Steps)

### Step 1: Create Vercel Project

1. Go to: **https://vercel.com/dashboard**
2. Click: **"Add New..." → "Project"**
3. Import your Git repository
4. **Configure:**
   ```
   Root Directory: sites/blue-lawns
   Framework: Astro
   Build Command: npm run build
   Output Directory: dist
   ```

### Step 2: Add Environment Variables

Go to: **Project Settings → Environment Variables**

Add these (for Production + Preview + Development):

```bash
RESEND_API_KEY=re_YcAkAxFL_G1vEpA6ftuPVvkmsZPHFG6aT
CONTACT_TO_EMAIL=info@bluelawns.com
PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyAe6gfSogTkEDYDr3GD88RPpLouGEVfPHU
```

### Step 3: Deploy

Click **"Deploy"** and wait ~2-3 minutes.

---

## ✅ Post-Deployment (5 minutes)

### 1. Test Contact Form

- Visit: `https://your-site.vercel.app/contact`
- Fill out form with real data
- Submit
- Verify redirect to /thank-you
- Check email delivery

### 2. Configure Custom Domain

1. Project → Settings → Domains
2. Add: `www.bluelawns.com`
3. Add DNS records as shown
4. Wait 30-60 minutes for DNS propagation

### 3. Verify Resend Domain

1. Go to: **https://resend.com/domains**
2. Add: `bluelawns.com`
3. Add DNS records (SPF + DKIM)
4. Wait for verification

### 4. Update Google Places Restrictions

1. Go to: **https://console.cloud.google.com/google/maps-apis/credentials**
2. Edit API key → HTTP referrers
3. Add: `https://www.bluelawns.com/*`
4. Save

### 5. Submit to Google Search Console

1. Go to: **https://search.google.com/search-console**
2. Add property: `bluelawns.com`
3. Verify via DNS TXT record
4. Submit sitemap: `https://www.bluelawns.com/sitemap.xml`

---

## 🧪 Testing URLs

After deployment, test these:

```
✅ https://www.bluelawns.com/
✅ https://www.bluelawns.com/contact
✅ https://www.bluelawns.com/services/landscaping
✅ https://www.bluelawns.com/locations/avalon
✅ https://www.bluelawns.com/membership
✅ https://www.bluelawns.com/thank-you
✅ https://www.bluelawns.com/sitemap.xml
✅ https://www.bluelawns.com/robots.txt
✅ https://www.bluelawns.com/api/test-resend
```

---

## ⚡ Quick Commands

```bash
# Deploy via CLI
cd sites/blue-lawns
vercel --prod

# Check build locally
npm run build

# Preview build locally
npm run preview

# Run dev server
npm run dev
```

---

## 🆘 Troubleshooting

**Contact form not sending:**
→ Check RESEND_API_KEY in Vercel env vars  
→ Verify bluelawns.com domain in Resend

**Autocomplete not working:**
→ Check PUBLIC_GOOGLE_PLACES_API_KEY  
→ Update API restrictions in Google Cloud

**Build failing:**
→ Check Vercel build logs  
→ Verify all dependencies in package.json

**404 errors:**
→ Check Vercel routing configuration  
→ May need to redeploy

---

## 📞 Need Help?

- **Vercel Support:** https://vercel.com/support
- **Vercel Docs:** https://vercel.com/docs
- **Astro Docs:** https://docs.astro.build

---

**Last Updated:** December 9, 2025  
**Build Status:** ✅ Verified Working

