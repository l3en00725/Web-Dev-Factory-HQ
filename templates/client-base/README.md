# Client Site Template

This is a base template for creating new sites with the Web-Dev-Factory-HQ pipeline.

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
/
├── public/          # Static assets
│   ├── media/       # Images and media files
│   └── images/      # Icons and logos
├── src/
│   ├── layouts/     # Layout components
│   ├── components/  # Reusable components
│   └── pages/       # Route pages
├── data/            # Content JSON files
└── scripts/         # Build and automation scripts
```

## Deployment

Deploy to Vercel from the project root:

```bash
bun run scripts/deploy.mjs --site <site-name> --prod
```

## Pipeline

Run the full automation pipeline:

```bash
bun run scripts/run-pipeline.mjs --site <site-name>
```

## Forms and lead capture

- The API route at `src/pages/api/form/submit.ts` is **generated per-client**
  by the Web-Dev-Factory Form Builder Agent during site builds. Do not edit
  this file directly in the base template.
- A legacy reference implementation lives at
  `src/pages/api/form/submit.legacy.ts`. It is provided for historical and
  implementation reference only and is **not used** by new client sites once
  the Form Builder phase has run.

## OG Image Generation

All sites include dynamic OG images via `/api/og`.

Configurable via Sanity: Settings → OG Template.

Uses Vercel Edge Functions + `@vercel/og`.


