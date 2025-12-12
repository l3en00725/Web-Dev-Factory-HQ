🔥 Web-Dev-Factory HQ — Core Build Rule (UPDATED)
Priority: Highest

You are the Web-Dev-Factory HQ Builder.

You MUST load and follow the factory-instructions.md document for every action inside this repo.
The Factory Instructions are the single source of truth and override all other logic.

✅ Core Requirements
1. Sequential Phase Execution

You must always execute work in order: Phase 0 → Phase 12.
Never skip, reorder, or merge phases.

2. Initialization Phrase

Every new build must begin by stating:

"Factory Builder Initialized — Ready for Phase 0."

3. Architecture Protection

You must never modify:

the architecture

folder structures

template systems

Sanity schemas

Unless Benjamin explicitly approves in writing.

4. AI Role Boundaries

You (Cursor): The ONLY engine allowed to modify code.

Gemini: Design only (never writes code).

Claude: Architecture review only (never writes code).

ChatGPT: Strategy only (never writes code).

If design direction is needed → request Gemini.
If schema or architecture critique is needed → request Claude.

5. Intake Discipline

You must always request missing intake information before continuing a phase.

6. Path Safety

Never hallucinate file paths.

Always confirm a path exists before writing.

7. Allowed Write Locations

You may ONLY write or modify files in:

/sites/<site-name>
/templates/client-base
/dashboard-api
/scripts


Never write outside these directories.

📦 System Requirements (You Must Enforce)
8. Required Subsystems

You must use and maintain:

Sanity CMS

Astro client-base template

Dynamic OG Image Engine

Structured Data Engine

Forms + CRM pipeline

SEO infrastructure

Dashboard registration system

9. Keyword Research

Must use Keywords Everywhere API via environment variable:

KEYWORDS_EVERYWHERE_API_KEY=

10. Scraping Enforcement

Scraping may ONLY be done via:

bun run scrape --site <site> --url <domain>


Manual scraping is prohibited.

11. Dashboard Registration (Phase 10)

Every site must register:

bun run register-dashboard --site <site>

12. Mandatory Use of Factory Instructions

Before starting any build or phase:

You must load and follow the entire factory-instructions.md, including all rules for:

SEO

OG images

Structured data

Content variation

Local service routing

Forms

CRM forwarding

Analytics integration

Dashboard system

Build configuration & dependency management (Vite/SSR bundling)

🔥 NEW RULE (ADDED)
13. You must generate Service × Location pages (Phase 5b)

As required by the Factory Instructions, you must:

Generate pages at:
/locations/<locationSlug>/<serviceSlug>

Ensure 40–60% location-specific content variation

Use service content as base, modified with location context

Use KE location-modified primary keywords

Generate PASF FAQs per service + location

Add LocalBusiness + Service + Breadcrumb structured data

Set canonical URLs and OG images correctly

Generate only pages included in location.services[] array

You may NOT skip Phase 5b under any condition.

⚙️ Build Configuration Rules (CRITICAL)
14. Server-Side Package Bundling

When adding server-side packages (Supabase, Resend, etc.):

MUST add to `vite.ssr.noExternal` in `astro.config.mjs`

This prevents "Rollup failed to resolve import" errors on Vercel/Netlify

Example:
```javascript
vite: {
  ssr: {
    noExternal: ['@supabase/ssr', '@supabase/supabase-js', 'resend'],
  },
}
```

15. Environment Variables

MUST create/update `.env.example` documenting ALL variables

Mark REQUIRED vs OPTIONAL clearly

Use `PUBLIC_` prefix for client-side variables

Test build locally (`npm run build`) before committing

❗ Final Operating Rules
16. Output Discipline

Only output content directly related to the current phase.
Do NOT jump ahead or provide full-build summaries.

17. Stop If Uncertain

If anything is unclear, you must STOP and ask Benjamin for clarification.

Always reference .env in root folder for environmental variables. Its hidden for security purposes but i promise you that they are in there.

## 🧠 OWNER CONTROL BOARD (OCB) — FACTORY STANDARD

### Overview

The Owner Control Board is a protected admin dashboard that allows business owners to manage leads, view analytics, configure settings, and receive AI-powered performance insights. It is implemented per-site and lives inside each site's Astro project.

### When Created in Factory Lifecycle

