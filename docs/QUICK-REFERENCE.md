# Quick Reference

One-page cheat sheet for Web-Dev Factory HQ commands and locations.

---

## COMMON COMMANDS

### Site Creation & Building

```bash
# Create new site from template
bun run new-site [client-name]

# Run full build pipeline (comprehensive)
bun run pipeline:full --site [client-name]

# Run pipeline in light mode (faster, skips heavy operations)
bun run pipeline:full --site [client-name] --mode=light

# Run pipeline without scraping
bun run pipeline:full --site [client-name] --skip scrape

# Run only specific step
bun run pipeline:full --site [client-name] --only schema
```

### Development & Testing

```bash
# Start dev server
cd sites/[client-name]
bun run dev
# Visit: http://localhost:4321

# Build for production
bun run build

# Preview production build
bun run preview

# Check TypeScript errors
bunx astro check
```

### Forms

```bash
# Choose form integration (interactive)
bun run choose-form

# Install form
bun run install-form --site [client-name] --type [jobber-zapier|email-resend|generic]

# Test form API
curl -X POST http://localhost:4321/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"555-1234"}'
```

### Image Optimization

```bash
# Optimize images
bun run optimize:images \
  --input output/[site]/scrape/media_assets \
  --output sites/[site]/public/media \
  --formats avif,webp,jpg

# Check optimized images
ls -lh sites/[site]/public/media/*.avif
```

### Schema & SEO

```bash
# Generate schema with FAQ detection
bun run scripts/generate-schema-with-faq.mjs \
  --site [client-name] \
  --business "LocalBusiness" \
  --price-range "$$"

# Generate sitemap
cd sites/[client-name]
bun run scripts/generate-sitemap.mjs \
  --project . \
  --domain https://example.com \
  --out public/sitemap.xml

# Validate schema locally
bunx ajv validate -s sites/[site]/src/components/site-schema.json

# Test schema in Google Rich Results
# Visit: https://search.google.com/test/rich-results
# Enter: your-site-url
```

### Deployment

```bash
# Setup GitHub + Vercel (interactive)
bun run setup-deployment --site [client-name]

# Push changes to deploy
cd sites/[client-name]
git add .
git commit -m "Update [description]"
git push
# Vercel auto-deploys in 1-2 minutes
```

### Quality Checks

```bash
# Run AI content QA analysis
cd sites/[client-name]
SITE_NAME=[client-name] BUSINESS_TYPE="service type" \
  bun run scripts/ai-qa-review.mjs

# Run accessibility validation (WCAG 2.1 AA)
cd sites/[client-name]
bun run scripts/test-accessibility.mjs

# Run accessibility on custom pages
PAGES="/,/services,/pricing" bun run scripts/test-accessibility.mjs

# Run accessibility on production URL
BASE_URL=https://client.com bun run scripts/test-accessibility.mjs
```

### Post-Launch

```bash
# Run post-launch checklist (interactive)
bun run post-launch --site [client-name]

# Submit to Google Search Console
bun run submit:gsc --site [client-name] --site-url https://client.com

# Submit to Bing Webmaster Tools
bun run submit:bing --site [client-name] --site-url https://client.com

# Ping sitemaps
bun run ping:sitemap --site-url https://client.com

# Check AI readiness
bun run check:ai --site [client-name] --url https://client.com
```

---

## FILE LOCATIONS

### Project Structure

```
Web-Dev-Factory-HQ/
├── .cursor/
│   ├── agents/              # Workflow orchestrators
│   └── skills/              # Reusable tasks
├── scripts/                 # Automation scripts
├── templates/
│   ├── client-base/         # Base template
│   └── contact-forms/       # Form templates
├── sites/
│   └── [client-name]/       # Client sites
└── output/
    └── [client-name]/       # Generated reports
```

### Important Files

```bash
# Configuration
package.json                 # Root dependencies
.env                        # Environment variables (gitignored)

# Client Site
sites/[client]/
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind configuration
├── src/
│   ├── layouts/Base.astro  # Base layout
│   ├── pages/              # Routes
│   └── components/         # Components
├── public/
│   ├── robots.txt          # AI crawler permissions
│   └── sitemap.xml         # Generated sitemap
└── .env                    # Site environment variables

# Reports & Output
output/[client]/
├── scrape/                 # Scraped content
├── gsc/                    # Google Search Console reports
├── bing/                   # Bing Webmaster reports
├── seo/                    # SEO audit reports
├── ai-qa/                  # AI content QA analysis
│   ├── qa-report.md        # Human-readable QA report
│   └── qa-score.json       # Numeric quality scores
├── accessibility/          # WCAG compliance reports
│   ├── accessibility_report.md
│   └── accessibility_report.json
├── ai-readiness/           # AI optimization reports
├── deployment/             # Deployment configs
├── post-launch/            # Post-launch checklists
├── logs/                   # Pipeline execution logs
├── pipeline-status.json    # Real-time pipeline status
└── summary.md              # Pipeline summary report
```

