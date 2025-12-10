🏭 Web-Dev-Factory HQ — Official Factory Instructions (MASTER DOCUMENT)
Version: 2025.12 — Authoritative & Enforced

🧠 Purpose of This Document
This is the single source of truth for how every website inside the Web-Dev-Factory HQ ecosystem must be built.
Cursor, all LLM agents, and all human developers must follow these instructions exactly.
This guide ensures:


every build is consistent


no architectural decisions get overwritten


all subsystems behave identically across all client sites


SEO, OG Engine, Structured Data, Forms, CRM, and Dashboard remain unified


tech debt is eliminated


the Factory becomes infinitely scalable


Nothing in this document may be changed unless Benjamin explicitly approves it.
Factory Obedience Rule


Cursor must always load and follow docs/factory-instructions.md before starting or modifying any build.


If anything in this document conflicts with prior rules, this document wins.



🚀 HIGH-LEVEL FACTORY PHASES (0 → 12 + 11b)
Every site must follow these phases in order:


Phase 0 — Intake Confirmation (Services + Locations)


Phase 1 — Scaffold Site


Phase 2 — Scrape Old Site (optional, default YES)


Phase 3 — Seed Content → Sanity CMS


Phase 4 — Keyword Research → KE API


Phase 4b — SEO Copy Generation


Phase 5 — Template Rendering → Astro Client Base


Phase 5b — Service × Location Page Generation (Mandatory)


Phase 6 — Site Build → Astro


Phase 7 — OG Image Engine


Phase 8 — Structured Data (JSON-LD)


Phase 9 — Forms + CRM Pipeline


Phase 10 — SEO Infrastructure


Phase 11 — Dashboard Registration


Phase 11b — Owner Control Board (OCB) Implementation


Phase 12 — Deploy + Optimize Images


No tool or agent may skip or reorder these phases.

🧾 PHASE 0 — INTAKE CONFIRMATION (MANDATORY BEFORE PHASE 1)
Before anything else happens, Cursor must complete intake confirmation.
✅ Services List (Mandatory)
Cursor must ask:

“List all services you want included. Please confirm this list is final.”

Cursor must:


Display a table of the services


Validate each contains:


title


slug


excerpt


body


isPrimaryService


SEO object


structured data fields




Confirm primary vs secondary classification


Wait for explicit approval:



“Confirmed — proceed.”

✅ Locations List (Mandatory)
Cursor must ask:

“List all locations you want included. Please confirm this list is final.”

Cursor must:


Display a table of locations


Validate each contains:


city


state


description


ZIP (if available)


SEO fields


list of services offered in that location (services[])




Wait for explicit approval:



“Confirmed — proceed.”

No build may begin until both lists are locked and approved.

🏗️ REPO STRUCTURE REQUIREMENTS
Every site must live inside the following structure:
Web-Dev-Factory-HQ/
  sites/<site-name>/
    data/
      scraped/
    public/
    src/
    .env.local

This structure may never be changed.

📦 SANITY REQUIREMENTS
Sanity must contain the following document types:


settings


homepage


service


location


lead


all PageBuilder section types


Required fields — Service


title


slug


excerpt


body


isPrimaryService (boolean)


SEO object


structured data fields


Required fields — Location


city


state


description


services[]


SEO object


Schema names may never be changed.
Expansions are allowed only with explicit approval.

🔍 SCRAPING REQUIREMENTS
Scraping must only be done using:
bun run scrape --site <site-name> --url <old-domain>

Scraper must output:


pages.json


images.json


site-map.json


service-areas.json


Manual copy/pasting is forbidden.

📝 CONTENT SEEDING REQUIREMENTS
Command:
bun run seed --site <site-name>

Rules:


Map scraped pages → service, location, and homepage content


Never overwrite existing Sanity docs unless explicitly approved


Always generate seed-ready.json


Every page must have SEO fields populated



🔎 KEYWORD RESEARCH REQUIREMENTS
Environment variable:
KEYWORDS_EVERYWHERE_API_KEY=

Rules:


Each service receives a primary keyword


Each location receives location-modified keyword variants


PASF questions must populate FAQ lists


SEO Copy Agent must consume KE data


All results must be saved into keywordResearch object



✍️ SEO COPY GENERATION REQUIREMENTS (Phase 4b)
All SEO copy must:


