# Web-Dev-Factory-HQ System Update Canvas

**Purpose**

This canvas serves as a living changelog and implementation directive for improving the Web-Dev-Factory-HQ build pipeline, documentation, and automation logic. Each entry is written so Cursor can execute updates systematically and provide a summary of all modified files when complete.

---

## 21. Automated Location Page Generator

**Goal:** Generate dynamic location pages with 80% unique content, schema injection, and navigation integration.

**Docs to Update:**
- COMPLETE-WORKFLOW.md: Add Location Page Generation section after content import phase.
- SYSTEM-ARCHITECTURE.md: Add to Key Scripts Reference section.
- IMPLEMENTATION-SUMMARY.md: Add Location Page Generator section.

**Directives:**
- Script location: `scripts/create-locations.mjs`
- Input: `data/locations.json` (array of city objects with lat/lng)
- Output: Dynamic Astro pages at `src/pages/locations/[city-slug]/index.astro`
- Features:
  - 80% unique content generation per city using keyword rotation
  - LocalBusiness schema injection with geo coordinates
  - SEO-optimized meta titles and descriptions
  - City-specific hero image references
  - Summary report: `output/[site]/locations-summary.md`
- AI generation directives: Uses keyword arrays (`lawnCareServices`, `coastalChallenges`) rotated by city index
- 80% uniqueness logic: 5 intro paragraph variations, rotated service keywords, unique schema coordinates
- Nav bar integration: Manual update to `src/components/navbar/navbar.astro` with locations dropdown

**Status:** Active — script exists, documentation complete.

---

## 22. Legacy SEO-Driven Image Renaming & Alt Text Preservation

**Goal:** Ensure all imported media files are automatically renamed, compressed, and SEO-labeled based on page content and service context.

**Docs to Update:**
- COMPLETE-WORKFLOW.md: Add Image SEO Renaming section after optimize-images phase.
- SYSTEM-ARCHITECTURE.md: Add to Key Scripts Reference section.
- IMPLEMENTATION-SUMMARY.md: Add Image SEO Renaming section.

**Directives:**
- Script location: `scripts/rename-images.mjs`
- Input: `output/[site]/scrape/content_map.json`, `sites/[site]/public/media/`
- Output: `sites/[site]/public/media/optimized/`, updated Astro files, `output/[site]/image-seo-map.csv`
- Naming pattern: `[brand]-[city]-[primary_keyword]-[section].webp`
- Alt text preservation: Preserves original alt text if 8-15 words, generates from context if missing
- Build failure threshold: >20% unrenamed images causes build to fail
- Integration point: After optimize-images, before import-content
- Context matching: Matches images to nearest page H1/H2 headings from content_map.json
- Compression: WebP format at 80% quality

**Status:** Active — script created, documentation complete, ready for pipeline integration.

---

