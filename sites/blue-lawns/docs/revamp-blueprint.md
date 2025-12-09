# Blue Lawns Website Revamp Blueprint

**Project:** Blue Lawns Astro Migration & SEO Optimization  
**Version:** 2.0  
**Status:** In Progress  
**Target Launch:** Q1 2025

---

## EXECUTIVE SUMMARY

**Objective:** Migrate Blue Lawns from legacy Webflow to a high-performance Astro site with a comprehensive location×service SEO matrix, optimized imagery, and conversion-focused UX.

**Core Requirements:**
1. **100+ Unique Pages:** Location × Service matrix for maximum local SEO coverage
2. **Manual Asset Integration:** Replace stock photos with authentic business imagery
3. **Direct Response Copywriting:** Benefit-driven, conversion-optimized content
4. **Mobile-First Design:** Premium card-based layouts, touch-optimized navigation
5. **Lighthouse 90+:** Performance, accessibility, SEO compliance

---

## PHASE 1: GLOBAL DESIGN SYSTEM UPGRADE

### 1.1 Brand Identity Implementation
**Status:** ✅ Complete

**Colors:**
- Primary Blue: `#0ea5e9` (Logo blue, headings, links)
- Navy: `#0f172a` (Dark text, footer)
- Secondary Green: `#22c55e` (CTAs, success states)
- Neutral Slate: Gray scale for text/backgrounds

**Typography:**
- Display: `Outfit` (Bold, modern) - All headings
- Body: `DM Sans` (Clean, readable) - All body text
- Fallback: System UI stack

### 1.2 Component Library
**Status:** ✅ Complete

**Core Components:**
- `Hero.astro` - Full-width hero with transparent/solid header variants
- `ServiceCard.astro` - 4:3 image, hover lift, green CTA
- `LocationCard.astro` - Same as ServiceCard + location badges
- `ServicesGrid.astro` - Responsive grid (1/2/3 cols)
- `Testimonials.astro` - Generated initial avatars, customer quotes
- `SocialProof.astro` - Trust indicators, review stars
- `Benefits.astro` - "Why Choose Blue Lawns" section
- `BeforeAfter.astro` - Image comparison slider
- `CTA.astro` - Conversion-focused call-to-action sections
- `FAQ.astro` - Accordion-style questions (future)

### 1.3 Layout System
**Status:** ✅ Complete

**Containers:**
- `max-w-7xl` - Default page width (1280px)
- `max-w-3xl` - Hero subtitles, intro text
- `px-6 lg:px-8` - Consistent horizontal padding

**Spacing:**
- Section Vertical: `py-20 lg:py-24` (80px → 96px)
- Section Internal: `mb-12 lg:mb-16` (48px → 64px)
- Card Gaps: `gap-8` (32px)

---

## PHASE 2: SERVICE ARCHITECTURE & IMAGERY SYSTEM

### 2.1 Service Inventory

#### **PRIMARY SERVICES** (Revenue Drivers)
1. **Landscape Maintenance** (`landscape-maintenance`)
   - Icon: `Sprout`
   - Slug: `landscape-maintenance`
   - Type: `primary`
   - Image: `hero-manual.webp` ✅

2. **Landscaping** (`landscaping`)
   - Icon: `Flower`
   - Slug: `landscaping`
   - Type: `primary`
   - Image: `hero-manual.webp` ✅

3. **Hardscaping** (`hardscaping`)
   - Icon: `BrickWall`
   - Slug: `hardscaping`
   - Type: `primary`
   - Image: `hero-manual.webp` ✅

4. **Landscape Lighting** (`landscape-lighting`)
   - Icon: `Lightbulb`
   - Slug: `landscape-lighting`
   - Type: `primary`
   - Image: `hero-manual.webp` ✅

5. **Pool Service & Maintenance** (`pool-service`)
   - Icon: `Waves`
   - Slug: `pool-service`
   - Type: `primary`
   - Image: `hero-manual.webp` ✅

6. **Commercial Services** (`commercial-services`)
   - Icon: `Building2`
   - Slug: `commercial-services`
   - Type: `primary`
   - Image: `hero-manual.webp` ✅

#### **SECONDARY SERVICES** (Supplemental Offerings)
7. **Lawn Care** (`lawn-care`)
   - Icon: `Grass`
   - Slug: `lawn-care`
   - Type: `secondary`
   - Image: `hero.webp` (stock fallback)

