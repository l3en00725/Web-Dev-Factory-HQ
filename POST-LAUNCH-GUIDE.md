# Post-Launch Guide

Comprehensive guide for search engine submission and post-deployment verification.

---

## Table of Contents

1. [When to Run Post-Launch](#when-to-run-post-launch)
2. [Google Search Console Setup](#google-search-console-setup)
3. [Bing Webmaster Tools Setup](#bing-webmaster-tools-setup)
4. [API Automation Setup](#api-automation-setup)
5. [Schema Validation](#schema-validation)
6. [Performance Verification](#performance-verification)
7. [Indexation Timeline](#indexation-timeline)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## When to Run Post-Launch

Run the post-launch checklist **AFTER** your site is live on Vercel:

```bash
bun run post-launch --site [your-site-name]
```

**Prerequisites:**
- ✅ Site deployed to Vercel
- ✅ Custom domain configured (if applicable)
- ✅ DNS propagated
- ✅ Site accessible at production URL
- ✅ Environment variables configured

**Do NOT run if:**
- Site is still in preview
- DNS not propagated
- Build failed on Vercel

---

## Google Search Console Setup

### Step 1: Add Property

1. Visit: **[https://search.google.com/search-console](https://search.google.com/search-console)**
2. Click **"Add Property"**
3. Choose property type:

**Option A: Domain Property (Recommended)**
- Enter: `clientwebsite.com` (without https://)
- Verifies all subdomains and protocols
- Requires DNS TXT record verification

**Option B: URL Prefix**
- Enter: `https://clientwebsite.com`
- Verifies exact URL only
- Multiple verification methods available

### Step 2: Verify Ownership

**Method 1: DNS TXT Record (Recommended)**

1. GSC will show TXT record like:
   ```
   google-site-verification=xxxxxxxxxxxxxxxxxxx
   ```
2. Add to domain DNS:
   ```
   Type: TXT
   Name: @
   Value: google-site-verification=xxxxxxxxxxx
   TTL: 3600
   ```
3. Wait 5-10 minutes
4. Click "Verify" in GSC

**Method 2: HTML File Upload**

1. Download verification file: `googlexxxxxxxxx.html`
2. Upload to `sites/[your-site]/public/`
3. Commit and push to deploy
4. Verify file loads: `https://clientwebsite.com/googlexxxxxxxxx.html`
5. Click "Verify" in GSC

**Method 3: HTML Meta Tag**

1. GSC provides meta tag:
   ```html
   <meta name="google-site-verification" content="xxxxx" />
   ```
2. Add to `<head>` in base layout
3. Deploy changes
4. Click "Verify" in GSC

### Step 3: Submit Sitemap

1. After verification, go to **"Sitemaps"** in left menu
2. Enter sitemap URL: `https://clientwebsite.com/sitemap.xml`
3. Click **"Submit"**

**Verify sitemap is accessible:**
```bash
curl -I https://clientwebsite.com/sitemap.xml
# Should return: 200 OK
```

### Step 4: Request Indexing

For important pages:

1. Go to **"URL Inspection"** in left menu
2. Enter URL: `https://clientwebsite.com`
3. If not indexed, click **"Request Indexing"**
4. Repeat for key pages:
   - Homepage
   - Main services page
   - Contact page
   - About page

**Daily Limit:** ~10 manual requests per day

---

## Bing Webmaster Tools Setup

### Step 1: Add Site

1. Visit: **[https://www.bing.com/webmasters](https://www.bing.com/webmasters)**
2. Sign in with Microsoft account
3. Click **"Add a site"**
4. Enter: `https://clientwebsite.com`

### Step 2: Verify Ownership

**Method 1: XML File (Easiest)**

1. Download: `BingSiteAuth.xml`
2. Upload to `sites/[your-site]/public/`
3. Commit and push
4. Verify loads: `https://clientwebsite.com/BingSiteAuth.xml`
5. Click "Verify" in Bing

**Method 2: Meta Tag**

1. Add meta tag to `<head>`:
   ```html
   <meta name="msvalidate.01" content="xxxxx" />
   ```
2. Deploy changes
3. Click "Verify"

**Method 3: CNAME Record**

1. Add DNS record:
   ```
   Type: CNAME
   Name: [provided by Bing]
   Value: verify.bing.com
   ```
2. Click "Verify"

### Step 3: Submit Sitemap

1. Go to **"Sitemaps"** in left menu
2. Click **"Submit a sitemap"**
3. Enter: `https://clientwebsite.com/sitemap.xml`
4. Click **"Submit"**

### Step 4: Submit URLs (Optional)

For immediate indexing:

1. Go to **"URL Submission"**
2. Enter important URLs (one per line)
3. Click **"Submit"**

**Limits:**
- Free tier: 10 URLs per day
- 5,000 URLs per month

---

## API Automation Setup

For automatic sitemap submission instead of manual setup.

### Google Search Console API

**Step 1: Enable API**

1. Visit: **[https://console.cloud.google.com](https://console.cloud.google.com)**
2. Create new project or select existing
3. Enable "Google Search Console API"
   - Search: "Search Console API"
   - Click "Enable"

**Step 2: Create Service Account**

1. Go to **"IAM & Admin"** → **"Service Accounts"**
2. Click **"Create Service Account"**
3. Name: `gsc-automation`
4. Click **"Create and Continue"**
5. Role: Not needed for GSC
6. Click **"Done"**

**Step 3: Generate Key**

1. Click on created service account
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Format: **JSON**
5. Download: `service-account-key.json`
6. Store securely in project root

**Step 4: Grant Access in GSC**

1. In service account, copy email (format: `gsc-automation@project-id.iam.gserviceaccount.com`)
2. In Google Search Console:
   - Settings → Users and Permissions
   - Click "Add User"
   - Paste service account email
   - Permission: **Owner**
   - Click "Add"

**Step 5: Configure Environment**

Add to `.env`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

**Test:**
```bash
bun run submit:gsc --site [site-name] --site-url https://clientwebsite.com
```

### Bing Webmaster API

**Step 1: Get API Key**

1. In Bing Webmaster Tools
2. Go to **"Settings"** → **"API Access"**
3. Click **"Generate API Key"**
4. Copy key (shown only once!)

**Step 2: Configure**

Add to `.env`:
```bash
BING_WEBMASTER_API_KEY=your_api_key_here
```

**Test:**
```bash
bun run submit:bing --site [site-name] --site-url https://clientwebsite.com
```

---

## Schema Validation

### Google Rich Results Test

1. Visit: **[https://search.google.com/test/rich-results](https://search.google.com/test/rich-results)**
2. Enter your URL: `https://clientwebsite.com`
3. Click **"Test URL"**
4. Wait for results (~30 seconds)

**What to Check:**
- ✅ No errors
- ✅ Schema type recognized (LocalBusiness, Organization, etc.)
- ✅ All required fields present
- ⚠ Warnings are okay (optional fields)

**Common Issues:**

| Error | Solution |
|-------|----------|
| "Invalid URL" | Schema has invalid field |
| "Missing required field" | Add required field to schema |
| "Date not in ISO format" | Use YYYY-MM-DD format |
| "Invalid image URL" | Use absolute URL |

### Schema.org Validator

1. Visit: **[https://validator.schema.org](https://validator.schema.org)**
2. Enter URL: `https://clientwebsite.com`
3. Click **"Run Test"**

More technical than Google's tool - useful for debugging.

### Testing Schema Locally

```bash
# Fetch your page HTML
curl https://clientwebsite.com > page.html

# Extract schema
grep -oP '(?<=<script type="application/ld\+json">).*?(?=</script>)' page.html | jq .
```

---

## Performance Verification

### PageSpeed Insights

1. Visit: **[https://pagespeed.web.dev](https://pagespeed.web.dev)**
2. Enter: `https://clientwebsite.com`
3. Click **"Analyze"**
4. Wait for results (mobile + desktop)

**Target Scores:**
- Mobile: **95+**
- Desktop: **95+**

**Key Metrics:**
- FCP (First Contentful Paint): < 1.8s
- LCP (Largest Contentful Paint): < 2.5s
- TBT (Total Blocking Time): < 200ms
- CLS (Cumulative Layout Shift): < 0.1

**If Scores are Low:**

```bash
# Run local optimization
cd sites/[your-site-name]
bun run scripts/optimize-performance.mjs

# Check image sizes
find public/media -type f -exec ls -lh {} \; | awk '{print $5, $9}' | sort -hr
```

### Core Web Vitals in GSC

After ~28 days of data:

1. Google Search Console → Experience → Core Web Vitals
2. Check mobile and desktop reports
3. Address any "Poor" URLs

---

## Indexation Timeline

### What to Expect

**24 hours:**
- Sitemap discovered by Google/Bing
- First crawl initiated
- Homepage may appear in search

**72 hours (3 days):**
- Most important pages indexed
- Breadth-first crawl complete
- Site appears in brand searches

**1-2 weeks:**
- All pages indexed
- Schema recognized in search results
- Rich results may start appearing

**2-4 weeks:**
- First meaningful traffic analytics
- Impressions data in GSC
- Initial keyword rankings

**3-6 months:**
- Full SEO impact visible
- Stable rankings
- Optimal organic traffic

### Checking Indexation Status

**Google:**
```
site:clientwebsite.com
```

**Bing:**
```
site:clientwebsite.com
```

**Check specific page:**
```
site:clientwebsite.com/services
```

**Number of indexed pages in GSC:**
- Coverage → Valid pages

---

## Monitoring & Maintenance

### Daily (First Week)

- [ ] Check Vercel deployment status
- [ ] Monitor GSC Coverage report for errors
- [ ] Verify sitemap processing
- [ ] Check for 404 errors

### Weekly (First Month)

- [ ] Review GSC Performance report
  - Impressions
  - Clicks
  - Average position
- [ ] Check Core Web Vitals
- [ ] Review Bing Webmaster reports
- [ ] Test key pages loading speed

### Monthly (Ongoing)

- [ ] Analyze traffic trends
- [ ] Review top-performing pages
- [ ] Check for new indexation errors
- [ ] Update schema if business info changes
- [ ] Re-run PageSpeed Insights
- [ ] Review backlinks (if any)

### Quarterly

- [ ] Comprehensive SEO audit
- [ ] Update content for seasonality
- [ ] Review competitor rankings
- [ ] Check for broken links
- [ ] Update local business listings

---

## Troubleshooting

### Sitemap Not Found (404)

**Check:**
```bash
curl -I https://clientwebsite.com/sitemap.xml
```

**Solutions:**
1. Verify `public/sitemap.xml` exists in repository
2. Rebuild and redeploy
3. Check Vercel build logs
4. Ensure no redirect on sitemap URL

### Pages Not Indexing

**Possible Causes:**
- robots.txt blocking
- Noindex meta tag
- Canonical pointing elsewhere
- Duplicate content
- Low-quality content

**Debug:**
```bash
# Check robots.txt
curl https://clientwebsite.com/robots.txt

# Check meta tags
curl -s https://clientwebsite.com | grep -i 'noindex\|canonical'
```

**In GSC:**
- URL Inspection → Enter URL
- Check "Coverage" status
- See "Crawled" status
- Review any errors

### Schema Not Showing in Search

**Timeline:**
- Can take 1-2 weeks to appear
- Google must crawl, process, and approve

**Verify:**
1. Rich Results Test shows no errors
2. Schema is in live HTML source
3. Schema passes validation
4. Wait for next Google crawl

### Site Not Ranking

**Expected:**
- New sites take 3-6 months to rank
- Need backlinks and citations
- Requires consistent content

**Checklist:**
- [ ] Site indexed?
- [ ] Schema valid?
- [ ] Performance good?
- [ ] Content quality high?
- [ ] Local citations complete?
- [ ] Google Business Profile claimed?

---

## Quick Reference

### Essential URLs

- **GSC:** [search.google.com/search-console](https://search.google.com/search-console)
- **Bing Webmaster:** [bing.com/webmasters](https://www.bing.com/webmasters)
- **Rich Results Test:** [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
- **PageSpeed Insights:** [pagespeed.web.dev](https://pagespeed.web.dev)
- **Schema Validator:** [validator.schema.org](https://validator.schema.org)

### Common Commands

```bash
# Run full post-launch checklist
bun run post-launch --site [site-name]

# Submit to Google
bun run submit:gsc --site [site-name] --site-url [url]

# Submit to Bing
bun run submit:bing --site [site-name] --site-url [url]

# Ping sitemap
bun run ping:sitemap --site-url [url]

# Check AI readiness
bun run check:ai --site [site-name] --url [url]
```

### Indexation Checklist

- [ ] Site deployed and accessible
- [ ] Sitemap submitted to Google
- [ ] Sitemap submitted to Bing
- [ ] Search engines pinged
- [ ] Schema validated
- [ ] Performance ≥95 PSI
- [ ] robots.txt allows crawlers
- [ ] No noindex tags
- [ ] Canonical tags correct
- [ ] Google Business Profile updated
- [ ] Local citations complete

---

**Questions?**

Refer to:
- [Google Search Central](https://developers.google.com/search)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help)
- [Web Dev Factory HQ Documentation](./README.md)

