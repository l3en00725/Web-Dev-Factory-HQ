# Skills Reference

Complete catalog of all Web-Dev Factory HQ skills.

---

## Table of Contents

1. [What Are Skills?](#what-are-skills)
2. [Content Skills](#content-skills)
3. [Optimization Skills](#optimization-skills)
4. [SEO Skills](#seo-skills)
5. [Quality Assurance Skills](#quality-assurance-skills)
6. [Deployment Skills](#deployment-skills)
7. [Verification Skills](#verification-skills)

---

## What Are Skills?

**Skills are reusable automation tasks** defined in YAML files.

**Location:** `.cursor/skills/*.yaml`

**Called by:** Agents (workflow orchestrators)

**Can be run manually:** Some skills can be executed directly

**Structure:**
- **Inputs:** What the skill needs
- **Outputs:** What the skill produces
- **Steps:** Commands to execute
- **Validation:** Success criteria

---

## Content Skills

### scrape_existing_site

**File:** `.cursor/skills/scrape_existing_site.yaml`

**Purpose:** Extract content and media from existing website.

**When to use:** Migrating from old site to new Astro site.

**Inputs:**
- `domain_url` (string): URL of existing website
- `output_dir` (path): Where to save scraped content

**Outputs:**
- `content_map` (json): Structured content data
- `media_assets` (path): Downloaded images/media
- `url_inventory` (csv): List of all URLs

**Called by:**
- `site_builder` agent (step 1)

**Manual usage:**
```bash
bun run scripts/crawl-site.mjs \
  --url https://existing-site.com \
  --out output/[site]/scrape
```

**What it does:**
1. Crawls all pages on domain
2. Extracts headings, paragraphs, lists
3. Downloads images and assets
4. Creates content map (JSON)
5. Generates URL inventory (CSV)

**Success criteria:**
- content_map.json has at least one page with H1
- Media assets downloaded
- URL inventory created

**Example output:**
```
output/[site]/scrape/
├── content_map.json      # Page structure
├── media_assets/         # Images
└── url_map.csv          # URLs
```

---

### clone_repo

**File:** `.cursor/skills/clone_repo.yaml`

**Purpose:** Clone GitHub repository for reference or template.

**When to use:** Using existing repo as design reference.

**Inputs:**
- `repo_url` (string): GitHub repository URL
- `destination` (path): Where to clone

**Outputs:**
- `local_repo_path` (path): Cloned repository location

**Called by:**
- `site_builder` agent (step 2, optional)

**Manual usage:**
```bash
git clone https://github.com/user/repo.git .cursor/cache/[site]/reference
```

**What it does:**
1. Clones GitHub repository
2. Checks out main branch
3. Verifies git clean status

**Success criteria:**
- Repository cloned successfully
- Git status clean

---

### setup_astro_project

**File:** `.cursor/skills/setup_astro_project.yaml`

**Purpose:** Initialize Astro project with content and configuration.

**When to use:** Creating new site or importing content.

**Inputs:**
- `project_slug` (string): Site name
- `content_map` (json): Scraped or manual content
- `media_assets` (path): Optimized images
- `image_map` (json): Image optimization mapping
- `reference_repo` (path): Optional reference repo
- `business_type` (string): For schema generation

**Outputs:**
- `astro_project_path` (path): Created Astro site
- `url_inventory` (csv): Page URL list

**Called by:**
- `site_builder` agent (step 3)

**What it does:**
1. Creates Astro project structure
2. Installs dependencies (Tailwind, etc.)
3. Imports content from content_map
4. Maps images to optimized versions
5. Generates pages from content
6. Configures astro.config.mjs

**Success criteria:**
- `bun install` completes in < 2 minutes
- Tailwind + shadcn/ui configured
- First build succeeds
- Content mapped to Astro routes

---

## Optimization Skills

### optimize_media

**File:** `.cursor/skills/optimize_media.yaml`

**Purpose:** Convert images to modern formats with responsive sizes.

**When to use:** After scraping images or adding new media.

**Inputs:**
- `raw_media_path` (path): Directory with original images
- `output_path` (path): Destination for optimized images
- `formats` (array): Output formats (default: [avif, webp, jpg])
- `max_width` (integer): Max width for largest size (default: 1200)
- `quality_avif` (integer): AVIF quality 0-100 (default: 80)
- `quality_webp` (integer): WebP quality 0-100 (default: 85)
- `quality_jpg` (integer): JPG quality 0-100 (default: 90)

**Outputs:**
- `optimized_media_path` (path): Optimized images directory
- `image_map` (json): Mapping of original → optimized paths

**Called by:**
- `site_builder` agent (step 2)

**Manual usage:**
```bash
bun run optimize:images \
  --input output/[site]/scrape/media_assets \
  --output sites/[site]/public/media \
  --formats avif,webp,jpg \
  --max-width 1200 \
  --quality-avif 80
```

**What it does:**
1. Scans input directory for images
2. Converts each to AVIF, WebP, JPG
3. Generates responsive sizes (400px, 800px, 1200px)
4. Creates image-map.json
5. Reports file size savings

**Success criteria:**
- All images converted to specified formats
- Responsive sizes generated
- image-map.json created
- Total file size reduction ≥ 60%
- No images exceed 500 KB

**Performance targets:**
- Processing time: < 30 seconds for 50 images
- Memory usage: < 2 GB peak
- Concurrent processing: 4 images at a time

**Example output:**
```
sites/[site]/public/media/
├── logo-400.avif
├── logo-400.webp
├── logo-400.jpg
├── logo-800.avif
├── logo-800.webp
├── logo-800.jpg
├── logo-1200.avif
├── logo-1200.webp
├── logo-1200.jpg
└── image-map.json
```

---

### optimize_page_speed

**File:** `.cursor/skills/optimize_page_speed.yaml`

**Purpose:** Apply performance optimizations for 95+ PSI scores.

**When to use:** After site setup, before deployment.

**Inputs:**
- `astro_project_path` (path): Astro site directory

**Outputs:**
- `performance_report` (json): Lighthouse results

**Called by:**
- `performance_specialist` agent
- `site_builder` agent (step 5)

**What it does:**
1. Runs Lighthouse audit
2. Enables image lazy loading
3. Configures asset compression
4. Sets up critical CSS extraction
5. Adds preconnect hints
6. Enables Tailwind JIT purging

**Success criteria:**
- Mobile PSI ≥ 95
- Desktop PSI ≥ 95
- LCP < 2.5s
- FCP < 1.8s
- CLS < 0.1
- TBT < 200ms

---

## SEO Skills

### generate_schema_markup

**File:** `.cursor/skills/generate_schema_markup.yaml`

**Purpose:** Create JSON-LD structured data for SEO.

**When to use:** During site setup or when updating business info.

**Inputs:**
- `business_type` (string): Schema.org type (LocalBusiness, etc.)
- `content` (json): Site content with business data
- `model` (json): Optional base schema to extend
- `price_range` (string): Optional override (e.g., "$$")

**Outputs:**
- `schema_file` (json): Generated schema JSON

**Called by:**
- `schema_specialist` agent
- `site_builder` agent (step 4)

**Manual usage:**
```bash
bun run scripts/generate-schema.mjs \
  --business "LocalBusiness" \
  --content sites/[site]/data/content.json \
  --price-range "$$" \
  --out sites/[site]/src/components/site-schema.json
```

**What it does:**
1. Detects or uses specified business type
2. Generates JSON-LD schema
3. Includes required fields (name, address, etc.)
4. Infers priceRange from business type if not specified
5. Validates schema structure

**Success criteria:**
- Schema contains required fields for type
- Coordinates are valid
- Hours format is correct
- Passes Google Rich Results Test

**Supported schema types:**
- LocalBusiness (home services, retail)
- Organization (general businesses)
- EducationalOrganization (schools)
- Product (e-commerce)
- FAQPage (Q&A content)

**Enhanced Features (v2.0):**
- **Automatic FAQ Detection:** Scans pages for FAQ patterns and generates FAQPage schema
- **Multiple Detection Strategies:** Finds FAQs in HTML, Astro components, and Markdown
- **Schema Merging:** Combines LocalBusiness + FAQPage when FAQs found
- **Price Range Inference:** Automatically suggests pricing tier based on business type

**FAQ Detection Patterns:**
1. Elements with "faq" in class/id
2. `<details>` / accordion components
3. Markdown headers ending with "?"
4. Question/answer pairs in semantic HTML

---

### generate_sitemap

**File:** `.cursor/skills/generate_sitemap.yaml` *(New in v2.0)*

**Purpose:** Automatically generate SEO-optimized sitemap.xml from Astro pages.

**When to use:** After site setup, before deployment, or when pages change.

**Inputs:**
- `site_path` (path): Root path of Astro site
- `domain_url` (string): Base URL (e.g., https://example.com)
- `output_path` (path): Output location (default: public/sitemap.xml)

**Outputs:**
- `sitemap_path` (path): Generated sitemap.xml
- `robots_path` (path): Updated robots.txt

**Called by:**
- `site_builder` agent (during build)
- Run standalone for updates

**Manual usage:**
```bash
cd sites/[site]
bun run scripts/generate-sitemap.mjs \
  --project . \
  --domain https://example.com \
  --out public/sitemap.xml
```

**What it does:**
1. Scans `src/pages` recursively for all routes
2. Filters out 404 and error pages
3. Assigns priority based on page type:
   - Homepage: 1.0
   - Services/Products: 0.8
   - Other pages: 0.6
4. Sets changefreq (weekly/monthly)
5. Uses file modification time for lastmod
6. Validates XML format
7. Updates/creates robots.txt with sitemap reference
8. Adds AI crawler permissions to robots.txt

**Success criteria:**
- sitemap.xml exists in public/ directory
- Contains at least one `<url>` entry
- Passes xmllint validation
- robots.txt references sitemap
- All URLs use HTTPS

**Performance targets:**
- Generation time: <5 seconds for 100 pages
- Sitemap size: <50MB (Google limit)
- Max URLs: 50,000 per sitemap

**Example output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2025-11-11</lastmod>
    <priority>1.0</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://example.com/services</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
</urlset>
```

---

### validate_accessibility

**File:** `.cursor/skills/validate_accessibility.yaml` *(New in v2.0)*

**Purpose:** Run automated WCAG 2.1 AA compliance testing using axe-core.

**When to use:** Before deployment, especially for government/public sites.

**Inputs:**
- `site_path` (path): Root path of Astro site
- `base_url` (string): URL to test (default: http://localhost:4321)
- `pages_to_test` (array): List of paths (default: /, /about, /contact, /services)
- `output_dir` (path): Report output directory

**Outputs:**
- `report_json` (path): JSON format report
- `report_md` (path): Markdown format report
- `total_violations` (int): Count of all violations
- `critical_violations` (int): Count of critical issues

**Called by:**
- `site_builder` agent (optional step)
- Run standalone for validation

**Manual usage:**
```bash
cd sites/[site]

# Test localhost (starts dev server automatically)
bun run scripts/test-accessibility.mjs

# Test production URL
BASE_URL=https://example.com bun run scripts/test-accessibility.mjs

# Test custom pages
PAGES="/,/services,/pricing" bun run scripts/test-accessibility.mjs
```

**What it does:**
1. Installs axe-core and Playwright if needed
2. Starts dev server (if testing localhost)
3. Tests each page for WCAG 2.1 AA violations
4. Categorizes issues by severity:
   - 🔴 Critical (blocks deployment)
   - 🟠 Serious (should fix)
   - 🟡 Moderate (nice to fix)
   - 🔵 Minor (optional)
5. Generates detailed reports with fix recommendations
6. Stops dev server on completion

**Success criteria:**
- Reports created successfully
- All pages tested without errors
- No critical violations (for deployment approval)
- Fix recommendations provided

**Validation checks:**
- Color contrast ratios (4.5:1 minimum)
- Image alt text presence
- Form label associations
- Heading hierarchy (no skipped levels)
- Keyboard navigation
- Screen reader compatibility
- ARIA attributes
- Semantic HTML

**Performance targets:**
- Test execution: <10 seconds per page
- Memory usage: <500MB
- Browser startup: <3 seconds

**Example report:**
```markdown
# Accessibility Report

**Pages Tested:** 4
**Total Violations:** 3

### / (Homepage)
✅ No violations

### /services
⚠️ 2 violations (moderate)
- Color contrast: 4.2:1 (needs 4.5:1)
  Fix: Increase text darkness or background lightness
- Heading hierarchy: H1 → H3 (skips H2)
  Fix: Change H3 to H2

### /contact
✅ No violations

## Recommendations
1. Fix color contrast on /services
2. Adjust heading hierarchy
```

**Deployment behavior:**
- Critical violations: **Blocks deployment**
- Serious violations: Warns but allows deployment
- Moderate/Minor: Informational only

---

### validate_llm_readability

**File:** `.cursor/skills/validate_llm_readability.yaml`

**Purpose:** Check heading hierarchy, FAQs, and semantic structure.

**When to use:** During site setup, before deployment.

**Inputs:**
- `astro_project_path` (path): Astro site directory

**Outputs:**
- `llm_readability_report` (md): Analysis and recommendations

**Called by:**
- `site_builder` agent (step 6)

**What it does:**
1. Checks heading hierarchy (H1 → H2 → H3)
2. Verifies semantic HTML tags
3. Looks for FAQ content
4. Analyzes content structure
5. Generates recommendations

**Success criteria:**
- Proper heading order on all pages
- Semantic HTML used
- FAQ page exists (recommended)

---

## Quality Assurance Skills

### content_qa_reviewer (Agent)

**File:** `.cursor/agents/content_qa_reviewer.yaml` *(New in v2.0)*

**Purpose:** AI-powered content quality analysis for SEO, readability, and conversion optimization.

**When to use:** After content is written, before deployment (especially for business/service sites).

**Inputs:**
- `site_path` (path): Root path of Astro site
- `site_name` (string): Client site identifier
- `business_type` (string): Type of business (e.g., "lawn care", "plumbing")
- `target_audience` (string): Target demographic (optional)
- `review_depth` (string): "quick", "standard", or "comprehensive"

**Outputs:**
- `qa_report` (md): Comprehensive analysis report
- `score` (int): Overall quality score (0-100)
- `critical_issues` (int): Number of critical problems

**Called by:**
- `site_builder` agent (automatic, after build)
- Run standalone for manual review

**Manual usage:**
```bash
cd sites/[site]
SITE_NAME=[site-name] \
BUSINESS_TYPE="service type" \
REVIEW_DEPTH="standard" \
bun run scripts/ai-qa-review.mjs
```

**What it does:**
1. **Extracts site content** from built HTML or source files
2. **Analyzes readability:**
   - Flesch-Kincaid Reading Ease score
   - Grade level (target: 8-10th grade)
   - Average words per sentence
   - Total word count
3. **Evaluates CTAs (Call-to-Action):**
   - Detects CTA buttons and links
   - Counts CTAs per page
   - Identifies missing CTAs
4. **SEO keyword analysis:**
   - Keyword density calculation
   - Keyword distribution
   - Over-optimization detection
5. **Tone & voice assessment:**
   - Professional indicators
   - Friendly language
   - Trust-building words
   - Urgency markers
6. **Issue classification:**
   - Critical (blocks deployment)
   - Warnings (should fix)
   - Suggestions (nice to have)
7. **Conversion optimization:**
   - Identifies missing social proof
   - Checks for guarantees/trust signals
   - Reviews value propositions
   - Suggests improvements

**Success criteria:**
- QA report generated with comprehensive analysis
- Score calculated (0-100)
- Critical issues identified and documented
- Actionable recommendations provided

**Scoring algorithm:**
```
Base score: 100
- Critical issues: -20 points each
- Warnings: -10 points each
- Suggestions: -5 points each
Final score: max(0, min(100, calculated score))
```

**Deployment behavior:**
- **Score < 60:** Warning displayed, deployment allowed
- **Critical issues > 0:** **Blocks deployment** (must fix first)
- **Score >= 80:** Pass silently, deploy with confidence

**Example report output:**
```markdown
# Content QA Report: blue-lawns

**Overall Score:** 82/100 ✅

## 📊 Readability Analysis
- Flesch Reading Ease: 68.5 (Standard) ✅
- Grade Level: 9.2 (High School) ✅
- Total Words: 487 ✅

## 🎯 Call-to-Action Analysis
Found 3 CTA elements:
- "Call Now" (button → tel:802-555-LAWN)
- "Get Quote" (button → /contact)
- "Schedule Service" (link → /book)
✅ Good CTA placement!

## 🔍 SEO Keyword Analysis
- "lawn care": 8 occurrences (1.64% density) ✅
- "Burlington": 6 occurrences (1.23% density) ✅
- "Vermont": 4 occurrences (0.82% density) ✅

## 💬 Tone & Voice Analysis
Dominant Tone: Professional & Trustworthy
- Professional: 5 indicators
- Friendly: 8 indicators
- Trustworthy: 3 indicators

## 🚨 Issues Found

### Critical
✅ No critical issues!

### Warnings (1)
- ⚠️ No customer testimonials found
  Fix: Add 2-3 testimonials from satisfied customers

### Suggestions (2)
- 💡 Add "Accredited by..." badge for trust
- 💡 Include pricing transparency

## ✅ Recommendations

1. **Add Social Proof:**
   - Display customer reviews/testimonials
   - Show "5 years in business" or similar

2. **Trust Signals:**
   - Add certifications/licenses
   - Include guarantee/warranty info

3. **Conversion Opportunities:**
   - Add "Free Estimate" prominently
   - Include seasonal offers
```

**When to run:**
- ✅ Service businesses (conversion critical)
- ✅ E-commerce sites
- ✅ Landing pages
- ✅ Client-facing websites
- ⏭️ Internal tools
- ⏭️ Documentation sites

**Benefits:**
- Improves conversion rates
- Enhances SEO (readability is a ranking factor)
- Ensures professional copy
- Identifies missing elements
- Provides data-driven recommendations

---

## Deployment Skills

### implement_redirects

**File:** `.cursor/skills/implement_redirects.yaml`

**Purpose:** Create 301 redirects for URL changes.

**When to use:** Domain migration or URL restructuring.

**Inputs:**
- `old_urls` (csv): Legacy URL list
- `new_urls` (csv): New URL list

**Outputs:**
- `redirect_file` (json): vercel.json or _redirects

**Called by:**
- `migration_manager` agent

**What it does:**
1. Compares old and new URLs
2. Creates mapping (old → new)
3. Generates redirect file
4. Validates redirect rules

**Success criteria:**
- All old URLs have redirects
- No redirect loops
- vercel.json valid JSON

---

### deploy_to_vercel

**File:** `.cursor/skills/deploy_to_vercel.yaml`

**Purpose:** Build and deploy site to Vercel.

**When to use:** After site is ready for production.

**Inputs:**
- `astro_project_path` (path): Site to deploy

**Outputs:**
- `deployment_url` (string): Live site URL

**Called by:**
- `site_builder` agent (step 9)

**Manual usage:**
```bash
# Handled by setup-deployment script
bun run setup-deployment --site [name]
```

**What it does:**
1. Runs `bun run build`
2. Uploads dist/ to Vercel
3. Configures deployment
4. Verifies deployment URL

**Success criteria:**
- Build completes successfully
- Deployment URL accessible
- All pages load correctly

---

## Verification Skills

### verify_indexation

**File:** `.cursor/skills/verify_indexation.yaml`

**Purpose:** Confirm domain indexation and redirect health.

**When to use:** After deployment, during post-launch.

**Inputs:**
- `site_url` (string): Live site URL
- `redirect_manifest` (json): Redirect mapping

**Outputs:**
- `indexation_report` (md): Status report

**Called by:**
- `migration_manager` agent
- `seo_guard` agent

**What it does:**
1. Checks redirect health
2. Tests for 404 errors
3. Verifies sitemap accessibility
4. Compiles indexation report

**Success criteria:**
- No broken redirects
- 404 pages handled
- Sitemap accessible

---

## Skill Execution Order

**Typical pipeline sequence:**

```
1. scrape_existing_site    (if migrating)
2. optimize_media          (always)
3. clone_repo             (if using reference)
4. setup_astro_project    (always)
5. generate_schema_markup (always)
6. optimize_page_speed    (always)
7. validate_llm_readability (always)
8. implement_redirects    (if needed)
9. verify_indexation      (if deployed)
10. deploy_to_vercel      (manual)
```

---

## Skill Dependencies

**Skills that depend on others:**

- `setup_astro_project` depends on:
  - `scrape_existing_site` (for content)
  - `optimize_media` (for images)
  - `clone_repo` (for reference, optional)

- `verify_indexation` depends on:
  - `deploy_to_vercel` (site must be live)
  - `implement_redirects` (if redirects exist)

- `optimize_page_speed` depends on:
  - `setup_astro_project` (site must exist)
  - `optimize_media` (images should be optimized)

---

## Calling Skills Manually

**From command line (via scripts):**

```bash
# Scrape site
bun run scripts/crawl-site.mjs --url [url] --out [path]

# Optimize images
bun run optimize:images --input [path] --output [path]

# Generate schema
bun run scripts/generate-schema.mjs --business [type] --out [path]

# Run full pipeline (calls all skills)
bun run pipeline:full --site [name]

# Run single step
bun run pipeline:full --site [name] --only schema
```

**From agents:**

Skills are called via agent sequence definitions in `.cursor/agents/*.yaml`

---

## Skill Performance Metrics

| Skill | Typical Duration | Memory | Network |
|-------|------------------|--------|---------|
| scrape_existing_site | 30-90s | Low | Required |
| optimize_media | 30-120s | High | None |
| setup_astro_project | 60-180s | Medium | Required (install) |
| generate_schema_markup | 5-10s | Low | None |
| optimize_page_speed | 20-60s | Medium | None |
| validate_llm_readability | 10-30s | Low | None |
| implement_redirects | 5-15s | Low | None |
| verify_indexation | 30-60s | Low | Required |

---

## Skill Error Handling

**All skills include:**
- Input validation
- Error logging
- Graceful failure
- Status reporting

**Error log locations:**
- Pipeline errors: Terminal output
- Individual errors: `output/[site]/logs/`
- Script errors: Console output

**Common error patterns:**

```bash
# Scraping fails (site down)
→ Skip scraping, use manual content

# Image optimization fails (corrupt file)
→ Skip corrupted file, log warning

# Schema generation fails (invalid type)
→ Use default Organization type

# Build fails (syntax error)
→ Show error, exit pipeline
```

---

## Creating Custom Skills

### When to Create Custom Skills

- Repetitive task across multiple sites
- Need for reusability
- Complex multi-step process
- Want to track in agent workflow

### Custom Skill Template

Create `.cursor/skills/my_custom_skill.yaml`:

```yaml
name: My Custom Skill
description: What this skill does

inputs:
  - name: input_name
    type: string|path|json
    required: true|false
    description: What this input is for

outputs:
  - name: output_name
    type: path|json|string
    description: What this output contains

steps:
  - id: step_1
    description: What this step does
    run: |
      command to execute
      can be multi-line
      
  - id: step_2
    description: Next step
    run: |
      another command

success_criteria:
  - Criterion 1
  - Criterion 2

validation:
  - Validation check 1
  - Validation check 2

performance_targets:
  - Processing time: < X seconds
  - Memory usage: < X GB

error_handling:
  - Error case 1: How to handle
  - Error case 2: How to handle

notes: |
  Additional notes about this skill
  Usage tips
  Limitations
```

---

## Skill Best Practices

**✅ Do:**
- Keep skills focused (single responsibility)
- Document inputs/outputs clearly
- Include success criteria
- Handle errors gracefully
- Log important events
- Make skills reusable

**❌ Don't:**
- Mix concerns (one skill, one job)
- Hardcode paths or values
- Skip validation
- Ignore errors
- Over-complicate logic
- Create skill for one-time use

---

## Skill Testing

**Test a skill:**

```bash
# Run skill via pipeline (isolated)
bun run pipeline:full --site test-site --only [skill-name]

# Or run underlying script directly
bun run scripts/[script-name].mjs [args]

# Check output
ls -la output/test-site/
cat output/test-site/[report].json
```

**Verify success criteria:**
- Check outputs exist
- Validate file contents
- Confirm no errors in logs
- Test with multiple input scenarios

---

## Skills Roadmap

**Planned skills (not yet implemented):**

- `optimize_fonts` - Font subsetting and preloading
- `generate_sitemap` - XML sitemap generation
- `validate_accessibility` - WCAG compliance check
- `compress_videos` - Video optimization
- `generate_manifest` - PWA manifest creation
- `test_responsiveness` - Mobile layout testing
- `audit_security` - Security headers check

---

**For implementation details, see the YAML file for each skill in `.cursor/skills/`**

*Skills Reference for Web-Dev Factory HQ v0.1.0*
