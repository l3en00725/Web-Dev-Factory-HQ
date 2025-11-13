# System Architecture Guide

Complete technical documentation for the Web-Dev Factory HQ system.

---

## Table of Contents

1. [Overview](#overview)
2. [Folder Structure](#folder-structure)
3. [Core Concepts](#core-concepts)
4. [The Build Pipeline](#the-build-pipeline)
5. [Agents Deep Dive](#agents-deep-dive)
6. [Key Scripts Reference](#key-scripts-reference)

---

## Overview

### What is Web-Dev Factory HQ?

Web-Dev Factory HQ is an **automated web development system** built inside Cursor that transforms website creation from a manual, time-consuming process into a streamlined, repeatable pipeline.

It's a collection of:
- **Agents** (orchestrators that manage workflows)
- **Skills** (reusable automation tasks)
- **Scripts** (executable automation tools)
- **Templates** (pre-built components and structures)

All working together to produce production-ready websites in a fraction of the time.

### What Problem Does It Solve?

**Before Web-Dev Factory:**
- Manual site creation: 40-80 hours per site
- Inconsistent quality across projects
- Manual schema markup (error-prone)
- Forgetting post-launch steps
- No standardized deployment process
- Manual search engine submissions
- Slow iteration on client sites

**After Web-Dev Factory:**
- Automated site generation: 2-4 hours per site
- Consistent 95+ PageSpeed scores
- Automatic, validated schema markup
- Automated post-launch checklist
- One-command deployment setup
- Automated search engine submissions
- Rapid iteration and updates

### Who Is It For?

**Primary User:** Web developers building sites for local service businesses

**Client Types:**
- Home services (lawn care, plumbing, HVAC, electrical)
- Local businesses (restaurants, retail, services)
- Educational institutions (beauty schools, trade schools)
- Professional services (law firms, accountants, consultants)

**NOT for:**
- E-commerce sites (requires different architecture)
- Complex web applications
- Sites requiring custom backends
- Sites with hundreds of pages

### What Does It Produce?

Every site built with Web-Dev Factory includes:

**✅ 95+ PageSpeed Insights scores** (mobile & desktop)
- Optimized images (AVIF/WebP)
- Lazy loading
- Minified assets
- Efficient CSS

**✅ Full SEO optimization**
- Valid schema markup (LocalBusiness, Organization, etc.)
- Semantic HTML structure
- Proper heading hierarchy
- Optimized meta tags
- XML sitemap
- robots.txt

**✅ AI-ready content**
- AI crawler permissions
- FAQ schema
- Natural language content structure
- Semantic markup

**✅ Production deployment**
- GitHub repository
- Vercel hosting
- Auto-deploy on push
- Custom domain support

**✅ Post-launch submissions**
- Google Search Console
- Bing Webmaster Tools
- Sitemap pings
- Indexation verification

---

## Folder Structure

### Complete Directory Tree

```
/Web-Dev-Factory-HQ/
│
├── .cursor/                          # Cursor AI automation definitions
│   ├── agents/                       # High-level workflow orchestrators
│   │   ├── site_builder.yaml        # Master build orchestrator
│   │   ├── performance_specialist.yaml  # PSI optimization
│   │   ├── schema_specialist.yaml   # JSON-LD generation
│   │   ├── seo_guard.yaml           # Technical SEO validation
│   │   ├── migration_manager.yaml   # Domain migration & redirects
│   │   └── post_launch_manager.yaml # Post-deployment automation
│   │
│   ├── skills/                       # Reusable automation tasks
│   │   ├── scrape_existing_site.yaml       # Content extraction
│   │   ├── clone_repo.yaml                 # GitHub repo cloning
│   │   ├── setup_astro_project.yaml        # Astro scaffolding
│   │   ├── optimize_page_speed.yaml        # Performance tuning
│   │   ├── generate_schema_markup.yaml     # Schema generation
│   │   ├── validate_llm_readability.yaml   # AI optimization check
│   │   ├── implement_redirects.yaml        # 301 redirect setup
│   │   ├── verify_indexation.yaml          # Search engine verification
│   │   ├── deploy_to_vercel.yaml           # Vercel deployment
│   │   └── optimize_media.yaml             # Image optimization
│   │
│   └── output/                       # Pipeline execution data (gitignored)
│
├── scripts/                          # Executable automation scripts
│   ├── run-pipeline.mjs              # Master pipeline orchestrator
│   ├── optimize-media.mjs            # Image optimization (sharp)
│   ├── generate-schema.mjs           # JSON-LD schema generator
│   ├── setup-deployment.mjs          # Interactive deployment guide
│   ├── post-launch-checklist.mjs     # Post-launch verification
│   ├── submit-to-gsc.mjs             # Google Search Console API
│   ├── submit-to-bing.mjs            # Bing Webmaster API
│   ├── ping-sitemap.mjs              # Sitemap notification
│   ├── check-ai-readiness.mjs        # AI optimization checker
│   ├── install-form.mjs              # Contact form installer
│   ├── choose-form.mjs               # Form selection helper
│   ├── clone-template.mjs            # New site creation
│   ├── crawl-site.mjs                # Website scraper
│   ├── import-content.mjs            # Content importer
│   ├── generate-sitemap.mjs          # XML sitemap generator
│   ├── validate-schema.mjs           # Schema validator
│   ├── generate-seo-report.mjs       # SEO audit report
│   └── [30+ other utility scripts]
│
├── templates/                        # Reusable site templates
│   ├── client-base/                  # Base template for new sites
│   │   ├── public/                   # Static assets
│   │   │   └── robots.txt            # AI crawler-friendly
│   │   ├── src/
│   │   │   ├── layouts/              # Page layouts
│   │   │   └── pages/                # Route pages
│   │   ├── astro.config.mjs          # Astro configuration
│   │   ├── package.json              # Dependencies
│   │   └── tailwind.config.mjs       # Tailwind config
│   │
│   └── contact-forms/                # Contact form integrations
│       ├── jobber-zapier/            # Jobber via Zapier
│       │   ├── ContactForm.astro     # Form component
│       │   ├── submit-form.js        # API route
│       │   └── README.md             # Setup guide
│       ├── email-resend/             # Email-only (Resend)
│       │   └── [same structure]
│       ├── generic/                  # Placeholder form
│       │   └── [same structure]
│       ├── DECISION-GUIDE.md         # Form selection guide
│       └── AI-OPTIMIZATION.md        # AI discoverability guide
│
├── sites/                            # Client website projects
│   ├── [client-name]/                # Individual client site
│   │   ├── src/                      # Astro source files
│   │   ├── public/                   # Static assets
│   │   ├── dist/                     # Build output (gitignored)
│   │   └── package.json              # Site dependencies
│   └── aveda-institute/              # Example: Aveda Institute site
│
├── output/                           # Generated reports & artifacts
│   └── [client-name]/                # Per-site output
│       ├── scrape/                   # Scraped content
│       ├── gsc/                      # Google Search Console reports
│       ├── bing/                     # Bing Webmaster reports
│       ├── sitemap/                  # Sitemap ping results
│       ├── ai-readiness/             # AI optimization reports
│       ├── deployment/               # Deployment configs
│       └── post-launch/              # Post-launch checklists
│
├── docs/                             # Documentation (you are here)
│   ├── SYSTEM-ARCHITECTURE.md        # This file
│   ├── COMPLETE-WORKFLOW.md          # Step-by-step tutorial
│   ├── TROUBLESHOOTING.md            # Common issues & fixes
│   ├── TEMPLATES-GUIDE.md            # Template documentation
│   ├── SKILLS-REFERENCE.md           # All skills documented
│   ├── QUICK-REFERENCE.md            # Command cheat sheet
│   └── DECISION-TREES.md             # Decision flowcharts
│
├── DEPLOYMENT-GUIDE.md               # GitHub + Vercel guide
├── POST-LAUNCH-GUIDE.md              # Search engine submission guide
├── package.json                      # Root dependencies & scripts
└── README.md                         # Project overview

```

### Directory Explanations

#### `.cursor/` - Cursor AI Automation

**Purpose:** Contains YAML definitions that Cursor AI uses to automate workflows.

**agents/** - High-level orchestrators that manage complete workflows
- Think of agents as "project managers"
- They coordinate multiple skills
- They define inputs, outputs, and success criteria
- Example: `site_builder.yaml` orchestrates the entire build process

**skills/** - Reusable automation tasks
- Think of skills as "specialized workers"
- Each does one specific job well
- Can be called by multiple agents
- Example: `optimize_media.yaml` optimizes images (used by multiple agents)

**output/** - Temporary execution data (gitignored)
- Stores intermediate results during pipeline execution
- Not committed to git
- Can be safely deleted and regenerated

#### `scripts/` - Executable Automation Scripts

**Purpose:** Node.js/Bun scripts that perform actual automation work.

**Key difference from skills:**
- Skills are YAML definitions (what to do)
- Scripts are JavaScript code (how to do it)
- Scripts can be run directly from command line
- Scripts are called by skills

**Organization:**
- Pipeline scripts: `run-pipeline.mjs`, `clone-template.mjs`
- Optimization: `optimize-media.mjs`, `enable-performance-defaults.mjs`
- SEO: `generate-schema.mjs`, `generate-sitemap.mjs`
- Post-launch: `submit-to-gsc.mjs`, `post-launch-checklist.mjs`
- Utilities: `utils.mjs`, `crawl-site.mjs`, `import-content.mjs`

#### `templates/` - Reusable Site Templates

**Purpose:** Pre-built structures that can be cloned for new sites.

**client-base/** - The foundation for every new site
- Contains: Astro config, Tailwind setup, base layouts
- Copied when running: `bun run new-site [name]`
- Includes: robots.txt with AI crawlers, basic page structure

**contact-forms/** - Pre-built form integrations
- Three options: Jobber+Zapier, Email (Resend), Generic
- Each includes: Astro component, API route, setup guide
- Installed with: `bun run install-form`

#### `sites/` - Client Website Projects

**Purpose:** Where actual client sites live.

**Structure:**
- Each site is a complete Astro project
- Self-contained with own `package.json`
- Can be developed independently
- Deployed separately to Vercel

**Naming convention:** Use client business name in kebab-case
- Good: `blue-lawns`, `smith-plumbing`, `aveda-institute`
- Bad: `client1`, `project-2024`, `website`

#### `output/` - Generated Reports & Artifacts

**Purpose:** Stores all generated reports, configs, and automation outputs.

**Organization by site:**
```
output/[client-name]/
├── scrape/           # Scraped content & media
├── gsc/              # Google Search Console submission reports
├── bing/             # Bing Webmaster submission reports
├── sitemap/          # Sitemap ping results
├── ai-readiness/     # AI optimization reports
├── deployment/       # Vercel configs, GitHub URLs
└── post-launch/      # Checklist results, timestamps
```

**Why separate from sites/?**
- Keeps client code clean
- Reports can be regenerated
- Easy to gitignore
- Centralized audit trail

---

## Core Concepts

### What is an Agent?

**Definition:** An agent is a high-level workflow orchestrator defined in YAML that coordinates multiple skills to accomplish a complex goal.

**Analogy:** Think of an agent as a project manager who:
- Knows the overall goal
- Breaks it into subtasks
- Assigns tasks to specialists (skills)
- Validates results
- Reports completion

**Characteristics:**
- Defined in `.cursor/agents/*.yaml`
- Contains a `sequence` of steps
- Each step calls a skill
- Has inputs, outputs, and success criteria
- Can be triggered by Cursor AI or manually

**Example: site_builder.yaml**

```yaml
name: Site Builder
description: Full-cycle Astro build orchestrator

sequence:
  - id: scrape_existing_site
    skill: scrape_existing_site
    
  - id: optimize_images
    skill: optimize_media
    
  - id: setup_astro_project
    skill: setup_astro_project
    
  - id: generate_schema
    skill: generate_schema_markup
```

The `site_builder` agent doesn't do the work itself—it delegates to specialized skills.

### What is a Skill?

**Definition:** A skill is a reusable automation task defined in YAML that performs one specific job.

**Analogy:** Think of a skill as a specialist who:
- Does one thing very well
- Can be hired by multiple project managers (agents)
- Has clear inputs and outputs
- Validates their own work

**Characteristics:**
- Defined in `.cursor/skills/*.yaml`
- Contains `steps` (shell commands or script calls)
- Reusable across multiple agents
- Has inputs, outputs, and validation criteria
- Self-contained and testable

**Example: optimize_media.yaml**

```yaml
name: Optimize Media
description: Convert images to AVIF/WebP with responsive sizes

inputs:
  - name: raw_media_path
    type: path
    required: true

outputs:
  - name: optimized_media_path
    type: path
  - name: image_map
    type: path

steps:
  - id: optimize_batch
    run: |
      bun run scripts/optimize-media.mjs \
        --input "{{ inputs.raw_media_path }}" \
        --output "{{ inputs.output_path }}"
```

### How Do Agents Call Skills?

**Workflow:**

1. **Agent defines sequence:**
   ```yaml
   sequence:
     - id: optimize_images
       skill: optimize_media
       inputs:
         raw_media_path: "/path/to/images"
   ```

2. **Cursor resolves skill:**
   - Looks up `optimize_media.yaml` in `.cursor/skills/`
   - Reads skill definition

3. **Skill executes steps:**
   - Runs each step in order
   - Passes inputs as variables
   - Generates outputs

4. **Agent receives outputs:**
   - Uses outputs in subsequent steps
   - Validates success criteria
   - Continues to next skill

**Variable Passing:**
```yaml
# In agent:
- id: optimize_images
  outputs:
    image_map: "/output/image-map.json"

# Next step can use it:
- id: import_content
  inputs:
    image_map: "{{ sequence.optimize_images.outputs.image_map }}"
```

### Pipeline vs Individual Scripts

**Pipeline (`bun run pipeline:full`):**
- Runs complete workflow start-to-finish
- Executes multiple scripts in sequence
- Handles dependencies automatically
- Produces comprehensive reports
- Best for: Initial site build, major updates

**Individual Scripts:**
- Run one specific task
- Can be used independently
- Useful for testing or fixing one step
- Faster for targeted changes
- Best for: Debugging, updates, specific tasks

**When to use each:**

| Task | Use |
|------|-----|
| New site from scratch | `pipeline:full` |
| Update schema only | `generate-schema.mjs` |
| Re-optimize images | `optimize-media.mjs` |
| Test deployment | `setup-deployment.mjs` |
| Resubmit to GSC | `submit-to-gsc.mjs` |

### What Runs Automatically vs Manually?

**Automatic (part of pipeline):**
- Image optimization
- Schema generation
- Performance optimization
- SEO validation
- Build process

**Manual (requires explicit command):**
- Site creation: `bun run new-site`
- Deployment setup: `bun run setup-deployment`
- Post-launch checklist: `bun run post-launch`
- Search engine submissions: `bun run submit:gsc`
- Form installation: `bun run install-form`

**Why separate?**
- Deployment requires GitHub account setup
- Search engine submissions need credentials
- Post-launch should only run once site is live
- Some steps need human decisions

---

## The Build Pipeline

### Overview

**Command:** `bun run pipeline:full --site [client-name]`

**Purpose:** Execute complete site build from source to production-ready output.

**Duration:** 5-15 minutes (depending on site size)

**Location:** `scripts/run-pipeline.mjs`

### Pipeline Steps (Detailed)

#### Step 1: Scrape Existing Site (Optional)

**What it does:**
- Crawls the client's existing website
- Extracts content structure (headings, paragraphs, lists)
- Downloads media assets (images, logos)
- Generates content map JSON
- Creates URL inventory CSV

**Script:** `scripts/crawl-site.mjs`

**Command executed:**
```bash
bun run scripts/crawl-site.mjs --out output/[site]/scrape
```

**Files created:**
```
output/[site]/scrape/
├── content_map.json      # Page structure & text content
├── media_assets/         # Downloaded images
│   ├── logo.png
│   ├── hero.jpg
│   └── service-1.jpg
└── url_map.csv          # URL inventory
```

**What can go wrong:**
- ❌ **Site behind paywall** → Scrape fails, use manual content input
- ❌ **JavaScript-rendered content** → Cheerio can't see it, use Playwright
- ❌ **Rate limiting** → Add delays between requests
- ❌ **Large images timeout** → Skip oversized files, optimize manually

**How to fix:**
```bash
# Skip scraping, create content manually
bun run pipeline:full --site client-name --skip scrape

# Or use alternative scraper
bun run scripts/crawl-site.mjs --use-playwright --out output/client/scrape
```

---

#### Step 2: Optimize Images

**What it does:**
- Converts images to modern formats (AVIF, WebP, JPG)
- Generates responsive sizes (400px, 800px, 1200px)
- Reduces file sizes by 60-80%
- Creates image mapping JSON for imports

**Script:** `scripts/optimize-media.mjs`

---

#### Step 3: Image SEO Renaming

**What it does:**
- Parses `content_map.json` to match images to page context
- Renames images using SEO-friendly format: `[brand]-[city]-[keyword]-[section].webp`
- Preserves alt text from original HTML (validates 10-12 words)
- Compresses images to WebP (80% quality)
- Updates all Astro page references automatically
- Generates verification CSV: `output/[site]/image-seo-map.csv`
- **Fails build if >20% of images remain unrenamed**

**Script:** `scripts/rename-images.mjs`

**Command executed:**
```bash
bun run scripts/rename-images.mjs --site [site-name]
```

**Inputs:**
- `--site`: Site name (required)
- `--contentMap`: Optional. Path to content_map.json (default: `output/[site]/scrape/content_map.json`)
- `--mediaDir`: Optional. Media directory (default: `sites/[site]/public/media`)
- `--outputDir`: Optional. Output directory (default: `sites/[site]/public/media/optimized`)

**Files created:**
```
sites/[site]/public/media/optimized/
├── blue-lawns-burlington-lawn-care-hero-1.webp
├── blue-lawns-cape-may-landscaping-service-2.webp
└── ...

output/[site]/
└── image-seo-map.csv    # Rename mapping with alt text
```

**Naming Algorithm:**
1. Load `content_map.json` to find page context
2. Match image filename to nearest page URL/slug
3. Extract keywords from H1 and H2 headings
4. Determine section (hero, service, about, gallery, etc.)
5. Extract city from page URL or heading
6. Generate: `[brand]-[city]-[primary_keyword]-[section]-[index].webp`

**Alt Text Preservation:**
- Preserves original alt text if 8-15 words
- Generates new alt text from context if missing/invalid
- Format: "Professional [service] services by [brand] in [city]"

**What can go wrong:**
- ❌ **Content map missing** → Script continues with limited context matching
- ❌ **>20% unrenamed** → Build fails, review report and fix issues
- ❌ **Sharp not installed** → Install: `bun add sharp`

**Integration point:** After optimize-images, before import-content

---

#### Step 4: Import Content

**What it does:**
- Imports scraped content into Astro pages
- Maps images to optimized versions
- Updates navigation links

**Script:** `scripts/import-content.mjs`

**Command executed:**
```bash
cd sites/[site] && bun run scripts/import-content.mjs
```

---

#### Step 5: Location Page Generation (Optional)

**What it does:**
- Generates dynamic location pages from `data/locations.json`
- Creates 80% unique content per city
- Injects LocalBusiness schema with geo coordinates
- Updates navigation with locations dropdown

**Script:** `scripts/create-locations.mjs`

**Command executed:**
```bash
bun run scripts/create-locations.mjs
```

**Prerequisites:**
- `data/locations.json` file with city data

**Files created:**
```
sites/[site]/src/pages/locations/
├── cape-may/
│   └── index.astro
├── stone-harbor/
│   └── index.astro
└── ...

output/[site]/
└── locations-summary.md
```

**Content Generation Algorithm:**
- Uses keyword rotation from service arrays
- Generates unique intro paragraphs per city index
- Varies service descriptions and coastal challenges
- Creates city-specific schema with unique coordinates

**Navigation Integration:**
- Updates `src/components/navbar/navbar.astro`
- Adds locations dropdown menu
- Links to all generated location pages

**What can go wrong:**
- ❌ **locations.json missing** → Create file with city data
- ❌ **No coordinates** → Use Google Maps to find lat/lng
- ❌ **Duplicate slugs** → Script handles automatically with index

---

#### Step 6: Generate Schema

**What it does:**
- Detects business type from content
- Generates JSON-LD schema markup
- Validates schema with Google Rich Results

**Script:** `scripts/generate-schema.mjs`

**Command executed:**
```bash
cd sites/[site] && bun run scripts/generate-schema.mjs
```

---

#### Step 7: Optimize Performance

**What it does:**
- Applies performance optimizations
- Enables lazy loading
- Configures asset compression

**Script:** `scripts/enable-performance-defaults.mjs`

**Command executed:**
```bash
bun run scripts/optimize-media.mjs \
  --input "output/[site]/scrape/media_assets" \
  --output "sites/[site]/public/media" \
  --formats avif,webp,jpg \
  --max-width 1200 \
  --quality-avif 80 \
  --quality-webp 85 \
  --quality-jpg 90
```

**Files created:**
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
└── image-map.json        # Maps original → optimized paths
```

**What can go wrong:**
- ❌ **Sharp installation fails** → Reinstall: `bun install sharp`
- ❌ **Out of memory** → Process large images in batches
- ❌ **Corrupted images** → Skipped automatically with warning
- ❌ **WebP not supported** → Check sharp version

**How to fix:**
```bash
# Reinstall sharp
bun remove sharp && bun install sharp

# Process in smaller batches
bun run scripts/optimize-media.mjs --input media/ --output public/ --batch-size 10

# Skip corrupted files (automatic)
# Check optimization.log for warnings
```

---

#### Step 3: Setup Astro Project

**What it does:**
- Creates Astro project structure
- Installs Tailwind + dependencies
- Imports scraped content into pages
- Sets up layouts and components
- Configures build settings

**Script:** `scripts/setup-astro-project.mjs` (called by skill)

**Command executed:**
```bash
cd sites/[site] && bun install && bun run build
```

**Files created:**
```
sites/[site]/
├── src/
│   ├── layouts/
│   │   └── Base.astro              # Base layout
│   ├── pages/
│   │   ├── index.astro             # Homepage
│   │   ├── services.astro          # Services page
│   │   └── contact.astro           # Contact page
│   └── components/
│       ├── Header.astro            # Header component
│       └── Footer.astro            # Footer component
├── public/
│   ├── media/                      # Optimized images
│   ├── sitemap.xml                 # Generated sitemap
│   └── robots.txt                  # From template
├── astro.config.mjs                # Astro configuration
├── tailwind.config.mjs             # Tailwind configuration
└── package.json                    # Dependencies
```

**What can go wrong:**
- ❌ **Bun install fails** → Network issue or corrupt lockfile
- ❌ **Port 4321 in use** → Another dev server running
- ❌ **Import errors** → Missing dependencies in package.json
- ❌ **Tailwind not loading** → Config path incorrect

**How to fix:**
```bash
# Clear cache and reinstall
cd sites/[site]
rm -rf node_modules bun.lockb
bun install

# Use different port
bun run dev --port 3000

# Check Tailwind config
cat tailwind.config.mjs  # Verify paths
```

---

#### Step 4: Generate Schema

**What it does:**
- Detects business type (LocalBusiness, Organization, etc.)
- Generates comprehensive JSON-LD schema
- Includes: name, address, phone, hours, services, geo coordinates
- Adds priceRange (inferred from business type)
- Validates schema structure

**Script:** `scripts/generate-schema.mjs`

**Command executed:**
```bash
bun run scripts/generate-schema.mjs \
  --business "LocalBusiness" \
  --content sites/[site]/data/content.json \
  --out sites/[site]/src/components/site-schema.json
```

**Files created:**
```
sites/[site]/src/components/
└── site-schema.json                # JSON-LD schema markup
```

**Example output:**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Blue Lawns",
  "description": "Professional lawn care services in Burlington, VT",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Burlington",
    "addressRegion": "VT",
    "postalCode": "05401"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 44.4759,
    "longitude": -73.2121
  },
  "telephone": "+1-802-555-1234",
  "priceRange": "$$",
  "serviceArea": {
    "@type": "Place",
    "name": ["Burlington", "South Burlington", "Winooski"]
  }
}
```

**What can go wrong:**
- ❌ **Invalid business type** → Use valid schema.org type
- ❌ **Missing required fields** → Add to content.json
- ❌ **Schema validation fails** → Check JSON syntax
- ❌ **Coordinates incorrect** → Verify lat/long values

**How to fix:**
```bash
# Validate schema locally
bunx ajv validate -s src/components/site-schema.json

# Test in Google Rich Results
# Visit: https://search.google.com/test/rich-results
# Paste site URL

# Regenerate with manual priceRange
bun run scripts/generate-schema.mjs \
  --business "LocalBusiness" \
  --price-range "$$$" \
  --out src/components/site-schema.json
```

---

#### Step 5: Optimize Page Speed

**What it does:**
- Enables performance optimizations
- Lazy loads images and iframes
- Defers non-critical JavaScript
- Minifies CSS and HTML
- Generates critical CSS

**Script:** `scripts/enable-performance-defaults.mjs`

**Files modified:**
```
sites/[site]/
├── astro.config.mjs        # Add compression, minification
└── src/layouts/Base.astro  # Add preconnect, preload hints
```

**What can go wrong:**
- ❌ **PSI score < 95** → Large images, unoptimized fonts, blocking scripts
- ❌ **Lighthouse timeout** → Site too large, reduce bundle size
- ❌ **CLS (layout shift)** → Images without width/height
- ❌ **TBT (blocking time)** → Too much JavaScript

**How to fix:**
```bash
# Test locally
bun run build && bun run preview
# Visit: http://localhost:4321

# Check bundle size
cd sites/[site]/dist
du -sh *

# Identify large files
find . -type f -size +100k

# Test PageSpeed
# Visit: https://pagespeed.web.dev
# Enter: your-site-url
```

---

#### Step 6: Generate SEO Report

**What it does:**
- Audits meta tags (title, description, OG tags)
- Checks internal linking
- Validates canonical tags
- Scans for SEO issues
- Generates report with recommendations

**Script:** `scripts/generate-seo-report.mjs`

**Files created:**
```
output/[site]/seo/
├── meta_audit.json         # Meta tag analysis
├── internal_links.json     # Link structure
└── post_launch.md          # SEO report
```

**What can go wrong:**
- ❌ **Missing meta descriptions** → Add to page frontmatter
- ❌ **Duplicate titles** → Make each page unique
- ❌ **Orphan pages** → Add to navigation or sitemap
- ❌ **Broken internal links** → Fix or remove

**How to fix:**
```bash
# Audit manually
grep -r "<title>" sites/[site]/src/pages/

# Check for duplicates
grep -r "<title>" sites/[site]/src/pages/ | sort | uniq -d

# Validate links
bun run scripts/audit-internal-links.mjs --project sites/[site]
```

---

#### Step 7: Build Site

**What it does:**
- Compiles Astro project to static HTML/CSS/JS
- Optimizes assets
- Generates sitemap.xml
- Creates 404 page
- Outputs to `dist/` folder

**Command executed:**
```bash
cd sites/[site] && bun run build
```

**Files created:**
```
sites/[site]/dist/
├── index.html              # Homepage
├── services/
│   └── index.html          # Services page
├── contact/
│   └── index.html          # Contact page
├── _astro/                 # Optimized assets
│   ├── [hash].css          # Minified CSS
│   └── [hash].js           # Minified JS
├── media/                  # Optimized images
├── sitemap.xml             # Generated sitemap
└── robots.txt              # Copied from public/
```

**What can go wrong:**
- ❌ **Build fails** → Syntax error, missing import, type error
- ❌ **Asset not found** → Broken image path, missing file
- ❌ **Out of memory** → Too many large files
- ❌ **CSS not loading** → Tailwind config issue

**How to fix:**
```bash
# Check for errors
bun run build 2>&1 | tee build.log

# Clear cache
rm -rf .astro dist
bun run build

# Check TypeScript errors
bunx astro check

# Verify dist folder
ls -la sites/[site]/dist/
```

---

### Pipeline Success Indicators

**✅ Complete success:**
```
📊 Pipeline Summary for client-name
══════════════════════════════════════════════════

✅ scrape              success        12.3s
✅ optimize-images     success        45.7s
✅ import              success        8.1s
✅ schema              success        3.2s
✅ performance         success        5.4s
✅ seo                 success        4.8s
✅ build               success        23.6s

⏱️  Total time: 103.1s
📁 Reports: output/client-name

✅ Build Pipeline Complete!
```

**Next steps are displayed automatically**

---

## Agents Deep Dive

### site_builder.yaml - Master Orchestrator

**File:** `.cursor/agents/site_builder.yaml`

**Purpose:** Master workflow coordinator for complete site build pipeline.

**Triggers:**
- `"start new project"`
- Manual: `bun run pipeline:full --site [name]`

**What it does:**
1. Scrapes existing site (optional)
2. Optimizes images to AVIF/WebP
3. Clones reference repo (if provided)
4. Sets up Astro project structure
5. Generates schema markup
6. Optimizes page speed
7. Validates LLM readability
8. Implements redirects
9. Verifies indexation readiness
10. Deploys to Vercel (manual)

**Inputs:**
- `domain_url`: Source website to migrate
- `repo_url`: Optional GitHub repo for reference
- `business_type`: For schema generation (LocalBusiness, etc.)
- `project_slug`: Directory name for site

**Outputs:**
- `astro_project_path`: Path to generated Astro site
- `performance_report`: Lighthouse results
- `seo_report`: SEO validation summary

**Success criteria:**
- Astro project builds successfully
- Lighthouse score ≥95
- Schema validation passes
- No broken links

**When to use:**
- New site from scratch
- Complete site rebuild
- Major content migration

---

### performance_specialist.yaml - PSI Optimization

**File:** `.cursor/agents/performance_specialist.yaml`

**Purpose:** Ensures 95+ PageSpeed Insights scores on all devices.

**Triggers:**
- Called by `site_builder` agent
- Manual performance optimization

**What it does:**
1. Runs Lighthouse audit
2. Optimizes images (AVIF/WebP + lazy loading)
3. Purges unused CSS
4. Lazy-loads media below fold
5. Confirms CDN caching headers
6. Validates Astro islands efficiency

**Tasks:**
- Image optimization (already handled by optimize_media skill)
- CSS purging (Tailwind JIT)
- Asset compression (Vite)
- Lazy loading configuration
- Critical CSS extraction

**Outputs:**
- Performance report with metrics
- Optimized asset configurations
- Recommendations for improvements

**Success criteria:**
- Mobile PSI ≥95
- Desktop PSI ≥95
- LCP < 2.5s
- FCP < 1.8s
- CLS < 0.1
- TBT < 200ms

---

### schema_specialist.yaml - JSON-LD Generation

**File:** `.cursor/agents/schema_specialist.yaml`

**Purpose:** Create and validate structured data markup for SEO and AI.

**Triggers:**
- Called by `site_builder` agent
- Manual schema regeneration

**What it does:**
1. Derives schema model from business type
2. Generates JSON-LD markup
3. Injects schema into Astro layout
4. Validates with Google Rich Results Test
5. Summarizes schema deployment

**Supported schema types:**
- LocalBusiness (home services)
- Organization (general businesses)
- EducationalOrganization (schools)
- Product (e-commerce items)
- FAQPage (question-answer content)

**Inputs:**
- `business_type`: Schema.org type
- `location_data`: Address, coordinates, hours
- `astro_project_path`: Target site

**Outputs:**
- `schema_file`: JSON-LD file path
- `schema_validation`: Rich Results Test report

**Validation:**
- Schema contains required fields
- Coordinates are valid
- Hours format is correct
- Passes Google Rich Results Test

---

### seo_guard.yaml - Technical SEO Validation

**File:** `.cursor/agents/seo_guard.yaml`

**Purpose:** Preserve rankings and ensure technical SEO integrity.

**Triggers:**
- Called by `site_builder` agent
- Pre-deployment validation

**What it does:**
1. Audits meta titles and descriptions
2. Ensures canonical tags are correct
3. Validates internal linking
4. Generates sitemap.xml
5. Validates robots.txt
6. Compares old vs new URL lists
7. Compiles post-launch SEO report

**Tasks:**
```yaml
tasks:
  - audit_meta              # Title, description, OG tags
  - ensure_canonicals       # Canonical tag validation
  - generate_sitemap        # XML sitemap creation
  - validate_robots         # robots.txt check
  - compare_url_lists       # URL mapping verification
  - compile_seo_report      # Final SEO report
```

**Outputs:**
- `seo_report`: Comprehensive SEO validation
- `sitemap`: XML sitemap file
- `robots`: Validated robots.txt

**Success criteria:**
- Every page has unique title and meta description
- Canonical tags reference primary domain
- No orphan pages detected
- Sitemap passes xmllint validation
- robots.txt allows crawlers

---

### migration_manager.yaml - Domain Migration

**File:** `.cursor/agents/migration_manager.yaml`

**Purpose:** Handle domain changes with zero traffic loss.

**Triggers:**
- Domain change scenarios
- URL structure modifications

**What it does:**
1. Exports existing URL map
2. Builds 301 redirect list
3. Pauses deploy until DNS & GSC confirmed
4. Tests for 404 errors
5. Verifies indexation after switch

**Critical features:**
- URL mapping (old → new)
- 301 redirect generation
- DNS verification wait
- 404 testing
- Search Console resubmission

**Outputs:**
- `redirect_manifest`: vercel.json or _redirects file
- `migration_report`: Status and verification

**Success criteria:**
- All old URLs have 301 redirects
- No 404 errors on important pages
- DNS propagated correctly
- Search Console updated

**When to use:**
- Changing domain names
- Restructuring URLs
- Consolidating multiple domains

---

### post_launch_manager.yaml - Post-Deployment

**File:** `.cursor/agents/post_launch_manager.yaml`

**Purpose:** Automate search engine submissions and post-deployment verification.

**Triggers:**
- `"run post-launch"`
- `"submit to search engines"`
- Manual: `bun run post-launch --site [name]`

**What it does:**
1. Verifies site is live and accessible
2. Validates schema on live URL
3. Submits sitemap to Google Search Console
4. Submits sitemap to Bing Webmaster Tools
5. Pings search engines about sitemap
6. Verifies AI readiness (crawler access)
7. Generates comprehensive post-launch report

**Sequence:**
```yaml
sequence:
  - verify_deployment      # HTTP 200 check
  - validate_schema        # Schema in HTML
  - submit_to_gsc          # Google submission
  - submit_to_bing         # Bing submission
  - ping_sitemap           # Ping Google/Bing
  - verify_ai_readiness    # AI crawler check
  - generate_report        # Summary report
```

**Outputs:**
- `submission_report`: Comprehensive status report
- `checklist_results`: JSON with timestamps
- `ai_readiness_score`: AI optimization grade

**Success criteria:**
- Site returns 200 status code
- Sitemaps submitted to Google and Bing
- AI crawlers have access
- Schema validation passes
- Post-launch checklist 80%+ complete

---

## Key Scripts Reference

### run-pipeline.mjs

**Purpose:** Master orchestrator that executes the full build pipeline.

**Usage:**
```bash
bun run pipeline:full --site [client-name] [--skip step1,step2] [--only stepX]
```

**Inputs:**
- `--site`: Required. Client site name
- `--skip`: Optional. Steps to skip (comma-separated)
- `--only`: Optional. Run only one specific step

**Outputs:**
- Pipeline summary with timing
- Reports in `/output/[site]/`
- Built site in `/sites/[site]/dist/`

**When to use:**
- Initial site build
- Complete rebuild
- Testing full workflow

**Example:**
```bash
# Full pipeline
bun run pipeline:full --site blue-lawns

# Skip scraping (no existing site)
bun run pipeline:full --site new-client --skip scrape

# Run only schema generation
bun run pipeline:full --site client --only schema
```

---

### optimize-media.mjs

**Purpose:** Convert images to AVIF/WebP/JPG with responsive sizes.

**Usage:**
```bash
bun run optimize:images --input [path] --output [path] [options]
```

**Inputs:**
- `--input, -i`: Input directory with raw images
- `--output, -o`: Output directory for optimized images
- `--formats, -f`: Output formats (default: avif,webp,jpg)
- `--max-width, -w`: Max width for largest size (default: 1200)
- `--quality-avif`: AVIF quality 0-100 (default: 80)
- `--quality-webp`: WebP quality 0-100 (default: 85)
- `--quality-jpg`: JPG quality 0-100 (default: 90)

**Outputs:**
- Optimized images in multiple formats and sizes
- `image-map.json`: Mapping of original → optimized paths

**When to use:**
- After scraping media assets
- Before importing to Astro
- When updating existing images

**Example:**
```bash
bun run optimize:images \
  --input output/blue-lawns/scrape/media_assets \
  --output sites/blue-lawns/public/media \
  --formats avif,webp,jpg \
  --max-width 1200
```

---

### generate-schema.mjs

**Purpose:** Generate JSON-LD schema markup for a site.

**Usage:**
```bash
bun run scripts/generate-schema.mjs --business [type] --out [path] [options]
```

**Inputs:**
- `--business`: Schema.org type (LocalBusiness, Organization, etc.)
- `--content`: Optional. Path to content.json with site data
- `--model`: Optional. Base schema JSON to extend
- `--out`: Output path for schema JSON
- `--price-range`: Optional. Override price range (e.g., "$$")

**Outputs:**
- `site-schema.json`: Complete JSON-LD schema

**When to use:**
- Initial schema generation
- Updating business information
- Adding new schema types

**Example:**
```bash
bun run scripts/generate-schema.mjs \
  --business "LocalBusiness" \
  --content sites/blue-lawns/data/content.json \
  --price-range "$$" \
  --out sites/blue-lawns/src/components/site-schema.json
```

---

### setup-deployment.mjs

**Purpose:** Interactive guide for GitHub + Vercel deployment setup.

**Usage:**
```bash
bun run setup-deployment --site [client-name]
```

**Inputs:**
- `--site`: Client site name

**Outputs:**
- `/output/[site]/deployment/setup-checklist.json`
- `/output/[site]/deployment/vercel-config.json`
- Git repository initialized and pushed
- Vercel project created

**When to use:**
- First deployment of new site
- Setting up client's GitHub/Vercel accounts
- Configuring custom domains

**Example:**
```bash
bun run setup-deployment --site blue-lawns
# Follow interactive prompts
```

**Prompts walk through:**
1. Git initialization
2. GitHub repository creation
3. First commit and push
4. Vercel project import
5. Environment variables
6. Custom domain configuration
7. Optional test deployment

---

### post-launch-checklist.mjs

**Purpose:** Comprehensive 9-step post-deployment verification.

**Usage:**
```bash
bun run post-launch --site [client-name]
```

**Inputs:**
- `--site`: Client site name

**Outputs:**
- `/output/[site]/post-launch/checklist-results.json`
- `/output/[site]/post-launch/submission-report.md`
- Progress percentage (X/9 completed)

**When to use:**
- Immediately after site goes live
- After DNS propagation completes
- Before final client handoff

**Example:**
```bash
bun run post-launch --site blue-lawns
# Interactive checklist with 9 steps
```

**Checklist items:**
1. Deployment verification (HTTP 200)
2. Schema validation
3. Google Search Console submission
4. Bing Webmaster Tools submission
5. Sitemap ping
6. AI crawler access check
7. Google Business Profile (if local business)
8. Performance verification (PSI 95+)
9. Directory submissions (optional)

---

### submit-to-gsc.mjs

**Purpose:** Submit sitemap to Google Search Console via API.

**Usage:**
```bash
bun run submit:gsc --site [name] --site-url [url] [--manual]
```

**Inputs:**
- `--site`: Client site name
- `--site-url`: Live site URL
- `--sitemap-url`: Optional. Sitemap URL (defaults to [site-url]/sitemap.xml)
- `--manual`: Optional. Force manual instructions instead of API

**Outputs:**
- `/output/[site]/gsc/submission-report.json`

**When to use:**
- After site goes live
- After updating sitemap
- When resubmitting for recrawl

**Example:**
```bash
# With API credentials configured
bun run submit:gsc \
  --site blue-lawns \
  --site-url https://bluelawns.com

# Force manual instructions
bun run submit:gsc \
  --site blue-lawns \
  --site-url https://bluelawns.com \
  --manual
```

**Requires (for API):**
- `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Service account with Search Console permissions

---

### submit-to-bing.mjs

**Purpose:** Submit sitemap to Bing Webmaster Tools via API.

**Usage:**
```bash
bun run submit:bing --site [name] --site-url [url] [--manual]
```

**Inputs:**
- `--site`: Client site name
- `--site-url`: Live site URL
- `--sitemap-url`: Optional. Sitemap URL
- `--manual`: Optional. Force manual instructions

**Outputs:**
- `/output/[site]/bing/submission-report.json`

**When to use:**
- After site goes live
- After Google Search Console submission
- When updating sitemap

**Example:**
```bash
bun run submit:bing \
  --site blue-lawns \
  --site-url https://bluelawns.com
```

**Requires (for API):**
- `BING_WEBMASTER_API_KEY` environment variable

---

### ping-sitemap.mjs

**Purpose:** Notify Google and Bing about sitemap updates.

**Usage:**
```bash
bun run ping:sitemap --site-url [url] [--site name]
```

**Inputs:**
- `--site-url`: Live site URL (required)
- `--site`: Optional. Site name for report saving

**Outputs:**
- `/output/[site]/sitemap/ping-results.json` (if --site provided)

**When to use:**
- After submitting sitemap
- After significant content updates
- As part of post-launch checklist

**Example:**
```bash
bun run ping:sitemap --site-url https://bluelawns.com --site blue-lawns
```

**What it does:**
- Pings: `google.com/ping?sitemap=[url]`
- Pings: `bing.com/ping?sitemap=[url]`
- Reports success/failure for each

---

### check-ai-readiness.mjs

**Purpose:** Verify AI optimization and crawler access.

**Usage:**
```bash
bun run check:ai --site [name] --url [live-url]
```

**Inputs:**
- `--site`: Client site name (required)
- `--url`: Optional. Live URL for testing

**Outputs:**
- `/output/[site]/ai-readiness/report.md`
- `/output/[site]/ai-readiness/results.json`
- Score: 0-60 points, Grade: A-F

**When to use:**
- After site deployment
- As part of post-launch checklist
- When optimizing for AI discovery

**Example:**
```bash
bun run check:ai \
  --site blue-lawns \
  --url https://bluelawns.com
```

**Checks performed:**
1. robots.txt AI crawler permissions (10 pts)
2. Schema markup completeness (15 pts)
3. Semantic HTML structure (10 pts)
4. Heading hierarchy (10 pts)
5. FAQ content presence (10 pts)
6. Live URL schema check (5 pts)

---

### install-form.mjs

**Purpose:** Install pre-built contact form integration into a site.

**Usage:**
```bash
bun run install-form --site [name] --type [form-type]
```

**Inputs:**
- `--site`: Client site name (required)
- `--type`: Form type (jobber-zapier, email-resend, generic)

**Outputs:**
- `sites/[site]/src/components/ContactForm.astro`
- `sites/[site]/src/pages/api/submit-form.js`
- Updated `.env` with required variables

**When to use:**
- During initial site setup
- When adding contact form to existing site
- When switching form integrations

**Example:**
```bash
bun run install-form \
  --site blue-lawns \
  --type jobber-zapier
```

**Prompts for:**
- API credentials (Zapier webhook URL, Resend API key, etc.)
- Contact email address
- Form configuration options

---

### choose-form.mjs

**Purpose:** Interactive decision helper for selecting form integration.

**Usage:**
```bash
bun run choose-form
```

**Inputs:**
- Interactive prompts (no CLI args)

**Outputs:**
- Recommendation with reasoning
- Estimated cost and setup time
- Option to install immediately

**When to use:**
- Unsure which form integration to use
- Evaluating options for client
- Documenting form decision

**Example:**
```bash
bun run choose-form
# Answer questions about client's needs
# Receives recommendation
# Optional: Install immediately
```

**Decision factors:**
- Does client use Jobber?
- Budget for Zapier ($30/mo)
- Need for CRM integration
- Email notification requirements

---

### rename-images.mjs

**Purpose:** SEO-driven image renaming with alt text preservation.

**Usage:**
```bash
bun run scripts/rename-images.mjs --site [site-name]
```

**Inputs:**
- `--site`: Site name (required)
- `--contentMap`: Optional. Path to content_map.json
- `--mediaDir`: Optional. Media directory path
- `--outputDir`: Optional. Output directory path

**Outputs:**
- `sites/[site]/public/media/optimized/` - Renamed and optimized images
- `output/[site]/image-seo-map.csv` - Rename mapping report

**Features:**
- Context-aware naming from page H1/H2 headings
- Alt text preservation (validates 10-12 words)
- WebP compression (80% quality)
- Build failure if >20% unrenamed

**When to use:**
- After image optimization
- Before content import
- As part of automated pipeline

---

### create-locations.mjs

**Purpose:** Generate dynamic location pages with 80% unique content.

**Usage:**
```bash
bun run scripts/create-locations.mjs
```

**Inputs:**
- `data/locations.json` - Array of city objects with coordinates

**Outputs:**
- `sites/[site]/src/pages/locations/[city-slug]/index.astro` - Generated pages
- `output/[site]/locations-summary.md` - Summary report

**Features:**
- 80% unique content per city using keyword rotation
- LocalBusiness schema injection with geo coordinates
- SEO-optimized meta titles and descriptions
- City-specific hero image references
- Dynamic internal linking

**Content Generation:**
- Unique intro paragraphs per city
- Varied service descriptions
- City-specific schema markup
- Custom meta tags

**Navigation Integration:**
- Updates navbar with locations dropdown
- Links to all generated location pages

**When to use:**
- For multi-location businesses
- After initial site setup
- When adding new service cities

---

### Additional Scripts

**clone-template.mjs**
- Creates new site from client-base template
- Called by: `bun run new-site [name]`

**crawl-site.mjs**
- Scrapes existing websites for content
- Outputs: content_map.json, media_assets/, url_map.csv

**import-content.mjs**
- Imports scraped content into Astro pages
- Maps images to optimized versions

**generate-sitemap.mjs**
- Creates XML sitemap with priority and changefreq
- Outputs: public/sitemap.xml

**validate-schema.mjs**
- Validates JSON-LD schema structure
- Checks for required fields

**generate-seo-report.mjs**
- Audits meta tags, links, and SEO issues
- Outputs: SEO report with recommendations

---

**End of SYSTEM-ARCHITECTURE.md**

---

This guide provides the technical foundation for understanding and working with the Web-Dev Factory HQ system. For step-by-step workflows, see COMPLETE-WORKFLOW.md. For troubleshooting, see TROUBLESHOOTING.md.