8. **Seasonal Cleanup** (`seasonal-cleanup`)
   - Icon: `Leaf`
   - Slug: `seasonal-cleanup`
   - Type: `secondary`
   - Image: `hero-manual.webp` ✅

9. **Power Washing** (`power-washing`)
   - Icon: `Droplets`
   - Slug: `power-washing`
   - Type: `secondary`
   - Image: `hero-manual.webp` ✅

10. **Fencing** (`fencing`)
    - Icon: `Fence`
    - Slug: `fencing`
    - Type: `secondary`
    - Image: `fencing-service-hero.webp` ✅ (scraped from bluefencingnj.com)

### 2.2 Service Data Schema
**File:** `src/content/services.json`

```json
{
  "id": "service-slug",
  "title": "Service Name",
  "slug": "service-slug",
  "type": "primary" | "secondary",
  "description": "Direct response benefit statement (1-2 sentences)",
  "fullDescription": "Extended description (2-3 paragraphs)",
  "icon": "LucideIconName",
  "heroImage": "src/assets/images/services/{slug}/hero-manual.webp",
  "alt": "{Service Title} services by Blue Lawns in Cape May County",
  "galleryImages": [],
  "seo": {
    "title": "{Service Title} Services | Blue Lawns",
    "description": "Meta description (120-160 chars)",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
}
```

### 2.3 Imagery Rules

#### **Manual Asset Processing**
**Status:** ✅ Complete (8 of 10 services)

**Script:** `scripts/process-manual-assets.ts`

**Process:**
1. User uploads raw images to `public/images/`
2. Script fuzzy-matches filename to service slug
3. Optimization: Resize to 1200px width, convert to WebP (80% quality)
4. Save to: `src/assets/images/services/{slug}/hero-manual.webp`
5. Update `services.json` paths and alt text

**Asset Status:**
- ✅ Hardscaping (manual)
- ✅ Landscaping (manual)
- ✅ Landscape Maintenance (manual)
- ✅ Landscape Lighting (manual)
- ✅ Pool Service (manual)
- ✅ Commercial Services (manual)
- ✅ Seasonal Cleanup (manual)
- ✅ Power Washing (manual)
- ✅ Fencing (scraped from bluefencingnj.com)
- ⚠️  Lawn Care (stock fallback)

#### **Prohibited Image Practices**
- ❌ NO logos as hero images
- ❌ NO icon files as service heroes
- ❌ NO duplicate images across services
- ❌ NO geographically inappropriate stock photos (cacti, palm trees, desert landscapes)

#### **Image Optimization Targets**
- Format: WebP
- Quality: 80%
- Hero Width: 1200px (auto height)
- Card Width: 800px (4:3 aspect ratio)
- File Size: < 200KB per image

---

## PHASE 3: LOCATION ARCHITECTURE

### 3.1 Location Inventory

**Service Area:** Cape May County, New Jersey

1. **Ocean View** (`ocean-view`)
   - Geo: 39.1751, -74.7268
   - Badges: Landscaping, Maintenance
   - Description: "Premium landscaping for spacious coastal properties."

2. **Cape May** (`cape-may`)
   - Geo: 38.9351, -74.9060
   - Badges: Gardening, Lawn Care
   - Description: "Expert care for historic Victorian homes and gardens."

3. **Avalon** (`avalon`)
   - Geo: 39.1007, -74.7185
   - Badges: Hardscaping, Design
   - Description: "High-end maintenance for luxury vacation residences."

4. **Stone Harbor** (`stone-harbor`)
   - Geo: 39.0487, -74.7568
   - Badges: Design, Pools
   - Description: "Bespoke outdoor living spaces for coastal estates."

5. **Sea Isle City** (`sea-isle-city`)
   - Geo: 39.1523, -74.6943
   - Badges: Maintenance, Cleanups
   - Description: "Reliable lawn care for vibrant summer properties."

6. **Wildwood** (`wildwood`)
   - Geo: 38.9917, -74.8117
   - Badges: Commercial, Lawn Care
   - Description: "Professional grounds keeping for commercial and residential."

7. **North Wildwood** (`north-wildwood`)
   - Geo: 39.0007, -74.7993
   - Badges: Cleanup, Pruning
   - Description: "Complete property care from the bay to the beach."

8. **Wildwood Crest** (`wildwood-crest`)
   - Geo: 38.9765, -74.8257
   - Badges: Lawn Care, Fertilization
   - Description: "Meticulous lawn services for quiet coastal neighborhoods."

