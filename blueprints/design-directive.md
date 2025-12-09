# Blue Lawns Global Design Directive

**Version:** 2.0  
**Last Updated:** December 2024  
**Status:** Active - Enforced Across All Pages

---

## 1. BRAND IDENTITY

### Brand Colors
```css
/* Primary Palette */
--color-primary-50: #f0f9ff;
--color-primary-100: #e0f2fe;
--color-primary-200: #bae6fd;
--color-primary-300: #7dd3fc;
--color-primary-400: #38bdf8;
--color-primary-500: #0ea5e9;  /* Base Brand Blue */
--color-primary-600: #0284c7;
--color-primary-700: #0369a1;
--color-primary-800: #075985;
--color-primary-900: #0c4a6e;
--color-primary-950: #0f172a;  /* Blue Lawns Navy (Dark Brand) */

/* Secondary Palette (Green - CTA/Action) */
--color-secondary-50: #f0fdf4;
--color-secondary-100: #dcfce7;
--color-secondary-200: #bbf7d0;
--color-secondary-300: #86efac;
--color-secondary-400: #4ade80;
--color-secondary-500: #22c55e;  /* Base Green */
--color-secondary-600: #16a34a;
--color-secondary-700: #15803d;
--color-secondary-800: #166534;
--color-secondary-900: #14532d;

/* Neutral Palette */
--color-slate-50: #f8fafc;
--color-slate-100: #f1f5f9;
--color-slate-200: #e2e8f0;
--color-slate-300: #cbd5e1;
--color-slate-400: #94a3b8;
--color-slate-500: #64748b;
--color-slate-600: #475569;
--color-slate-700: #334155;
--color-slate-800: #1e293b;
--color-slate-900: #0f172a;
```

### Brand Fonts
- **Display Font (Headings):** `Outfit` - Bold, Modern, Geometric
- **Body Font:** `DM Sans` - Clean, Readable, Professional
- **Fallback Stack:** `system-ui, -apple-system, sans-serif`

---

## 2. TYPOGRAPHY SYSTEM

### Heading Scale
```css
h1: font-display text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-slate-900
h2: font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900
h3: font-display text-2xl lg:text-3xl font-bold text-slate-900
h4: font-display text-xl lg:text-2xl font-semibold text-slate-900
h5: font-display text-lg lg:text-xl font-semibold text-slate-700
h6: font-display text-base lg:text-lg font-semibold text-slate-700
```

### Body Scale
```css
body-xl: text-xl leading-relaxed text-slate-600
body-lg: text-lg leading-relaxed text-slate-600
body-base: text-base leading-relaxed text-slate-700
body-sm: text-sm leading-normal text-slate-600
body-xs: text-xs leading-normal text-slate-500
```

### Font Weight Rules
- **Bold (700):** H1, H2, H3, Primary CTAs
- **Semibold (600):** H4, H5, H6, Navigation, Secondary CTAs
- **Medium (500):** Card titles, Labels
- **Regular (400):** Body text, Descriptions

---

## 3. SPACING & LAYOUT SYSTEM

### Section Spacing
```css
/* Vertical Section Padding */
py-section-mobile: py-20 (5rem / 80px)
py-section-desktop: lg:py-24 (6rem / 96px)
py-hero-desktop: lg:py-32 (8rem / 128px)

/* Section Internal Gaps */
section-gap-mobile: mb-12 (3rem)
section-gap-desktop: lg:mb-16 (4rem)
```

### Container System
```css
/* Max Widths */
max-w-7xl: 80rem (1280px) - Default Container
max-w-6xl: 72rem (1152px) - Narrow Content
max-w-4xl: 56rem (896px) - Text Content
max-w-3xl: 48rem (768px) - Hero Subtitles, Intros
max-w-2xl: 42rem (672px) - Article Width

/* Horizontal Padding */
container-padding: px-6 (mobile) → px-8 (desktop)
```

### Grid System
```css
/* Service/Location Cards */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8

/* Testimonial Cards */
grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6

/* Feature Lists */
grid-cols-1 md:grid-cols-2 gap-4
```