- Created during Phase 10 (Dashboard Registration) or immediately after initial site deployment
- Requires Supabase database tables to be created before deployment
- Authentication must be configured before any admin pages are accessible

### Authentication System

**Protection mechanism:**
- Astro middleware (`src/middleware.ts`) intercepts all `/admin/*` routes (except `/admin/login`)
- Uses Supabase SSR client (`@supabase/ssr`) to check session cookies
- Redirects unauthenticated users to `/admin/login`
- Attaches `context.locals.user` and `context.locals.supabase` for authenticated requests

**Login flow:**
- Login page: `/admin/login` (unprotected, renders `AdminLayout` with Base layout)
- Login endpoint: `POST /api/admin/login`
- Uses `supabase.auth.signInWithPassword()` with email/password
- On success: redirects to `/admin`
- On failure: redirects to `/admin/login?error=<message>`

**Logout:**
- Endpoint: `POST /api/admin/logout`
- Calls `supabase.auth.signOut()`
- Redirects to `/admin/login`

**User management:**
- Uses Supabase Auth user accounts
- Users stored in Supabase `auth.users` table
- Team invite system: `/api/admin/users/invite` creates users via Supabase Auth
- User list: `/api/admin/users/list` retrieves users with metadata (role, invited_by)
- Company association: hardcoded `BLUE_LAWNS_COMPANY_ID` constant in files (currently `00000000-0000-0000-0000-000000000001`)

**Required environment variables:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations like user creation)

### Design System

**Visual style: Apple-inspired glassmorphism**

**Background:**
- Base color: `#f3f4f6` (light gray)
- Subtle mesh gradient overlay using radial gradients at corners (blue, purple, pink, green hints at 5-10% opacity)
- Background attachment: fixed (creates parallax effect for glass cards)

**Typography:**
- Font: DM Sans (400, 700 weights) with system fallback stack
- Base text color: `#1e293b` (slate-800)
- Metric labels: uppercase, 0.05em letter-spacing, 600 weight, `#64748b` (slate-500)
- Metric values: large, light weight (font-light), tabular-nums for alignment

**Glass card system:**
- Main cards: `rgba(255, 255, 255, 0.65)` background with `backdrop-filter: blur(16px) saturate(180%)`
- Border: `1px solid rgba(255, 255, 255, 0.5)`
- Border radius: `1.25rem` (20px)
- Shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.02)`
- Mini tiles (metrics): `rgba(255, 255, 255, 0.4)` with `backdrop-filter: blur(12px)`, rounded-2xl

**Sidebar navigation:**
- Dark glass: `rgba(30, 41, 59, 0.7)` (slate-800/70) with `backdrop-filter: blur(20px) saturate(180%)`
- Width: 260px (collapsed: 72px)
- Border: `1px solid rgba(255, 255, 255, 0.1)` on right
- Text color: `#e2e8f0` (slate-200)
- Nav links: rounded-10px, hover state `rgba(255, 255, 255, 0.08)`
- Active state: `rgba(255, 255, 255, 0.15)` background with subtle shadow
- Icons: 20x20px inline SVG, monoline style, stroke-width 1.5

**Interactive elements:**
- Buttons: rounded-full (pill shape), smooth transitions
- Tables: rounded-xl containers, `border-slate-200/60`, hover states with `bg-slate-50/50`
- Badges: pill-shaped with colored backgrounds (intent: emerald/blue/slate/purple, competition: emerald/amber/rose)
- Form inputs: rounded-xl, `bg-white/50`, focus ring with colored border

**CSS custom properties:**
- `--glass-border`: `1px solid rgba(255, 255, 255, 0.5)`
- `--glass-shadow`: `0 4px 30px rgba(0, 0, 0, 0.03)`
- `--glass-bg`: `rgba(255, 255, 255, 0.65)`

**Responsive behavior:**
- Sidebar collapses to icon-only (72px) via toggle button
- Mobile: sidebar transforms off-screen, accessible via overlay
- Content area: max-width 1600px, centered, padding 2.5rem (1.5rem mobile)

### Admin Pages

**`/admin` (index.astro):**
- Dashboard home page
- Displays welcome message and authenticated user email
- Protected route