9. **Rio Grande** (`rio-grande`)
   - Geo: 39.0194, -74.8776
   - Badges: Installation, Maintenance
   - Description: "Full-service landscaping for fast-growing communities."

10. **Cape May Court House** (`cape-may-court-house`)
    - Geo: 39.0818, -74.8257
    - Badges: Tree Care, Landscaping
    - Description: "Comprehensive estate management and tree services."

### 3.2 Location Data Schema
**File:** `src/content/locations.json`

```json
{
  "id": "town-slug",
  "town": "Town Name",
  "slug": "town-slug",
  "geo": {
    "lat": 00.0000,
    "lng": -00.0000
  },
  "description": "Brief location-specific value proposition (1 sentence)",
  "badges": ["Service Type 1", "Service Type 2"],
  "heroImage": "src/assets/images/general/hero-main.jpg"
}
```

### 3.3 Location Imagery Strategy
**Current Status:** ⚠️ All locations use fallback `hero-main.jpg`

**Future Enhancement:**
- Create location-specific hero images
- Folder structure: `src/assets/images/locations/{town-slug}/hero.webp`
- Showcase: Local landmarks, completed projects in that town
- Alt text: "Landscaping services in {Town}, NJ"

---

## PHASE 4: PAGE TEMPLATES & ROUTING

### 4.1 Homepage Template
**Path:** `src/pages/index.astro`  
**Status:** ✅ Complete

**Structure:**
1. Hero (Transparent header, left-aligned)
2. Social Proof (Reviews, trust badges)
3. Primary Services Grid (3 columns, **primary only**)
4. Secondary Services Grid (4 columns, gray background) ⚠️ **TO BE REMOVED per Phase 1 analysis**
5. Benefits ("Why Choose Blue Lawns")
6. Before/After Gallery
7. Testimonials (3 columns)
8. CTA ("Ready to transform your lawn?")

**SEO:**
- Title: "Blue Lawns | Premier Landscaping in Cape May County"
- Description: "Professional landscaping, lawn care, and hardscaping services for Avalon, Stone Harbor, Sea Isle City, and surrounding areas."
- Schema: LocalBusiness + Organization + BreadcrumbList

### 4.2 Service Index Template
**Path:** `src/pages/services/index.astro`  
**Status:** ⚠️ Needs Visual Redesign

**Current Issue:** Displays as text list, not visual grid

**Required Changes:**
- Replace with 3-column visual grid
- Use `ServiceCard` component style (image, title, description, "Learn More" button)
- Display ALL services (primary + secondary)
- Responsive: 1 col mobile → 2 col tablet → 3 col desktop

**SEO:**
- Title: "Our Services | Blue Lawns"
- Description: "Comprehensive landscaping, lawn care, and hardscaping services for residential and commercial properties in Cape May County."
- Schema: BreadcrumbList

### 4.3 Individual Service Page Template
**Path:** `src/pages/services/[slug].astro`  
**Status:** ✅ Partially Complete (6 of 10 pages exist)

**Existing Pages:**
- ✅ `commercial-services.astro`
- ✅ `fencing.astro`
- ✅ `landscaping.astro`
- ✅ `lawn-care.astro`
- ✅ `seasonal-cleanup.astro`
- ❌ landscape-maintenance (missing)
- ❌ hardscaping (missing)
- ❌ landscape-lighting (missing)
- ❌ pool-service (missing)
- ❌ power-washing (missing)

**Structure:**
1. Hero (Service-specific image, center-aligned)
2. Service Description (2-3 paragraphs)
3. Features/Benefits List (2-column grid)
4. Testimonials (service-specific, if available)
5. FAQ Section (future)
6. CTA ("Get a Free Quote")

**SEO:**
- Title: "{Service Title} Services | Blue Lawns"
- Description: "Expert {service} services in Cape May County. {Benefit}. Licensed, insured, and satisfaction guaranteed."
- Schema: Service + BreadcrumbList + FAQPage

### 4.4 Location Index Template
**Path:** `src/pages/locations/index.astro`  
**Status:** ✅ Complete

**Structure:**
1. Hero ("Where We Work", centered)
2. 3-Column Location Grid (LocationCard components)
3. All 10 locations displayed
4. Responsive: 1 col mobile → 2 col tablet → 3 col desktop

**SEO:**
- Title: "Where We Work | Blue Lawns"
- Description: "Proudly serving homeowners across Cape May County with professional landscaping and outdoor services."
- Schema: BreadcrumbList + AreaServed