---

## 4. COMPONENT DESIGN PATTERNS

### 4.1 Hero Component
**Required Structure:**
- Full-width background image (1920×1080px minimum)
- Gradient overlay: `bg-gradient-to-r from-slate-900/90 to-slate-900/60`
- H1: Left-aligned (default) or Center-aligned
- Subtitle: max-w-3xl, text-xl, text-white/90
- CTA Buttons: Primary (Green) + Secondary (Outline White)
- Minimum Height: `min-h-[600px]` desktop, `min-h-[500px]` mobile

**Variants:**
- `alignment="left"` - Hero text left-aligned (Homepage)
- `alignment="center"` - Hero text centered (Service/Location pages)

**Required Props:**
```typescript
title: string;
subtitle: string;
primaryCta: { label: string; href: string };
secondaryCta?: { label: string; href: string };
backgroundImage: ImageMetadata;
alignment?: 'left' | 'center';
```

### 4.2 Service Card
**Structure:**
- Aspect ratio 4:3 image top
- White background, rounded-xl, shadow-md
- Hover: shadow-xl + translate-y-1 (lift effect)
- Title: font-display text-2xl font-bold text-slate-900 (on hover: text-secondary-500)
- Description: text-slate-600 text-sm line-clamp-3
- CTA: "Learn More" text link, text-secondary-600 font-bold uppercase

**Required Classes:**
```html
<div class="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
  <div class="aspect-[4/3] overflow-hidden">
    <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
  </div>
  <div class="p-6">
    <h3 class="text-2xl font-bold text-slate-900 group-hover:text-secondary-500 transition-colors">
    <p class="text-slate-600 text-sm line-clamp-3">
    <a class="text-secondary-600 hover:text-secondary-700 font-bold uppercase">
  </div>
</div>
```

### 4.3 Location Card
**Structure:**
- Same as Service Card
- Badges: px-3 py-1 bg-primary-50 text-primary-700 text-xs rounded-full
- Link arrow: "View Services in {Town} →"

### 4.4 Button System
**Primary Button (Green CTA):**
```css
bg-secondary-500 hover:bg-secondary-600 text-white
px-8 py-4 rounded-full font-semibold text-base
shadow-lg hover:shadow-xl transition-all duration-300
```

**Secondary Button (Outline):**
```css
border-2 border-white text-white hover:bg-white hover:text-slate-900
px-8 py-4 rounded-full font-semibold text-base
transition-all duration-300
```

**Text Link:**
```css
text-secondary-600 hover:text-secondary-700 font-bold uppercase tracking-wider text-sm
```

### 4.5 Testimonial Card
**Structure:**
- White background, rounded-xl, p-8, shadow-sm
- 5-star rating (Gold stars)
- Quote: text-lg text-slate-700 italic
- Avatar: 48×48px circle, PNG format
- Name: font-semibold text-slate-900
- Location/Title: text-sm text-slate-500

---

## 5. HEADER & NAVIGATION

### 5.1 Header Component
**Variants:**
- **Transparent:** Used on Homepage/Hero pages - `bg-transparent text-white`
- **Solid:** Used on content pages - `bg-white/90 backdrop-blur-md text-slate-900`

**Behavior:**
- Fixed top, z-50
- On scroll (>20px): Transparent → Solid (if initial variant was transparent)
- Height: h-20 (80px)

**Navigation Items:**
- Font: text-sm font-medium
- Spacing: px-4 py-2 rounded-full
- Hover: bg-white/10 (transparent) or bg-slate-50 (solid)
- Active: bg-white/20 + font-semibold (transparent) or bg-primary-50 text-primary-700 (solid)

**Services Dropdown:**
- Trigger: Hover
- Width: w-64
- Style: White background, rounded-xl, shadow-xl
- Items: Primary services only
- Footer link: "View All Services" (primary-600, centered)

**Mobile Menu:**
- Full-screen overlay: h-[100dvh] bg-white z-[100]
- Close button: Top-right, z-[110]
- Navigation: Vertical stack, text-lg
- CTA: Bottom-fixed green button