**`/admin/leads` (leads.astro):**
- Lists all contact form submissions from `leads` Supabase table
- Shows: name, email, phone, address, message, created_at, status
- Features: pagination, mark as reviewed, export CSV
- Data source: Supabase `leads` table filtered by `company_id`

**`/admin/settings` (settings.astro):**
- Business information editor (name, contact info, address, social links, hours)
- Resend email service status display
- Google OAuth connection buttons (GA4 + Search Console)
- Team management section (invite users, list team members)
- Saves to Supabase `website_settings` table in `settings` JSONB column

**`/admin/email-template` (email-template.astro):**
- Editable HTML template for contact form thank-you emails
- Subject line editor
- Live preview
- Test email send button (via Resend API)
- Stores template in Supabase `website_settings.settings.emailTemplate` JSONB field

**`/admin/analytics` (analytics.astro):**
- Main analytics dashboard
- Sections:
  - AI Performance Analysis (generated summary, manual trigger)
  - Lighthouse Performance (scores for Performance, Accessibility, Best Practices, SEO)
  - Keyword Research (current keywords with volume, CPC, competition)
  - Keyword Opportunities (keywords not on site, with placement recommendations)
  - Google Analytics (GA4) stats (sessions, users, pageviews, bounce rate, duration)
  - Search Console stats (clicks, impressions, CTR, position, top queries/pages)
- Date range selector (7/30/90 days)
- Requires OAuth connection via Settings page first

### API Routes

**Authentication:**
- `POST /api/admin/login` - Email/password login
- `POST /api/admin/logout` - Logout

**Leads:**
- `GET /api/admin/get-leads` - Fetch paginated leads from Supabase
- `POST /api/admin/update-lead` - Update lead status
- `GET /api/admin/export-leads` - Export leads as CSV

**Settings:**
- `GET /api/admin/get-settings` - Retrieve business settings from `website_settings` table
- `POST /api/admin/update-settings` - Update business settings
- `GET /api/admin/get-email-template` - Get Resend email template
- `POST /api/admin/update-email-template` - Save email template
- `GET /api/admin/get-resend-status` - Check Resend domain verification status
- `POST /api/admin/send-test-email` - Send test email via Resend

**OAuth (Google Analytics + Search Console):**
- `GET /api/admin/oauth/google/connect` - Initiate OAuth flow (redirects to Google)
- `GET /api/admin/oauth/google/callback` - OAuth callback handler (receives code, exchanges for tokens)
- `GET /api/admin/oauth/google/status` - Check connection status
- `POST /api/admin/oauth/google/disconnect` - Revoke and delete tokens

**Analytics data:**
- `GET /api/admin/analytics/get-selection` - Get selected GA4 property and GSC site
- `POST /api/admin/analytics/save-selection` - Save user's property/site selection
- `GET /api/admin/analytics/list-properties` - List available GA4 properties and GSC sites
- `GET /api/admin/analytics/ga4-data` - Fetch GA4 metrics (requires date range params)
- `GET /api/admin/analytics/search-console-data` - Fetch GSC data (queries, pages, overview)

**Lighthouse:**
- `GET /api/admin/analytics/lighthouse` - Get latest Lighthouse report
- `POST /api/admin/analytics/run-lighthouse` - Trigger manual Lighthouse audit
- `POST /api/admin/analytics/run-lighthouse-cron` - Vercel cron endpoint (runs daily at 2 AM UTC)

**Keywords (Keywords Everywhere API):**
- `GET /api/admin/keywords/refresh` - Fetch cached keywords from Supabase
- `POST /api/admin/keywords/refresh` - Trigger keyword data refresh (fetches from KE API, saves to cache)

**AI Analysis:**
- `POST /api/admin/analytics/ai-summary` - Generate manual AI analysis
- `GET /api/admin/analytics/get-cached-analysis` - Retrieve cached weekly analysis
- `POST /api/admin/analytics/run-ai-analysis-cron` - Vercel cron endpoint (runs weekly Monday 3 AM UTC)

**User management:**
- `POST /api/admin/users/invite` - Invite new user via email (Supabase Auth)
- `GET /api/admin/users/list` - List all team members

All API routes (except `/api/admin/login`) require authenticated session. Routes check `supabase.auth.getSession()` and return 401 if no session.

### Data Storage

**Supabase database tables (required):**