### 4.5 Individual Location Page Template
**Path:** `src/pages/locations/[slug].astro`  
**Status:** ✅ Complete (All 10 pages exist)

**Existing Pages:**
- ✅ avalon.astro
- ✅ cape-may.astro
- ✅ cape-may-court-house.astro
- ✅ north-wildwood.astro
- ✅ ocean-view.astro
- ✅ rio-grande.astro
- ✅ sea-isle-city.astro
- ✅ stone-harbor.astro
- ✅ wildwood.astro
- ✅ wildwood-crest.astro

**Structure:**
1. Hero ("Lawn Care in {Town}")
2. Location Description
3. Services Grid (Primary services, "Our Services in {Town}")
4. CTA ("Ready to Get Started in {Town}?")

**SEO:**
- Title: "Landscaping in {Town}, NJ | Blue Lawns"
- Description: "Professional lawn care and landscaping services in {Town}, NJ. Serving {Town} homeowners since 2010."
- Schema: LocalBusiness + AreaServed + BreadcrumbList

### 4.6 Location × Service Matrix Template
**Path:** `src/pages/locations/[town]/[service].astro`  
**Status:** ❌ **CRITICAL MISSING IMPLEMENTATION**

**Target:** 100 unique pages (10 locations × 10 services)

**Dynamic Route Logic:**
```javascript
export async function getStaticPaths() {
  const services = await import('../../../content/services.json');
  const locations = await import('../../../content/locations.json');
  
  return locations.default.flatMap(location => 
    services.default.map(service => ({
      params: { 
        town: location.slug, 
        service: service.slug 
      },
      props: { location, service }
    }))
  );
}
```

**Structure (Required):**
1. Hero (Service-specific image, location-modified H1)
2. Agent-Generated Intro Paragraph (unique per location×service combo)
3. Benefits Section (service-specific)
4. Testimonials (location-specific if available, otherwise generic)
5. FAQ Section (location-service specific)
6. CTA ("Get {Service} in {Town} - Free Quote")

**H1 Format (Agent-Generated):**
```
"Expert {Service} Contractors Serving {Town}'s {Demographic} Homes"
"Professional {Service} Services in {Town}, NJ"
"Top-Rated {Service} Specialists for {Town} Properties"
```

**SEO:**
- Title: "{Service Title} in {Town}, NJ | Top Rated {Service Keyword}"
- Description: "Looking for {Service} in {Town}? Blue Lawns provides expert {service} services for {Town} homeowners. Free estimates available."
- Schema: Service + LocalBusiness + AreaServed + BreadcrumbList + FAQPage

**Content Differentiation (Critical for SEO):**
- Use `src/utils/seo-content.ts` helper to generate 20-40% unique copy per page
- Rotate modifiers: "Expert", "Local", "Professional", "Affordable", "Top-Rated", "Licensed"
- Vary sentence structure and keyword placement
- Location-specific details: Mention nearby neighborhoods, local landmarks, soil/climate considerations

### 4.7 Membership Page Template
**Path:** `src/pages/membership.astro`  
**Status:** ✅ Complete

**Structure:**
1. Hero ("Choose Your Membership Plan")
2. Pricing Toggle (Monthly/Yearly)
3. 2-Column Plan Grid (Preserve, Nurture)
4. Feature Comparison Table
5. FAQ Section
6. CTA

**SEO:**
- Title: "Membership Plans | Blue Lawns"
- Description: "Flexible landscaping membership plans for Cape May County homes. Comprehensive care packages with monthly and yearly options."
- Schema: BreadcrumbList

### 4.8 Contact Page Template
**Path:** `src/pages/contact.astro`  
**Status:** ✅ Complete (assumed)

**Structure:**
1. Hero ("Get Your Free Quote")
2. Contact Form (Name, Email, Phone, Service, Message)
3. Business Info (Address, Phone, Email, Hours)
4. Map Embed (Google Maps)
5. Social Links

**Form Handling:**
- Endpoint: `/api/contact.ts`
- Validation: Client-side + Server-side
- Destination: Webhook (configurable) or Email fallback

---

## PHASE 5: NAVIGATION & INFORMATION ARCHITECTURE

### 5.1 Primary Navigation
**Status:** ✅ Complete