be 100% unique for each location


contain primary keywords in H1 and meta title


include KE semantic keyword variations


avoid keyword stuffing


be conversational and helpful


🔥 Mandatory Location Variation Rule (40% Minimum)
Every location-based service page must include:


at least 40% unique, location-specific variation


no more than 60% shared content


Variations must be based on:


KE data


local terms


PASF questions


local examples


tone shifts


Cursor must enforce this rule during Phase 4b.

🧩 TEMPLATE RENDERING — ASTRO (Phase 5)
Phase 5 implements all core top-level routes using the client-base template.
It must complete before Phase 5b begins.
Required routes:


/


/services


/services/[slug]


/locations


/locations/[slug]


/contact


/dashboard (SSR only)


All routes must:


pass SEO props


pass structured data


define canonical URLs via seo-utils.ts


Service × Location routing is not handled in Phase 5.
That is handled only in Phase 5b.

⭐ Phase 5b — Service × Location Page Generation (Mandatory)
Every Factory site must automatically generate a dedicated SEO page for every service offered in every location.
Route Format
/locations/<locationSlug>/<serviceSlug>

Requirements for Each Service × Location Page
Each page must:


use base service content as a template


apply 40–60% variation via the variation engine


use location-modified KE keywords


auto-generate PASF FAQs for that service in that location


generate static paths for each valid combination


only include services listed in location.services[]


emit JSON-LD:


LocalBusiness


Service


BreadcrumbList




SEO Rules
Meta Title:
<Service> in <Location>, <State> | <Brand>

H1:
<Location> <Service>

Canonical:
/locations/<locationSlug>/<serviceSlug>

Breadcrumbs:
Home → Locations → <Location> → <Service>

OG Requirements
Each Service × Location page must generate a dynamic OG image using /api/og.


If seo.image exists → use it


Otherwise → build a dynamic OG URL using:


title = “Service in Location”


subtitle = brand name or tagline




Cursor is not allowed to skip Phase 5b under any circumstances.

🎯 Phase 5b Execution Protocol (Cursor Must Follow This)
Cursor must execute Phase 5b in seven atomic micro-steps.
Cursor must stop after each step and must not batch them.
Step 1 — Scaffold Route File (Stop After Completion)
Create:
sites/<site>/src/pages/locations/[location]/[service].astro

Include only:


imports for Base.astro


PageBuilder


SEO utilities


structured data helpers


an empty component shell


Cursor must stop and wait for confirmation.

Step 2 — getStaticPaths (Stop After Completion)
Implement getStaticPaths to:


fetch all locations from Sanity


for each location, iterate location.services[]


generate static paths:


{ params: { location: <locationSlug>, service: <serviceSlug> } }

Cursor must stop and wait for confirmation.

Step 3 — Loader / Data Fetching (Stop After Completion)
Implement server-side data fetching to:


load the location document by locationSlug


load the service document by serviceSlug


load global settings


load keywordResearch data (if available)


Return a clean props object to the page.
Cursor must stop and wait for confirmation.

Step 4 — SEO, Canonical, JSON-LD (Stop After Completion)
Implement:


meta title, description, H1 using the SEO rules above


canonical URL using seo-utils.ts


structured data:


LocalBusiness


Service


BreadcrumbList




All structured data must be cleaned with cleanStructuredData().
Cursor must stop and wait for confirmation.

Step 5 — Page Content with 40% Variation (Stop After Completion)
Implement content using:


base service content as a template


variationContext with location data:


city, state


local modifiers


KE location-modified keywords




PageBuilder sections adjusted so:


at least 40% of the content is location-specific


no two locations share identical full paragraphs




Cursor must stop and wait for confirmation.

Step 6 — OG Image Wiring (Stop After Completion)
Implement OG logic:


if seo.image exists → use it


otherwise:


build OG URL via /api/og with:


title: “<Service> in <Location>”


subtitle: brand or tagline






Inject:


og:image


twitter:image


twitter:card


Cursor must stop and wait for confirmation.

Step 7 — Validation + Summary (Final Step)
Cursor must:


validate static path generation count


validate canonical URLs


validate JSON-LD output


validate meta tags


validate that no architectural rules were broken


🧪 MANDATORY TESTING & VALIDATION PROTOCOL

Before marking any task as complete, Cursor MUST perform comprehensive testing:

