# 📸 Image SEO Optimization Guide for Blue Lawns

## Overview

This guide provides a complete strategy for optimizing all 167 images on the Blue Lawns site for local SEO dominance in Cape May County, NJ.

---

## 🎯 Image Naming Strategy

### Pattern
```
blue-lawns-[location]-[service]-[section]-[number].webp
```

### Locations (Rotate through these 10 cities)
1. ocean-view
2. cape-may
3. avalon
4. stone-harbor
5. sea-isle-city
6. wildwood
7. wildwood-crest
8. north-wildwood
9. cape-may-court-house
10. rio-grande

### Services
- lawn-care
- lawn-maintenance
- landscaping
- landscape-design
- hardscape
- pool-service
- pool-maintenance
- commercial-landscaping
- seasonal-cleanup
- erosion-control

### Sections
- hero
- service
- gallery
- about
- team
- before-after
- testimonial
- contact

### Examples
```
blue-lawns-ocean-view-lawn-care-hero-1.webp
blue-lawns-avalon-landscaping-gallery-2.webp
blue-lawns-stone-harbor-pool-service-before-after-3.webp
blue-lawns-cape-may-commercial-landscaping-service-4.webp
```

---

## 📝 Alt Text Strategy (10-12 words each)

### Templates by Service Type

**Lawn Care:**
```
Professional lawn care and maintenance services by Blue Lawns in [City], Cape May County
Expert lawn mowing and turf maintenance for residential properties in [City], New Jersey
Weekly lawn care services for homes and businesses in [City], Cape May County
```

**Landscaping:**
```
Custom landscaping design and installation by expert team in [City], New Jersey
Professional landscape design services for coastal properties in [City], Cape May County
Hardscape installation and custom garden design by Blue Lawns in [City], NJ
```

**Pool Service:**
```
Pool maintenance and cleaning services for residential properties in [City], NJ
Professional pool care and chemical balancing services in [City], Cape May County
Weekly pool cleaning and equipment maintenance for homes in [City], New Jersey
```

**Commercial:**
```
Commercial property landscaping and grounds maintenance services in [City], Cape May County
Professional commercial lawn care for businesses and hotels in [City], New Jersey
Year-round commercial landscaping services for properties in [City], Cape May County
```

**Erosion Control:**
```
Coastal erosion control and native plantings for properties in [City], New Jersey
Dune stabilization and drainage solutions for coastal homes in [City], Cape May
Professional erosion control services for beach properties in [City], New Jersey
```

---

## 🖼️ Image Optimization Checklist

### For Each Image:

1. **Rename the file** using the pattern above
2. **Compress to WebP format** (80% quality)
3. **Generate responsive sizes:**
   - Thumbnail: 400px wide
   - Medium: 800px wide
   - Large: 1200px wide
   - Original: 1920px wide
4. **Add descriptive alt text** (10-12 words)
5. **Update all references** in .astro files

---

## 🛠️ Tools & Methods

### Option 1: Online Tools
1. **Squoosh.app** - Free WebP conversion
2. **TinyPNG.com** - Batch compression
3. **Bulk Rename Utility** - Windows renaming tool
4. **Rename** command - Mac/Linux terminal

### Option 2: Automated Script
Run the provided script (requires Sharp):
```bash
bun run scripts/optimize-images-seo.mjs
```

### Option 3: Manual Process

#### Step 1: List All Images
```bash
cd sites/blue-lawns/public/media
ls -1 > ../../output/blue-lawns/current-images.txt
```

#### Step 2: Create Renaming Map
Open `current-images.txt` and create a CSV:
```csv
Old Name,New Name,Alt Text,Service Type,Location
hero-1.jpg,blue-lawns-ocean-view-lawn-care-hero-1.webp,"Professional lawn care...",lawn-care,ocean-view
```

#### Step 3: Batch Rename (Mac/Linux)
```bash
# Using a CSV, create rename commands
while IFS=',' read -r old new alt service loc; do
  mv "$old" "$new"
done < rename-map.csv
```

---

## 📊 Priority Images to Rename First

### Critical Pages (Do These First):

1. **Homepage Hero Images** (5-10 images)
   - Pattern: `blue-lawns-[city]-landscaping-hero-[n].webp`
   - Alt: Focus on "Cape May County lawn care and landscaping services"

2. **Services Page** (20-30 images)
   - Pattern: `blue-lawns-[city]-[service]-service-[n].webp`
   - Alt: Service-specific with location

3. **Pool Page** (10-15 images)
   - Pattern: `blue-lawns-[city]-pool-service-[section]-[n].webp`
   - Alt: Pool maintenance with location

4. **Gallery/Portfolio** (30-50 images)
   - Pattern: `blue-lawns-[city]-[service]-gallery-[n].webp`
   - Alt: Before/after descriptions with location

5. **About/Team** (10-15 images)
   - Pattern: `blue-lawns-cape-may-county-team-[n].webp`
   - Alt: Team and company descriptions

---

## 🔄 Update References in Code

### Search & Replace in .astro Files

#### Find:
```astro
<img src="/media/old-image-name.jpg" alt="generic alt text" />
```