**Header Links:**
1. Home → `/`
2. Services (Dropdown) → `/services`
   - Landscape Maintenance → `/services/landscape-maintenance`
   - Landscaping → `/services/landscaping`
   - Hardscaping → `/services/hardscaping`
   - Landscape Lighting → `/services/landscape-lighting`
   - Pool Service → `/services/pool-service`
   - Commercial Services → `/services/commercial-services`
   - *Divider*
   - "View All Services" → `/services`
3. Locations → `/locations`
4. Membership → `/membership`
5. Contact → `/contact`

**CTA Button:**
- "Get a Free Quote" → `/contact`
- Color: Green (`secondary-500`)
- Always visible (desktop + mobile)

### 5.2 Footer Navigation
**Status:** ✅ Complete (assumed)

**Columns:**
1. **About**
   - About Us
   - Why Choose Blue Lawns
   - Service Areas
   - Contact

2. **Services**
   - All Primary Services (links)
   - View All Services

3. **Locations**
   - All 10 Locations (links)
   - View All Locations

4. **Contact**
   - Phone: 609-425-2954
   - Email: info@bluelawns.com
   - Address: 57 W. Katherine Ave Unit B, Ocean View, NJ 08230
   - Social: Facebook, Instagram

**Footer Bottom:**
- Copyright © 2024 Blue Lawns
- Badges: "Licensed & Insured", "BBB Accredited"

### 5.3 Breadcrumb Navigation
**Status:** ✅ Implemented on most pages

**Required on ALL pages:**
- Homepage: No breadcrumbs
- Service Index: Home > Services
- Service Page: Home > Services > {Service Name}
- Location Index: Home > Service Areas
- Location Page: Home > Service Areas > {Town Name}
- **Location-Service Page:** Home > Service Areas > {Town} > {Service}

**Visual Style:**
```
Home / Service Areas / Avalon / Hardscaping
```
- Separator: `/`
- Current page: Bold, non-clickable
- Previous pages: Links with `text-primary-600 hover:text-primary-700`

---

## PHASE 6: SEO OPTIMIZATION STRATEGY

### 6.1 Keyword Research Integration
**Reference:** `.cursor/agents/factory/keyword_research_agent.yaml`

**Strategy:**
- **Primary Keywords:** Service-specific (e.g., "hardscaping", "landscape lighting")
- **Location Modifiers:** Town names (e.g., "hardscaping avalon nj", "lawn care stone harbor")
- **PASF Terms:** "How to", "Best", "Cost of", "Near me"
- **Long-Tail Keywords:** "residential hardscaping contractors avalon", "pool maintenance stone harbor nj"

**Keyword Placement:**
- H1: Primary keyword + location
- H2: Secondary keywords, PASF variations
- Meta Title: Primary keyword + location + brand
- Meta Description: Primary + secondary keywords, benefit statement
- Body: Natural keyword density (1-2%), semantic variations

### 6.2 SEO Copy Generation (Agent Logic)
**Reference:** `.cursor/agents/factory/seo_copy_agent.yaml`

**Content Differentiation Rules:**
- **20-40% Unique Content:** Required per location-service page
- **Modifier Rotation:** "Expert", "Local", "Professional", "Affordable", "Top-Rated"
- **Sentence Structure Variation:** Vary intro, benefits, CTA phrasing
- **Location Details:** Mention nearby landmarks, local climate, soil conditions

**Agent-Generated Content Helper:**
**File:** `src/utils/seo-content.ts`

```typescript
export function generateSEOContent(service, location) {
  return {
    h1: generateH1(service, location),
    intro: generateIntro(service, location),
    benefits: generateBenefits(service, location),
    faqs: generateFAQs(service, location)
  };
}
```

### 6.3 Internal Linking Strategy

**Homepage:**
- Links to ALL primary services
- Links to "View All Services"
- Links to "View All Locations"

**Service Index:**
- Links to ALL individual service pages

**Service Page:**
- Links to ALL location pages (via "Serving: Avalon, Stone Harbor, ..." text)
- Links to related services (sidebar or footer)

**Location Index:**
- Links to ALL individual location pages

**Location Page:**
- Links to ALL service pages (via services grid)
- Links to location-service pages: `/locations/{town}/{service}`

**Location-Service Page:**
- Links back to service page: `/services/{service}`
- Links back to location page: `/locations/{town}`
- Links to related services in that location
- Links to same service in nearby locations

**Link Juice Flow:**
```
Homepage (Highest Authority)
  ↓
Service Index + Location Index
  ↓
Individual Service Pages + Individual Location Pages
  ↓
Location × Service Matrix Pages (100+ pages)
```

