# 🟦 OWNER CONTROL BOARD CANVAS — BLUE LAWNS (V1.1)



---

# 1️⃣ PURPOSE OF THE OWNER CONTROL BOARD

The OCB allows Blue Lawns (and later other clients) to manage:

- Leads
- Contact form settings
- Email notifications (Resend)
- Webhooks
- Domain connection status
- Analytics (GA4 + Search Console)
- Speed tests (Lighthouse)
- Basic SEO insights

For **Blue Lawns**, the goal is to have a functioning `/admin` dashboard within **1 hour**.

---

# 2️⃣ DIRECTORY STRUCTURE (BLUE LAWNS ONLY)

The dashboard lives inside:

````

/sites/blue-lawns/src/pages/admin/

```

Required pages:

```

admin/
index.astro          → dashboard home
leads.astro          → leads viewer
settings.astro       → business info + webhook + GA/GSC buttons
email-template.astro → thank-you email customization
analytics.astro      → GA4 + Search Console overview
speed.astro          → Lighthouse score

```

Additional supporting directories:

```

/sites/blue-lawns/src/admin-components/
/sites/blue-lawns/src/admin-api/

```

---

# 3️⃣ REQUIRED MODULES FOR BLUE LAWNS OCB

Below is the exact set of modules the OCB must contain.

---

## Module 1 — **Authentication (Supabase)**

OCB **must be protected**.

Requirements:

- Email/password login
- Auth guard middleware
- Protect everything under `/admin` route

---

## Module 2 — **Leads Viewer**

Pulls leads from:

```

/sites/blue-lawns/src/pages/api/contact.ts

```

Features:

- List all leads
- Show name, email, phone, address, message
- Table format
- Pagination
- "Mark as reviewed"
- Export CSV

---

## Module 3 — **Email Template Editor (Resend)**

OCB must allow Blue Lawns to:

- Edit "Thank You" email subject
- Edit HTML body template
- Live preview
- Save template to DB (or JSON for MVP)
- Send a test email using Resend
- Show DNS verification status for Resend domain

---

## Module 4 — **Settings Page**

Editable values:

- Business name
- Email
- Phone
- Address
- Lead recipient email
- Webhook URL

Integrations section:

- Connect GA4 (OAuth via Google Cloud)
- Connect Google Search Console (OAuth)

---

## Module 5 — **Analytics Overview**

Pull from GA4:

- Sessions (7 days)
- Users
- Top pages
- Conversions (based on form submits)

Pull from Google Search Console:

- Impressions
- Clicks
- Keywords
- Avg position

---

## Module 6 — **Speed Test / Lighthouse**

Use Vercel serverless API route to run Lighthouse programmatically.

Display:

- Performance score
- LCP, CLS, TBT
- Opportunities
- Warnings

Button: **Re-run Lighthouse**

---

# 4️⃣ REQUIRED BACKEND ROUTES (MINIMUM VIABLE LIST)

Create under:

```

/sites/blue-lawns/src/pages/api/admin/

```

### Routes:

- `get-leads.ts`
- `update-settings.ts`
- `update-email-template.ts`
- `test-email.ts` (Resend)
- `oauth-ga4.ts`
- `oauth-gsc.ts`
- `lighthouse.ts`

---

# 5️⃣ DATABASE / STORAGE (MVP)

For now (Blue Lawns ONLY), we store settings in JSON. Later, this moves to Supabase for multi-tenant.

Files under:

```

/sites/blue-lawns/src/admin-data/

```

- `settings.json`
- `email-template.json`
- `oauth.json` (encrypted)

---

# 6️⃣ INTEGRATION SETUP — GOOGLE ANALYTICS + SEARCH CONSOLE

The user already has a Google Cloud account. We must prepare instructions + API stubs.

### GA4 & GSC OAuth Requirements:

Enable APIs in Google Cloud:

- Google Analytics Data API
- Search Console API
- Google OAuth Consent Screen (Internal or External)

Create OAuth credentials:

- OAuth Client ID
- OAuth Client Secret
- Authorized redirect URI to:

```