### 5.2 Footer Component
**Structure:**
- Dark background: bg-slate-900 text-white
- 4-column grid (desktop) → stack (mobile)
- Columns: About, Services, Locations, Contact
- Social icons: Facebook, Instagram (white, hover:primary-400)
- Copyright: text-slate-400 text-sm, centered
- Badges: "Licensed & Insured", "BBB Accredited"

---

## 6. IMAGE SYSTEM

### 6.1 Image Optimization Rules
- **Format:** WebP (80% quality)
- **Hero Images:** 1920×1080px (16:9)
- **Service Hero:** 1200px width (auto height)
- **Card Thumbnails:** 800×600px (4:3)
- **Avatars:** 100×100px PNG

### 6.2 File Naming Convention
```
Service Hero: /src/assets/images/services/{slug}/hero-manual.webp
Location Hero: /src/assets/images/locations/{slug}/hero.webp
General Assets: /src/assets/images/general/{name}.{ext}
Avatars: /src/assets/images/avatars/avatar-{n}.png
```

### 6.3 Alt Text Rules
**Service Images:**
```
"{Service Title} services by Blue Lawns in Cape May County"
Example: "Hardscaping services by Blue Lawns in Cape May County"
```

**Location Images:**
```
"Landscaping services in {Town Name}, NJ"
Example: "Landscaping services in Avalon, NJ"
```

**Location-Service Images:**
```
"{Service Title} in {Town Name}, NJ | Blue Lawns"
Example: "Hardscaping in Avalon, NJ | Blue Lawns"
```

### 6.4 Image Loading Rules
- **Above Fold:** `loading="eager"` (Hero images)
- **Below Fold:** `loading="lazy"` (All cards, galleries)
- **Always:** `decoding="async"`
- **Aspect Ratio:** Explicitly set width/height to prevent CLS

### 6.5 Prohibited Images
- ❌ **NO LOGOS as hero images**
- ❌ **NO icon files as service heroes**
- ❌ **NO duplicate images across different services**
- ❌ **NO stock photos with wrong climate** (no cacti, palm trees, desert)

---

## 7. SEO & METADATA SYSTEM

### 7.1 Meta Tags (Required on Every Page)
```html
<title>{Page Title} | Blue Lawns</title>
<meta name="description" content="{120-160 characters}">
<meta property="og:title" content="{Page Title} | Blue Lawns">
<meta property="og:description" content="{Same as meta description}">
<meta property="og:image" content="{Hero Image URL}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

### 7.2 Title Templates by Page Type
**Homepage:**
```
Blue Lawns | Premier Landscaping in Cape May County
```

**Service Page:**
```
{Service Title} Services | Blue Lawns
Example: Hardscaping Services | Blue Lawns
```

**Location Page:**
```
Landscaping in {Town}, NJ | Blue Lawns
Example: Landscaping in Avalon, NJ | Blue Lawns
```

**Location-Service Page:**
```
{Service Title} in {Town}, NJ | Blue Lawns
Example: Hardscaping in Avalon, NJ | Blue Lawns
```

### 7.3 Meta Description Templates
**Homepage:**
```
Professional landscaping, lawn care, and hardscaping services for Avalon, Stone Harbor, Sea Isle City, and surrounding Cape May County areas.
```

**Service Page:**
```
Expert {service name} services in Cape May County. {Benefit statement}. Licensed, insured, and satisfaction guaranteed.
```

**Location Page:**
```
Professional lawn care and landscaping services in {Town}, NJ. Serving {Town} homeowners since 2010. Get a free quote today.
```

**Location-Service Page:**
```
Looking for {service name} in {Town}, NJ? Blue Lawns provides expert {service} services for {Town} homeowners. Free estimates available.
```

---

## 8. STRUCTURED DATA (JSON-LD) REQUIREMENTS

### 8.1 Required on ALL Pages
**BreadcrumbList Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.bluelawns.com/"
    }
  ]
}
```