---

## PHASE 7: TECHNICAL IMPLEMENTATION CHECKLIST

### 7.1 Content Files
- [x] `services.json` - 10 services with manual images
- [x] `locations.json` - 10 locations with fallback hero
- [x] `settings.json` - Business info, contact, branding
- [x] `navigation.json` - Header nav items
- [x] `membership.json` - Membership plans + comparison matrix
- [ ] `faqs.json` - Global FAQs (future)
- [ ] `testimonials.json` - Structured testimonials (future)

### 7.2 Page Files
- [x] Homepage (`index.astro`)
- [x] Service Index (`services/index.astro`) - **Needs visual redesign**
- [ ] Individual Service Pages (4 of 10 complete)
- [x] Location Index (`locations/index.astro`)
- [x] Individual Location Pages (10 of 10 complete)
- [ ] **Location × Service Matrix** (`locations/[town]/[service].astro`) - **CRITICAL MISSING**
- [x] Membership Page (`membership.astro`)
- [x] Contact Page (`contact.astro`)
- [x] 404 Page (`404.astro`)

### 7.3 Component Files
- [x] Hero Component
- [x] ServiceCard Component
- [x] LocationCard Component
- [x] ServicesGrid Component
- [x] SocialProof Component
- [x] Benefits Component
- [x] BeforeAfter Component
- [x] Testimonials Component
- [x] CTA Component
- [x] Header Component
- [x] Footer Component (assumed)
- [x] MobileMenu Component
- [ ] FAQ Component (future)
- [ ] PricingCard Component (membership)
- [ ] PricingToggle Component (membership)
- [ ] ComparisonTable Component (membership)

### 7.4 Utility Files
- [x] `image-helper.ts` - Resolve image imports
- [x] `structured-data/Breadcrumbs.ts` - Generate breadcrumb schema
- [x] `structured-data/LocalBusiness.ts` - Generate business schema
- [x] `structured-data/Service.ts` - Generate service schema
- [ ] **`seo-content.ts`** - Agent logic for content generation - **CRITICAL MISSING**

### 7.5 Image Assets
**Service Hero Images:**
- [x] Landscape Maintenance (`hero-manual.webp`)
- [x] Landscaping (`hero-manual.webp`)
- [x] Hardscaping (`hero-manual.webp`)
- [x] Landscape Lighting (`hero-manual.webp`)
- [x] Pool Service (`hero-manual.webp`)
- [x] Commercial Services (`hero-manual.webp`)
- [x] Seasonal Cleanup (`hero-manual.webp`)
- [x] Power Washing (`hero-manual.webp`)
- [x] Fencing (`fencing-service-hero.webp`)
- [ ] Lawn Care (stock fallback, needs manual upload)

**Location Hero Images:**
- [ ] All locations use `hero-main.jpg` fallback (low priority)

**General Images:**
- [x] `hero-main.jpg` (Homepage hero)
- [x] `before-yard.jpg` (Before/After section)
- [x] `after-yard.jpg` (Before/After section)
- [x] Avatars (3 × PNG, generated initials)

### 7.6 Scripts
- [x] `process-manual-assets.ts` - Optimize and map manual images
- [x] `migrate-assets.ts` - Scrape images from legacy site (partially successful)
- [ ] `generate-sitemap.ts` - Generate XML sitemap (assumed exists)
- [ ] `generate-robots.ts` - Generate robots.txt (assumed exists)

---

## PHASE 8: CRITICAL GAPS & NEXT STEPS

### 8.1 High Priority (Blocking Launch)
1. **Location × Service Matrix Implementation**
   - Create dynamic route: `/locations/[town]/[service].astro`
   - Implement `getStaticPaths()` for 100 page generation
   - Build `seo-content.ts` helper with Agent logic
   - Test content differentiation (20-40% uniqueness)

2. **Service Index Visual Redesign**
   - Replace text list with 3-column grid
   - Use `ServiceCard` components
   - Display ALL services

3. **Complete Missing Service Pages**
   - landscape-maintenance.astro
   - hardscaping.astro
   - landscape-lighting.astro
   - pool-service.astro
   - power-washing.astro

4. **Homepage Cleanup**
   - Remove "Secondary Services" section
   - Display ONLY primary services

### 8.2 Medium Priority (Post-Launch Enhancement)
1. **FAQ System**
   - Create `faqs.json` content file
   - Build `FAQ.astro` component
   - Add FAQs to all service pages
   - Add location-specific FAQs to location-service pages
   - Generate FAQPage schema

