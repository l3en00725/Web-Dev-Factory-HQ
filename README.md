## 🚀 Web-Dev-Factory-HQ — AI-Driven Website Builder

This repository powers automated, migration-safe, fully AI-generated websites using:

- GPT-5.1 (Builder Orchestrator)
- Gemini 3.0 (Design Enhancement Engine)
- Claude (Reasoning & QA)
- Sanity MCP (Schema + Content Pipeline)

## ⚡ How to Build a New Site

Open a new dev chat in Cursor and run:

Run the Builder Orchestrator to create a new site.

```yaml
siteName: blue-lawns
templateName: client-base
businessName: Blue Lawns Landscaping
services: ["Lawn Care", "Sprinklers", "Mulch & Stone"]
locations: ["Cape May", "Avalon", "Stone Harbor"]
brandColors:
  primary: "#14532D"
  secondary: "#10B981"
  accent: "#22C55E"
contactEmail: info@bluelawns.com
contactPhone: "(609) 555-1234"
crmIntegration:
  provider: "jobber"
analytics:
  googleAnalyticsId: ""
websiteUrl: "https://bluelawns.com"
sourceUrl: null
```

The orchestrator will automatically:

- Normalize intake  
- Deploy/update Sanity schema  
- Seed content  
- Apply Gemini 3.0 design patterns  
- Generate SEO strategy & migration plan  
- Build Astro pages/components  
- Generate form UI + API + CRM wiring  
- Initialize `/sites/[siteName]`  
- Configure the OG image engine  
- Produce redirects + SEO safety checks  

No manual coding required.

---

## 🧠 Architecture Overview