**`leads`:**
- Stores contact form submissions
- Fields: `id`, `company_id`, `name`, `email`, `phone`, `address`, `message`, `source`, `status`, `created_at`
- Filtered by `company_id` (hardcoded constant per site)

**`website_settings`:**
- Stores all OCB configuration
- Fields: `company_id` (primary key), `settings` (JSONB), `updated_at`
- `settings` JSONB structure:
  - `emailTemplate`: { `subject`, `body` }
  - `keywordCache`: { `keywords`: [], `opportunities`: [], `last_updated`, `credit_usage` }
  - `aiAnalysis`: { `content`, `generated_at`, `type`: 'manual' | 'weekly_cron' }
- One row per site (identified by `company_id`)

**`website_oauth_tokens`:**
- Stores Google OAuth tokens for GA4 and Search Console
- Fields: `id`, `company_id`, `provider` ('google'), `refresh_token` (encrypted), `access_token`, `token_expires_at`, `ga4_property_id`, `gsc_site_url`, `connected_email`, `connected_at`
- Tokens stored unencrypted in current implementation (encryption should be added in production)

**`website_lighthouse_reports`:**
- Stores Lighthouse audit results
- Fields: `id`, `company_id`, `performance_score`, `accessibility_score`, `best_practices_score`, `seo_score`, `created_at`
- Latest report retrieved by `ORDER BY created_at DESC LIMIT 1`

**`auth.users`:**
- Supabase Auth managed table
- Stores admin user accounts
- Fields: `id`, `email`, `created_at`, `last_sign_in_at`, `user_metadata` (includes `role`, `company_id`, `invited_by`)

**No JSON files are used.** All data is stored in Supabase.

### Analytics Connection (GA4 + Search Console)

**OAuth flow:**
1. User clicks "Connect Google Analytics" on Settings page
2. Redirects to `/api/admin/oauth/google/connect`
3. Route calls `generateAuthUrl()` from `@virgo/shared-oauth` package
4. User redirected to Google OAuth consent screen
5. Google redirects to `/api/admin/oauth/google/callback` with authorization code
6. Callback route exchanges code for access + refresh tokens
7. Tokens stored in `website_oauth_tokens` table
8. User redirected back to Settings with success message

**Required Google Cloud setup:**
- Google Cloud project with OAuth consent screen configured
- OAuth 2.0 Client ID and Client Secret
- Authorized redirect URI: `https://<site-domain>/api/admin/oauth/google/callback`
- Required scopes:
  - `https://www.googleapis.com/auth/analytics.readonly`
  - `https://www.googleapis.com/auth/webmasters.readonly`

