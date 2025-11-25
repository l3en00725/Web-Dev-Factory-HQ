# Sanity Schema System

This directory contains the complete Sanity CMS schema system for the Web-Dev-Factory HQ.

## Directory Structure

```
/sanity
├── sanity.config.ts          ← To be created when connecting to Sanity project
└── schema/
    ├── index.ts              ← Exports all schema types
    ├── objects/              ← Reusable object types
    │   ├── seo.ts            ← SEO metadata object
    │   ├── geo.ts            ← Geolocation object for local SEO
    │   ├── socialLink.ts     ← Social media link object
    │   └── footerLink.ts     ← Footer navigation link object
    ├── sections/             ← Page Builder section modules
    │   ├── hero.ts           ← Hero section
    │   ├── features.ts       ← Features grid section
    │   ├── servicesGrid.ts   ← Services reference grid
    │   ├── imageBanner.ts    ← Full-width image banner
    │   ├── contactSection.ts ← Contact form/info section
    │   ├── callToAction.ts   ← CTA banner section
    │   ├── gallery.ts        ← Image gallery section
    │   ├── pricing.ts        ← Pricing table section
    │   ├── faq.ts            ← FAQ accordion section
    │   ├── contentBlock.ts   ← Rich text + image block
    │   └── stats.ts          ← Statistics/metrics section
    └── documents/            ← Top-level document types
        ├── homepage.ts       ← Homepage document
        ├── service.ts        ← Service pages
        ├── location.ts       ← Location/GEO pages
        ├── testimonial.ts    ← Customer testimonials
        ├── settings.ts       ← Site settings (singleton)
        ├── navItem.ts        ← Navigation menu items
        └── globalSEO.ts      ← Global SEO settings (singleton)
```

## Usage

The schema in this folder is designed to be deployed to the **WebHQFactory → Web-Dev-Factory** Sanity project.

- **Project ID**: `m8m8m99r`
- **Default dataset**: `production`

### 1. Environment variables

Set the following at the repo root (or in your shell/CI):

```bash
SANITY_PROJECT_ID=m8m8m99r
SANITY_DATASET=production
SANITY_API_VERSION=2023-10-01
SANITY_WRITE_TOKEN=your-write-token # server-side only
```

These keys are also documented in `web-dev-factory/core/env-docs.md` and templated in `env.template`.

### 2. Import `schemaTypes` in your `sanity.config.ts`:

```typescript
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schema';

export default defineConfig({
  name: 'web-dev-factory',
  title: 'Web Dev Factory',
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
```

### 3. Install dependencies and deploy schema

From the `/sanity` directory:

```bash
cd sanity
npm install
npm run schema:deploy
```

This runs `sanity schema deploy` against project `m8m8m99r` / dataset `production`, registering the blueprint schema in your Sanity project. Once deployed, the Sanity agents (e.g. `sanity_content_seeder_agent`) can safely create and publish documents against this model.

## Page Builder System

All page documents (homepage, service, location) include a `pageBuilder` field that accepts an array of section modules:

- `hero` — Above-the-fold hero section
- `features` — Feature highlights grid
- `servicesGrid` — Service cards with references
- `imageBanner` — Full-width image with overlay
- `contactSection` — Contact form and info
- `callToAction` — Conversion-focused CTA
- `gallery` — Image gallery with lightbox
- `pricing` — Pricing table/plans
- `faq` — FAQ accordion (with schema.org support)
- `contentBlock` — Rich text with image
- `stats` — Key metrics/statistics

## Environment Variables Required

```
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_WRITE_TOKEN=your-write-token
SANITY_API_VERSION=2023-10-01
```

## Blueprint Compliance

This schema system follows the Template System Blueprint specifications:
- ✅ All document types with SEO object
- ✅ GEO object for location pages
- ✅ Page Builder array system
- ✅ Image hotspot support
- ✅ Validation rules
- ✅ Settings singleton for site config
- ✅ GlobalSEO singleton for SEO defaults