2. **Testimonials System**
   - Create `testimonials.json` content file
   - Replace placeholder avatars with real customer photos
   - Add service-specific testimonials
   - Add location-specific testimonials

3. **Location-Specific Imagery**
   - Replace `hero-main.jpg` fallback with location-specific images
   - Create folder structure: `/assets/images/locations/{town}/hero.webp`
   - Showcase: Local landmarks, completed projects

4. **Lawn Care Service Image**
   - Replace stock fallback with manual upload
   - Process with `process-manual-assets.ts`

### 8.3 Low Priority (Future Optimization)
1. **Blog/Content Hub**
   - Create `/blog` section
   - Seasonal lawn care tips
   - Local gardening guides
   - Project showcases

2. **Before/After Gallery**
   - Expand gallery with more examples
   - Filter by service type
   - Filter by location

3. **Service Area Expansion**
   - Add more locations if service area expands
   - Duplicate location × service matrix

4. **Conversion Rate Optimization**
   - A/B test CTA button colors
   - Test hero headline variations
   - Add exit-intent popups
   - Implement chat widget (Botpress integration exists)

---

## PHASE 9: LEGACY URL MAPPING (OLD → NEW)

**Note:** This section requires analysis of legacy Webflow site structure.

**Confirmed Legacy URLs:**
- `bluelawns.com/` → `/`
- `bluelawns.com/#financing` → `/membership` (anchor → page)
- `bluelawns.com/#services` → `/services` (anchor → page)
- External links:
  - `bluefencingnj.com/` (Fencing sister site)
  - `ecoastpoolservice.com/` (Pool service sister site)

**Expected Legacy Patterns:**
- `/landscape-maintenance` → `/services/landscape-maintenance` (if existed)
- `/avalon` → `/locations/avalon` (if existed)

**Redirect Strategy:**
- Implement 301 redirects in `vercel.json` or `astro.config.mjs`
- Preserve query parameters
- Redirect legacy anchors to new pages

---

## PHASE 10: PERFORMANCE & COMPLIANCE

### 10.1 Lighthouse Targets
- **Performance:** 90+ (Mobile), 95+ (Desktop)
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 100

### 10.2 Core Web Vitals Targets
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### 10.3 Optimization Checklist
- [x] WebP image format
- [x] Lazy loading below-fold images
- [x] Preload critical fonts
- [ ] Inline critical CSS
- [ ] Defer non-critical JavaScript
- [ ] Enable Brotli/Gzip compression
- [ ] Implement Service Worker (optional)
- [ ] Set up CDN for static assets

### 10.4 SEO Compliance
- [x] Meta titles on all pages
- [x] Meta descriptions on all pages
- [x] Alt text on all images
- [x] Breadcrumb schema on all pages
- [ ] Service schema on service pages
- [ ] LocalBusiness schema on location pages
- [ ] FAQPage schema on pages with FAQs
- [x] Robots.txt
- [x] Sitemap.xml
- [ ] Google Analytics integration
- [ ] Google Search Console verification

---

## APPENDIX A: FILE STRUCTURE