1. **Build Validation**
   - Run `npm run build` and verify zero errors
   - Check for TypeScript/ESLint errors
   - Verify all imports resolve correctly
   - **CRITICAL**: If adding server-side packages (Supabase, Resend, etc.), verify build succeeds
   - Check for "Rollup failed to resolve import" errors - these indicate missing Vite SSR config

2. **Dynamic Route Testing**
   - Test ALL dynamic routes (e.g., `[town]/[service]`, `[slug]`)
   - Verify props are available both from `getStaticPaths` AND client-side navigation
   - Add defensive checks: if props are missing, fetch from `Astro.params`
   - Never assume props exist - always validate or provide fallbacks
   - Example: `const location = props.location || locations.find(l => l.slug === Astro.params.town)`

3. **Component Integration Testing**
   - Test components with both string paths AND ImageMetadata objects
   - Verify public folder assets work (use `<img>` not Astro `<Image>` for public assets)
   - Test all prop combinations (required + optional)
   - Verify error boundaries and fallbacks

4. **Navigation Testing**
   - Test client-side navigation (clicking links)
   - Test direct URL access (browser refresh)
   - Test back/forward browser navigation
   - Verify no 404s or undefined prop errors

5. **Asset Validation**
   - Verify all image paths exist (check both `src/assets/` and `public/`)
   - Test logo/icon components render correctly
   - Verify responsive images work on mobile/tablet/desktop
   - Check console for 404s or broken asset errors

6. **Error Prevention Rules**
   - NEVER access object properties without null/undefined checks
   - Always provide fallbacks for optional props
   - Use optional chaining (`?.`) for nested properties
   - Add type guards for runtime validation

7. **Local Dev Server Testing**
   - Start dev server and manually test affected pages
   - Check browser console for errors
   - Test responsive breakpoints
   - Verify all interactive elements work

**Failure to complete ALL validation steps results in incomplete work.**


⚙️ BUILD CONFIGURATION & DEPENDENCY MANAGEMENT

When adding server-side packages or API routes, Cursor MUST:

1. **Vite/SSR Package Bundling**
   - Server-side packages (e.g., `@supabase/ssr`, `@supabase/supabase-js`) MUST be added to `vite.ssr.noExternal` in `astro.config.mjs`
   - This ensures packages are bundled for serverless/edge environments (Vercel, Netlify)
   - Example:
     ```javascript
     vite: {
       ssr: {
         noExternal: ['@supabase/ssr', '@supabase/supabase-js', 'resend'],
       },
     }
     ```
   - If build fails with "Rollup failed to resolve import", check if package needs to be in `noExternal`
   - **CRITICAL**: NEVER use conflicting configurations:
     - ❌ DO NOT set `build.rollupOptions.external` AND `ssr.noExternal` for the same packages
     - ❌ DO NOT mark packages as external in build but not external in SSR
     - ✅ DO use only `vite.ssr.noExternal` for server-side packages
     - **Error to watch for**: "MiddlewareCantBeLoaded: Can't load the middleware" - this indicates conflicting Vite config
     - If middleware fails to load, check `astro.config.mjs` for conflicting `external`/`noExternal` settings

2. **Environment Variable Requirements**
   - MUST create/update `.env.example` file documenting ALL environment variables
   - Mark variables as REQUIRED vs OPTIONAL with clear comments
   - For client-side access, use `PUBLIC_` prefix (e.g., `PUBLIC_GOOGLE_PLACES_API_KEY`)
   - Server-side only variables should NOT have `PUBLIC_` prefix
   - Always provide fallbacks for optional variables: `import.meta.env.VAR || 'default'`
   - Include instructions on where to get each API key/value
   - Document which features require which variables

3. **Package Installation Verification**
   - After adding dependencies, run `npm install` to update `package-lock.json`
   - Verify package is in `dependencies` (not `devDependencies`) if used in production
   - Test build locally: `npm run build` must succeed before committing
   - If package exists in `package.json` but build fails, check Vite SSR configuration

4. **API Route Dependencies**
   - All API routes in `src/pages/api/` are server-side only
   - Packages used in API routes must be in `vite.ssr.noExternal` if build fails
   - Verify API routes work in both dev and production builds
   - Test API routes with actual HTTP requests, not just type checking