---

## ENVIRONMENT VARIABLES

### Root `.env`

```bash
# Not typically used at root level
# API keys for automation (optional)
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account.json
BING_WEBMASTER_API_KEY=your_api_key
```

### Site `.env` (sites/[client]/.env)

```bash
# Contact Forms
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=owner@clientwebsite.com
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx

# Analytics (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# API Keys (optional)
BING_WEBMASTER_API_KEY=xxxxxxxxxxxxx
```

### Vercel Environment Variables

Add in Vercel Dashboard → Project → Settings → Environment Variables:
- `RESEND_API_KEY`
- `CONTACT_EMAIL`
- `ZAPIER_WEBHOOK_URL`
- `GOOGLE_ANALYTICS_ID` (if used)

---

## QUICK DIAGNOSTICS

### Check Site Health

```bash
# Site is accessible
curl -I https://client.com
# Expected: 200 OK

# Sitemap exists
curl -I https://client.com/sitemap.xml
# Expected: 200 OK, Content-Type: application/xml

# Robots.txt allows crawlers
curl https://client.com/robots.txt
# Expected: User-agent: * \n Allow: /

# Schema in HTML
curl -s https://client.com | grep "application/ld+json"
# Expected: JSON-LD schema block

# Form API works
curl -X POST https://client.com/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"555-1234"}'
# Expected: {"success":true}
```

### Check Build

```bash
# Check bundle size
cd sites/[client]/dist
du -sh *
# Target: < 5 MB total

# Find large files
find . -type f -size +100k -exec ls -lh {} \;

# Check image formats
cd sites/[client]/public/media
file *.{avif,webp,jpg} 2>/dev/null | head -5
# Expected: AVIF, WebP, JPG formats
```

### Check Performance

```bash
# Local Lighthouse test
cd sites/[client]
bun run build && bun run preview
npx lighthouse http://localhost:4321 --view

# Live site test
# Visit: https://pagespeed.web.dev
# Enter: https://client.com
# Target: 95+ (mobile & desktop)
```

### Check Indexation

```bash
# Google search
site:client.com
# Expected: Shows all pages

# Bing search
site:client.com
# Expected: Shows all pages

# Google Search Console
# Visit: https://search.google.com/search-console
# Check: Coverage → Valid pages
```

---

## COMMON ISSUES & FIXES

### Build Fails

```bash
# Clear cache and rebuild
cd sites/[client]
rm -rf .astro dist node_modules bun.lockb
bun install
bun run build
```

### Form Not Working

```bash
# Check environment variables
cd sites/[client]
cat .env
# Verify: RESEND_API_KEY, CONTACT_EMAIL

# Test API route locally
bun run dev
curl -X POST http://localhost:4321/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"555-1234"}'
```

### Images Not Optimized

```bash
# Re-run optimization
bun run optimize:images \
  --input sites/[client]/public/media \
  --output sites/[client]/public/media-opt \
  --formats avif,webp,jpg
```

### PSI Score Low

```bash
# Check image sizes
cd sites/[client]/public/media
du -h *.{jpg,png,webp,avif} | sort -hr | head -10
# Each should be < 200 KB

# Check bundle size
cd sites/[client]/dist/_astro
du -h *.{css,js} | sort -hr
# CSS: < 100 KB, JS: < 200 KB
```

### Not Indexed

```bash
# Verify sitemap submitted
# Google Search Console → Sitemaps
# Status should be: "Success"

# Check robots.txt
curl https://client.com/robots.txt
# Should NOT have: Disallow: /

# Request indexing manually
# Google Search Console → URL Inspection
# Enter URL → Request Indexing
```

---

## KEYBOARD SHORTCUTS

### In Terminal

```bash
# Stop dev server
Ctrl+C

# Clear terminal
Ctrl+L or clear

# Search command history
Ctrl+R (then type command)

# Previous command
↑ (up arrow)
```

### In Browser (DevTools)

```bash
# Open DevTools
Cmd+Option+I (Mac)
Ctrl+Shift+I (Windows)

# Toggle device toolbar (mobile view)
Cmd+Shift+M (Mac)
Ctrl+Shift+M (Windows)

# Network tab
Cmd+Option+I, then click "Network"

# View page source
Cmd+Option+U (Mac)
Ctrl+U (Windows)
```

---

