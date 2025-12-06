# Phase 3 Corrective Seeding Plan
## Blue Lawns Services & Locations Update

**Date:** 2025-12-03  
**Status:** AWAITING APPROVAL - DO NOT EXECUTE

---

## 📦 SERVICES ANALYSIS

### Current Services in Sanity (6):
1. ✅ **Lawn Care & Maintenance** → Keep & Rename to "Lawn Care"
2. ✅ **Landscaping & Garden Design** → Keep & Rename to "Landscape"
3. ❌ **Pool Maintenance & Cleaning** → Keep & Rename to "Pool Service"
4. ➕ **Hardscaping** → CREATE NEW
5. ➕ **Power Washing** → CREATE NEW
6. ❓ **Commercial Services** → REMOVE? (not in new list)
7. ❓ **Fencing** → REMOVE? (not in new list)
8. ❓ **Seasonal Cleanup** → REMOVE? (not in new list)

### Service Actions Required:

**UPDATE (3 services):**
- `b59cd306-9339-47a7-b134-48f2f627981b` - "Lawn Care & Maintenance" → Rename to "Lawn Care"
- `54677dcf-5b7a-4987-8d25-5a0dec48adb4` - "Landscaping & Garden Design" → Rename to "Landscape"
- `b8cca2db-3b0b-4ffb-bc0e-2a916fae2f2a` - "Pool Maintenance & Cleaning" → Rename to "Pool Service"

**CREATE (2 services):**
- Hardscaping (slug: `hardscaping`)
- Power Washing (slug: `power-washing`)

**KEEP (3 services) - APPROVED:**
- Commercial Services (`b4173304-e510-46e2-994c-c3c3fb303a10`) - KEEP
- Fencing (`5dc49767-1720-418d-89a1-1a7a3a19c88b`) - KEEP
- Seasonal Cleanup (`cbe2627e-6a9b-4817-9765-febecd0c69eb`) - KEEP

**PRIMARY SERVICES (4):**
- Lawn Care (after rename)
- Landscape (after rename)
- Pool Service (after rename)
- Power Washing (new)

---

## 📍 LOCATIONS ANALYSIS

### Current Locations in Sanity (11):
1. ✅ Avalon (08202) - EXISTS
2. ✅ Cape May (08204) - EXISTS
3. ✅ Cape May Court House (08210) - EXISTS
4. ✅ Ocean City (08226) - EXISTS
5. ✅ Ocean View (08230) - EXISTS
6. ✅ Rio Grande (08242) - EXISTS
7. ✅ Sea Isle City (08243) - EXISTS (needs city name fix: "Isle City" → "Sea Isle City")
8. ✅ Stone Harbor (08247) - EXISTS
9. ✅ Wildwood (08260) - EXISTS
10. ✅ North Wildwood (08260) - EXISTS (same zip as Wildwood)
11. ✅ Wildwood Crest - EXISTS (likely 08260)

### Missing Locations (11):
1. ➕ Cape May Point (08212)
2. ➕ Dennisville (08214)
3. ➕ Erma (08218)
4. ➕ Goshen (08219)
5. ➕ Marmora (08223)
6. ➕ South Dennis (08245)
7. ➕ South Seaville (08246)
8. ➕ Strathmere (08248)
9. ➕ Tuckahoe (08250)
10. ➕ Villas (08251)
11. ➕ Whitesboro (08252)
12. ➕ Woodbine (08270)

### Location Actions Required:

**UPDATE (1 location):**
- `234d96b8-9bba-465f-97b3-dd36df8312a2` - Sea Isle City: Fix `geo.city` from "Isle City" to "Sea Isle City"

**CREATE (11 locations):**
- Cape May Point (08212)
- Dennisville (08214)
- Erma (08218)
- Goshen (08219)
- Marmora (08223)
- South Dennis (08245)
- South Seaville (08246)
- Strathmere (08248)
- Tuckahoe (08250)
- Villas (08251)
- Whitesboro (08252)
- Woodbine (08270)

**UPDATE COUNTY (all locations):**
- Ensure all locations have `geo.county: "Cape May County"`

---

## 🎯 EXECUTION PLAN

### Step 1: Service Updates
1. Update "Lawn Care & Maintenance" → "Lawn Care"
2. Update "Landscaping & Garden Design" → "Landscape"
3. Update "Pool Maintenance & Cleaning" → "Pool Service"

### Step 2: Service Creation
1. Create "Hardscaping" service
2. Create "Power Washing" service

### Step 3: Service Primary Flags
1. Set `isPrimaryService: true` for: Lawn Care, Landscape, Pool Service, Power Washing
2. Set `isPrimaryService: false` for: Commercial Services, Fencing, Seasonal Cleanup, Hardscaping

### Step 4: Location Updates
1. Fix Sea Isle City city name

### Step 5: Location Creation
1. Create 11 missing Cape May County locations

### Step 6: Location County Updates
1. Ensure all locations have `geo.county: "Cape May County"`

---

## ✅ APPROVED ACTIONS

1. **Services to Keep:** KEEP "Commercial Services", "Fencing", and "Seasonal Cleanup" as additional services

2. **Primary Services:** Mark as `isPrimaryService: true`:
   - Lawn Care
   - Landscape
   - Pool Service
   - Power Washing

3. **Wildwood Locations:** KEEP all three: Wildwood, North Wildwood, and Wildwood Crest

---

## 📝 NOTES

- All operations will preserve existing content (only update titles/names)
- New documents will be created as drafts, then published
- Location geo data will include: city, state, zip, county, region
- Service slugs will be auto-generated from titles

---

**STATUS: AWAITING YOUR APPROVAL BEFORE EXECUTION**