### 8.2 Homepage Required Schemas
- LocalBusiness
- Organization
- BreadcrumbList

### 8.3 Service Page Required Schemas
- Service
- BreadcrumbList
- FAQPage (if FAQs present)

### 8.4 Location Page Required Schemas
- LocalBusiness (with location-specific address)
- AreaServed
- BreadcrumbList

### 8.5 Location-Service Page Required Schemas
- Service (with AreaServed property)
- LocalBusiness
- BreadcrumbList
- FAQPage

---

## 9. RESPONSIVE BREAKPOINTS

```css
/* Mobile First Approach */
Default: 320px - 767px (Mobile)
md: 768px+ (Tablet)
lg: 1024px+ (Desktop)
xl: 1280px+ (Large Desktop)
2xl: 1536px+ (Extra Large)

/* Common Patterns */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
text-2xl lg:text-4xl
py-12 lg:py-24
px-4 lg:px-8
```

---

## 10. ACCESSIBILITY (WCAG 2.1 AA)

### Required Standards
- **Color Contrast:** Minimum 4.5:1 for body text, 3:1 for large text
- **Focus States:** Visible focus ring on all interactive elements
- **Alt Text:** Required on all images (see Section 6.3)
- **ARIA Labels:** Required on icon-only buttons
- **Keyboard Navigation:** Tab order must be logical
- **Screen Reader:** All content must be accessible

### Focus Visible Classes
```css
focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
```

---

## 11. ANIMATION & TRANSITIONS

### Standard Timing
```css
/* Default Transition */
transition-all duration-300

/* Hover Effects */
hover:scale-105 transition-transform duration-500

/* Page Load */
fade-in: opacity-0 → opacity-100 (400ms)
slide-up: translate-y-4 → translate-y-0 (600ms)
```

### Animation Classes
```css
.fade-in { animation: fadeIn 400ms ease-out; }
.slide-up { animation: slideUp 600ms ease-out; }
.hover-lift { transition: transform 300ms; }
.hover-lift:hover { transform: translateY(-4px); }
```

---

## 12. PERFORMANCE TARGETS (Lighthouse)

### Required Scores
- **Performance:** 90+ (Mobile), 95+ (Desktop)
- **Accessibility:** 100
- **Best Practices:** 100
- **SEO:** 100

### Critical Metrics
- **FCP (First Contentful Paint):** < 1.8s
- **LCP (Largest Contentful Paint):** < 2.5s
- **CLS (Cumulative Layout Shift):** < 0.1
- **TBT (Total Blocking Time):** < 200ms

### Optimization Rules
- ✅ Lazy load all below-fold images
- ✅ Preload critical fonts
- ✅ Inline critical CSS
- ✅ Defer non-critical JavaScript
- ✅ Compress all images (WebP)
- ✅ Enable Brotli/Gzip compression
- ✅ Use CDN for assets

---

## 13. INTERACTIVITY RULES

### Hover States (Desktop Only)
- **Cards:** Lift (-translate-y-1) + Shadow increase
- **Buttons:** Background darken + Shadow expand
- **Links:** Color change + Underline
- **Images:** Scale (1.05) on parent hover

### Click/Tap States (All Devices)
- **Buttons:** Scale down (0.98) on active
- **Links:** Brief opacity change (0.8)
- **Forms:** Focus ring + border color change

### Loading States
- **Buttons:** Spinner icon, disabled state, "Loading..." text
- **Forms:** Overlay with spinner, prevent double-submit
- **Page Transitions:** Skeleton screens (optional)

---

## 14. FORM DESIGN RULES

### Input Fields
```css
/* Base Style */
border border-slate-300 rounded-lg px-4 py-3 text-base
focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20

/* Error State */
border-red-500 focus:border-red-500 focus:ring-red-500/20

/* Success State */
border-secondary-500 focus:border-secondary-500
```

### Labels
```css
text-sm font-medium text-slate-700 mb-2
```

### Error Messages
```css
text-sm text-red-600 mt-1
```

