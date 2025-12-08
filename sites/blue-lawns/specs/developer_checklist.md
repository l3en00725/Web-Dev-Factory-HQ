# Final Developer Checklist for Blue Lawns Migration

## 1. Imagery & Assets
- [ ] **Generate Images**: Use `imagery_manifest.json` to generate/source all required WebP images.
- [ ] **Place Images**: Save to `public/images/` using the specified filenames.
- [ ] **Verify Logo**: Ensure vector logo matches `design_system.json` colors.

## 2. Content & SEO implementation
- [ ] **Apply SEO Mapping**: Update `astro.config.mjs` redirects or create pages to match `seo_mapping.json`.
- [ ] **Inject Schema**: Add `schema_pack.json` JSON-LD blocks to `Base.astro` `<head>`.
- [ ] **Update Copy**: Replace placeholder text in components with `copy_rewrite_pack.json` content.
- [ ] **Meta Tags**: Ensure all pages have unique Title and Meta Descriptions from the mapping.

## 3. Automation & Tracking
- [ ] **Implement API**: Create `src/pages/api/lead.ts` using `lead_endpoint_spec.js` logic.
- [ ] **Env Vars**: Set `JOBBER_API_TOKEN` and `ZAPIER_WEBHOOK_URL` in `.env`.
- [ ] **GA4 Events**: Add `onclick` handlers from `ga4_phone_events.js` to all phone links.
- [ ] **Test Forms**: Verify form submission sends data to the API and handles errors.

## 4. UI/UX Final Polish
- [ ] **UI QA Patch**: Apply `sites/blue-lawns/specs/ui_qa/header_fix_patch.astro` to `Header.astro` and `MobileMenu.astro`.
- [ ] **Design Tokens**: Verify `tailwind.config.mjs` matches `design_system.json` (Colors/Fonts).
- [ ] **Review Section**: Implement the Review Card component using `review_template.json` structure.
- [ ] **OG Images**: Generate and assign OG images per `og_image_instructions.md`.
- [ ] **Performance**: Run Lighthouse audit to ensure Green scores (target 90+).