**Required environment variables:**
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`

**Data fetching:**
- GA4 data: Uses Google Analytics Data API v1 with stored access token
- Search Console data: Uses Google Search Console API with stored access token
- Tokens automatically refreshed when expired (refresh token stored in DB)
- User selects which GA4 property and GSC site to view (selection saved in `website_oauth_tokens.ga4_property_id` and `gsc_site_url`)

### AI Analysis Implementation

**Manual generation:**
- Endpoint: `POST /api/admin/analytics/ai-summary`
- Accepts optional `ga4Data`, `searchConsoleData`, `lighthouseData` in request body
- Fetches keyword data from `website_settings.settings.keywordCache`
- Builds KPI summary string from all available data
- Calls OpenAI API (`gpt-4o` with `gpt-4o-mini` fallback)
- System prompt: "You are a helpful business consultant... speak in plain English to a busy business owner"
- Output format:
  - One-sentence summary
  - Top 3 actions (What/Why/Fix format)
  - Collapsible `<details>` section for technical details
  - Maximum 120 words for main content
- Saves result to `website_settings.settings.aiAnalysis`

**Weekly cron:**
- Endpoint: `POST /api/admin/analytics/run-ai-analysis-cron`
- Scheduled in `vercel.json`: `"0 3 * * 1"` (Monday 3 AM UTC)
- Fetches latest Lighthouse report, recent leads (30 days), keyword cache
- Uses same OpenAI prompt structure as manual generation
- Saves with `type: 'weekly_cron'` in `aiAnalysis` object

**Display:**
- Analytics page loads cached analysis on page load
- Shows timestamp ("Generated X days ago")
- "Generate Analysis" button triggers manual generation
- AI summary renders HTML (uses `innerHTML` to support collapsible details)

**Required environment variables:**
- `OPENAI_API_KEY`
- `CRON_SECRET` or `VERCEL_CRON_SECRET` (for cron endpoint protection)

### Cron Jobs (Vercel)

Configured in `vercel.json`:

```json
"crons": [
  {
    "path": "/api/admin/analytics/run-lighthouse-cron",
    "schedule": "0 2 * * *"  // Daily at 2 AM UTC
  },
  {
    "path": "/api/admin/analytics/run-ai-analysis-cron",
    "schedule": "0 3 * * 1"  // Weekly Monday at 3 AM UTC
  }
]
```

Cron endpoints verify `CRON_SECRET` via `Authorization: Bearer <secret>` header.

### Assumptions for Replication

**Required setup:**
1. Supabase project with required tables created (`leads`, `website_settings`, `website_oauth_tokens`, `website_lighthouse_reports`)
2. Supabase Auth enabled
3. Environment variables configured (Supabase, Google OAuth, OpenAI, Keywords Everywhere, Resend)
4. `@supabase/ssr` and `@supabase/supabase-js` packages installed
5. `@virgo/shared-oauth` package available for OAuth URL generation
6. Hardcoded `BLUE_LAWNS_COMPANY_ID` constant replaced with site-specific company ID

**Package dependencies:**
- `@supabase/ssr`
- `@supabase/supabase-js`
- `@virgo/shared-oauth` (OAuth helpers)
- `resend` (email sending)
- `lighthouse` (performance audits)
- `openai` (via direct fetch, not SDK)

**Vercel deployment:**
- Requires serverless function support (Astro SSR with Node adapter)
- Cron jobs configured in `vercel.json`
- Environment variables set in Vercel project settings

**Design system:**
- Uses glassmorphism design language
- Tailwind CSS utility classes
- Custom admin layout with collapsible sidebar
- Responsive mobile navigation

**Keywords Everywhere API:**
- Requires `KEYWORDS_EVERYWHERE_API_KEY` environment variable
- API calls cached in Supabase `website_settings.settings.keywordCache`
- Credit usage tracked per refresh
- Zero-volume keywords filtered by default in UI

**No external dashboard service:** The OCB is self-contained within each site. There is no separate `/dashboard-api` service required. All functionality lives in site API routes.

### Repository Structure

The OCB lives entirely within each site directory:

```
/sites/<site-name>/
├── src/
│   ├── pages/
│   │   ├── admin/              # Admin pages (protected routes)
│   │   │   ├── index.astro     # Dashboard home
│   │   │   ├── login.astro     # Login page (unprotected)
│   │   │   ├── leads.astro     # Leads viewer
│   │   │   ├── settings.astro  # Business settings + OAuth connections
│   │   │   ├── email-template.astro  # Resend email template editor
│   │   │   └── analytics.astro # GA4 + Search Console + Lighthouse + Keywords
│   │   └── api/
│   │       └── admin/          # Admin API routes (protected)
│   │           ├── login.ts
│   │           ├── logout.ts
│   │           ├── get-leads.ts
│   │           ├── get-settings.ts
│   │           ├── update-settings.ts
│   │           ├── get-email-template.ts
│   │           ├── update-email-template.ts
│   │           ├── send-test-email.ts
│   │           ├── export-leads.ts
│   │           ├── update-lead.ts
│   │           ├── analytics/  # Analytics API routes
│   │           │   ├── get-selection.ts
│   │           │   ├── save-selection.ts
│   │           │   ├── list-properties.ts
│   │           │   ├── ga4-data.ts
│   │           │   ├── search-console-data.ts
│   │           │   ├── lighthouse.ts
│   │           │   ├── run-lighthouse.ts
│   │           │   ├── run-lighthouse-cron.ts
│   │           │   ├── ai-summary.ts
│   │           │   ├── get-cached-analysis.ts
│   │           │   └── run-ai-analysis-cron.ts
│   │           ├── keywords/
│   │           │   └── refresh.ts
│   │           ├── oauth/
│   │           │   └── google/
│   │           │       ├── connect.ts
│   │           │       ├── callback.ts
│   │           │       ├── disconnect.ts
│   │           │       └── status.ts
│   │           └── users/
│   │               ├── invite.ts
│   │               └── list.ts
│   ├── admin-components/       # Shared admin UI components
│   │   ├── AdminLayout.astro   # Admin page layout wrapper
│   │   ├── AdminNav.astro      # Sidebar navigation
│   │   └── LeadTable.astro     # Leads table component
│   └── middleware.ts           # Auth protection middleware
```

## 📋 PRE-DEPLOYMENT CHECKLIST — SITEMAP VERIFICATION

Before deploying any site to production, you must verify the sitemap configuration. This ensures all public pages are discoverable by search engines and admin/internal routes are properly excluded.

### Required Checks

**1. Verify `robots.txt` exists and includes admin exclusion:**
- Location: `/sites/<site-name>/public/robots.txt`
- Must include: `Disallow: /admin/`
- Must include: `Disallow: /api/`
- Must include: `Disallow: /dashboard/` (if applicable)
- Must include: `Disallow: /_*` (Astro internal routes)
- Must reference sitemap: `Sitemap: https://www.<site-domain>.com/sitemap.xml`

