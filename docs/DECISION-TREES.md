# Decision Trees

Visual decision frameworks for common Web-Dev Factory HQ decisions.

---

## Table of Contents

1. [Which Form Template?](#which-form-template)
2. [Should I Scrape Existing Site?](#should-i-scrape-existing-site)
3. [How to Fix PSI < 95?](#how-to-fix-psi--95)
4. [Which Schema Type?](#which-schema-type)
5. [Deploy Now or Wait?](#deploy-now-or-wait)
6. [Full Mode vs Light Mode?](#full-mode-vs-light-mode)
7. [Should I Run AI QA?](#should-i-run-ai-qa)
8. [Should I Validate Accessibility?](#should-i-validate-accessibility)

---

## Which Form Template?

```
START: Client needs contact form

Does client use Jobber for scheduling?
├─ YES
│  └─ Can client afford $30/month for Zapier?
│     ├─ YES
│     │  └─ ✅ USE: jobber-zapier
│     │     Why: OAuth handled automatically
│     │     Cost: $30/month Zapier + free Resend
│     │     Setup: 5 minutes
│     │     Command: bun run install-form --site [name] --type jobber-zapier
│     │
│     └─ NO
│        └─ ⚠️  CONSIDER: Direct Jobber OAuth (complex)
│           Why: No monthly fee, but requires token management
│           Cost: $0/month (but high maintenance)
│           Alternative: Convince client to budget for Zapier
│           Note: Direct OAuth not yet implemented
│
└─ NO
   └─ Does client use any other CRM?
      ├─ YES
      │  └─ Which CRM?
      │     ├─ HubSpot
      │     │  └─ ✅ USE: generic + custom webhook
      │     │     Setup: Add HubSpot API endpoint
      │     │     Cost: Free (included with HubSpot)
      │     │
      │     ├─ Salesforce
      │     │  └─ ✅ USE: generic + Zapier/Make
      │     │     Setup: Zapier to Salesforce
      │     │     Cost: $20-30/month
      │     │
      │     └─ Other
      │        └─ Check if CRM has webhook API
      │           ├─ HAS API → Use generic + custom webhook
      │           └─ NO API → Use email-resend + manual import
      │
      └─ NO
         └─ ✅ USE: email-resend
            Why: Simple email notifications
            Cost: $0/month (100 emails/day free)
            Setup: 10 minutes
            Command: bun run install-form --site [name] --type email-resend
            Perfect for: Small businesses, solo operators

DECISION SUMMARY:

Jobber user + budget → jobber-zapier ✅
Jobber user + no budget → Convince client or use email-resend
Other CRM → generic + custom integration
No CRM → email-resend ✅
Not sure yet → generic (placeholder)
```

---

## Should I Scrape Existing Site?

```
START: Client has existing website?

Does client have existing website?
├─ NO
│  └─ ✅ SKIP SCRAPING
│     Action: Create content manually
│     Command: bun run pipeline:full --site [name] --skip scrape
│     Next: Gather content from client (text, images, services)
│
└─ YES
   └─ Is existing site accessible (no paywall/login)?
      ├─ NO
      │  └─ Can you get credentials?
      │     ├─ YES
      │     │  └─ ⚠️  MANUAL SCRAPING
      │     │     Action: Log in manually, copy content
      │     │     Alternative: Ask client for content export
      │     │
      │     └─ NO
      │        └─ ✅ SKIP SCRAPING
      │           Action: Request content from client
      │           Format: Google Doc, PDF, or existing files
      │
      └─ YES
         └─ Is content primarily in HTML (not JavaScript-rendered)?
            ├─ YES
            │  └─ Is site simple (< 50 pages)?
            │     ├─ YES
            │     │  └─ ✅ SCRAPE IT
            │     │     Command: bun run scripts/crawl-site.mjs --url [url]
            │     │     Time: 1-5 minutes
            │     │     Benefits: Fast, preserves structure, downloads images
            │     │
            │     └─ NO (50+ pages)
            │        └─ Do you need all pages?
            │           ├─ YES
            │           │  └─ ✅ SCRAPE WITH LIMITS
            │           │     Command: [add --max-pages flag]
            │           │     Action: Scrape key pages only
            │           │     Manual: Add other pages later
            │           │
            │           └─ NO
            │              └─ ✅ SCRAPE KEY PAGES ONLY
            │                 Action: Scrape homepage + main pages
            │                 Skip: Blog archive, old news
            │
            └─ NO (JavaScript-heavy, SPA)
               └─ Can Playwright render it?
                  ├─ YES
                  │  └─ ✅ SCRAPE WITH PLAYWRIGHT
                  │     Command: bun run scripts/crawl-site.mjs --use-playwright --url [url]
                  │     Time: 5-15 minutes (slower)
                  │     Note: Requires Playwright installed
                  │
                  └─ NO (complex app)
                     └─ ⚠️  SKIP SCRAPING
                        Action: Request content export from client
                        Alternative: Manually copy key pages

DECISION SUMMARY:

Simple HTML site → Scrape it ✅
JavaScript-heavy site → Try Playwright
Behind paywall → Manual or skip
No existing site → Skip, create from scratch
Large site (50+ pages) → Scrape key pages only
```

---

## How to Fix PSI < 95?

```
START: PageSpeed Insights score < 95

Run: https://pagespeed.web.dev/analysis?url=[your-site]

Check score breakdown:

Score: 85-94 (Close!)
├─ Check: Largest Contentful Paint (LCP)
│  └─ LCP > 2.5s?
│     ├─ YES
│     │  └─ Problem: Large images
│     │     ├─ Fix 1: Optimize images
│     │     │  Command: bun run optimize:images [options]
│     │     │  Target: Hero < 200 KB, content < 100 KB
│     │     │
│     │     ├─ Fix 2: Use AVIF format
│     │     │  Check: Images are AVIF/WebP, not PNG/JPG
│     │     │  Command: ls public/media/*.avif
│     │     │
│     │     └─ Fix 3: Preload hero image
│     │        Add to <head>: <link rel="preload" as="image" href="/media/hero.avif" />
│     │
│     └─ NO → Check other metrics
│
├─ Check: Cumulative Layout Shift (CLS)
│  └─ CLS > 0.1?
│     ├─ YES
│     │  └─ Problem: Layout shifts during load
│     │     ├─ Fix 1: Add image dimensions
│     │     │  Change: <img src="..." />
│     │     │  To: <img src="..." width="800" height="600" />
│     │     │
│     │     ├─ Fix 2: Reserve space for ads/embeds
│     │     │  Use: min-height on containers
│     │     │
│     │     └─ Fix 3: Load fonts properly
│     │        Add: <link rel="preload" href="/fonts/..." as="font" crossorigin />
│     │
│     └─ NO → Check other metrics
│
├─ Check: Total Blocking Time (TBT)
│  └─ TBT > 200ms?
│     ├─ YES
│     │  └─ Problem: Too much JavaScript
│     │     ├─ Fix 1: Defer non-critical scripts
│     │     │  Change: <script src="..."></script>
│     │     │  To: <script src="..." defer></script>
│     │     │
│     │     ├─ Fix 2: Remove unused scripts
│     │     │  Check: Analytics, tracking, chat widgets
│     │     │  Action: Load asynchronously
│     │     │
│     │     └─ Fix 3: Code splitting
│     │        Use: Astro islands (automatic)
│     │        Check: Large components are isolated
│     │
│     └─ NO → Check other metrics
│
└─ Check: First Contentful Paint (FCP)
   └─ FCP > 1.8s?
      ├─ YES
      │  └─ Problem: Slow initial render
      │     ├─ Fix 1: Reduce CSS size
      │     │  Check: Tailwind purging enabled
      │     │  Command: du -h dist/_astro/*.css
      │     │  Target: < 100 KB
      │     │
      │     ├─ Fix 2: Remove render-blocking resources
      │     │  Check: Fonts, CSS, early scripts
      │     │  Use: preconnect, preload
      │     │
      │     └─ Fix 3: Server location
      │        Note: Vercel edge network is fast
      │        Check: Test from multiple locations
      │
      └─ NO → Score should be 95+!

Score: 70-84 (Needs work)
└─ MULTIPLE ISSUES
   └─ Priority checklist:
      1. ✅ Optimize ALL images (most impactful)
         Command: bun run optimize:images
         
      2. ✅ Add image dimensions (prevents CLS)
         Action: width + height on all <img> tags
         
      3. ✅ Defer JavaScript (reduces TBT)
         Action: Add defer to script tags
         
      4. ✅ Minify CSS/JS (automatic in build)
         Check: bun run build completes successfully
         
      5. ✅ Remove unused dependencies
         Action: Check package.json, remove bloat
         
      6. ✅ Test locally first
         Command: bun run build && bun run preview
         Run Lighthouse: npx lighthouse http://localhost:4321

Score: < 70 (Major issues)
└─ START OVER
   └─ Problem: Fundamental architecture issues
      Actions:
      1. Check template is Folex Lite (lightweight)
      2. Remove all animations (AOS, SmoothScroll)
      3. Remove heavy libraries
      4. Re-run pipeline with optimization
      5. Contact developer for help

DECISION SUMMARY:

LCP > 2.5s → Optimize images ✅
CLS > 0.1 → Add image dimensions ✅
TBT > 200ms → Defer JavaScript ✅
FCP > 1.8s → Reduce CSS size ✅
Multiple issues → Follow checklist top-to-bottom
Score < 70 → Architectural problem, start over
```

---

## Which Schema Type?

```
START: Need to generate schema for client site

What type of business is it?

Physical location clients visit?
├─ YES
│  └─ What type of service?
│     ├─ Home services (lawn care, plumbing, HVAC, electrical)
│     │  └─ ✅ USE: LocalBusiness
│     │     Subtype: HomeAndConstructionBusiness
│     │     Command: --business "LocalBusiness"
│     │     Required: address, telephone, geo coordinates
│     │     Optional: priceRange, serviceArea, openingHours
│     │     Example: Blue Lawns, Smith Plumbing
│     │
│     ├─ Professional services (lawyers, accountants, consultants)
│     │  └─ ✅ USE: LocalBusiness
│     │     Subtype: ProfessionalService
│     │     Command: --business "LocalBusiness"
│     │     Required: address, telephone
│     │     Optional: priceRange (often omitted)
│     │
│     ├─ Food/Restaurant
│     │  └─ ✅ USE: LocalBusiness
│     │     Subtype: FoodEstablishment or Restaurant
│     │     Command: --business "LocalBusiness"
│     │     Required: address, telephone, openingHours
│     │     Optional: menu, priceRange, servesCuisine
│     │
│     ├─ Retail store
│     │  └─ ✅ USE: LocalBusiness
│     │     Subtype: Store
│     │     Command: --business "LocalBusiness"
│     │     Required: address, telephone, openingHours
│     │     Optional: paymentAccepted, currenciesAccepted
│     │
│     ├─ Medical/Health
│     │  └─ ✅ USE: LocalBusiness
│     │     Subtype: MedicalBusiness or HealthAndBeautyBusiness
│     │     Command: --business "LocalBusiness"
│     │     Required: address, telephone
│     │     Optional: openingHours, acceptsReservations
│     │
│     └─ Beauty/Wellness (salons, spas)
│        └─ ✅ USE: LocalBusiness
│           Subtype: HealthAndBeautyBusiness
│           Command: --business "LocalBusiness"
│           Required: address, telephone, openingHours
│           Optional: priceRange, serviceArea
│
└─ NO (no physical location)
   └─ What type of organization?
      ├─ School/Training institution
      │  └─ ✅ USE: EducationalOrganization
      │     Command: --business "EducationalOrganization"
      │     Required: name, description
      │     Optional: address (if campus), programs offered
      │     Example: Aveda Institute
      │     Special: Add hasProgram for courses
      │
      ├─ Non-profit / Association
      │  └─ ✅ USE: Organization
      │     Command: --business "Organization"
      │     Required: name, description, url
      │     Optional: address, telephone
      │     Note: Generic type for non-commercial entities
      │
      ├─ E-commerce / Online only
      │  └─ ✅ USE: Organization
      │     Command: --business "Organization"
      │     Required: name, description, url
      │     Optional: Add Product schema for items
      │     Note: Not implemented yet in Web-Dev Factory
      │
      └─ Software / SaaS
         └─ ✅ USE: Organization
            Command: --business "Organization"
            Required: name, description, url
            Optional: Add SoftwareApplication schema
            Note: Typically doesn't need local schema

NESTED SCHEMAS:

For schools (EducationalOrganization):
└─ Add hasOfferCatalog with EducationalProgram items
   Example:
   "hasOfferCatalog": {
     "@type": "OfferCatalog",
     "itemListElement": [{
       "@type": "Offer",
       "itemOffered": {
         "@type": "EducationalProgram",
         "name": "Cosmetology",
         "timeRequired": "P1600H"
       }
     }]
   }

For businesses with FAQs:
└─ Add separate FAQPage schema
   Location: On /faq page
   Separate from main LocalBusiness schema

For businesses with products:
└─ Add Product schema for each product/service
   Location: On individual product pages
   Link from main Organization schema

PRICE RANGE GUIDE:

$ = Under $50 average
$$ = $50-$150 average (most home services)
$$$ = $150-$500 average (professional services)
$$$$ = $500+ average (luxury services)

Inferred automatically based on business type:
- Lawn care: $$
- Plumbing/HVAC: $$$
- Luxury services: $$$$
- Education: Not applicable
- Professional services: $$$

Override with: --price-range "$$"

DECISION SUMMARY:

Physical location + services → LocalBusiness ✅
School/Training → EducationalOrganization ✅
Non-profit → Organization ✅
Online only → Organization ✅
Multiple locations → LocalBusiness (one schema per location)
```

---

## Deploy Now or Wait?

```
START: Site built, ready to deploy?

Checklist before deployment:

1. Local build successful?
   ├─ Run: bun run build
   ├─ Check: dist/ folder created
   └─ Test: bun run preview works
      ├─ YES → Continue checklist
      └─ NO → ⛔ FIX BUILD ERRORS FIRST
         Action: Check terminal errors
         Fix: See TROUBLESHOOTING.md

2. All pages load locally?
   ├─ Visit: http://localhost:4321
   ├─ Check: Home, Services, About, Contact
   └─ Test: Navigation works
      ├─ YES → Continue checklist
      └─ NO → ⛔ FIX NAVIGATION
         Action: Check page routes
         Fix: Ensure all pages in src/pages/

3. Contact form works?
   ├─ Fill out form locally
   ├─ Submit
   └─ Check: Success message appears
      ├─ YES → Continue checklist
      └─ NO → ⛔ FIX FORM FIRST
         Action: Check API route
         Fix: Verify .env variables

4. Images optimized?
   ├─ Check: public/media/ has AVIF/WebP
   ├─ Check: No images > 200 KB
   └─ Check: Lazy loading enabled
      ├─ YES → Continue checklist
      └─ NO → ⚠️  OPTIMIZE NOW
         Command: bun run optimize:images
         Impact: Significant PSI improvement

5. Schema present?
   ├─ View source: Ctrl+U
   ├─ Search: application/ld+json
   └─ Check: Schema block exists
      ├─ YES → Continue checklist
      └─ NO → ⛔ GENERATE SCHEMA
         Command: bun run scripts/generate-schema.mjs
         Impact: Required for SEO

6. Environment variables documented?
   ├─ Check: .env exists
   ├─ List: Required variables
   └─ Document: For Vercel setup
      ├─ YES → Continue checklist
      └─ NO → ⚠️  DOCUMENT NOW
         Action: List all variables needed
         Important: RESEND_API_KEY, CONTACT_EMAIL, etc.

7. GitHub repository created?
   ├─ Check: git remote -v shows GitHub URL
   └─ If not created yet
      ├─ NO → ⛔ CREATE REPO FIRST
      │  Action: Visit github.com/new
      │  Then: Run setup-deployment
      │
      └─ YES → Continue checklist

8. Client approved design?
   ├─ Shown: Local preview to client
   └─ Approved: Colors, layout, content
      ├─ YES → ✅ READY TO DEPLOY!
      │  Action: bun run setup-deployment --site [name]
      │  Expected: Live in 5-10 minutes
      │
      └─ NO → ⛔ WAIT FOR APPROVAL
         Action: Request client feedback
         Fix: Make requested changes
         Then: Restart checklist

DEPLOY DECISION:

All checks ✅ → Deploy now
1-2 checks ⚠️  → Deploy, fix on live site (non-critical)
3+ checks ❌ → Don't deploy, fix issues first
Form broken ❌ → NEVER deploy (fix first)
Build fails ❌ → NEVER deploy (fix first)
Client not approved ❌ → Wait

AFTER DEPLOYMENT:

Immediately:
├─ Visit live URL
├─ Test form submission
├─ Check images load
└─ Verify no console errors

Within 24 hours:
├─ Run post-launch checklist
├─ Submit to Google Search Console
├─ Submit to Bing Webmaster Tools
└─ Check PageSpeed Insights

Within 1 week:
├─ Monitor Search Console for errors
├─ Check indexation status
└─ Review with client

EMERGENCY ROLLBACK:

If deployed site has issues:
├─ Vercel Dashboard → Deployments
├─ Find previous working deployment
├─ Click "..." → "Promote to Production"
└─ Fix issues locally, redeploy when ready
```

---

## Full Mode vs Light Mode?

```
START: Running pipeline build

What is the purpose of this build?
├─ First-time build (initial client site creation)
│  └─ ✅ USE: FULL MODE
│     Command: bun run pipeline:full --site [name]
│     Duration: 5-10 minutes
│     Includes:
│       • Image optimization (AVIF/WebP conversion)
│       • Performance audits (Lighthouse)
│       • AI content QA
│       • Accessibility validation
│       • Schema generation with FAQ detection
│       • Full SEO audit
│     When: First build, pre-deployment validation
│
├─ Testing changes (iterative development)
│  └─ ✅ USE: LIGHT MODE
│     Command: bun run pipeline:full --site [name] --mode=light
│     Duration: 2-3 minutes (66% faster)
│     Skips:
│       • Image optimization (already done)
│       • Performance audits (expensive)
│     Includes:
│       • Content import
│       • Schema generation
│       • SEO audit
│       • Build
│     When: Rapid iteration, content updates, weekly CI
│
├─ Weekly monitoring (CI/CD automation)
│  └─ ✅ USE: LIGHT MODE (GitHub Actions)
│     Trigger: Every Monday at 9 AM UTC
│     Purpose: Catch regressions, monitor quality
│     Output: Artifacts + GitHub issues on failures
│
└─ Pre-release validation (before client delivery)
   └─ ✅ USE: FULL MODE
      Command: bun run pipeline:full --site [name]
      Purpose: Comprehensive quality check
      Review: All reports before deployment

DECISION SUMMARY:

First build → FULL MODE ✅
Iterative dev → LIGHT MODE ⚡
Weekly CI → LIGHT MODE (automated) 🤖
Pre-release → FULL MODE ✅

Time Savings:
- Full: 180-240 seconds
- Light: 60-90 seconds
- Savings: ~66% faster
```

---

## Should I Run AI QA?

```
START: Site content is written

Is this a client-facing site (not internal tool)?
├─ NO (internal tool, documentation, etc.)
│  └─ ⏭️  SKIP AI QA
│     Reason: Not customer-facing
│     Focus on: Functionality over marketing copy
│
└─ YES (client website)
   └─ Is this a business site (sells services/products)?
      ├─ YES
      │  └─ ✅ RUN AI QA
      │     Command: cd sites/[name] && SITE_NAME=[name] \
      │              BUSINESS_TYPE="service type" \
      │              bun run scripts/ai-qa-review.mjs
      │     Why: Conversion optimization critical
      │     Checks:
      │       • Readability (Flesch-Kincaid)
      │       • CTA presence and quality
      │       • SEO keyword density
      │       • Tone and trustworthiness
      │       • Conversion opportunities
      │     Output: Score (0-100) + recommendations
      │     Blocks deployment if: Score < 60 or critical issues
      │
      └─ NO (blog, personal site, portfolio)
         └─ Is good copy important for your goals?
            ├─ YES
            │  └─ ✅ RUN AI QA
            │     Benefit: Improve readability and engagement
            │     Focus on: Grade level, tone, structure
            │
            └─ NO
               └─ ⏭️  SKIP AI QA
                  Reason: Content quality not priority

WHEN TO USE AI QA:

✅ Service businesses (lawn care, plumbing, etc.)
✅ E-commerce sites
✅ Professional services (law, accounting, etc.)
✅ B2B websites
✅ Landing pages for campaigns
✅ Client sites where conversion matters

⏭️ Internal tools
⏭️ Documentation sites
⏭️ Personal blogs (unless quality matters)
⏭️ Prototypes / MVPs

INTERPRETING SCORES:

90-100: Excellent - deploy with confidence ✅
80-89:  Good - minor improvements suggested
70-79:  Acceptable - review warnings
60-69:  Needs work - address issues before deploy
<60:    Poor - significant revision needed ❌
```

---

## Should I Validate Accessibility?

```
START: Site is ready for deployment

What type of site is this?
├─ Government / Public sector
│  └─ ✅ REQUIRED - WCAG 2.1 AA is legally mandated
│     Command: bun run scripts/test-accessibility.mjs
│     Standard: WCAG 2.1 Level AA (minimum)
│     Consequence: Legal liability if non-compliant
│     Fix: ALL critical violations before launch
│
├─ Education / Non-profit
│  └─ ✅ STRONGLY RECOMMENDED
│     Why: Often serves diverse audiences
│     Also: May receive government funding requiring compliance
│     Action: Run validation, fix critical issues
│
├─ Commercial / Small business
│  └─ Is accessibility important for your audience?
│     ├─ YES (wide audience, elderly, disabilities common)
│     │  └─ ✅ RUN VALIDATION
│     │     Command: bun run scripts/test-accessibility.mjs
│     │     Benefits:
│     │       • Larger addressable market (15% of population)
│     │       • Better SEO (Google favors accessible sites)
│     │       • Reduced legal risk
│     │       • Better UX for everyone
│     │     Fix: Critical + serious violations
│     │     Optional: Moderate violations
│     │
│     └─ NO (niche audience, internal tool)
│        └─ Do you care about SEO?
│           ├─ YES
│           │  └─ ✅ RUN VALIDATION
│           │     Why: Accessibility overlaps with SEO
│           │     Focus on:
│           │       • Alt text on images
│           │       • Heading hierarchy
│           │       • Semantic HTML
│           │     These improve both accessibility and SEO
│           │
│           └─ NO
│              └─ ⚠️  CONSIDER RUNNING ANYWAY
│                 Why: Catches common UX issues
│                 Example violations often found:
│                   • Missing form labels (confusing)
│                   • Low color contrast (hard to read)
│                   • Broken keyboard navigation
│                 Time: <10 minutes
│                 Risk: Low
│                 Benefit: Better UX for all users
│
└─ Personal site / Portfolio
   └─ ⏭️  OPTIONAL
      Run if: You want to showcase best practices
      Skip if: Time-constrained

VIOLATION SEVERITY:

🔴 CRITICAL: Blocks deployment
  • Missing alt text on all images
  • No form labels
  • Inaccessible interactive elements

🟠 SERIOUS: Should fix before launch
  • Color contrast too low
  • Heading hierarchy skipped
  • Missing ARIA labels

🟡 MODERATE: Fix when possible
  • Redundant alt text
  • Non-semantic HTML
  • Minor contrast issues

🔵 MINOR: Optional improvements
  • Best practice recommendations
  • Future-proofing suggestions

DECISION SUMMARY:

Government/Public → REQUIRED (legal) ✅
Education/Non-profit → STRONGLY RECOMMENDED ✅
Commercial + wide audience → RECOMMENDED ✅
Commercial + SEO matters → RUN IT ✅
Internal tools / Niche → OPTIONAL ⏭️
Personal sites → OPTIONAL ⏭️

Always worth it when:
- Site has forms (accessibility = usability)
- Serving elderly or diverse audiences
- Want best-in-class quality
```

---

## VISUAL LEGEND

```
✅ = Recommended action (do this)
⚠️  = Warning (proceed with caution)
⛔ = Stop (don't proceed until fixed)
├─ = Decision point
└─ = End of branch / Result
```

---

## DECISION MATRIX

Quick reference table for common scenarios:

| Scenario | Form | Schema | Scrape | Deploy |
|----------|------|--------|--------|--------|
| New lawn care site, uses Jobber | jobber-zapier | LocalBusiness | Skip | After approval |
| School with existing site | email-resend | EducationalOrg | Yes | After testing |
| Restaurant, no CRM | email-resend | LocalBusiness | Yes | After approval |
| Online service, no location | email-resend | Organization | Optional | After testing |
| Large site (100+ pages) | (depends) | LocalBusiness | Key pages only | After testing |
| Client site rebuild | jobber-zapier | LocalBusiness | Yes | After approval |

---

**Use these decision trees to make informed choices quickly and confidently.**

*Decision Trees for Web-Dev Factory HQ v0.1.0*