5. **Build Error Prevention**
   - If build works locally but fails on Vercel/Netlify, check:
     - Package bundling configuration (`vite.ssr.noExternal`)
     - Environment variables are set in deployment platform
     - `package-lock.json` is committed and up-to-date
     - No missing dependencies in `package.json`
   - **Common Error**: "Rollup failed to resolve import @package/name"
     - Solution: Add package to `vite.ssr.noExternal` in `astro.config.mjs`
     - This happens when Vite tries to externalize server-side packages
     - Serverless/Edge environments need packages bundled, not externalized
   - **Common Error**: "MiddlewareCantBeLoaded: Can't load the middleware"
     - Cause: Conflicting Vite configuration (e.g., `build.rollupOptions.external` AND `ssr.noExternal` for same packages)
     - Solution: Remove conflicting `external` settings, use only `vite.ssr.noExternal` for server-side packages
     - Check `astro.config.mjs` for any `build.rollupOptions.external` that conflicts with `ssr.noExternal`

6. **Environment Variable Checklist**
   - Create/update `.env.example` with ALL variables (required + optional)
   - Document where to obtain each API key
   - Mark REQUIRED vs OPTIONAL clearly
   - Use `PUBLIC_` prefix for client-side variables
   - Test that site works with missing optional variables (graceful degradation)


provide a summary of:


files created


files modified


number of Service × Location pages generated




Then stop. No further changes in Phase 5b.

📸 OG IMAGE ENGINE REQUIREMENTS (Phase 7)
Route:
/api/og

Rules:


must generate dynamic 1200×630 images


must pull brand colors and logo from Sanity


if seo.image exists → override dynamic OG


otherwise → auto-generate



🧱 STRUCTURED DATA REQUIREMENTS (Phase 8)
Each page must emit JSON-LD:


Homepage → Organization


Service → Service + BreadcrumbList


Location → LocalBusiness + BreadcrumbList


Service × Location → LocalBusiness + Service + BreadcrumbList


All structured data must be cleaned via:
cleanStructuredData()


📨 FORMS + CRM REQUIREMENTS (Phase 9)
Route:
/api/forms/contact

Pipeline:


create lead document in Sanity


forward submission to:


email


webhook


Jobber (future)




patch status after forwarding


Requires:
SANITY_API_WRITE_TOKEN=


🧭 SEO INFRASTRUCTURE REQUIREMENTS (Phase 10)
Must include:


/sitemap-index.xml


/robots.txt (with staging detection)


redirect map generator


canonical URL logic


custom 404 page


optional 410 endpoint


Redirects:
bun run generate-redirects --site <site-name>


📊 CENTRAL DASHBOARD REQUIREMENTS (Phase 11)
Site must auto-register:
bun run register-dashboard --site <site-name>

This must write:


DASHBOARD_UUID=


DASHBOARD_API_URL=


Dashboard must display:


analytics status


keyword insights


leads


site health


Dashboard route must be SSR only.

🖼️ DEPLOY + IMAGE OPTIMIZATION (Phase 12)


Ensure scripts/optimize-images.mjs has been run for legacy images


Confirm WebP/AVIF output where applicable


Confirm no oversized assets are shipped in production



⭐ OFFICIAL CURSOR KICKOFF PROMPT
Every build must begin with this prompt in Cursor:

You are the Web-Dev-Factory HQ Builder.
Follow the Factory Phases and never skip or reorder any step.
Project: Build a new site in the Factory system.
Site Name: <SITE_NAME>
Old Domain (optional): <OLD_DOMAIN>
Your responsibilities:


Ask any missing intake questions


Confirm the final list of services and locations


Run Phase 0 → 12 sequentially


Scrape old domain (if provided)


Seed Sanity using scraped data


Perform Keyword Research (KE API)


Generate SEO Copy


Render templates using client-base


Generate all Service × Location pages


Build Astro static site with dashboard SSR


Register site with dashboard API


Produce final build report


Acknowledge with:
“Factory Builder Initialized — Ready for Phase 0”


🎛️ AI USAGE RULES — MUST FOLLOW
Cursor (GPT-5.1 Auto Mode) — The Only Engine Allowed to Touch Code
Cursor handles:


all 12 phases


Sanity integration


scraping


seeding


SEO copy


Service × Location generation


Astro build


dashboard registration


form pipelines


OG engine


structured data