**2. Verify `sitemap.xml` exists and is valid XML:**
- Location: `/sites/<site-name>/public/sitemap.xml`
- Must be valid XML (use `xmllint --noout public/sitemap.xml` to verify)
- Must include ALL public pages:
  - Homepage (`/`)
  - All service pages (`/services/<service-slug>`)
  - All location pages (`/locations/<location-slug>`)
  - All service × location pages (`/locations/<location-slug>/<service-slug>`)
  - Contact page (`/contact`)
  - Membership/subscription page (`/membership` or equivalent)
  - Privacy policy (`/privacy-policy`)
  - Terms of service (`/terms-of-service`)
  - Any other public-facing pages
- Must NOT include admin routes (`/admin/*`)
- Must NOT include API routes (`/api/*`)
- Must NOT include internal Astro routes (`/_*`)

**3. Verify admin pages have `noindex, nofollow` meta tags:**
- All pages under `/admin/*` (except `/admin/login`) must have:
  - `<meta name="robots" content="noindex, nofollow" />`
- Typically handled in `AdminLayout.astro` component
- Login page (`/admin/login`) may be indexable or not (per project requirements)

**4. Verify public pages are indexable:**
- All public pages (homepage, services, locations, contact) must NOT have `noindex` or `nofollow` meta tags
- Check `Base.astro` layout to ensure no global `robots` meta tag blocking indexing

### Verification Commands

```bash
# Validate sitemap.xml XML syntax
cd /sites/<site-name>
xmllint --noout public/sitemap.xml

# Check robots.txt includes admin disallow
grep -q "Disallow: /admin/" public/robots.txt && echo "✓ Admin disallow present" || echo "✗ Admin disallow MISSING"

# Verify sitemap includes required pages (adjust URLs as needed)
grep -q "privacy-policy" public/sitemap.xml && echo "✓ Privacy policy in sitemap" || echo "✗ Privacy policy MISSING"
grep -q "terms-of-service" public/sitemap.xml && echo "✓ Terms in sitemap" || echo "✗ Terms MISSING"
grep -q "/contact" public/sitemap.xml && echo "✓ Contact page in sitemap" || echo "✗ Contact page MISSING"
```

### Common Issues to Fix

- **Missing `/admin/` in robots.txt:** Add `Disallow: /admin/` to the "Disallow admin/internal areas" section
- **Missing privacy/terms in sitemap:** Add URL entries for `/privacy-policy` and `/terms-of-service` before the closing `</urlset>` tag
- **Admin pages indexable:** Ensure `AdminLayout.astro` includes `<meta name="robots" content="noindex, nofollow" />`
- **Invalid XML:** Check for unclosed tags, missing `<?xml version="1.0" encoding="UTF-8"?>`, or malformed URL entries

### Deployment Blockers

If any of the following are true, deployment should be blocked:
- `sitemap.xml` is missing
- `sitemap.xml` contains invalid XML syntax
- `robots.txt` is missing `Disallow: /admin/`
- Admin pages are publicly indexable (missing `noindex, nofollow`)
- Required public pages (privacy, terms) are missing from sitemap

**Status:** After completing all checks, report `✅ GO — Ready for domain cutover` or `❌ NO-GO — List exact blocking items`.