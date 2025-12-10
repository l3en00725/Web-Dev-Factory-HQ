# VIRGO OCB Implementation Plan

**Status:** Analysis Complete | **Date:** 2025-01-XX

## Executive Summary

The current codebase has a **Central Dashboard Service** architecture that differs from the **VIRGO OCB Master Directive**. This plan outlines what needs to be built/aligned to match the OCB specification.

---

## 🎯 ARCHITECTURE GAP ANALYSIS

### Current State vs Required State

| Component | Current State | Required State | Status |
|-----------|--------------|----------------|--------|
| **Database Schema** | `sites`, `analytics_connections`, `dashboard_settings` | `companies`, `website_leads`, `website_settings`, `website_oauth_tokens` | ❌ **MISMATCH** |
| **Monorepo Structure** | Partial (`packages/utils/`, `dashboard-api/`) | `/packages/shared/`, `/apps/api/` | ⚠️ **PARTIAL** |
| **OAuth Implementation** | Exists but incomplete (no refresh) | Full flow with refresh | ⚠️ **INCOMPLETE** |
| **OCB Modules** | Exists in blue-lawns | All 6 modules required | ✅ **EXISTS** |
| **Tracking Component** | Exists but may need updates | Required with UTM capture | ✅ **EXISTS** |
| **Shared Packages** | Only `keywords-everywhere.ts` | OAuth, Supabase, Utils | ❌ **MISSING** |

---

## 📋 IMPLEMENTATION PLAN

### PHASE 1: Database Schema Migration ⚠️ CRITICAL

**Problem:** Current schema uses `sites`/`analytics_connections` but OCB requires `companies`/`website_oauth_tokens`.

**Decision Required:**
- **Option A:** Migrate existing schema to OCB schema (breaking change)
- **Option B:** Create OCB schema alongside existing (dual support)
- **Option C:** Align OCB directive to match existing schema

**Recommended:** Option B (dual support) to avoid breaking existing sites.

**Tasks:**
1. [ ] Create migration script to add OCB tables:
   - `companies` table
   - `website_leads` table (if not exists)
   - `website_settings` table (if not exists)
   - `website_oauth_tokens` table
2. [ ] Add foreign key relationships
3. [ ] Create data sync script: `sites` → `companies`
4. [ ] Test migration on staging database
5. [ ] Document schema differences

**Files to Create:**
- `dashboard-api/db/migrations/001_ocb_schema.sql`
- `scripts/migrate-to-ocb-schema.mjs`

---

### PHASE 2: Monorepo Structure Alignment

**Current:** 
```
/packages/utils/keywords-everywhere.ts
/dashboard-api/
```

**Required:**
```
/packages/shared/
  ├── oauth/
  │   ├── google.ts
  │   ├── providers.ts
  │   └── types.ts
  ├── supabase/
  │   ├── client.ts
  │   └── types.ts
  └── utils/
      └── tracking.ts
/apps/api/
  └── routes/
      └── oauth/
          ├── google-connect.ts
          ├── google-callback.ts
          ├── google-refresh.ts
          └── google-disconnect.ts
```

**Tasks:**
1. [ ] Create `/packages/shared/oauth/` directory structure
2. [ ] Move OAuth logic from `dashboard-api/lib/oauth/google.ts` to shared package
3. [ ] Create `/packages/shared/supabase/` with shared client
4. [ ] Create `/packages/shared/utils/tracking.ts` for UTM helpers
5. [ ] Create `/apps/api/` structure (or decide if `dashboard-api` is the API)
6. [ ] Update all imports across codebase

**Files to Create:**
- `packages/shared/oauth/google.ts` (refactor from dashboard-api)
- `packages/shared/oauth/providers.ts`
- `packages/shared/oauth/types.ts`
- `packages/shared/supabase/client.ts`
- `packages/shared/supabase/types.ts`
- `packages/shared/utils/tracking.ts`

---

### PHASE 3: OAuth Implementation Completion

**Current:** OAuth exists but `refreshAccessToken()` is not implemented.

**Tasks:**
1. [ ] Implement `refreshAccessToken(refreshToken: string)` function
2. [ ] Implement `getValidAccessToken(companyId: string)` helper
3. [ ] Add token expiry checking before API calls
4. [ ] Implement `revokeToken()` for disconnect
5. [ ] Add automatic token refresh middleware
6. [ ] Test full OAuth flow: connect → callback → refresh → disconnect

**Files to Update:**
- `packages/shared/oauth/google.ts` (complete implementation)
- `dashboard-api/lib/oauth/google.ts` (if keeping both)

---

### PHASE 4: OCB Module Verification & Completion

**Current:** Blue Lawns has admin pages, but need to verify all 6 modules match spec.

**Required Modules:**
1. ✅ Authentication (`/admin/login`)
2. ✅ Admin Layout (`AdminLayout.astro`, `AdminNav.astro`)
3. ✅ Leads Viewer (`/admin/leads`)
4. ✅ Settings (`/admin/settings`)
5. ✅ Email Template Editor (`/admin/email-template`)
6. ⚠️ Analytics (`/admin/analytics` - may need OAuth integration)

**Tasks:**
1. [ ] Audit each module against OCB spec
2. [ ] Verify Leads Viewer has:
   - Pagination ✅
   - CSV export ✅
   - Source detection ⚠️ (check implementation)
   - "Mark as Reviewed" toggle ✅
3. [ ] Verify Settings has:
   - Business Information section ✅
   - Contact Information section ✅
   - Tracking & Pixels section ✅
   - Google Integration section ⚠️ (OAuth buttons)