If code changes are required → Cursor only.
Gemini 3.0 — The Design Brain (Never Writes Code)
Use Gemini for:


visual design


layout exploration


hero concepts


typography


spacing


OG concepts


Workflow:


Ask Gemini for design direction.


Paste its response into Cursor.


Tell Cursor:



“Apply this design direction following Factory Instructions.”

Claude 3 Sonnet — The Architect & Critic (Never Writes Code)
Use Claude for:


diff reviews


architecture critique


content model review


SEO strategy


English rewrites


Folder or structural changes may only be implemented by Cursor if allowed by these Factory Instructions.
ChatGPT (This Chat) — The Director
Use ChatGPT for:


strategy


building Factory Instructions


adding features


high-level troubleshooting


evolving the Factory



🔒 CHANGE CONTROL
Only Benjamin may approve:


schema changes


template structure changes


factory process changes



📊 OWNER CONTROL BOARD (OCB) REQUIREMENTS (Phase 11b - Standard for All Sites)

Every Factory site MUST include an Owner Control Board (OCB) - an admin dashboard for managing leads, settings, email templates, and tracking.

**Database Setup (Supabase)**

1. **Create Required Tables**
   - `website_leads` - Contact form submissions with tracking data
   - `website_settings` - Business settings and email templates
   - `companies` - Company records (if multi-tenant)

2. **Table Schema: website_leads**
   ```sql
   CREATE TABLE website_leads (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     company_id UUID NOT NULL,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     phone TEXT,
     address TEXT,
     message TEXT,
     reviewed BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT now(),
     -- UTM tracking fields
     utm_source TEXT,
     utm_medium TEXT,
     utm_campaign TEXT,
     utm_term TEXT,
     utm_content TEXT,
     gclid TEXT,
     fbclid TEXT
   );
   ```

3. **Table Schema: website_settings**
   ```sql
   CREATE TABLE website_settings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     company_id UUID NOT NULL UNIQUE,
     settings JSONB NOT NULL DEFAULT '{}'::jsonb,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   ```

4. **Table Naming Convention**
   - ALL OCB-related tables MUST use `website_*` prefix (not `ocb_*`)
   - Examples: `website_leads`, `website_settings`, `website_email_templates` (if separate table)
   - This ensures consistency across all Factory sites

**OCB Implementation Modules (Build in Order)**

Module 1: Supabase Auth Guard + Login Page
- Create `/admin/login` page
- Implement middleware (`src/middleware.ts`) to protect `/admin/*` routes
- Use `@supabase/ssr` for session management
- Create admin user in Supabase Auth (email/password)
- Required files:
  - `src/middleware.ts`
  - `src/pages/admin/login.astro`
  - `src/pages/api/admin/login.ts`
  - `src/pages/api/admin/logout.ts`
  - `src/env.d.ts` (for TypeScript locals)

Module 2: Admin Layout Shell
- Create collapsible left navigation
- Create `AdminLayout.astro` component
- Create `AdminNav.astro` component
- Navigation items: Dashboard, Leads, Settings, Email Templates, Analytics (placeholder)
- Required files:
  - `src/admin-components/AdminLayout.astro`
  - `src/admin-components/AdminNav.astro`
  - `src/pages/admin/index.astro`

Module 3: Leads Viewer
- Display leads from `website_leads` table
- Features: pagination (10 per page), status filter (all/new/reviewed), "Mark as Reviewed" toggle, CSV export
- Required files:
  - `src/pages/admin/leads.astro`
  - `src/admin-components/LeadTable.astro`
  - `src/pages/api/admin/get-leads.ts`
  - `src/pages/api/admin/update-lead.ts`
  - `src/pages/api/admin/export-leads.ts`
- Update `src/pages/api/contact.ts` to save leads to `website_leads` table

Module 4: Settings Page
- Business information form (title, tagline, description, contact info, social media, business hours, brand colors, analytics, SEO)
- Tracking & Pixels section (Google Ads ID, Google Ads Conversion Label, Meta Pixel ID)
- Save to `website_settings.settings` JSONB field
- Required files:
  - `src/pages/admin/settings.astro`
  - `src/pages/api/admin/get-settings.ts`
  - `src/pages/api/admin/update-settings.ts`

