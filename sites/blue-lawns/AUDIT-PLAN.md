# Blue Lawns - Lighthouse + SEO + Accessibility Fix Plan

**Date:** December 9, 2025  
**Scope:** `/sites/blue-lawns` only

---

## 📋 FILES TO MODIFY

### 1. Configuration Files (2 files)
- ✅ `vercel.json` - Add CSP headers
- ✅ `src/layouts/Base.astro` - Add default robots meta tag

### 2. Page Files - Heading Hierarchy Fixes (8 files)
- ✅ `src/pages/index.astro` - Verify h1 → h2 hierarchy in components
- ✅ `src/pages/contact.astro` - Already correct (h1 only)
- ✅ `src/pages/thank-you.astro` - Already correct (h1 → h2 → h3)
- ✅ `src/pages/membership.astro` - Already correct (h1 → h2 → h3)
- ✅ `src/pages/services/index.astro` - Check heading structure
- ✅ `src/pages/locations/index.astro` - Check heading structure
- ✅ `src/pages/locations/[town]/[service].astro` - Check heading structure
- ✅ `src/pages/404.astro` - Already correct (h1 → h2)

### 3. Component Files - Heading Hierarchy (6 files)
- ✅ `src/components/sections/BrandValues.astro` - Add h2 wrapper, ensure h3 for items
- ✅ `src/components/sections/ProcessSteps.astro` - Already has h2, h3 is correct
- ✅ `src/components/sections/Benefits.astro` - Already has h2, h3 is correct
- ✅ `src/components/sections/Testimonials.astro` - Already has h2
- ✅ `src/components/sections/BeforeAfter.astro` - Already has h2
- ✅ `src/components/sections/ServicesGrid.astro` - Already has h2, h3 is correct

### 4. Component Files - Accessibility (3 files)
- ✅ `src/components/sections/ContactSection.astro` - Add role="region" with aria-label
- ✅ `src/components/layout/Footer.astro` - Add role="contentinfo", ensure nav has role="navigation"
- ✅ `src/components/layout/Header.astro` - Add role="banner", ensure nav has role="navigation"

### 5. Image Optimization (Phase 1 - Identify only)
- ⚠️ Will identify large images but NOT modify (per instructions to wait for approval)

---

## 🔍 ISSUES IDENTIFIED

### Heading Hierarchy
1. **Homepage (`index.astro`):**
   - Hero component has h1 ✅
   - BrandValues: Uses h3 directly (needs h2 wrapper) ⚠️
   - ProcessSteps: Has h2, then h3 ✅
   - ServicesGrid: Has h2, then h3 ✅
   - Benefits: Has h2, then h3 ✅
   - Other sections: Need verification

2. **Service Pages:**
   - Hero has h1 ✅
   - "About Our Services" is h2 ✅
   - Structure is correct ✅

3. **Location Pages:**
   - Hero has h1 ✅
   - "Your Trusted Partner" is h2 ✅
   - "Our Services" is h2 ✅
   - Structure is correct ✅

### Accessibility
1. **Missing ARIA roles:**
   - Footer needs `role="contentinfo"`
   - Header needs `role="banner"`
   - Navigation needs `role="navigation"`
   - ContactSection needs `role="region"` with aria-label

2. **Icon-only links:**
   - Footer social icons: ✅ Already have aria-labels
   - Header phone icon: ✅ Already has aria-label

3. **Form labels:**
   - ContactForm: ✅ All fields have labels

4. **Image alt text:**
   - Most images have alt text ✅
   - Need to verify all decorative images have alt=""

### SEO
1. **Robots meta tag:**
   - Currently only added if `noIndex` or `noFollow` is set
   - Need default `<meta name="robots" content="index, follow">` for all pages

2. **Title tags:**
   - All pages have titles ✅
   - Lengths are appropriate ✅

3. **Meta descriptions:**
   - All pages have descriptions ✅
   - Lengths are appropriate ✅

4. **Canonical tags:**
   - Already present ✅

### Content Security Policy
1. **Missing CSP header:**
   - Need to add to vercel.json

### Link Text
1. **Ambiguous links:**
   - Need to scan for "click here", "here", "read more" without context
   - Most links appear descriptive ✅

---

## ✅ FIXES TO APPLY

### Priority 1: Critical (Must Fix)
1. Add CSP headers to vercel.json
2. Add default robots meta tag to Base.astro
3. Fix BrandValues heading hierarchy (add h2 wrapper)
4. Add ARIA roles to Header, Footer, Navigation

### Priority 2: Important (Should Fix)
5. Add role="region" to ContactSection
6. Verify all images have meaningful alt text
7. Scan for ambiguous link text

### Priority 3: Optimization (Nice to Have)
8. Identify large images for future optimization
9. Add loading="lazy" to below-fold images

---

## 📊 EXPECTED IMPROVEMENTS

**Before:**
- Performance: 86/100
- Accessibility: 0/100 (audit failed)
- SEO: 92/100
- Best Practices: 100/100

**After (Expected):**
- Performance: 86-90/100 (minimal change)
- Accessibility: 85-95/100 (major improvement)
- SEO: 95-100/100 (improvement)
- Best Practices: 100/100 (maintained)

---

**Total Files to Modify:** ~15 files  
**Estimated Changes:** ~50-75 lines modified  
**Risk Level:** LOW (semantic improvements only, no layout changes)

