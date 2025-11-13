# Complete Workflow Guide

Step-by-step tutorial for building a client site from start to finish using Web-Dev Factory HQ.

---

## Scenario

**Client:** Blue Lawns  
**Business:** Lawn care and landscaping  
**Location:** Burlington, Vermont  
**Services:** Lawn mowing, fertilization, weed control, seasonal cleanup  
**Existing site:** yes (`https://old-blue-lawns.com`)  
**CRM:** Uses Jobber for scheduling  
**Goal:** Modern, fast website with 95+ PageSpeed scores and full SEO

---

## Table of Contents

1. [Phase 1: Initial Setup](#phase-1-initial-setup)
2. [Phase 2: Content Migration](#phase-2-content-migration)
3. [Phase 3: Build & Optimize](#phase-3-build--optimize)
4. [Phase 4: Local Testing](#phase-4-local-testing)
5. [Phase 5: Deployment](#phase-5-deployment)
6. [Phase 6: Post-Launch](#phase-6-post-launch)
7. [Phase 7: Client Handoff](#phase-7-client-handoff)

---

## Phase 1: Initial Setup

### Step 1: Create New Site

**Command:**
```bash
cd /Users/benjaminhaberman/Web-Dev-Factory-HQ
bun run new-site blue-lawns
```

**What it does:**
- Clones `templates/client-base/` to `sites/blue-lawns/`
- Copies base Astro structure
- Installs default dependencies
- Creates package.json with site name
- Sets up Tailwind and basic layouts

**Interactive prompts:**

```
📋 Cloning template "client-base" to sites/blue-lawns...
✅ Created blue-lawns from client-base template

📝 Contact Form Setup

? Install contact form integration? (Y/n) › Yes
```

**Choose:** Yes

```
? Which integration does this client need? 
  ❯ Jobber via Zapier (Recommended)
    Email via Resend
    Generic Placeholder
    Skip for now
```

**Choose:** Jobber via Zapier

**Why:** Client uses Jobber for scheduling, Zapier makes integration easy

### Step 2: Form Installation

After choosing Jobber via Zapier, you'll be prompted:

```
📝 Contact Form Installation

📦 Installing jobber-zapier form...

✓ Installed ContactForm.astro
✓ Installed API route

🔑 Configuration:

? Zapier webhook URL (leave blank to add later): 
```

**What to enter:**
- **If you have the webhook:** Paste it now
- **If you don't:** Press Enter, we'll add it later

**Best practice:** Leave blank for now, get it from client after Zapier setup

```
⏳ Remember to add ZAPIER_WEBHOOK_URL to .env

✅ Form installation complete!

Next steps:
  1. Add <ContactForm /> to your pages
  2. Test: cd sites/blue-lawns && bun run dev
  3. Submit test form and verify integration
```

**Files created:**
```
sites/blue-lawns/
├── src/
│   ├── components/
│   │   └── ContactForm.astro          # ✅ Form component
│   ├── pages/
│   │   ├── index.astro                # Homepage
│   │   ├── contact.astro              # Contact page
│   │   └── api/
│   │       └── submit-form.js         # ✅ API endpoint
│   └── layouts/
│       └── Base.astro                 # Base layout
├── public/
│   ├── robots.txt                     # AI crawler-friendly
│   └── media/                         # Images directory
├── .env                               # ✅ Environment variables
├── package.json                       # Dependencies
└── astro.config.mjs                   # Astro config
```

**Verify creation:**
```bash
ls -la sites/blue-lawns/
```

Expected output shows all files listed above.

---

## Phase 2: Content Migration

### Step 3: Scrape Existing Site

**Scenario:** Blue Lawns has an existing site at `https://old-blue-lawns.com`

**Command:**
```bash
bun run scripts/crawl-site.mjs \
  --url https://old-blue-lawns.com \
  --out output/blue-lawns/scrape
```

**What it does:**
- Crawls all pages on the site
- Extracts text content (headings, paragraphs, lists)
- Downloads images (logos, photos, graphics)
- Maps URL structure
- Generates content inventory

**Terminal output:**
```
🌐 Starting site crawl...
Crawling: https://old-blue-lawns.com

✓ Found 12 pages
✓ Downloaded 24 images
✓ Extracted 156 text blocks

📄 Generating content map...
✓ Created content_map.json
✓ Created url_map.csv

📦 Total size: 45.2 MB
⏱️  Duration: 23 seconds

Report saved: output/blue-lawns/scrape/
```

**Files created:**
```
output/blue-lawns/scrape/
├── content_map.json                   # Page structure & content
├── media_assets/                      # Downloaded images
│   ├── logo.png
│   ├── hero-lawn.jpg
│   ├── service-mowing.jpg
│   ├── service-fertilization.jpg
│   ├── before-after-1.jpg
│   └── [18 more images]
└── url_map.csv                        # URL inventory
```

**Inspect content map:**
```bash
cat output/blue-lawns/scrape/content_map.json | jq '.pages[0]'
```

Example output:
```json
{
  "url": "/",
  "title": "Blue Lawns - Professional Lawn Care in Burlington, VT",
  "h1": "Beautiful Lawns, Guaranteed",
  "h2": [
    "Our Services",
    "Why Choose Blue Lawns?",
    "Service Areas"
  ],
  "paragraphs": [
    "Professional lawn care services serving Burlington...",
    "With over 15 years of experience..."
  ],
  "images": [
    {
      "src": "/images/hero-lawn.jpg",
      "alt": "Beautifully manicured lawn"
    }
  ]
}
```

**What if:**

❓ **Site has no existing website?**
```bash
# Skip scraping, create content manually
# Proceed directly to Step 4
```

❓ **Site is behind paywall or login?**
```bash
# Manual content extraction
# Copy/paste key content into:
# sites/blue-lawns/data/content.json
```

❓ **Site uses heavy JavaScript rendering?**
```bash
# Use Playwright instead of Cheerio
bun run scripts/crawl-site.mjs \
  --url https://old-blue-lawns.com \
  --use-playwright \
  --out output/blue-lawns/scrape
```

---

## Phase 3: Build & Optimize

### Step 4: Run Full Pipeline

**Command:**
```bash
# Full mode (comprehensive validation - recommended for first build)
bun run pipeline:full --site blue-lawns

# Or light mode (faster, skips heavy operations - good for iteration)
bun run pipeline:full --site blue-lawns --mode=light
```

**Expected duration:** 
- Full mode: 5-10 minutes
- Light mode: 2-3 minutes (skips image optimization & performance audits)

**What to watch for:**

**Initial output:**
```
🚀 Starting Web-Dev Factory Pipeline
Site: blue-lawns
──────────────────────────────────────

Running 7 steps:
1. scrape_existing_site (optional - already done)
2. optimize_images
3. import_content
4. generate_schema
5. optimize_performance
6. generate_seo_report
7. build_site
```

**Step 1: Scrape (Skipped)**
```
⏭️  scrape            skipped       0.1s
   (using existing data from output/blue-lawns/scrape/)
```

**Step 2: Optimize Images**
```
🖼️  optimize-images    running...

Analyzing images...
Found 24 images to optimize

Processing:
✓ logo.png → 3 formats, 3 sizes (saved 2.1 MB)
✓ hero-lawn.jpg → 3 formats, 3 sizes (saved 4.8 MB)
✓ service-mowing.jpg → 3 formats, 3 sizes (saved 3.2 MB)
[... 21 more ...]

✅ optimize-images    success      45.7s
   Processed: 24 images
   Total savings: 38.4 MB (82% reduction)
   Output: sites/blue-lawns/public/media/
```

**Step 3: Image SEO Renaming**

**Command:**
```bash
bun run scripts/rename-images.mjs --site blue-lawns
```

**What it does:**
- Parses `output/[site]/scrape/content_map.json` for image context
- Matches images to nearest page H1 or section heading
- Renames using format: `[brand]-[city]-[primary_keyword]-[section].webp`
- Preserves alt text from original HTML (validates 10-12 words)
- Writes renamed images to `/public/media/optimized/`
- Compresses images to WebP (80% quality)
- Generates verification log: `output/[site]/image-seo-map.csv`
- **Fails build if >20% of images remain unrenamed**

**Expected output:**
```
🖼️  Starting SEO Image Renaming & Optimization...

Site: blue-lawns
Content Map: output/blue-lawns/scrape/content_map.json
Media Dir: sites/blue-lawns/public/media
Output Dir: sites/blue-lawns/public/media/optimized

Found 24 images to process

[1/24] Processing: hero-lawn.jpg
  → blue-lawns-burlington-lawn-care-hero-1.webp
  Context: burlington | hero | lawn, care, maintenance
  Alt: "Professional lawn care services by blue lawns in Burlington"
  ✅ Renamed and optimized (saved 65.2%)

[... 23 more ...]

✅ IMAGE RENAMING COMPLETE
📊 Total Images: 24
✅ Renamed: 24
⚠️  Unrenamed: 0 (0.0%)
❌ Errors: 0
📋 Report: output/blue-lawns/image-seo-map.csv
📁 Optimized images: sites/blue-lawns/public/media/optimized
```

**Verification:**
- Review `output/[site]/image-seo-map.csv` for rename mapping
- Check that alt text is 10-12 words per image
- Verify <20% unrenamed threshold

**Next step:** Update Astro page references (handled automatically by import step)

---

**Step 4: Import Content**
```
📥 import             running...

Importing content from scrape data...
✓ Created index.astro (Homepage)
✓ Created services.astro (Services)
✓ Created about.astro (About Us)
✓ Created contact.astro (Contact)
✓ Mapped 24 images to optimized versions
✓ Updated navigation links

✅ import             success       8.1s
```

**Step 5: Location Page Generation** (Optional)

**Command:**
```bash
bun run scripts/create-locations.mjs
```

**Prerequisites:**
- Create `data/locations.json` with city data:
```json
[
  { "city": "Cape May", "state": "NJ", "lat": 38.9351, "lng": -74.9060 },
  { "city": "Stone Harbor", "state": "NJ", "lat": 39.0501, "lng": -74.7596 },
  { "city": "Avalon", "state": "NJ", "lat": 39.1018, "lng": -74.7163 }
]
```

**What it does:**
- Generates dynamic Astro pages at `src/pages/locations/[city-slug]/index.astro`
- Creates **80% unique content** per city using keyword rotation
- Injects LocalBusiness schema with geo coordinates
- Generates SEO-optimized meta titles and descriptions
- Creates city-specific hero images references
- Generates summary report: `output/[site]/locations-summary.md`

**Expected output:**
```
🚀 Starting location page generation...

✅ Generated: /locations/cape-may/
✅ Generated: /locations/stone-harbor/
✅ Generated: /locations/avalon/

📊 Summary report generated: output/blue-lawns/locations-summary.md

✨ Successfully generated 3 location pages!
```

**Content Uniqueness:**
- Unique introductory paragraphs per city
- Varied service descriptions and keyword placement
- City-specific schema markup with unique coordinates
- Custom meta titles and descriptions
- Dynamic internal linking structure

**Navigation Integration:**
After generation, update `src/components/navbar/navbar.astro` to include locations dropdown:
```astro
{
  title: "Locations",
  children: [
    { title: "Cape May", path: "/locations/cape-may/" },
    { title: "Stone Harbor", path: "/locations/stone-harbor/" },
    { title: "Avalon", path: "/locations/avalon/" }
  ]
}
```

**Verification:**
- Check `output/[site]/locations-summary.md` for generated pages
- Verify schema.org markup on each location page
- Test navigation dropdown functionality
- Validate unique content per city (target: 80%+ uniqueness)

---

**Step 6: Generate Schema**
```
🏷️  schema            running...

Detecting business type...
✓ Detected: LocalBusiness

🔍 Scanning for FAQ sections...
✓ Found 5 FAQ entries in pages

Generating JSON-LD schema...
✓ Name: Blue Lawns
✓ Address: 123 Main St, Burlington, VT 05401
✓ Phone: (802) 555-LAWN
✓ Coordinates: 44.4759, -73.2121
✓ Price range: $$ (inferred from lawn care)
✓ Service area: Burlington, Winooski, South Burlington
✓ FAQ schema: 5 questions detected

✅ schema             success       3.2s
   Output: sites/blue-lawns/src/components/site-schema.json
   Schemas: LocalBusiness + FAQPage
```

**Step 7: Optimize Performance**
```
⚡ performance        running...

Applying performance optimizations...
✓ Enabled image lazy loading
✓ Configured asset compression
✓ Set up critical CSS extraction
✓ Added preconnect hints
✓ Enabled Tailwind JIT purging

✅ performance        success       5.4s
```

**Step 8: Generate SEO Report**
```
📊 seo                running...

Auditing SEO...
✓ Meta tags: 4/4 pages have unique titles
✓ Meta descriptions: 4/4 pages
✓ Canonical tags: All correct
✓ Internal links: 18 links, 0 broken
✓ Heading hierarchy: All pages pass

✅ seo                success       4.8s
   Report: output/blue-lawns/seo/post_launch.md
```

**Step 9: Build Site**
```
🏗️  build             running...

Building Astro site...
✓ Compiled 4 pages
✓ Optimized assets
✓ Generated sitemap.xml
✓ Minified CSS/JS

✅ build              success      23.6s
   Output: sites/blue-lawns/dist/
   Size: 2.8 MB (uncompressed), 892 KB (gzipped)
```

**Step 10: Quality Assurance (Automatic)**
```
🤖 ai-qa             running...

Analyzing site content...

📊 Readability Analysis
✓ Flesch Reading Ease: 68.5 (Standard)
✓ Grade Level: 9.2 (High School)
✓ Total Words: 487

🎯 Call-to-Action Analysis
✓ Found 3 CTAs: "Call Now", "Get Quote", "Schedule Service"

🔍 SEO Keyword Analysis
✓ "lawn care": 8 occurrences (1.64% density)
✓ "Burlington": 6 occurrences (1.23% density)

💬 Tone: Professional & Trustworthy

✅ ai-qa              success       5.2s
   Overall Score: 82/100
   Report: output/blue-lawns/ai-qa/qa-report.md
```

**Step 9: Accessibility Validation**
```
♿ accessibility      running...

Testing 4 pages for WCAG 2.1 AA compliance...

Testing: http://localhost:4321/
✅ / - 0 violations

Testing: http://localhost:4321/services
✅ /services - 0 violations

Testing: http://localhost:4321/about
⚠️  /about - 1 violation (moderate)
   Color contrast: 4.2:1 (needs 4.5:1)

Testing: http://localhost:4321/contact
✅ /contact - 0 violations

✅ accessibility      success       8.4s
   Total Violations: 1 (moderate)
   Report: output/blue-lawns/accessibility/accessibility_report.md
```

**Final summary:**
```
📊 Pipeline Summary for blue-lawns
══════════════════════════════════════════════════

✅ scrape              skipped       0.1s
✅ optimize-images     success      45.7s
✅ import              success       8.1s
✅ schema              success       3.2s
✅ performance         success       5.4s
✅ seo                 success       4.8s
✅ build               success      23.6s
✅ ai-qa               success       5.2s
✅ accessibility       success       8.4s

⏱️  Total time: 104.7s (1m 45s)
📁 Reports: output/blue-lawns/
📄 Summary report: output/blue-lawns/summary.md

✅ Build Pipeline Complete!

📦 Site built in: sites/blue-lawns/dist/

Next Steps:

1. Setup Deployment:
   bun run setup-deployment --site blue-lawns

   This will guide you through:
   • GitHub repository creation
   • Vercel project setup
   • Custom domain configuration

2. After site is live, run post-launch checklist:
   bun run post-launch --site blue-lawns
```

**What if pipeline fails?**

❌ **Error: Image optimization fails**
```
Solution: Check sharp installation
bun remove sharp && bun install sharp
```

❌ **Error: Build fails with TypeScript errors**
```
Solution: Run type checker
cd sites/blue-lawns
bunx astro check
# Fix reported errors
```

❌ **Error: Out of memory**
```
Solution: Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" bun run pipeline:full --site blue-lawns
```

### Step 5: Review Outputs

**Check output directory:**
```bash
tree output/blue-lawns/
```

Expected structure:
```
output/blue-lawns/
├── scrape/
│   ├── content_map.json
│   ├── media_assets/
│   └── url_map.csv
├── seo/
│   ├── meta_audit.json
│   ├── internal_links.json
│   └── post_launch.md
├── ai-qa/
│   ├── qa-report.md
│   ├── qa-score.json
│   └── raw_content.html
├── accessibility/
│   ├── accessibility_report.json
│   └── accessibility_report.md
├── logs/
│   └── [timestamped execution logs]
├── pipeline-status.json
└── summary.md
```

**Read SEO report:**
```bash
cat output/blue-lawns/seo/post_launch.md
```

Example report:
```markdown
# SEO Post-Launch Report

## Site: Blue Lawns
Generated: 2025-01-15T10:30:00Z

### Meta Tags Audit ✅
- Homepage: ✅ Unique title, description
- Services: ✅ Unique title, description
- About: ✅ Unique title, description
- Contact: ✅ Unique title, description

### Internal Links ✅
- Total links: 18
- Broken links: 0
- Orphan pages: 0

### Schema Markup ✅
- Type: LocalBusiness
- Required fields: All present
- Validation: Passes

### Recommendations
- Add FAQ page for better AI discovery
- Consider adding blog for content marketing
```

**Verify schema:**
```bash
cat sites/blue-lawns/src/components/site-schema.json | jq '.'
```

**Review AI Content QA Report:**
```bash
cat output/blue-lawns/ai-qa/qa-report.md
```

Expected report sections:
```markdown
# Content QA Report: blue-lawns

**Overall Score:** 82/100 ✅

## 📊 Readability Analysis
- Flesch Reading Ease: 68.5 (Standard) ✅
- Grade Level: 9.2 ✅

## 🎯 Call-to-Action Analysis
- Found 3 CTAs ✅

## 🔍 SEO Keyword Analysis
- Keywords present with good density ✅

## 🚨 Issues Found
- Critical: 0 ✅
- Warnings: 1
- Suggestions: 2

## ✅ Recommendations
[Actionable improvements]
```

**Review Accessibility Report:**
```bash
cat output/blue-lawns/accessibility/accessibility_report.md
```

**If violations found:**
1. Open the report
2. Review each violation
3. Fix critical issues before deployment
4. Address warnings when possible

**Review Pipeline Summary:**
```bash
cat output/blue-lawns/summary.md
```

This shows:
- All steps executed
- Duration of each step
- Skipped steps (if light mode)
- Success/failure status
- Links to all reports

---

## Phase 4: Local Testing

### Step 6: Test Site Locally

**Start dev server:**
```bash
cd sites/blue-lawns
bun run dev
```

Output:
```
🚀 astro v4.0.0 started in 342ms

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose

watching for file changes...
```

**Open browser:** http://localhost:4321

**Checklist:**

✅ **Homepage loads**
- Hero section with image
- Services overview
- Call-to-action buttons
- Footer with contact info

✅ **Navigation works**
- Click: Services → Services page loads
- Click: About → About page loads
- Click: Contact → Contact page loads
- Mobile menu expands/collapses

✅ **Contact form works**
- Fill out form
- Submit
- Should see success message
- Check console for any errors

**Test form submission:**

1. Go to: http://localhost:4321/contact
2. Fill out form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 802-555-1234
   - Service: Lawn mowing
   - Message: This is a test submission
3. Click "Request Free Quote"
4. Should see: "✓ Thank you! We'll contact you within 24 hours."

**Check browser console:**
```
Form submission: POST /api/submit-form
Response: 200 OK
{ success: true }
```

✅ **Images are optimized**

1. Open DevTools → Network tab
2. Filter: Img
3. Refresh page
4. Check image files:
   - Format: AVIF or WebP (not PNG/JPG)
   - Size: < 100 KB per image
   - Lazy loaded: Only above-fold images load initially

✅ **Schema is present**

1. Right-click page → View Page Source
2. Search for: `application/ld+json`
3. Should find schema block:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Blue Lawns",
  ...
}
</script>
```

**Run build test:**
```bash
bun run build
```

Should complete without errors:
```
✓ Completed in 23.6s.

Built dist/ in 23.6s
```

**Test production build locally:**
```bash
bun run preview
```

```
🚀 astro preview started

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose
```

Visit and verify site works in production mode.

**Stop servers:**
```bash
# Press Ctrl+C in both terminal windows
```

---

## Phase 5: Deployment

### Step 7: Setup GitHub + Vercel

**Command:**
```bash
cd /Users/benjaminhaberman/Web-Dev-Factory-HQ
bun run setup-deployment --site blue-lawns
```

**Interactive walkthrough:**

```
🚀 Deployment Setup Guide

Site: blue-lawns
Path: /Users/benjaminhaberman/Web-Dev-Factory-HQ/sites/blue-lawns

═══════════════════════════════════════════════════════════════
STEP 1: GitHub Repository Setup
═══════════════════════════════════════════════════════════════

⚠ Git not initialized yet

? Initialize git repository? (Y/n) › Yes
```

**Choose:** Yes

```
✓ Git initialized

⚠ No git remote configured

Create a new GitHub repository:
  1. Visit: https://github.com/new
  2. Repository name: blue-lawns
  3. Keep it private (recommended for client sites)
  4. Do NOT initialize with README

? Enter your GitHub repository URL: › 
```

**What to do:**
1. Open browser: https://github.com/new
2. Fill in:
   - Owner: [your-username]
   - Repository name: `blue-lawns`
   - Description: "Blue Lawns lawn care website"
   - Private: ✅ (checked)
   - Initialize: ❌ (unchecked - leave everything blank)
3. Click "Create repository"
4. Copy URL: `https://github.com/[your-username]/blue-lawns.git`
5. Paste into prompt

```
? Enter your GitHub repository URL: › https://github.com/yourname/blue-lawns.git

✓ Remote added successfully

No commits found. Creating initial commit...

? Create initial commit and push to GitHub? (Y/n) › Yes
```

**Choose:** Yes

```
Adding files...
Creating commit...
Pushing to GitHub...

✅ Successfully pushed to GitHub!

═══════════════════════════════════════════════════════════════
STEP 2: Vercel Project Setup
═══════════════════════════════════════════════════════════════

Import your project to Vercel:

  1. Visit: https://vercel.com/new
  2. Click "Import Git Repository"
  3. Select your GitHub repository: blue-lawns
  4. Configure project:
     • Framework Preset: Astro
     • Root Directory: ./ (leave as default)
     • Build Command: bun run build (or npm run build)
     • Output Directory: dist
  5. Add Environment Variables (if needed):

     Environment variables to add in Vercel:
       • ZAPIER_WEBHOOK_URL
       • RESEND_API_KEY
       • CONTACT_EMAIL

? Have you created the Vercel project? (y/N) › 
```

**What to do:**
1. Open browser: https://vercel.com/new
2. Click "Import Git Repository"
3. Authorize GitHub if prompted
4. Find `blue-lawns` repository → Click "Import"
5. Configuration screen:
   - Framework Preset: **Astro** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `bun run build` (or `npm run build`)
   - Output Directory: `dist` (default)
   - Install Command: `bun install` (or `npm install`)
6. Environment Variables (click "Add"):
   - Key: `ZAPIER_WEBHOOK_URL`, Value: [paste webhook from Zapier]
   - Key: `RESEND_API_KEY`, Value: [from Resend dashboard]
   - Key: `CONTACT_EMAIL`, Value: `owner@bluelawns.com`
7. Click "Deploy"
8. Wait 1-2 minutes for first deployment

**After deployment completes:**

Vercel shows:
```
✅ Deployment Complete

Your project is live at:
https://blue-lawns.vercel.app

Domain: blue-lawns.vercel.app
Status: Ready
Build Time: 23s
```

**Back in terminal:**

```
? Have you created the Vercel project? › Yes

? Enter your Vercel deployment URL: › https://blue-lawns.vercel.app

✓ Vercel URL saved: https://blue-lawns.vercel.app

═══════════════════════════════════════════════════════════════
STEP 3: Custom Domain Setup (Optional)
═══════════════════════════════════════════════════════════════

? Do you want to add a custom domain? (y/N) › Yes
```

**Choose:** Yes (if client has domain) or No (if using Vercel subdomain)

**If Yes:**

```
Custom domain configuration:

  1. In Vercel project settings, go to "Domains"
  2. Click "Add Domain"
  3. Enter your domain (e.g., clientwebsite.com)
  4. Configure DNS:

     Option A: Nameservers (Recommended)
       • Point your domain nameservers to Vercel
       • Vercel nameservers: ns1.vercel-dns.com, ns2.vercel-dns.com

     Option B: CNAME Record
       • Add CNAME: www → cname.vercel-dns.com
       • Add A Record: @ → 76.76.21.21

? Enter your custom domain (e.g., clientwebsite.com): › bluelawns.com

✓ Custom domain saved: bluelawns.com

═══════════════════════════════════════════════════════════════
STEP 4: Auto-Deploy Workflow
═══════════════════════════════════════════════════════════════

Your deployment workflow is now configured:

  ✓ Any push to main branch will automatically deploy
  ✓ Vercel will build and deploy changes within 1-2 minutes
  ✓ You'll receive deployment notifications

Future changes workflow:

  1. Make changes to your site
  2. cd sites/blue-lawns
  3. git add .
  4. git commit -m "Description of changes"
  5. git push
  6. Vercel automatically deploys! 🚀

? Would you like to test the deployment with a small change? (y/N) › No
```

**Choose:** No (we'll test manually later)

```
═══════════════════════════════════════════════════════════════
✅ DEPLOYMENT SETUP COMPLETE!
═══════════════════════════════════════════════════════════════

Configuration saved:
  • output/blue-lawns/deployment/setup-checklist.json
  • output/blue-lawns/deployment/vercel-config.json

📋 Next Steps:

1. Wait for initial Vercel deployment to complete
2. Visit your deployment URL to verify site is live
3. Run post-launch checklist:

   bun run post-launch --site blue-lawns

⏳ Custom domain DNS changes can take 24-48 hours to propagate
```

### Step 8: Verify Deployment

**Check Vercel dashboard:**

1. Go to: https://vercel.com/dashboard
2. Find "blue-lawns" project
3. Check status: "Ready" (green checkmark)
4. Click project name
5. Click "Visit" button

**Verify site loads:**
- Homepage displays correctly
- Images load (check for AVIF/WebP)
- Navigation works
- Contact form submits successfully
- Schema is in page source

**Test custom domain (if configured):**
```bash
# Check DNS propagation
dig bluelawns.com

# Should show Vercel IP: 76.76.21.21
```

**If DNS not propagated yet:**
- Wait 24-48 hours
- Check status: https://www.whatsmydns.net/#A/bluelawns.com

---

## Phase 6: Post-Launch

### Step 9: Run Post-Launch Checklist

**Wait until:** Site is live and DNS propagated (if using custom domain)

**Command:**
```bash
bun run post-launch --site blue-lawns
```

**Interactive checklist:**

```
🚀 Post-Launch Checklist

Site: blue-lawns
Site URL: https://bluelawns.com

═══════════════════════════════════════════════════════════════
1. Deployment Verification
═══════════════════════════════════════════════════════════════

Testing site accessibility...

✓ Site is accessible (200)
  Content-Type: text/html

? Is the site live and looking correct? (Y/n) › Yes
```

**Choose:** Yes (after verifying in browser)

```
═══════════════════════════════════════════════════════════════
2. Schema Validation
═══════════════════════════════════════════════════════════════

Test your schema at:

  Google Rich Results: https://search.google.com/test/rich-results?url=https%3A%2F%2Fbluelawns.com
  Schema.org Validator: https://validator.schema.org/#url=https%3A%2F%2Fbluelawns.com

? Does schema pass validation? (Y/n) › 
```

**What to do:**
1. Open: https://search.google.com/test/rich-results
2. Enter URL: `https://bluelawns.com`
3. Click "Test URL"
4. Wait for results
5. Check: "No errors detected"

**Choose:** Yes (if passes)

```
✓ Schema validated

═══════════════════════════════════════════════════════════════
3. Google Search Console
═══════════════════════════════════════════════════════════════

? Attempt automatic Google Search Console submission? (Y/n) › Yes

Running GSC submission script...

🔍 Google Search Console Submission

Site: https://bluelawns.com
Sitemap: https://bluelawns.com/sitemap.xml

⚠️  Google API credentials not configured.

📋 Manual Submission Instructions:

1. Verify Domain Ownership:
   Visit: https://search.google.com/search-console
   Click: "Add Property"
   Enter: https://bluelawns.com
   Choose verification method (DNS TXT record recommended)

2. Submit Sitemap:
   After verification, go to "Sitemaps" in left menu
   Enter sitemap URL: https://bluelawns.com/sitemap.xml
   Click "Submit"

3. Request Indexing (Important Pages):
   Go to "URL Inspection" in left menu
   Enter URL: https://bluelawns.com
   Click "Request Indexing" (for homepage)
   Repeat for key pages: /services, /contact, etc.

? Is GSC property verified? (y/N) › 
```

**What to do:**
1. Open: https://search.google.com/search-console
2. Click "Add Property"
3. Choose "URL prefix"
4. Enter: `https://bluelawns.com`
5. Verification method: HTML file (easiest)
   - Download verification file
   - Upload to `sites/blue-lawns/public/`
   - Commit and push
   - Wait for deployment
   - Click "Verify"
6. After verified, go to "Sitemaps"
7. Enter: `https://bluelawns.com/sitemap.xml`
8. Click "Submit"

**Choose:** Yes (after completing)

```
? Is sitemap submitted to GSC? (y/N) › Yes

═══════════════════════════════════════════════════════════════
4. Bing Webmaster Tools
═══════════════════════════════════════════════════════════════

? Attempt automatic Bing submission? (Y/n) › Yes

[Similar process for Bing]

═══════════════════════════════════════════════════════════════
5. Sitemap Ping
═══════════════════════════════════════════════════════════════

? Ping search engines about sitemap? (Y/n) › Yes

Pinging search engines...

🔔 Sitemap Ping Service

Sitemap: https://bluelawns.com/sitemap.xml

1. Pinging Google...
   ✓ Google pinged successfully

2. Pinging Bing...
   ✓ Bing pinged successfully

3. IndexNow Protocol...
   ℹ IndexNow requires API key (optional)
   See: https://www.indexnow.org for setup

═══════════════════════════════════════════════════════════════
6. AI Crawler Access
═══════════════════════════════════════════════════════════════

? Run AI readiness check? (Y/n) › Yes

Running AI readiness check...

🤖 AI Readiness Check

Site: blue-lawns

1. Checking robots.txt for AI crawler access...
   ✓ AI crawlers allowed (7/7)

2. Checking schema markup...
   ✓ Comprehensive schema (5/5 key fields)

3. Checking semantic HTML structure...
   ✓ Semantic HTML used (6/6 tags)

4. Checking heading hierarchy...
   ✓ Proper heading hierarchy (H1 → H2+)

5. Checking for FAQ content...
   ⚠ No dedicated FAQ page found

6. Checking live URL...
   ✓ Schema present in live HTML

═══════════════════════════════════════════════════════════════
AI READINESS SCORE
═══════════════════════════════════════════════════════════════

   55/60 points (92%) - Grade: A

📋 Recommendations:

   • Consider adding FAQ page for better AI understanding

═══════════════════════════════════════════════════════════════
7. Google Business Profile (Local Businesses)
═══════════════════════════════════════════════════════════════

? Is this a local business (physical location)? (Y/n) › Yes

Update Google Business Profile:

  Visit: https://www.google.com/business
  Update website URL to: https://bluelawns.com
  Verify address matches schema markup
  Add photos if missing

? GBP updated with website URL? (y/N) › Yes

═══════════════════════════════════════════════════════════════
8. Performance Final Check
═══════════════════════════════════════════════════════════════

Test performance:

  PageSpeed Insights: https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fbluelawns.com

? 95+ PSI scores (mobile & desktop)? (Y/n) › Yes

✓ Performance verified

═══════════════════════════════════════════════════════════════
9. Local Directory Submissions (Optional)
═══════════════════════════════════════════════════════════════

Submit to local directories:

  • Yelp: https://biz.yelp.com
  • Facebook Business: https://business.facebook.com
  • Apple Maps: https://mapsconnect.apple.com
  • Yellow Pages: https://www.yellowpages.com/claimListing
  • HomeAdvisor: https://www.homeadvisor.com/pro
  • Angie's List: https://www.angi.com/business-center

? Directories submitted or scheduled? (y/N) › No

═══════════════════════════════════════════════════════════════
POST-LAUNCH CHECKLIST COMPLETE
═══════════════════════════════════════════════════════════════

Progress: 9/9 items (100%)

🎉 Congratulations! All launch items completed.

Reports saved:
  • output/blue-lawns/post-launch/checklist-results.json
  • output/blue-lawns/post-launch/submission-report.md

📋 Important Reminders:

  • Indexation takes 24-72 hours
  • Monitor Search Console for crawl errors
  • Check performance scores weekly
  • Update Google Business Profile if details change
```

### Step 10: Verify Indexation

**Timeline:** 24-72 hours after submission

**Check Google indexation:**
```
# Google search:
site:bluelawns.com
```

Expected: Should show all pages (homepage, services, about, contact)

**Check Bing indexation:**
```
# Bing search:
site:bluelawns.com
```

**Monitor in Search Console:**

1. Go to: https://search.google.com/search-console
2. Select property: blue-lawns.com
3. Click "Coverage" (or "Pages")
4. Check: "Valid" pages count
5. Should show: 4 pages indexed

**If not indexed after 72 hours:**

❓ **Troubleshooting:**

1. Check robots.txt allows crawlers:
```bash
curl https://bluelawns.com/robots.txt
```

2. Check sitemap is accessible:
```bash
curl https://bluelawns.com/sitemap.xml
```

3. Use URL Inspection tool in GSC:
   - Enter URL
   - Check "Coverage" status
   - If "Not indexed", click "Request Indexing"

4. Verify no noindex tags:
```bash
curl -s https://bluelawns.com | grep -i noindex
# Should return nothing
```

---

## Phase 7: Client Handoff

### Step 11: Prepare Client Deliverables

**What to give the client:**

#### 1. Vercel Dashboard Access

**Steps:**
1. Go to: https://vercel.com/teams/[your-team]/settings/members
2. Click "Invite Member"
3. Email: client@bluelawns.com
4. Role: "Member" (can view deployments, not delete)
5. Send invite

**Client receives:**
- Email with invite link
- Instructions to create Vercel account
- Access to view deployments and analytics

#### 2. GitHub Repository Access (Optional)

**Only if client wants source code access:**

1. Go to: https://github.com/[your-username]/blue-lawns/settings/access
2. Click "Add people"
3. Email: client@bluelawns.com
4. Role: "Read" (view only) or "Write" (can commit)
5. Send invite

#### 3. Contact Form Notifications

**Configure email forwarding:**

Already configured in `.env`:
```
CONTACT_EMAIL=owner@bluelawns.com
```

**Test:**
1. Submit test form on live site
2. Verify client receives email
3. Check Zapier task history (if using Jobber integration)
4. Verify lead appears in Jobber

#### 4. Google Search Console Access

**Steps:**
1. Go to: https://search.google.com/search-console
2. Select property: blue-lawns.com
3. Settings → Users and Permissions
4. Click "Add User"
5. Email: client@bluelawns.com
6. Permission: "Full" (so they can see all data)
7. Click "Add"

**Client can monitor:**
- Search impressions
- Click-through rates
- Indexation status
- Performance over time

#### 5. Documentation Package

**Create client handoff folder:**
```bash
mkdir -p client-handoff/blue-lawns
```

**Include:**

**A. Site Summary Document**

Create: `client-handoff/blue-lawns/SITE-SUMMARY.md`

```markdown
# Blue Lawns Website - Site Summary

## Live URLs
- **Production:** https://bluelawns.com
- **Vercel Dashboard:** https://vercel.com/[team]/blue-lawns

## Contact Form
- **Integration:** Jobber via Zapier
- **Email notifications:** owner@bluelawns.com
- **Webhook:** https://hooks.zapier.com/hooks/catch/[id]

## Performance Metrics
- **PageSpeed Score (Mobile):** 97/100
- **PageSpeed Score (Desktop):** 98/100
- **Build time:** ~23 seconds
- **Total page size:** 892 KB (gzipped)

## Search Engine Status
- **Google Search Console:** Verified, sitemap submitted
- **Bing Webmaster Tools:** Verified, sitemap submitted
- **Indexation:** 4 pages indexed
- **Schema validation:** Passed

## Maintenance
- **Updates:** Automatic via git push to main branch
- **Hosting:** Vercel (free tier, no expiration)
- **Domain:** Managed by [registrar name]
- **SSL:** Automatic (Let's Encrypt via Vercel)

## Support Contacts
- **Developer:** [your name] - [your email]
- **Emergency:** [emergency contact]
```

**B. How to Make Updates Guide**

Create: `client-handoff/blue-lawns/HOW-TO-UPDATE.md`

```markdown
# How to Update Your Website

## Minor Text Changes (Easy)

1. Contact your developer with changes
2. Developer updates files
3. Commits to GitHub
4. Site automatically rebuilds on Vercel (1-2 minutes)

## Adding New Service

1. Tell developer:
   - Service name
   - Description (2-3 sentences)
   - Pricing (if applicable)
   - Photo (if available)

2. Developer adds to services page
3. Updates schema markup
4. Deploys changes

## Changing Contact Information

**Important:** Update in 3 places:

1. Website files (developer)
2. Google Business Profile (you)
3. Schema markup (developer)

## Emergency: Site is Down

1. Check: https://vercel.com/[team]/blue-lawns
   - Look for red "Error" badge
   - Click for error details

2. Contact developer immediately

## Future Enhancements

**Low-cost additions:**
- Blog section ($200-500)
- Photo gallery ($100-200)
- Customer testimonials ($100)
- FAQ page ($100-200)
- Booking system integration ($500-1000)
```

**C. Credentials List**

Create: `client-handoff/blue-lawns/CREDENTIALS.txt` (encrypted)

```
=== Blue Lawns Website Credentials ===

Vercel Dashboard
  URL: https://vercel.com
  Email: client@bluelawns.com
  Password: [provided separately]

Google Search Console
  URL: https://search.google.com/search-console
  Email: client@bluelawns.com
  (uses Google account)

Bing Webmaster Tools
  URL: https://www.bing.com/webmasters
  Email: client@bluelawns.com
  (uses Microsoft account)

Zapier (Jobber Integration)
  URL: https://zapier.com
  Email: [your zapier account]
  Note: Contact developer to modify workflow

Resend (Email Service)
  URL: https://resend.com
  API Key: re_[key]
  Note: Managed by developer

GitHub Repository (Source Code)
  URL: https://github.com/[username]/blue-lawns
  Access: Read-only
  Note: Optional, for developers only
```

**D. Analytics Setup (Optional)**

If client wants Google Analytics:

```bash
# Add to .env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Add to sites/blue-lawns/src/layouts/Base.astro
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

# Redeploy
git add .
git commit -m "Add Google Analytics"
git push
```

#### 6. Training Session (Optional)

**30-minute walkthrough:**

1. **View live site** (10 min)
   - Show all pages
   - Demonstrate contact form
   - Explain responsive design
   - Show performance metrics

2. **Vercel dashboard** (5 min)
   - Where to view deployments
   - How to check site status
   - Where to find analytics

3. **Search Console basics** (10 min)
   - How to view search impressions
   - Where to check indexation
   - How to monitor performance

4. **Making update requests** (5 min)
   - How to send change requests
   - What information to include
   - Expected turnaround time

**Record session** (with permission) and provide video link

---

## Summary: Complete Workflow Checklist

**Phase 1: Initial Setup** ✅
- [ ] Create new site: `bun run new-site blue-lawns`
- [ ] Choose form integration: Jobber via Zapier
- [ ] Configure environment variables

**Phase 2: Content Migration** ✅
- [ ] Scrape existing site: `bun run scripts/crawl-site.mjs`
- [ ] Review scraped content
- [ ] Download media assets

**Phase 3: Build & Optimize** ✅
- [ ] Run full pipeline: `bun run pipeline:full --site blue-lawns`
- [ ] Review pipeline output
- [ ] Check generated reports

**Phase 4: Local Testing** ✅
- [ ] Start dev server: `bun run dev`
- [ ] Test all pages
- [ ] Test contact form
- [ ] Verify images optimized
- [ ] Check schema in source
- [ ] Test production build

**Phase 5: Deployment** ✅
- [ ] Setup deployment: `bun run setup-deployment --site blue-lawns`
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Import to Vercel
- [ ] Configure environment variables
- [ ] Setup custom domain (optional)
- [ ] Verify deployment

**Phase 6: Post-Launch** ✅
- [ ] Run checklist: `bun run post-launch --site blue-lawns`
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Ping sitemaps
- [ ] Check AI readiness
- [ ] Update Google Business Profile
- [ ] Verify performance scores
- [ ] Monitor indexation (24-72 hours)

**Phase 7: Client Handoff** ✅
- [ ] Grant Vercel access
- [ ] Grant Search Console access
- [ ] Test contact form notifications
- [ ] Prepare documentation package
- [ ] Schedule training session (optional)
- [ ] Provide credentials (encrypted)

**Total time estimate:**
- Phases 1-3: 2-3 hours
- Phase 4: 30 minutes
- Phase 5: 1 hour
- Phase 6: 1-2 hours (spread over 3 days)
- Phase 7: 1 hour

**Grand total: 6-8 hours** (vs. 40-80 hours manually!)

---

**End of COMPLETE-WORKFLOW.md**