Module 5: Email Template Editor
- Subject line and HTML body editor
- Live preview pane
- Save template to `website_settings.settings.emailTemplate`
- "Send Test Email" button (uses Resend, sends to logged-in user's email)
- Resend status indicator
- Required files:
  - `src/pages/admin/email-template.astro`
  - `src/pages/api/admin/get-email-template.ts`
  - `src/pages/api/admin/update-email-template.ts`
  - `src/pages/api/admin/send-test-email.ts`
  - `src/pages/api/admin/get-resend-status.ts`

**Conversion Tracking Setup (Required Before Module 5)**

1. **Add Tracking Fields to website_settings**
   - Update `website_settings.settings.tracking` JSONB structure:
     ```json
     {
       "tracking": {
         "google_ads_id": null,
         "google_ads_conversion_label": null,
         "meta_pixel_id": null
       }
     }
     ```

2. **Create Tracking Component**
   - `src/components/Tracking.astro` - Fetches settings and conditionally injects:
     - Google Ads gtag.js script (if `google_ads_id` is set)
     - Meta Pixel script (if `meta_pixel_id` is set)
   - Import in `src/layouts/Base.astro`

3. **Update Contact Form**
   - Capture UTM parameters and gclid/fbclid from URL
   - Store in localStorage (30-day expiry)
   - Fire conversion events on successful submission:
     - Google Ads: `gtag('event', 'conversion', {...})`
     - Meta Pixel: `fbq('track', 'Lead', {...})`
   - Save all tracking data to `website_leads` table

4. **Update Contact API**
   - Extract UTM/gclid/fbclid from request
   - Save to `website_leads` table with lead record
   - Fetch tracking settings and return Google Ads conversion ID to client

**Environment Variables Required**

```env
# Supabase (Required for OCB)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For admin user creation

# Resend (Required for email templates)
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_TO_EMAIL=info@example.com
```

**Supabase Auth Setup**

1. Create admin user in Supabase Auth (email/password)
2. User must have access to the Supabase project
3. Login credentials stored securely in Supabase Auth

**Middleware Configuration (CRITICAL)**

- DO NOT use conflicting Vite configurations
- DO NOT set `build.rollupOptions.external` AND `ssr.noExternal` for same packages
- For Supabase packages, use ONLY `vite.ssr.noExternal` if needed
- Example (if build fails):
  ```javascript
  vite: {
    ssr: {
      noExternal: ['@supabase/ssr', '@supabase/supabase-js'],
    },
  }
  ```
- If middleware fails to load ("MiddlewareCantBeLoaded"), check for conflicting `external`/`noExternal` settings

**OCB File Structure**

```
sites/<site-name>/
  src/
    admin-components/
      AdminLayout.astro
      AdminNav.astro
      LeadTable.astro
    pages/
      admin/
        index.astro
        login.astro
        leads.astro
        settings.astro
        email-template.astro
        analytics.astro (placeholder)
      api/
        admin/
          login.ts
          logout.ts
          get-leads.ts
          update-lead.ts
          export-leads.ts
          get-settings.ts
          update-settings.ts
          get-email-template.ts
          update-email-template.ts
          send-test-email.ts
          get-resend-status.ts
    middleware.ts
    components/
      Tracking.astro
    env.d.ts
```

**Testing Checklist**

Before marking OCB complete, verify:
- [ ] Admin login works (`/admin/login`)
- [ ] Middleware protects `/admin/*` routes
- [ ] Leads page displays data from `website_leads`
- [ ] Settings page loads and saves to `website_settings`
- [ ] Email template editor loads, saves, and sends test emails
- [ ] Conversion tracking pixels load when configured
- [ ] Contact form saves leads with UTM/gclid/fbclid data
- [ ] Conversion events fire on form submission
- [ ] All API routes require authentication
- [ ] Build succeeds (`npm run build`)

**OCB Execution Order**

1. Set up Supabase database (tables, company record)
2. Create admin user in Supabase Auth
3. Build Module 1 (Auth + Login)
4. Build Module 2 (Admin Layout)
5. Build Module 3 (Leads Viewer)
6. Build Module 4 (Settings Page)
7. Set up conversion tracking (before Module 5)
8. Build Module 5 (Email Template Editor)
9. Test all modules
10. Verify build succeeds

🚫 ABSOLUTE RULES


Cursor is the only AI allowed to modify code


Gemini never touches code


Claude never touches code


ChatGPT oversees strategy only