#### Replace with:
```astro
<img 
  src="/media/optimized/blue-lawns-ocean-view-lawn-care-hero-1.webp" 
  srcset="
    /media/optimized/blue-lawns-ocean-view-lawn-care-hero-1-thumb.webp 400w,
    /media/optimized/blue-lawns-ocean-view-lawn-care-hero-1-md.webp 800w,
    /media/optimized/blue-lawns-ocean-view-lawn-care-hero-1-lg.webp 1200w,
    /media/optimized/blue-lawns-ocean-view-lawn-care-hero-1.webp 1920w
  "
  sizes="(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Professional lawn care and maintenance services by Blue Lawns in Ocean View, Cape May County"
  loading="lazy"
/>
```

### Bulk Find & Replace
```bash
# Find all image references
grep -r 'src="/media/' sites/blue-lawns/src/pages/

# Update with new names
sed -i 's|/media/old-name.jpg|/media/optimized/blue-lawns-ocean-view-lawn-care-hero-1.webp|g' sites/blue-lawns/src/pages/*.astro
```

---

## 📈 Expected SEO Impact

### Before Optimization:
- Generic filenames: `IMG_1234.jpg`, `hero-image.png`
- Missing alt text or generic descriptions
- Large file sizes (100-500 KB per image)
- No responsive sizing
- No location keywords

### After Optimization:
- ✅ Location-rich filenames (10 cities × 167 images)
- ✅ Descriptive alt text with city names
- ✅ 60-80% smaller file sizes
- ✅ Responsive WebP images
- ✅ Faster page load times

### Local SEO Benefits:
1. **Image Search Rankings** - Appear in Google Images for "[service] [city]"
2. **Page Speed** - Faster load times improve Google rankings
3. **Accessibility** - Better alt text improves user experience
4. **Mobile Performance** - Responsive images load faster on phones
5. **Keyword Density** - Location keywords in every image filename

---

## 🚀 Implementation Timeline

### Phase 1: Critical Pages (2-3 hours)
- [ ] Homepage hero images (5-10)
- [ ] Services page main images (10-15)
- [ ] Pool page images (10-15)
- **Expected Impact:** 40% of SEO value

### Phase 2: Content Pages (3-4 hours)
- [ ] Gallery/portfolio images (30-50)
- [ ] About/team images (10-15)
- [ ] Contact page images (5-10)
- **Expected Impact:** 30% of SEO value

### Phase 3: Supporting Content (2-3 hours)
- [ ] FAQ page images (5-10)
- [ ] Membership page images (5-10)
- [ ] Knowledge base images (20-30)
- **Expected Impact:** 20% of SEO value

### Phase 4: Cleanup & Verification (1-2 hours)
- [ ] Remove old images
- [ ] Test all pages
- [ ] Run Lighthouse audit
- [ ] Verify image search indexing
- **Expected Impact:** 10% of SEO value

**Total Time: 8-12 hours**

---

## ✅ Quality Checklist

Before deploying:

- [ ] All images renamed with location keywords
- [ ] All images compressed to WebP (80% quality)
- [ ] All images have responsive sizes (thumb, md, lg, original)
- [ ] All images have descriptive alt text (10-12 words)
- [ ] All .astro files updated with new image references
- [ ] All old images backed up
- [ ] Lighthouse Performance score ≥ 95
- [ ] Lighthouse SEO score ≥ 90
- [ ] All pages load in < 2 seconds
- [ ] Images appear in Google Image search

---

## 📋 Sample Renaming Map (First 20 Images)

```csv
Old Name,New Name,Alt Text,Service,Location
hero-1.jpg,blue-lawns-ocean-view-lawn-care-hero-1.webp,"Professional lawn care and maintenance services by Blue Lawns in Ocean View, Cape May County",lawn-care,ocean-view
hero-2.jpg,blue-lawns-cape-may-landscaping-hero-2.webp,"Custom landscaping design and installation by expert team in Cape May, New Jersey",landscaping,cape-may
service-lawn.jpg,blue-lawns-avalon-lawn-maintenance-service-3.webp,"Weekly lawn care services for homes and businesses in Avalon, Cape May County",lawn-care,avalon
service-landscape.jpg,blue-lawns-stone-harbor-landscape-design-service-4.webp,"Hardscape installation and custom garden design by Blue Lawns in Stone Harbor, NJ",landscaping,stone-harbor
pool-hero.jpg,blue-lawns-sea-isle-city-pool-service-hero-5.webp,"Pool maintenance and cleaning services for residential properties in Sea Isle City, NJ",pool-service,sea-isle-city
...
```

---

## 🎯 Next Steps

1. **Immediate:** Rename and optimize homepage hero images (highest traffic)
2. **Week 1:** Complete critical pages (homepage, services, pool)
3. **Week 2:** Complete content pages (gallery, about, contact)
4. **Week 3:** Complete supporting pages (FAQ, membership, blog)
5. **Week 4:** Monitor Google Search Console for image indexing

---

## 📞 Questions?

Contact: info@bluelawns.com | 609-425-2954

---

**Generated:** November 2025  
**Version:** 1.0  
**Status:** Ready for Implementation