- **/templates/** → Site templates (client-base is primary)  
- **/.cursor/agents/factory/** → All multi-model AI agents  
- **/sites/[client]/** → Output for completed builds  
- **/sanity/** → Shared CMS schema  
- **/docs/** → Active documentation  
- **/legacy/** → Archived files (ignored by factory)  

---

## 🛠 Installing Sanity MCP

For schema + seeding to work, developers must install the Sanity MCP extension in Cursor:

1. Open **Extensions** → search **Sanity MCP** → Install  
2. Enter credentials:
   - SANITY_PROJECT_ID  
   - SANITY_DATASET  
   - SANITY_API_VERSION  
   - SANITY_TOKEN  
3. Verify installation:

```bash
mcp ls
```

You should see: `sanity`

---

## Web-Dev-Factory HQ – AI-Powered Multi-Tenant Website Factory

This repository hosts an **AI-driven, multi-tenant website factory**. Cursor agents coordinate Sanity, Astro, and form/CRM infrastructure to spin up production-ready marketing sites with minimal manual work.

The system is designed so that **Cursor agents (in `.cursor/agents/factory`) orchestrate the entire pipeline**, while the repo itself remains a relatively thin, template-driven runtime.

---

## High-Level Architecture

The factory follows a consistent end-to-end flow:

1. **Intake**
   - `Universal Intake Agent` normalizes client information into a canonical `intakeObject`.
   - This object is the single source of truth for schema, content, design, forms, and routing decisions.

2. **Sanity Schema**
   - `Sanity Schema Agent` designs the full Sanity content model (documents, objects, sections, index exports).

3. **Content Seeding**
   - `Sanity Content Seeder Agent` uses the `intakeObject` to create initial documents (homepage, services, locations, navigation, settings, SEO, etc.).

4. **Dataset Inspection**
   - `Dataset Inspector Agent` validates the dataset, surfaces missing content, reference issues, and required fixes before build steps proceed.

5. **Template Rendering**
   - `Template Rendering Agent` maps Sanity schema and sections to Astro components, generating a `template.config`/rendering blueprint.

6. **Astro Build**
   - `Template Initialization Agent` scaffolds `/sites/[site-name]` from the base template.
   - `Astro Site Builder Agent` wires routes, layouts, SEO, navigation, and pageBuilder rendering based on the rendering blueprint and dataset.

7. **Forms & CRM**
   - `Form Builder Agent` generates reusable form components, form types/validation, and API routes for submissions.
   - Forms write leads into Sanity and forward to configured CRM/webhooks with full attribution.

8. **Deploy**
   - Deployment is handled via Vercel (or similar) using environment variables and build hooks.
   - Post-launch agents (SEO, performance, QA) can be run as needed, with older flows preserved under `/legacy`.

---

## Folder Structure Overview

- **`.cursor/agents/factory`**
  - Active multi-agent system (orchestrators + workers) that define how a build runs.
  - Includes:
    - Builder Orchestrator Agent
    - Universal Intake Agent
    - Sanity Schema & Content Seeder Agents
    - Dataset Inspector Agent
    - Template Rendering Agent
    - Astro Site Builder Agent
    - Design Enhancement Agent
    - SEO Copy Agent
    - Form Builder Agent

- **`templates/client-base`**
  - Base Astro template used for new sites.
  - Contains layout primitives, shared components, and configuration that factory agents customize per site.

- **`sanity`**
  - Sanity Studio and schema source of truth.
  - `schema/` contains documents/objects/sections aligned with the factory content model.
  - `sanity.config.ts` wires the project, dataset, plugins, and schema.

- **`sites/[site-name]`**
  - Per-site Astro projects generated by the factory.
  - The Builder Orchestrator + Astro Site Builder populate:
    - `src/pages/` for routes
    - `src/components/` for shared UI
    - `src/content/` for content collections (if used)

- **`docs`**
  - Current documentation:
    - Prompting guides for different models
    - System architecture
    - Templates guide
    - Troubleshooting and quick-reference docs
  - Archived/older docs live under `docs/legacy/`.

- **`legacy`**
  - Archived code and scripts retained for reference only:
    - `legacy/web-dev-factory-old/` – older agent definitions and core env docs.
    - `legacy/botpress-old/` and `legacy/zapier-old/` – prior integrations.
    - `legacy/scripts-old/` – the old `/scripts` toolkit (no longer used by active factory agents).

---

## Running the Builder Orchestrator

The **Builder Orchestrator Agent** (in `.cursor/agents/factory/builder_orchestrator_agent.yaml`) is the primary entry point for new builds.

At a high level:

1. Provide inputs that match the orchestrator’s `inputs` block:
   - `siteName`
   - `templateName`
   - `businessName`
   - `services` (array of service names)
   - `locations` (array of location names)
   - `brandColors`
   - `contactEmail` / `contactPhone`
   - `crmIntegration`
   - `analytics`
   - `websiteUrl` (optional)
   - `sourceUrl` (optional legacy site to scrape)

2. The orchestrator will:
   - Run **Phase 0 – Universal Intake** to produce `intakeObject`.
   - Drive schema generation, seeding, dataset inspection, design, rendering, Astro build, forms, and deployment planning in order.

In Cursor, you typically **run this agent via the Agents panel**, selecting the Builder Orchestrator and supplying the JSON inputs above.

---

## Required Environment Variables

Set these in your local `.env` and in your deployment platform (e.g., Vercel):

- **Sanity**
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET`
  - `SANITY_API_VERSION`
  - `SANITY_TOKEN` (for content seeding and server-side operations)

- **Vercel / Deployment**
  - `VERCEL_PROJECT_ID` (if applicable)
  - `VERCEL_ORG_ID` (if applicable)
  - `VERCEL_DEPLOY_HOOK_URL` or project build configuration

- **Forms & CRM (used by Form Builder / handlers)**
  - `JOBBER_API_KEY` (if `crmIntegration.provider === "jobber"`)
  - `HUBSPOT_PORTAL_ID` (if `provider === "hubspot"`)
  - `HUBSPOT_FORM_ID` (if `provider === "hubspot"`)
  - `FORM_WEBHOOK_URL` (if `provider === "webhook"`)

Refer to `env.template` and `sanity/core env docs` (in docs/legacy and sanity/core) for the complete, authoritative list.

---

## How Templates Work

- The **client-base template** under `templates/client-base` acts as the master Astro project.
- Factory agents **clone and adapt** this template into `sites/[site-name]`:
  - Routing and navigation are driven by Sanity documents and the rendering blueprint.
  - Shared sections (hero, grids, FAQs, CTAs, testimonials, etc.) are mapped to Sanity’s sections-array/pageBuilder model.
- Most structural changes should be made in `templates/client-base` and then consumed by agents, rather than editing generated sites directly.

---

## Forms, CRM Forwarding, and Attribution

Forms are owned by the **Form Builder Agent** and the downstream form handler logic it defines.

- **Generated artifacts (per site)** may include:
  - `src/components/form/Form.astro` and field components
  - `src/lib/forms/types.ts` and `src/lib/forms/validation.ts`
  - `src/pages/api/form/submit.ts` for handling submissions
  - Optional `src/lib/forms/formConfig.ts` describing field mappings and display.

- **Lead storage in Sanity**
  - A `lead` document type stores:
    - Contact fields (name, email, phone, message)
    - Context fields (service, location)
    - Attribution object (UTM params, URL path, referer)
    - `crmForwardStatus` and timestamps.

- **Attribution handling**
  - Hidden fields and/or request parsing capture:
    - `utm_source`, `utm_medium`, `utm_campaign`
    - `url_path`, `referer`
  - These are persisted into the `lead` document’s attribution object.

- **CRM / webhook forwarding**
  - The handler inspects `crmIntegration` and environment variables:
    - Jobber → `JOBBER_API_KEY`
    - HubSpot → `HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_ID`
    - Webhook → `FORM_WEBHOOK_URL`
  - Failures should be recorded on the lead or surfaced in logs (behavior defined by the active form handler implementation).

---

## Vercel Deployment

While exact deployment steps may vary by project, the intended flow is:

1. Build the site(s) using the standard Astro/Vercel pipeline.
2. Use a **deploy hook** (`VERCEL_DEPLOY_HOOK_URL`) or Vercel’s CI integration to trigger builds.
3. Ensure:
   - Sanity env vars are set in the Vercel project.
   - Form/CRM env vars are configured for the production environment.
   - Any site-specific overrides (e.g., base URL) are in place.

Legacy deployment helpers and CLIs are preserved under `legacy/` and `legacy/scripts-old/` for reference but are **not part of the active factory pipeline**.

---

## Legacy Content

- The `legacy/` folder contains **historical agents, integrations, and scripts** that informed this factory but are no longer the primary path.
- The `docs/legacy/` folder contains older documentation, environment notes, and migration writeups.

You can safely ignore these for normal day-to-day factory operations, but they are available if you need to trace prior behavior or reuse ideas.


