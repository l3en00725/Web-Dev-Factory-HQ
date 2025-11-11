# Web-Dev-Factory-HQ: Unified Build Pipeline

## Overview

The Web-Dev-Factory-HQ is now a fully integrated automation system that connects `.cursor/agents` with `/scripts` utilities into a cohesive pipeline for building, optimizing, and deploying high-performance Astro websites.

## Architecture

### Agent System

All agents now include `working_directory` and `output_directory` fields:

- **site_builder.yaml** - Full-cycle orchestrator
- **performance_specialist.yaml** - Maintains 95+ PSI scores  
- **schema_specialist.yaml** - Generates JSON-LD structured data
- **seo_guard.yaml** - Preserves rankings during migration
- **migration_manager.yaml** - Handles domain changes with zero traffic loss

### Output Structure

```
/output/
  [site-name]/
    schema/          # JSON-LD and validation reports
    performance/     # Lighthouse audits
    seo/             # Meta, sitemap, robots validation
    migration/       # Redirect manifests and checklists
    logs/            # Pipeline execution logs
```

### Sites Structure

```
/sites/
  aveda-institute/   # Production site (Vermont campus)
  [client-name]/     # Future sites...
```

### Template System

```
/templates/
  client-base/       # Minimal Astro + Tailwind scaffold
    src/
      layouts/Base.astro
      pages/index.astro, 404.astro
    public/media, images
    data/content.json
    package.json, astro.config.mjs, vercel.json
```

## Core Scripts

### Deployment

```bash
# Deploy any site to Vercel
bun run scripts/deploy.mjs --site <name> [--prod]

# Example
bun run scripts/deploy.mjs --site aveda-institute --prod
```

### Site Cloning

```bash
# Create new site from template
bun run scripts/clone-template.mjs --name <name> [--template client-base]

# Example
bun run scripts/clone-template.mjs --name client-two
```

### Pipeline Orchestrator

```bash
# Run full automation pipeline
bun run scripts/run-pipeline.mjs --site <name> [--skip <step>] [--only <step>]

# Available steps: scrape, import, schema, performance, seo, redirects, build

# Examples
bun run scripts/run-pipeline.mjs --site aveda-institute
bun run scripts/run-pipeline.mjs --site aveda-institute --skip scrape
bun run scripts/run-pipeline.mjs --site aveda-institute --only build
```

## Root Package Scripts

```json
{
  "new-site": "bun run scripts/clone-template.mjs --name",
  "build:site": "bun run scripts/build-site.mjs --site",
  "deploy:site": "bun run scripts/deploy.mjs --site",
  "pipeline:full": "bun run scripts/run-pipeline.mjs --site"
}
```

## Workflow Example

### Creating a New Client Site

```bash
# 1. Clone template
bun run new-site client-xyz

# 2. Navigate and install
cd sites/client-xyz
bun install

# 3. Customize content
# Edit data/content.json, src/pages/*.astro

# 4. Run pipeline
cd ../..
bun run pipeline:full client-xyz

# 5. Deploy to production
bun run deploy:site client-xyz --prod
```

### Working with Aveda Institute

```bash
# Run build only
bun run pipeline:full aveda-institute --only build

# Run full pipeline without scraping
bun run pipeline:full aveda-institute --skip scrape

# Deploy to Vercel preview
bun run deploy:site aveda-institute

# Deploy to production
bun run deploy:site aveda-institute --prod
```

## Aveda Institute Status

### Completed

- ✅ Vermont address updated (400 Cornerstone Drive, Williston, VT 05495)
- ✅ Schema enhanced with `serviceArea` (VT, NH, Upstate NY)
- ✅ `EducationalOrganization` nested in `LocalBusiness`
- ✅ `/campus` page created with NAP + map
- ✅ Navigation updated (Home, Programs, Admissions, Services, Campus, Contact)
- ✅ Open Graph tags configured
- ✅ Build succeeds (7 pages generated)
- ✅ Images optimized (62-71KB each)

### Ready for Deployment

1. Run Lighthouse audit manually:
   ```bash
   cd sites/aveda-institute
   bun run build && bun run preview
   # In another terminal:
   lighthouse http://localhost:4321 --view
   ```

2. Validate schema at: https://search.google.com/test/rich-results

3. Deploy:
   ```bash
   bun run scripts/deploy.mjs --site aveda-institute --prod
   ```

## Configuration

### Agent YAML Structure

```yaml
name: Agent Name
working_directory: "${path_variable}"
output_directory: "output/${site_name}/category"
inputs: [...]
outputs: [...]
tasks: [...]
```

### Vercel Configuration

Each site includes `vercel.json`:

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "framework": "astro",
  "installCommand": "bun install"
}
```

## Performance Standards

- PageSpeed Insights: ≥ 95 (mobile & desktop)
- LCP: < 2.5s
- CLS: < 0.1
- FID/INP: < 100ms

## Schema Standards

- Valid JSON-LD
- Google Rich Results: zero errors
- Required properties: @type, name, address, telephone, geo, openingHours

## Future Enhancements

1. Update remaining scripts to accept `--output` flag
2. Add Lighthouse automation to pipeline
3. Implement schema validation step
4. Add broken link checker
5. Automate image optimization
6. Create additional templates (e-commerce, portfolio, blog)

## Support

For questions or issues:
1. Check `.cursor/agents/*.yaml` for agent definitions
2. Review `/scripts/*.mjs` for implementation
3. Examine `/output/[site-name]/logs/` for execution traces