### Submit Buttons
- Use Primary Button (Green)
- Full-width on mobile
- Include loading spinner state

---

## 15. ENFORCEMENT CHECKLIST

Before deploying ANY page, verify:

- [ ] All headings use `font-display` (Outfit)
- [ ] All body text uses default font (DM Sans)
- [ ] Section spacing uses `py-section-mobile lg:py-section-desktop`
- [ ] Container uses `max-w-7xl mx-auto px-container-padding`
- [ ] Images use WebP format
- [ ] Images have proper alt text
- [ ] No logos used as hero images
- [ ] Meta title follows template
- [ ] Meta description is 120-160 characters
- [ ] Breadcrumb schema is present
- [ ] All interactive elements have hover states
- [ ] All links have focus states
- [ ] Color contrast passes WCAG AA
- [ ] Mobile navigation works
- [ ] All images are lazy-loaded (except hero)
- [ ] Lighthouse scores meet targets

---

## 16. NAVIGATION COLOR SAFETY RULE

### 16.1 Header Mode System

The Header component now supports a `headerMode` prop to ensure navigation text is always visible against any hero background.

**Available Modes:**
- `headerMode="light"` — White text (`text-white`) — Use on dark hero images
- `headerMode="dark"` — Navy text (`text-brand-navy`) — Use on bright hero images

### 16.2 Implementation Rules

**Every page with a bright hero MUST set `headerMode="dark"`:**

```astro
<Layout 
  headerVariant="transparent"
  headerMode="dark"
>
```

**Pages with dark heroes use `headerMode="light"` (default):**

```astro
<Layout 
  headerVariant="transparent"
  headerMode="light"
>
```

### 16.3 Header.astro Behavior

The Header component applies these styles based on `headerMode`:

**Light Mode (default):**
- Transparent state: `text-white`
- Scrolled state: `text-brand-navy`

**Dark Mode:**
- Transparent state: `text-brand-navy`
- Scrolled state: `text-brand-navy`

### 16.4 Enforcement

**Cursor/Sonnet may NOT:**
- Modify nav color logic without explicit instruction
- Change headerMode values arbitrarily
- Remove the headerMode prop system

**When adding new pages:**
1. Examine the hero image brightness
2. Set `headerMode="dark"` if hero is bright/light
3. Set `headerMode="light"` if hero is dark
4. Test navigation visibility in browser

---

## 17. SERVICE IMAGE ISOLATION RULE

### 17.1 Image Field Hierarchy

Services in `services.json` may have multiple image fields:

**Homepage (ServicesGrid):**
- Prefers: `cardImage` (optimized thumbnail for grid display)
- Fallback: `heroImage` (if cardImage not available)
- Final fallback: Gradient background

**Service Pages (Hero Section):**
- Uses: `heroImage` ONLY (full-size hero)
- Must NOT use: `cardImage` for hero sections

### 17.2 ServicesGrid.astro Logic

The component already implements safe image resolution:

```typescript
const imageSrc = service.image || service.heroImage;
```

This ensures:
1. Homepage uses `cardImage` if available
2. Falls back to `heroImage` gracefully
3. Shows gradient if no images exist

### 17.3 Strict Rules for Cursor/Sonnet

**Cursor MUST NEVER:**
- Rename image files
- Delete image files  
- Regenerate image files
- Change image paths in services.json without explicit user confirmation
- Swap heroImage and cardImage usage

**Before modifying any image references, Cursor MUST:**
1. Show the user the proposed changes
2. Explain which paths will be affected
3. Wait for explicit approval
4. Document the changes

**Safe Operations (allowed):**
- Reading image paths
- Checking if images exist
- Adding new image fields (with user approval)
- Updating alt text (only if explicitly requested)

### 17.4 Image Path Conventions

**Hero Images:**
```
src/assets/images/services/{slug}/hero-manual.webp
```

**Card Images (when added):**
```
src/assets/images/services/{slug}/card.webp
```

**Location Images:**
```
src/assets/images/locations/{slug}/hero.webp
```

---

**END OF DESIGN DIRECTIVE**

