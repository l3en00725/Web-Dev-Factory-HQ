## Blue Lawns – Deployment Checklist (Phase 9)

### Build & Output
- **Working directory**: `sites/blue-lawns`
- **Build command**: `npm run build`
- **Dev command**: `npm run dev`
- **Preview command**: `npm run preview`
- **Output directory**:
  - Server bundle: `sites/blue-lawns/dist/server/` (Node server entry)
  - Client assets: `sites/blue-lawns/dist/client/`
- **Adapter**: `@astrojs/node` with `output: "server"` and `mode: "standalone"` (see `astro.config.mjs`)

For a generic Node host (Render, Fly, Railway, etc.), configure:
- **Start command** (example): `node dist/server/entry.mjs`
- **Root/working directory**: `sites/blue-lawns`

### Required Environment Variables (names only)

Sanity (content fetching & writes):
- `SANITY_PROJECT_ID`
- `SANITY_DATASET` (optional, defaults to `production`)
- `SANITY_API_VERSION` (optional, defaults to `2023-10-01`)
- `SANITY_USE_CDN` (optional, `"false"` to disable CDN)
- `SANITY_READ_TOKEN` (optional, only if you need private/preview reads)
- `SANITY_API_WRITE_TOKEN` (required for contact form lead creation & CRM forwarding)

Dashboard service (Phase 10 integration):
- `DASHBOARD_UUID`
- `DASHBOARD_API_URL`

Platform / runtime (typically provided by host, but used by the app if present):
- `NODE_ENV`
- `VERCEL_ENV` (only relevant on Vercel; used in `robots.txt` staging logic)

### Standalone Site Readiness
- `src-old` code is excluded from TypeScript and not used by any active route.
- Active routes are limited to:
  - `/` (homepage)
  - `/services`, `/services/[slug]`
  - `/locations`, `/locations/[slug]`, `/locations/[location]/[service]`
  - `/contact`
  - `/membership`
  - `/dashboard`
  - `robots.txt`
  - `sitemap.xml`, `sitemap-index.xml`
  - API routes under `/api`: `og`, `forms/contact`, legacy `form/submit.legacy` (kept for reference but not used by the new form pipeline).
- Build passes with 0 errors; no unresolved references to experimental code.

### Hosting-Dashboard TODOs
- Configure the environment variables above for the production project (no secrets committed to git).
- Ensure the production domain `https://www.bluelawns.com` is pointed at this deployment and matches the `site` value in `astro.config.mjs`.
- For Vercel specifically:
  - Set project root to `sites/blue-lawns`.
  - Use `npm run build` as the build command.
  - Use a Node-compatible runtime (or consider switching to the official `@astrojs/vercel` adapter in a future phase if desired).


