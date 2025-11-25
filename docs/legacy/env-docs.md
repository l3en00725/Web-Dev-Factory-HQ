## Web-Dev-Factory Environment Variables

This file documents the **factory-level environment variables** required by the Template System Blueprint.
Actual values should live in a root `.env` file (or environment configuration in Vercel), using the keys below.

> Note: During Phase 1.5 we only define and document these variables.
> Sanity installation, schemas, and runtime code that reads them will be added in later phases.

---

### SANITY_PROJECT_ID

- **What it is**: The unique ID of your Sanity project (from Sanity.io dashboard).
- **Used for**: Connecting the factory’s Sanity client and CLI to the correct project.
- **Populated in**: **Phase 2 – Sanity System Install** (once the Sanity project has been created).
- **How Cursor will use it later**:
  - Scripts in `web-dev-factory/core` (e.g., `push-to-sanity` and other Sanity helpers) will load this from `process.env.SANITY_PROJECT_ID`.
  - Frontend adapters (e.g., `src/lib/sanity.ts` created later) will read it for GROQ queries and client config.

---

### SANITY_DATASET

- **What it is**: The dataset name within your Sanity project (e.g. `production`).
- **Used for**: Telling Sanity which dataset to read/write when seeding content and querying documents.
- **Default value**: `production` (as per Blueprint).
- **Populated in**: **Phase 2 – Sanity System Install**.
- **How Cursor will use it later**:
  - Sanity client utilities will read `process.env.SANITY_DATASET` to target the correct dataset.
  - Any future multi-site or multi-dataset logic will branch based on this value.

---

### SANITY_READ_TOKEN

- **What it is**: A Sanity API token with **read-only** permissions.
- **Used for**:
  - Server-side rendering and API routes that need to fetch published content securely.
  - Any future factory tooling that needs to **read** content without write access.
- **Populated in**: **Phase 2 – Sanity System Install** (after creating a read-only API token in Sanity).
- **How Cursor will use it later**:
  - Backend utilities and API handlers will read `process.env.SANITY_READ_TOKEN` when performing secure content queries.
  - This token will never be exposed client-side; it will only be used in server contexts.

---

### SANITY_WRITE_TOKEN

- **What it is**: A Sanity API token with **read + write** permissions.
- **Used for**: Allowing factory scripts to:
  - Create/update documents (homepage, services, locations, settings, etc.).
  - Run migrations or bulk content operations.
- **Populated in**: **Phase 2 – Sanity System Install** (after creating API token in Sanity).
- **How Cursor will use it later**:
  - Server-side scripts under `web-dev-factory/core` will read `process.env.SANITY_WRITE_TOKEN` when pushing content.
  - The token will never be exposed client-side; only server/build scripts and secure API routes may use it.

---

### SANITY_API_VERSION

- **What it is**: The date-based API version for Sanity’s HTTP API (e.g. `2023-10-01`).
- **Used for**: Ensuring consistent Sanity behavior even when the API evolves.
- **Default value**: `2023-10-01` (as specified in the Blueprint).
- **Populated in**: **Phase 2 – Sanity System Install** (or earlier, when `.env` is first configured).
- **How Cursor will use it later**:
  - All Sanity clients constructed in shared utilities will use `process.env.SANITY_API_VERSION` as the API version.

---

### VERCEL_DEPLOY_HOOK_URL

- **What it is**: The Vercel deploy hook URL configured to rebuild the site when content changes.
- **Used for**:
  - Triggering Vercel deployments from Sanity webhooks when documents are published or updated.
  - Enabling “content changes → automatic rebuild” behavior.
- **Populated in**: **Phase 2 or Phase 5**, when wiring Sanity → Vercel webhooks.
- **How Cursor will use it later**:
  - Sanity webhook configuration will point to this URL (or a serverless function that calls it).
  - Core scripts may hit this URL after major scripted content operations, if desired.

---

### RESEND_API_KEY (Optional – Future)

- **What it is**: API key for the Resend email service.
- **Used for**: Sending transactional emails from contact forms or factory workflows.
- **Populated in**: When enabling email features for a specific project (typically **Phase 4+**, content/contact integrations).
- **How Cursor will use it later**:
  - API routes and server-side handlers (e.g., `submit-form` functions) will read `process.env.RESEND_API_KEY`.

---

### ZAPIER_WEBHOOK_URL (Optional – Future)

- **What it is**: A Zapier “Catch Hook” URL used to forward leads or events into Zapier automations.
- **Used for**:
  - Contact / lead forms → Zapier → downstream tools (Jobber, CRMs, etc.).
- **Populated in**: When integrating external automations for a given site (typically **Phase 4+**, lead routing).
- **How Cursor will use it later**:
  - Serverless API routes will POST payloads to `process.env.ZAPIER_WEBHOOK_URL`.

---

### FACTORY_SITE_NAME (Optional – Future)

- **What it is**: A short identifier for the current factory site (e.g., `blue-lawns`, `demo-site-1`).
- **Used for**:
  - Tagging logs, output directories, or multi-project workflows.
  - Allowing scripts to know “which site” is currently being processed.
- **Populated in**: When setting up a new site via the Project Intake Flow (typically **Phase 1 / Phase 3**).
- **How Cursor will use it later**:
  - Core scripts under `web-dev-factory/core` can read `process.env.FACTORY_SITE_NAME` to resolve paths like:
    - `/web-dev-factory/data/<FACTORY_SITE_NAME>/branding.json`
    - `/web-dev-factory/data/<FACTORY_SITE_NAME>/seo.json`

---

### FACTORY_ENV (Optional – Future)

- **What it is**: A simple environment flag for the Web-Dev-Factory itself (e.g., `local`, `staging`, `production`).
- **Used for**:
  - Toggling behavior between local development, CI, and production runs.
  - Controlling logging verbosity, safety checks, and external calls.
- **Default example**: `local`
- **Populated in**: **Phase 1.5** for local dev; later overridden per environment (CI, production).
- **How Cursor will use it later**:
  - Scripts can branch on `process.env.FACTORY_ENV` to:
    - Skip external APIs in local mode.
    - Enable stricter checks or webhooks only in production.

---

### How Cursor Will Read Env Vars for Builds (Later Phases)

- Cursor will operate under the assumption that:
  - A root `.env` file (or environment variables set in the shell/CI) defines all keys documented here.
  - Node/Bun-based scripts in `web-dev-factory/core` and individual sites use `process.env.*` to read them.
- During:
  - **Phase 2 (Sanity)**: Sanity client utilities and push scripts will read all `SANITY_*` vars and `VERCEL_DEPLOY_HOOK_URL`.
  - **Phase 3–5 (Templates & Astro)**: Template agents and Astro builder scripts will rely on `FACTORY_SITE_NAME`, `FACTORY_ENV`, and any email/Zapier keys where applicable.

This document is the single source of truth for factory-level environment configuration until later phases introduce actual code that consumes these variables.