[https://blue-lawns.vercel.app/api/admin/oauth-ga4](https://blue-lawns.vercel.app/api/admin/oauth-ga4)
[https://blue-lawns.vercel.app/api/admin/oauth-gsc](https://blue-lawns.vercel.app/api/admin/oauth-gsc)

```

Scopes required:

```

[https://www.googleapis.com/auth/analytics.readonly](https://www.googleapis.com/auth/analytics.readonly)
[https://www.googleapis.com/auth/webmasters.readonly](https://www.googleapis.com/auth/webmasters.readonly)

```

On the Settings page: Buttons:

- **Connect Google Analytics** (starts OAuth)
- **Connect Search Console** (starts OAuth)

After auth, store tokens in `oauth.json`.

---

# 7️⃣ POST-DEPLOY TASKS

After Blue Lawns is live on Vercel:

- Submit sitemap to Search Console
- Verify domain in GSC
- Add GA4 property manually (automatic addition comes later)
- Add GA4 Measurement ID to env vars

---

# 9️⃣ AI MODEL ROLES (WHO DOES WHAT)

To avoid confusion and ensure consistency across all future OCB and SaaS dashboard builds, we define **exact AI roles**:

### **🟦 Claude Sonnet 4.5 — The ENGINE**
- Reads this Canvas
- Enters **Planning Mode** only (no code)
- Produces step‑by‑step build plans
- Creates file structures, APIs, UI skeletons
- Executes implementation in clean, controlled sequences
- Never improvises architecture
- Works only within defined folders

### **🟧 Claude Opus — The AUDITOR**
- Reviews Sonnet’s plans
- Performs deep reasoning
- Identifies architectural risks
- Suggests optimizations before code is written

### **🟪 GPT‑5.1 — The CONTENT + UX Layer**
- Writes page copy, headings, SEO titles/descriptions
- Writes microcopy inside the admin dashboard
- Writes email templates
- Helps refine user‑facing UX text

### **🟩 Gemini — The VISUALIZER**
- Produces diagrams, flows, and blueprint visuals
- Generates UI sketches for the admin/dashboard layouts
- Used only *after* architecture is finalized (WHO DOES WHAT)

To avoid confusion and ensure consistency across all future OCB and SaaS dashboard builds, we define **exact AI roles**:

### **🟦 Claude Sonnet 4.5 — The ENGINE**

- Reads this Canvas
- Enters **Planning Mode** only (no code)
- Produces step‑by‑step build plans
- Creates file structures, APIs, UI skeletons
- Executes implementation in clean, controlled sequences
- Never improvises architecture
- Works only within defined folders

### **🟧 Claude Opus — The AUDITOR**

- Reviews Sonnet’s plans
- Performs deep reasoning
- Identifies architectural risks
- Suggests optimizations before code is written

### **🟪 GPT‑5.1 — The CONTENT + UX Layer**

- Writes page copy, headings, SEO titles/descriptions
- Writes microcopy inside the admin dashboard
- Writes email templates
- Helps refine user‑facing UX text

### **🟩 Gemini — The VISUALIZER**

- Produces diagrams, flows, and blueprint visuals
- Generates UI sketches for the admin/dashboard layouts
- Used only *after* architecture is finalized

These roles must be followed globally across the Web‑Dev‑Factory ecosystem.

---

# 1️⃣1️⃣ UPDATED DATABASE DIRECTION — UNIFY WITH HUB UPDATED DATABASE DIRECTION — UNIFY WITH HUB

For now, Blue Lawns stores settings in JSON.\
Long‑term, we **must** migrate all OCB data into the **Hub Supabase Database** so that:

- All company dashboards feed into a single multi‑tenant system
- Shared auth + role system across all companies
- Users can connect multiple sites or departments
- Cross‑company KPI comparison becomes possible
- AI can reason across all a business’s data

This is the foundation for the larger vision:

> A conversational business‑wide performance dashboard that ingests KPIs, analytics, revenue, and operational data from multiple sources.

---

# 1️⃣2️⃣ ANALYTICS ENHANCEMENTS — NEW RULES

### **GA4 Property Reuse (Required)**

Users must be able to reuse their existing GA4 property so we preserve historical data.\
This allows before/after comparisons when migrating to the new site.

### **AI Insights (Sonnet)**

Every KPI in the dashboard must include an **AI Insight block**:

```

Sessions: 1,452 (+12%)
AI Insight:
Traffic increased this week primarily from organic terms around "lawn aeration"...

```

Placed as a collapsible section under every KPI.

---

# 1️⃣3️⃣ GEMINI VISUAL BLUEPRINT — ADMIN UI FLOW

Gemini will be used to create the **visual system diagram** for the Owner Control Board.

### What Gemini must draw:
- Overall architecture diagram (admin UI ↔ APIs ↔ storage ↔ Vercel ↔ GA4/GSC)
- UI wireframe of the dashboard:
  - Left collapsible navigation
  - Main KPI panels
  - AI Insight blocks
  - Meta/SEO health module
  - Lead table layout
  - Settings & integrations UI
- Data flow for lead submission → dashboard → AI insights
- OAuth flow diagrams for GA4 + GSC
- Component tree for OCB
- Diagram of how Blue Lawns OCB connects to the future HUB Supabase system

Gemini Prompt (store in repo):
```

You are generating the visual system design for the Blue Lawns Owner Control Board.
Use clean SaaS-style diagrams.
Output:

1. High-level architecture
2. UI wireframes (admin dashboard, leads, analytics, SEO)
3. OAuth flows for GA4 & Search Console
4. Data flow diagrams (contact form → OCB → AI insights)
   Follow the Owner Control Board Canvas exactly.

```

---

# 1️⃣4️⃣ META TAG & TITLE MANAGEMENT MODULE (NEW)

Add a new module in the OCB:

## **SEO Health Panel**
Located under `/admin/seo`.

Features:
- List every page in the site
- Show title length, meta description length
- Highlight issues:
  - Missing titles
  - Duplicate titles
  - Titles too long/short
  - Missing descriptions
  - Descriptions too long/short
- Show AI recommendations per page
- Button: “Apply AI Fix” (writes back into Astro frontmatter or content JSON)
- Weekly auto-scan
- KeywordRecommendations API (Keyword Everywhere)

### **Keyword Everywhere Integration**
Use KE API to:
- Fetch trending keywords weekly
- Compare to current targeting
- Recommend:
  - Add keywords
  - Remove unused ones
  - Add new pages (“You should consider a Mulch Delivery page based on demand in Cape May County”)

### AI Recommendation Block (Sample)
```

AI Suggestion:
Your Lawn Aeration page is missing a keyword that is trending this week: "aeration cost near me".
Suggested title update: “Lawn Aeration in Cape May County | Pricing & Service Options”

```

---

# 1️⃣5️⃣ EXPANDED SONNET 4.5 PROMPT — WITH INSIGHT REQUIREMENTS

```

SYSTEM TASK — SONNET 4.5 IN PLANNING MODE
Your job is to produce the full OCB plan based solely on the Canvas.
Do not write code.

Your output must include:

1. File plan & folder hierarchy
2. Component architecture
3. API design
4. SEO Health module (meta/title scanning, keyword suggestions)
5. OAuth GA4 & GSC implementation sequence
6. Dashboard UI blueprint (referencing Gemini diagram)
7. How AI Insights will attach to every KPI
8. How Keyword Everywhere API will be used weekly
9. Storage plan for SEO scan results
10. How the dashboard connects into the future HUB
11. Risks, assumptions, alternatives
12. Your reasoning on how you interpreted the canvas
13. How you will execute the implementation in stages
14. Ask clarifying questions before proceeding

Rules:

* Follow the Canvas exactly.
* Stay in Planning Mode only.
* Surface concerns proactively.
* Offer architectural improvements if beneficial.

```

---

# 1️⃣6️⃣ NEXT STEP FOR BEN

Once approved:
- Add this updated Canvas to the repo under `/docs/ocb/OWNER_CONTROL_BOARD.md`.
- Create `/prompts/sonnet/ocb-planning.md` with the Sonnet prompt.
- Create `/prompts/gemini/ocb-visual-blueprint.md` with the Gemini prompt.

Tell me when you're ready for direct file generation.
 FOR SONNET 4.5 — PLANNING MODE

(Consolidated — refer to the single unified prompt below, duplicates removed.)

```

SYSTEM TASK — ENTER PLANNING MODE FOR BLUE LAWNS OWNER CONTROL BOARD

You will generate a complete implementation plan based ONLY on the Canvas.
Do NOT write code yet.

Your output must include:

1. File creation plan
2. Directory layout
3. Component architecture
4. Required API endpoints
5. OAuth steps for GA4 and Search Console
6. JSON storage strategy (MVP)
7. Lighthouse API design
8. Admin UI + collapsible left navigation
9. Supabase Auth integration
10. OG guardrails
11. Deployment notes

Rules:

* Follow the Canvas EXACTLY.
* After producing the plan, **Sonnet must include a brief diagnostic section** explaining:
  • How it interpreted the Canvas
  • Why it structured the plan the way it did
  • Any risks, assumptions, or improvements it recommends
  • How it intends to attach and execute the plan in implementation mode (sequence, safety, guardrails)
* Sonnet should surface concerns or insights proactively.
* Do not invent new architecture.
* Ask clarifying questions if anything is ambiguous.
* Produce a safe, staged plan that can be executed within 1 hour.

```

---


```