```
sites/blue-lawns/
├── public/
│   ├── images/
│   │   ├── optimized/ (162 webp files from legacy site)
│   │   ├── blue-lawns-{location}-lawn-care-hero.jpg (5 files)
│   │   ├── commercial.jpg (manual upload)
│   │   ├── hardscaping.jpg (manual upload)
│   │   ├── landscape-lighting.webp (manual upload)
│   │   ├── landscape-maintenance.jpg (manual upload)
│   │   ├── landscaping.jpg (manual upload)
│   │   ├── pool-maintenance.png (manual upload)
│   │   ├── power-washing.jpg (manual upload)
│   │   └── seasonal-clean-up.jpg (manual upload)
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── assets/
│   │   └── images/
│   │       ├── general/
│   │       │   ├── hero-main.jpg
│   │       │   ├── before-yard.jpg
│   │       │   └── after-yard.jpg
│   │       ├── avatars/
│   │       │   ├── avatar-1.png
│   │       │   ├── avatar-2.png
│   │       │   └── avatar-3.png
│   │       └── services/
│   │           ├── landscape-maintenance/
│   │           │   └── hero-manual.webp
│   │           ├── landscaping/
│   │           │   └── hero-manual.webp
│   │           ├── hardscaping/
│   │           │   └── hero-manual.webp
│   │           ├── landscape-lighting/
│   │           │   └── hero-manual.webp
│   │           ├── pool-service/
│   │           │   └── hero-manual.webp
│   │           ├── commercial-services/
│   │           │   └── hero-manual.webp
│   │           ├── lawn-care/
│   │           │   └── hero.webp (stock)
│   │           ├── seasonal-cleanup/
│   │           │   └── hero-manual.webp
│   │           ├── power-washing/
│   │           │   └── hero-manual.webp
│   │           └── fencing/
│   │               └── fencing-service-hero.webp
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── MobileMenu.astro
│   │   │   └── Container.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── ServicesGrid.astro
│   │   │   ├── SocialProof.astro
│   │   │   ├── Benefits.astro
│   │   │   ├── BeforeAfter.astro
│   │   │   ├── Testimonials.astro
│   │   │   └── CTA.astro
│   │   ├── membership/
│   │   │   ├── PricingCard.astro
│   │   │   ├── PricingToggle.astro
│   │   │   └── ComparisonTable.astro
│   │   ├── ui/
│   │   │   ├── Button.astro
│   │   │   └── Logo.astro
│   │   ├── ServiceCard.astro
│   │   └── LocationCard.astro
│   ├── content/
│   │   ├── services.json (10 services)
│   │   ├── locations.json (10 locations)
│   │   ├── settings.json (business info)
│   │   ├── navigation.json (header nav)
│   │   └── membership.json (plans + matrix)
│   ├── layouts/
│   │   └── Base.astro
│   ├── lib/
│   │   ├── image-helper.ts
│   │   └── structured-data/
│   │       ├── Breadcrumbs.ts
│   │       ├── LocalBusiness.ts
│   │       └── Service.ts
│   ├── pages/
│   │   ├── index.astro (Homepage)
│   │   ├── contact.astro
│   │   ├── membership.astro
│   │   ├── 404.astro
│   │   ├── services/
│   │   │   ├── index.astro (Service Index)
│   │   │   ├── commercial-services.astro
│   │   │   ├── fencing.astro
│   │   │   ├── landscaping.astro
│   │   │   ├── lawn-care.astro
│   │   │   └── seasonal-cleanup.astro
│   │   └── locations/
│   │       ├── index.astro (Location Index)
│   │       ├── avalon.astro
│   │       ├── cape-may.astro
│   │       ├── cape-may-court-house.astro
│   │       ├── north-wildwood.astro
│   │       ├── ocean-view.astro
│   │       ├── rio-grande.astro
│   │       ├── sea-isle-city.astro
│   │       ├── stone-harbor.astro
│   │       ├── wildwood.astro
│   │       ├── wildwood-crest.astro
│   │       └── [town]/ (MISSING CRITICAL FOLDER)
│   │           └── [service].astro (MISSING CRITICAL FILE)
│   ├── styles/
│   │   └── tokens.css (CSS variables)
│   └── utils/ (MISSING FOLDER)
│       └── seo-content.ts (MISSING CRITICAL FILE)
├── scripts/
│   ├── process-manual-assets.ts (Image optimization)
│   └── migrate-assets.ts (Legacy scraper)
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── vercel.json (deployment config)
```

---

## APPENDIX B: ROUTING TABLE

| Page Type | Route Pattern | Example | Status |
|-----------|---------------|---------|--------|
| Homepage | `/` | `/` | ✅ Complete |
| Service Index | `/services` | `/services` | ⚠️ Needs redesign |
| Service Detail | `/services/{slug}` | `/services/hardscaping` | ⚠️ 6 of 10 |
| Location Index | `/locations` | `/locations` | ✅ Complete |
| Location Detail | `/locations/{slug}` | `/locations/avalon` | ✅ Complete |
| **Location-Service** | **`/locations/{town}/{service}`** | **`/locations/avalon/hardscaping`** | **❌ MISSING** |
| Membership | `/membership` | `/membership` | ✅ Complete |
| Contact | `/contact` | `/contact` | ✅ Complete |
| 404 | `/404` | `/404` | ✅ Complete |

**Total Target Pages:** 130+
- Homepage: 1
- Service Index: 1
- Service Detail: 10
- Location Index: 1
- Location Detail: 10
- **Location × Service Matrix: 100**
- Membership: 1
- Contact: 1
- 404: 1

**Current Status:** 27 of 130+ pages complete (21%)

---

**END OF BLUEPRINT**

