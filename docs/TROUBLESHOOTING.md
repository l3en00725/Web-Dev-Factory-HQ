# Troubleshooting Guide

Common issues and solutions for Web-Dev Factory HQ.

---

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Pipeline Failures](#pipeline-failures)
3. [Form Issues](#form-issues)
4. [Deployment Issues](#deployment-issues)
5. [Post-Launch Issues](#post-launch-issues)

---

## Installation & Setup

### Cannot find module 'sharp'

**Error:**
```
Error: Cannot find module 'sharp'
```

**Cause:** Sharp (image optimization library) not installed or corrupted

**Fix:**
```bash
# Remove and reinstall
bun remove sharp
bun install sharp

# If still fails, try with npm
npm install sharp

# For M1/M2 Macs, may need Rosetta
arch -x86_64 bun install sharp
```

**Verify:**
```bash
bun run scripts/optimize-media.mjs --help
# Should show help text without errors
```

---

### bun: command not found

**Error:**
```bash
bun: command not found
```

**Cause:** Bun not installed or not in PATH

**Fix:**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH (if not auto-added)
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
bun --version
```

**Alternative:** Use Node.js + npm instead
```bash
# Replace "bun run" with "npm run"
npm run pipeline:full --site client-name
```

---

### Permission denied when running scripts

**Error:**
```
zsh: permission denied: ./scripts/optimize-media.mjs
```

**Cause:** Scripts not executable

**Fix:**
```bash
# Make all scripts executable
chmod +x scripts/*.mjs

# Or run with bun directly
bun run scripts/optimize-media.mjs
```

---

### Git not initialized

**Error:**
```
fatal: not a git repository
```

**Cause:** Running git commands outside repository or site not initialized

**Fix:**
```bash
# Initialize git in project root
cd /Users/benjaminhaberman/Web-Dev-Factory-HQ
git init

# Or in site directory
cd sites/[client-name]
git init
```

---

## Pipeline Failures

### Image optimization fails

**Error:**
```
Error: Input file is missing or corrupted
```

**Causes:**
1. Corrupted image files
2. Unsupported image format
3. Out of memory
4. Permission issues

**Fix:**

**1. Identify problematic images:**
```bash
# Check which images failed
cat output/[site]/optimization.log
```

**2. Remove corrupted files:**
```bash
# Test each image
cd output/[site]/scrape/media_assets
for img in *.{jpg,png,webp}; do
  file "$img" | grep -v "image data" && echo "Corrupted: $img"
done

# Remove corrupted
rm corrupted-file.jpg
```

**3. Increase memory:**
```bash
NODE_OPTIONS="--max-old-space-size=4096" bun run pipeline:full --site [site]
```

**4. Process in batches:**
```bash
# Edit scripts/optimize-media.mjs
# Add: --batch-size 10
bun run scripts/optimize-media.mjs --input [path] --output [path] --batch-size 10
```

---

### Schema generation fails

**Error:**
```
Error: Invalid business type
```

**Cause:** Business type not recognized by schema.org

**Fix:**
```bash
# Use valid schema.org types:
# - LocalBusiness (most home services)
# - Organization (general businesses)
# - EducationalOrganization (schools)
# - Store (retail)
# - Restaurant
# - MedicalBusiness
# - AutomotiveBusiness

# Regenerate with correct type
bun run scripts/generate-schema.mjs \
  --business "LocalBusiness" \
  --out sites/[site]/src/components/site-schema.json
```

**Common subtypes for LocalBusiness:**
- HomeAndConstructionBusiness (contractors)
- ProfessionalService (lawyers, accountants)
- FoodEstablishment (restaurants)
- HealthAndBeautyBusiness (salons, spas)

---

### Performance score below 95

**Error:** Lighthouse score 85/100 (target: 95+)

**Causes & Fixes:**

**1. Large images:**
```bash
# Check image sizes
cd sites/[site]/public/media
du -h *.{jpg,png,webp,avif} | sort -hr | head -10

# Should be:
# - Hero images: < 200 KB
# - Content images: < 100 KB
# - Icons/logos: < 50 KB

# If too large, re-optimize:
bun run scripts/optimize-media.mjs \
  --input public/media \
  --output public/media-optimized \
  --quality-avif 75 \
  --quality-webp 80
```

**2. Unoptimized fonts:**
```bash
# Use system fonts or preload custom fonts
# Edit sites/[site]/src/layouts/Base.astro

# Add to <head>:
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preload" as="font" href="/fonts/custom-font.woff2" type="font/woff2" crossorigin />
```

**3. Render-blocking JavaScript:**
```bash
# Defer non-critical scripts
# Change: <script src="..."></script>
# To: <script src="..." defer></script>

# Or use Astro's is:inline directive for critical scripts
<script is:inline>
  // Critical code here
</script>
```

**4. Layout shift (CLS):**
```bash
# Add width/height to images
# Change: <img src="..." alt="..." />
# To: <img src="..." alt="..." width="800" height="600" />

# Or use Astro Image component (automatic)
<Image src={heroImage} alt="..." />
```

---

### Lighthouse timeout

**Error:**
```
Timeout waiting for Lighthouse audit
```

**Cause:** Site too large or too slow

**Fix:**
```bash
# 1. Check bundle size
cd sites/[site]/dist
du -sh *

# Should be:
# - HTML: < 500 KB total
# - CSS: < 100 KB
# - JS: < 200 KB
# - Images: < 2 MB total

# 2. Reduce bundle size
# Remove unused dependencies:
cd sites/[site]
bunx astro add @astrojs/critters  # Inline critical CSS

# 3. Test locally first
bun run build
bun run preview
# Visit http://localhost:4321

# 4. Run Lighthouse manually
npx lighthouse http://localhost:4321 --view
```

---

## Form Issues

### Form submission returns 500 error

**Error in console:**
```
POST /api/submit-form 500 Internal Server Error
```

**Causes & Fixes:**

**1. Missing environment variables:**
```bash
# Check .env file exists
cd sites/[site]
cat .env

# Should contain (for Jobber-Zapier):
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
RESEND_API_KEY=re_...
CONTACT_EMAIL=owner@client.com

# If missing, add them and redeploy
```

**2. Invalid API keys:**
```bash
# Test Resend API key
curl https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@yourdomain.com","to":"you@email.com","subject":"Test","html":"Test"}'

# Should return: 200 OK (or 400 if domain not verified)
# If 401: API key is invalid
```

**3. Zapier webhook not receiving:**
```bash
# Test webhook directly
curl -X POST https://hooks.zapier.com/hooks/catch/YOUR/WEBHOOK \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'

# Check Zapier task history
# Visit: https://zapier.com/app/history
# Look for recent task
```

**4. Check Vercel logs:**
```bash
# In Vercel dashboard:
# Project → Functions → [function-name] → Logs
# Look for error messages
```

---

### Email not sending

**Error:** Form submits successfully but no email received

**Causes & Fixes:**

**1. Check Resend API key:**
```bash
# Verify key in Vercel environment variables
# Vercel Dashboard → Project → Settings → Environment Variables
# Ensure RESEND_API_KEY is set for Production
```

**2. Domain not verified:**
```bash
# In Resend dashboard:
# Visit: https://resend.com/domains
# Verify domain has green checkmark
# If not, add DNS records as shown
```

**3. Email going to spam:**
```bash
# Check spam folder
# Add sender to contacts
# Verify SPF/DKIM records in Resend dashboard
```

**4. Rate limits:**
```bash
# Resend free tier: 100 emails/day
# Check quota: https://resend.com/settings/usage
# Upgrade plan if needed
```

---

### Zapier webhook not receiving data

**Error:** Form submits but Jobber doesn't receive lead

**Debug steps:**

**1. Check Zapier task history:**
```bash
# Visit: https://zapier.com/app/history
# Filter by Zap name
# Look for recent tasks
# If no tasks: Webhook not receiving data
```

**2. Test webhook URL:**
```bash
# Copy webhook URL from Zapier
# Test with curl:
curl -X POST https://hooks.zapier.com/hooks/catch/[YOUR-HOOK] \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "555-1234",
    "service_type": "Test",
    "message": "Test message"
  }'

# Should see: {"status":"success"}
# Check Zapier history for this test
```

**3. Verify Jobber connection:**
```bash
# In Zapier:
# Open Zap → Jobber action
# Click "Test action"
# Should create test client in Jobber
# If fails: Reconnect Jobber account
```

**4. Check field mapping:**
```bash
# In Zapier Zap editor:
# Ensure fields mapped correctly:
# - First Name: (split from "name")
# - Last Name: (split from "name")
# - Email: mapped to "email"
# - Phone: mapped to "phone"
```

---

## Deployment Issues

### Vercel build fails

**Error in Vercel logs:**
```
Error: Build failed with exit code 1
```

**Common causes:**

**1. Missing dependencies:**
```bash
# Check package.json includes all dependencies
cd sites/[site]
cat package.json

# Ensure these are present:
"dependencies": {
  "astro": "^4.0.0",
  "@astrojs/tailwind": "^5.0.0",
  "tailwindcss": "^3.0.0"
}

# If missing, add and push:
bun add [missing-package]
git add package.json bun.lockb
git commit -m "Add missing dependencies"
git push
```

**2. TypeScript errors:**
```bash
# Run type check locally
cd sites/[site]
bunx astro check

# Fix reported errors
# Then commit and push
```

**3. Build command incorrect:**
```bash
# In Vercel project settings:
# Build Command should be: bun run build (or npm run build)
# NOT: bun build or astro build
```

**4. Node version mismatch:**
```bash
# Vercel uses Node 18 by default
# If need different version, add to package.json:
"engines": {
  "node": ">=18.0.0"
}
```

---

### Environment variables not working

**Error:** Site deploys but features don't work (form, analytics, etc.)

**Fix:**

**1. Check variables are set in Vercel:**
```bash
# Vercel Dashboard → Project → Settings → Environment Variables
# Verify each variable:
# - RESEND_API_KEY
# - ZAPIER_WEBHOOK_URL
# - CONTACT_EMAIL
# - etc.
```

**2. Check variable names match:**
```bash
# In code: import.meta.env.RESEND_API_KEY
# In Vercel: Must be exactly "RESEND_API_KEY" (case-sensitive)
```

**3. Redeploy after adding variables:**
```bash
# Variables don't apply to existing deployment
# Must trigger new deployment:
git commit --allow-empty -m "Trigger rebuild"
git push
```

**4. Check environment scopes:**
```bash
# In Vercel, each variable has scopes:
# - Production ✅
# - Preview ✅
# - Development ✅
# Ensure all three are checked
```

---

### Custom domain not connecting

**Error:** Domain shows "Not Found" or doesn't resolve

**Causes & Fixes:**

**1. DNS not propagated:**
```bash
# Check propagation status
dig yourdomain.com

# Should show Vercel IP: 76.76.21.21
# If not, wait 24-48 hours

# Check global propagation:
# Visit: https://www.whatsmydns.net/#A/yourdomain.com
```

**2. Incorrect DNS records:**
```bash
# For apex domain (example.com):
Type: A
Name: @
Value: 76.76.21.21

# For www subdomain:
Type: CNAME
Name: www
Value: cname.vercel-dns.com

# Verify in domain registrar (GoDaddy, Namecheap, etc.)
```

**3. SSL certificate pending:**
```bash
# In Vercel → Domains
# Check SSL status
# May show "Pending" for up to 24 hours
# Vercel auto-issues Let's Encrypt certificate
```

**4. Domain already in use:**
```bash
# In Vercel Dashboard → Domains
# Error: "Domain is already in use by another project"
# Solution: Remove from old project first
```

---

## Post-Launch Issues

### Site not indexed after 72 hours

**Error:** `site:yourdomain.com` in Google shows no results

**Causes & Fixes:**

**1. Verify sitemap submitted:**
```bash
# Google Search Console → Sitemaps
# Should show: "Success" status
# If "Couldn't fetch": Check sitemap accessibility

# Test sitemap manually:
curl -I https://yourdomain.com/sitemap.xml
# Should return: 200 OK
```

**2. Check robots.txt allows indexing:**
```bash
curl https://yourdomain.com/robots.txt

# Should contain:
User-agent: *
Allow: /

# Should NOT contain:
Disallow: /  # ← This blocks all crawlers
```

**3. Check for noindex tags:**
```bash
# View page source
curl -s https://yourdomain.com | grep -i noindex

# Should return nothing
# If found: Remove noindex from meta tags or headers
```

**4. Request indexing manually:**
```bash
# In Google Search Console:
# 1. URL Inspection tool
# 2. Enter: https://yourdomain.com
# 3. Click "Request Indexing"
# 4. Repeat for important pages
```

**5. Check Search Console for errors:**
```bash
# Google Search Console → Coverage
# Look for:
# - "Excluded" pages → Why excluded?
# - "Error" pages → Fix errors
# - "Valid" pages → These are indexed
```

---

### Schema validation errors

**Error in Google Rich Results Test:**
```
Missing required field "address"
```

**Common errors & fixes:**

**1. Missing required fields:**
```bash
# LocalBusiness requires:
# - name ✅
# - address ✅ (PostalAddress with all fields)
# - telephone (optional but recommended)

# Edit: sites/[site]/src/components/site-schema.json
# Add missing fields
```

**2. Invalid date format:**
```bash
# Error: "Date not in ISO format"
# Fix: Use YYYY-MM-DD format

# Wrong: "01/15/2024"
# Correct: "2024-01-15"
```

**3. Invalid URL:**
```bash
# Error: "URL is not valid"
# URLs must be absolute:
# Wrong: "/services"
# Correct: "https://yourdomain.com/services"
```

**4. Nested schema errors:**
```bash
# If using nested types (EducationalOrganization, etc.)
# Validate each level separately

# Test at: https://validator.schema.org
```

---

### PSI score dropped on live site

**Error:** Local preview: 98, Live site: 87

**Causes:**

**1. Additional tracking scripts:**
```bash
# Google Analytics, Meta Pixel, etc. add overhead
# Solution: Load asynchronously

<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>
```

**2. Third-party content:**
```bash
# Embedded maps, videos, social widgets slow site
# Solution: Lazy load or use facades

# Google Maps: Use static image, load map on click
# YouTube: Use lite-youtube-embed
```

**3. CDN not caching:**
```bash
# Check cache headers:
curl -I https://yourdomain.com

# Should see:
cache-control: public, max-age=0, must-revalidate
x-vercel-cache: HIT  # ← This means cached

# If MISS: Content not cached
# Vercel auto-caches static files
# May take a few requests to warm cache
```

**4. Geographic distance:**
```bash
# PageSpeed runs from Google servers (may be far from Vercel edge)
# Check from multiple locations:
# - https://www.webpagetest.org (choose location)
# - https://pagespeed.web.dev (Google's tool)
```

---

## Quick Diagnosis Commands

**Check site is accessible:**
```bash
curl -I https://yourdomain.com
# Expected: 200 OK
```

**Check sitemap:**
```bash
curl -I https://yourdomain.com/sitemap.xml
# Expected: 200 OK, Content-Type: application/xml
```

**Check robots.txt:**
```bash
curl https://yourdomain.com/robots.txt
# Expected: User-agent: * \n Allow: /
```

**Check schema in HTML:**
```bash
curl -s https://yourdomain.com | grep -o '<script type="application/ld+json">.*</script>'
# Expected: JSON-LD schema
```

**Check form API:**
```bash
curl -X POST https://yourdomain.com/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"555-1234"}'
# Expected: {"success":true}
```

**Check build size:**
```bash
cd sites/[site]/dist
du -sh *
# Target: < 5 MB total
```

**Check image optimization:**
```bash
cd sites/[site]/public/media
file hero-*.{avif,webp,jpg} 2>/dev/null
# Expected: AVIF, WebP, and JPG variants
```

---

## Getting Help

**If issue not listed:**

1. **Check logs:**
   - Vercel: Project → Functions → Logs
   - Browser: DevTools → Console
   - Pipeline: `output/[site]/logs/`

2. **Search GitHub issues:**
   - Astro: https://github.com/withastro/astro/issues
   - Vercel: https://github.com/vercel/vercel/discussions

3. **Community help:**
   - Astro Discord: https://astro.build/chat
   - Vercel Discord: https://vercel.com/discord

4. **Create issue:**
   - Include error message
   - Include relevant logs
   - Include steps to reproduce

---

**End of TROUBLESHOOTING.md**