## USEFUL LINKS

### Development

- **Astro Docs:** https://docs.astro.build
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Bun Docs:** https://bun.sh/docs

### Deployment & Hosting

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repos:** https://github.com/[username]

### SEO & Search Engines

- **Google Search Console:** https://search.google.com/search-console
- **Bing Webmaster Tools:** https://www.bing.com/webmasters
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **PageSpeed Insights:** https://pagespeed.web.dev
- **Schema.org Validator:** https://validator.schema.org

### Tools

- **DNS Checker:** https://whatsmydns.net
- **SSL Checker:** https://ssllabs.com/ssltest
- **Image Optimizer:** https://squoosh.app
- **JSON Formatter:** https://jsonformatter.org

---

## VERSION CONTROL

### Git Commands

```bash
# Check status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "Update [description]"

# Push to GitHub (triggers Vercel deployment)
git push

# View commit history
git log --oneline

# View remote URL
git remote -v

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main
```

### Vercel Deployment

```bash
# After git push, Vercel automatically:
# 1. Detects push to main branch
# 2. Runs: bun run build
# 3. Deploys dist/ to CDN
# 4. Completes in 1-2 minutes

# View deployment status:
# Vercel Dashboard → Project → Deployments
```

---

## TIPS & TRICKS

### Speed Up Development

```bash
# Use --only flag to run single step
bun run pipeline:full --site client --only schema

# Skip scraping for sites without existing content
bun run pipeline:full --site client --skip scrape

# Test form locally before deploying
cd sites/client && bun run dev
# Submit form at http://localhost:4321/contact
```

### Optimize Workflow

```bash
# Create alias for common commands
alias new-site="bun run new-site"
alias pipeline="bun run pipeline:full --site"
alias deploy="bun run setup-deployment --site"

# Add to ~/.zshrc or ~/.bashrc
```

### Batch Operations

```bash
# Build multiple sites
for site in site1 site2 site3; do
  bun run pipeline:full --site $site
done

# Check all site sizes
du -sh sites/*/dist
```

---

## PACKAGE MANAGEMENT

### Bun Commands

```bash
# Install dependencies
bun install

# Add dependency
bun add [package-name]

# Remove dependency
bun remove [package-name]

# Update all dependencies
bun update

# Run script
bun run [script-name]
```

### npm Equivalent (if Bun not available)

```bash
# Install
npm install

# Add
npm install [package-name]

# Remove
npm uninstall [package-name]

# Update
npm update

# Run
npm run [script-name]
```

---

## EMERGENCY PROCEDURES

### Site is Down

```bash
# 1. Check Vercel status
# Visit: https://vercel.com/[team]/[project]
# Look for red "Error" badge

# 2. Check recent deployments
# Click project → Deployments
# Find failed deployment, view logs

# 3. Rollback if needed
# Click "..." on previous successful deployment
# Click "Promote to Production"

# 4. Contact developer if needed
```

### Lost Environment Variables

```bash
# 1. Check local .env file
cd sites/[client]
cat .env

# 2. Check Vercel dashboard
# Project → Settings → Environment Variables

# 3. Regenerate if needed
# API keys from respective services:
# - Resend: https://resend.com/api-keys
# - Zapier: Check Zap settings
```

### Corrupted Site

```bash
# 1. Restore from git
git log --oneline
git checkout [commit-hash]

# 2. Or re-clone template
mv sites/[client] sites/[client]-backup
bun run new-site [client]
# Copy content from backup

# 3. Or rebuild from pipeline
bun run pipeline:full --site [client]
```

---

## DOCUMENTATION LINKS

### Internal Docs

- [SYSTEM-ARCHITECTURE.md](./SYSTEM-ARCHITECTURE.md) - Technical reference
- [COMPLETE-WORKFLOW.md](./COMPLETE-WORKFLOW.md) - Step-by-step tutorial
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [DECISION-TREES.md](./DECISION-TREES.md) - Decision frameworks
- [TEMPLATES-GUIDE.md](./TEMPLATES-GUIDE.md) - Template documentation
- [SKILLS-REFERENCE.md](./SKILLS-REFERENCE.md) - All skills catalog

### External Guides

- [DEPLOYMENT-GUIDE.md](../DEPLOYMENT-GUIDE.md) - GitHub + Vercel setup
- [POST-LAUNCH-GUIDE.md](../POST-LAUNCH-GUIDE.md) - Search engine submission
- [AI-OPTIMIZATION.md](../templates/contact-forms/AI-OPTIMIZATION.md) - AI discovery

---

**Print this page and keep it handy!**

*Quick Reference for Web-Dev Factory HQ v0.1.0*