4. [ ] Verify Email Template Editor has:
   - Subject line input ✅
   - HTML body textarea ✅
   - Live preview ⚠️ (check)
   - Send test email ✅
5. [ ] Complete Analytics module with OAuth integration
6. [ ] Test all modules end-to-end

**Files to Review/Update:**
- `sites/blue-lawns/src/pages/admin/*.astro`
- `sites/blue-lawns/src/admin-components/*.astro`

---

### PHASE 5: Tracking Component Enhancement

**Current:** `Tracking.astro` exists but may need UTM capture.

**Required:**
- UTM parameter capture on page load
- localStorage storage (30-day expiry)
- Form submission with tracking data
- Conversion event firing

**Tasks:**
1. [ ] Review `Tracking.astro` component
2. [ ] Add UTM capture JavaScript to `Tracking.astro`
3. [ ] Create `packages/shared/utils/tracking.ts` with:
   - `captureUTMParams()` function
   - `storeTrackingData()` function
   - `getTrackingData()` function
4. [ ] Update all contact forms to submit tracking data
5. [ ] Add conversion event firing (Google Ads, Meta Pixel)
6. [ ] Test UTM flow: URL → localStorage → form → database

**Files to Update:**
- `sites/blue-lawns/src/components/Tracking.astro`
- `sites/blue-lawns/src/components/form/ContactForm.astro`
- Create: `packages/shared/utils/tracking.ts`

---

### PHASE 6: Google Cloud Setup & Environment Variables

**Tasks:**
1. [ ] Document Google Cloud Console setup process
2. [ ] Create OAuth consent screen (if not exists)
3. [ ] Verify API enablement:
   - Google Analytics Data API
   - Google Search Console API
4. [ ] Create/update `.env.example` with all OAuth variables
5. [ ] Document redirect URI requirements
6. [ ] Test OAuth flow in development

**Files to Create/Update:**
- `docs/GOOGLE-OAUTH-SETUP.md`
- Root `.env.example`

---

### PHASE 7: New Site Setup Automation

**Current:** Manual setup process.

**Required:** Automated checklist/tooling.

**Tasks:**
1. [ ] Create `scripts/setup-ocb-site.mjs` script
2. [ ] Script should:
   - Create company record in `companies` table
   - Create initial `website_settings` record
   - Generate `company_id`
   - Create admin user in Supabase Auth
   - Copy OCB template files
3. [ ] Update `scripts/create-site.mjs` to include OCB setup
4. [ ] Create setup verification script
5. [ ] Document new site setup process

**Files to Create:**
- `scripts/setup-ocb-site.mjs`
- `docs/NEW-SITE-OCB-SETUP.md`

---

### PHASE 8: Pre-Launch Checklist Implementation

**Current:** Checklist exists in OCB directive but not automated.

**Tasks:**
1. [ ] Create `scripts/pre-launch-audit.mjs` script
2. [ ] Script should check:
   - Performance metrics (PageSpeed)
   - SEO requirements
   - Tracking setup
   - Form functionality
   - OAuth connections
3. [ ] Generate audit report
4. [ ] Integrate into deployment workflow

**Files to Create:**
- `scripts/pre-launch-audit.mjs`

---

## 🔴 CRITICAL DECISIONS NEEDED

### 1. Database Schema Strategy
**Question:** Should we migrate to OCB schema or support both?
**Impact:** High - affects all future sites
**Recommendation:** Support both schemas initially, migrate gradually

### 2. Monorepo Structure
**Question:** Is `dashboard-api` the `/apps/api/` or separate?
**Impact:** Medium - affects package imports
**Recommendation:** Use `dashboard-api` as the API, create shared packages

### 3. OAuth Token Storage
**Question:** Use `website_oauth_tokens` (OCB) or `analytics_connections` (current)?
**Impact:** High - affects OAuth flow
**Recommendation:** Support both, sync data

---

## 📊 PRIORITY MATRIX

| Phase | Priority | Effort | Dependencies | Status |
|-------|----------|--------|--------------|--------|
| Phase 1: Schema | 🔴 CRITICAL | High | None | ⏳ Pending |
| Phase 2: Monorepo | 🟡 HIGH | Medium | Phase 1 | ⏳ Pending |
| Phase 3: OAuth | 🔴 CRITICAL | Medium | Phase 1, 2 | ⏳ Pending |
| Phase 4: OCB Modules | 🟡 HIGH | Low | Phase 3 | ✅ Partial |
| Phase 5: Tracking | 🟡 HIGH | Low | None | ✅ Partial |
| Phase 6: Google Setup | 🟢 MEDIUM | Low | Phase 3 | ⏳ Pending |
| Phase 7: Automation | 🟢 MEDIUM | Medium | Phase 1-4 | ⏳ Pending |
| Phase 8: Pre-Launch | 🟢 LOW | Medium | All | ⏳ Pending |

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Decision Meeting:** Review schema strategy (Option A/B/C)
2. **Phase 1 Start:** Create OCB schema migration
3. **Phase 3 Start:** Complete OAuth refresh implementation
4. **Phase 4 Audit:** Verify all OCB modules match spec

---

## 📝 NOTES

- Blue Lawns is the reference implementation
- All new sites should follow OCB directive exactly
- Existing sites may need gradual migration
- Consider backward compatibility during transition

---

**Last Updated:** 2025-01-XX
**Next Review:** After Phase 1 completion

