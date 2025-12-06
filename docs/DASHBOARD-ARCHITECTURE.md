# Central Dashboard Service Architecture

## Overview

The Central Dashboard Service is a **multi-tenant, Supabase-based analytics and insights platform** that provides unified dashboard functionality for all Web-Dev-Factory HQ sites. Unlike traditional per-site dashboards, this service is centralized and shared across all client sites.

## Key Principles

1. **Centralized, Not Per-Site**: The dashboard service lives in `/dashboard-api`, not inside each client site
2. **Multi-Tenant**: All sites share the same infrastructure with data isolation via Row Level Security (RLS)
3. **OAuth-Based**: Uses Google OAuth 2.0 for GA4 and Search Console connections
4. **Token Security**: OAuth tokens stored encrypted in Supabase (Vault or pgcrypto)
5. **Caching Layer**: Reduces API calls by caching analytics data in `analytics_cache` table
6. **AI-Powered**: Generates insights using Keyword Research Agent and SEO Agent data

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Central Dashboard Service                │
│                      (/dashboard-api)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Supabase   │  │  Google OAuth │  │   Keywords   │    │
│  │   Database   │  │     Flow      │  │  Everywhere  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                │                    │            │
│         └────────────────┼────────────────────┘            │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Endpoints                            │  │
│  │  /api/status                                          │  │
│  │  /api/analytics/ga4/*                                 │  │
│  │  /api/analytics/search-console/*                      │  │
│  │  /api/keyword-research/*                             │  │
│  │  /api/leads/*                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ (API calls)
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│  Site A      │  │  Site B      │  │  Site C      │
│  (blue-lawns)│  │  (client-2)  │  │  (client-3)  │
│              │  │              │  │              │
│  /dashboard  │  │  /dashboard  │  │  /dashboard  │
│  DASHBOARD_  │  │  DASHBOARD_  │  │  DASHBOARD_  │
│  UUID: abc   │  │  UUID: xyz   │  │  UUID: 123   │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Database Schema

### Core Tables

#### `sites`
Stores site information and generates unique dashboard UUIDs:
- `id`: Primary key (UUID)
- `site_name`: Directory name (e.g., "blue-lawns")
- `site_url`: Production URL
- `dashboard_uuid`: Unique identifier for dashboard API calls
- `site_owner_uid`: Supabase Auth user ID (for RLS)
- `sanity_project_id`: Sanity project ID
- `sanity_dataset`: Sanity dataset name

#### `analytics_connections`
Stores OAuth tokens for GA4, Search Console, and future integrations:
- `id`: Primary key
- `site_id`: Foreign key to `sites`
- `connection_type`: 'ga4', 'search_console', etc.
- `ga4_property_id`: GA4 property ID
- `ga4_measurement_id`: GA4 measurement ID
- `search_console_site_url`: Search Console verified site URL
- `refresh_token`: Encrypted refresh token (Supabase Vault)
- `access_token`: Short-lived access token
- `token_expires_at`: Token expiration timestamp
- `sync_status`: 'pending', 'syncing', 'success', 'error'

#### `dashboard_settings`
Per-site dashboard configuration:
- `site_id`: Foreign key to `sites`
- Feature toggles: `show_traffic_overview`, `show_keyword_opportunities`, etc.
- Display preferences: `default_date_range`, `refresh_interval_minutes`
- Alert thresholds: `traffic_drop_threshold_percent`, etc.

#### `analytics_cache`
Cached analytics snapshots to reduce API calls:
- `site_id`: Foreign key to `sites`
- `connection_id`: Foreign key to `analytics_connections`
- `cache_type`: 'ga4_traffic', 'search_console_queries', etc.
- `data`: JSONB cached data
- `expires_at`: Cache expiration timestamp

#### `ai_insights`
AI-generated insights per site:
- `site_id`: Foreign key to `sites`
- `insight_type`: 'traffic_analysis', 'keyword_opportunity', 'seo_recommendation', etc.
- `title`: Insight title
- `summary`: Insight summary
- `priority`: 'low', 'medium', 'high', 'critical'
- `status`: 'new', 'reviewed', 'dismissed', 'implemented'
- `generated_by`: Which agent generated this (e.g., 'keyword_research_agent')

## OAuth Flow

### Google Analytics 4 / Search Console Connection

1. **User Action**: User clicks "Connect Google Analytics" in dashboard UI
2. **Authorization Request**: Site redirects to `/dashboard-api/api/oauth/google?siteId=<uuid>&type=ga4`
3. **OAuth Redirect**: Dashboard service redirects to Google OAuth consent screen
4. **User Consent**: User authorizes access in Google
5. **Callback**: Google redirects to `/dashboard-api/api/oauth/callback` with `code` and `state`
6. **Token Exchange**: Dashboard service exchanges `code` for `access_token` and `refresh_token`
7. **Storage**: Tokens stored encrypted in `analytics_connections` table
8. **Success Redirect**: User redirected back to site dashboard with success message

### Token Refresh

- Access tokens are short-lived (typically 1 hour)
- Dashboard service automatically refreshes using `refresh_token` when needed
- Refresh happens before API calls if `token_expires_at` is in the past
- Failed refreshes update `sync_status` to 'error' and log `sync_error`

## API Endpoints

### Status Check
```
GET /api/status?siteId=<uuid>
```
Returns connection status for all services:
```json
{
  "analyticsConnected": true,
  "searchConsoleConnected": true,
  "keywordResearchReady": true,
  "sanityLeadsConfigured": true
}
```

### Analytics Endpoints

**GA4 Traffic:**
```
GET /api/analytics/ga4/traffic?siteId=<uuid>&startDate=<iso>&endDate=<iso>
```

**GA4 Events:**
```
GET /api/analytics/ga4/events?siteId=<uuid>&eventName=<name>
```

**Search Console Queries:**
```
GET /api/analytics/search-console/queries?siteId=<uuid>&startDate=<iso>&endDate=<iso>
```

**Search Console Pages:**
```
GET /api/analytics/search-console/pages?siteId=<uuid>
```

### Keyword Research
```
POST /api/keyword-research/single
Body: { "keyword": "lawn care", "location": "Cape May, NJ" }
```

```
POST /api/keyword-research/batch
Body: { "keywords": ["lawn care", "sprinkler installation"], "location": "Cape May, NJ" }
```

### Leads
```
GET /api/leads/summary?siteId=<uuid>&startDate=<iso>&endDate=<iso>
GET /api/leads/recent?siteId=<uuid>&limit=20&offset=0
```

## Site Registration (Phase 10)

When a new site is built, the orchestrator:

1. **Calls Dashboard Registration API**: POST to `/dashboard-api/api/sites/register`
2. **Receives Dashboard UUID**: Response includes `dashboard_uuid`
3. **Injects UUID into Site**: Updates site's `.env` or config with:
   - `DASHBOARD_UUID=<uuid>`
   - `DASHBOARD_API_URL=https://dashboard-api.example.com`
4. **Site Can Now Use Dashboard**: Site can call status endpoint and display dashboard UI

## Multi-Tenant Security

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own sites
- Sites can only access their own analytics connections
- Data is isolated per `site_owner_uid`

### Token Encryption

- `refresh_token` stored encrypted using Supabase Vault or pgcrypto
- `access_token` stored in plain text (short-lived, refreshed frequently)
- Encryption keys managed by Supabase

## Caching Strategy

### Cache Types

- **GA4 Traffic**: Cached for 1 hour
- **GA4 Events**: Cached for 30 minutes
- **Search Console Queries**: Cached for 4 hours (data updates daily)
- **Search Console Pages**: Cached for 4 hours
- **Keyword Research**: Cached for 24 hours
- **Leads Summary**: Cached for 15 minutes

### Cache Invalidation

- Cache expires based on `expires_at` timestamp
- Manual refresh button in UI invalidates cache
- Cache version incremented on schema changes

## AI Insights Generation

### Sources

1. **Keyword Research Agent**: Generates keyword opportunity insights
2. **SEO Agent**: Generates SEO recommendations based on analytics data
3. **Traffic Analysis**: AI analyzes traffic patterns and suggests optimizations
4. **Lead Analysis**: AI analyzes lead sources and suggests improvements

### Insight Types

- `traffic_analysis`: Traffic pattern insights
- `keyword_opportunity`: High-value keyword opportunities
- `seo_recommendation`: SEO improvement suggestions
- `content_suggestion`: Content optimization recommendations
- `performance_insight`: Performance optimization insights
- `lead_analysis`: Lead generation insights

### Priority Levels

- `critical`: Requires immediate attention (e.g., traffic drop >50%)
- `high`: Important optimization opportunity
- `medium`: Good to implement when possible
- `low`: Nice-to-have improvement

## Integration with Agents

### Keyword Research Agent

- Dashboard calls `/api/keyword-research/*` endpoints
- Results cached in `analytics_cache` with `cache_type='keyword_research'`
- AI insights generated from keyword data stored in `ai_insights`

### SEO Agent

- SEO recommendations generated from analytics data
- Stored in `ai_insights` with `insight_type='seo_recommendation'`
- Recommendations include keyword opportunities, content suggestions, etc.

## Dashboard UI Components

Each site's `/dashboard` route includes:

1. **Connection Status Banner**: Shows which services are connected
2. **TrafficOverview**: GA4 traffic charts and metrics
3. **KeywordOpportunities**: Keyword research insights
4. **LeadsOverview**: Lead statistics from Sanity
5. **SiteHealthOverview**: Overall site health metrics
6. **AIInsightsSummary**: AI-generated insights and recommendations

## Environment Variables

### Dashboard Service
```bash
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
KEYWORDS_EVERYWHERE_API_KEY=
```

### Client Sites
```bash
DASHBOARD_UUID=<generated-during-phase-10>
DASHBOARD_API_URL=https://dashboard-api.example.com
```

## Future Integrations

### Optional APIs (Placeholder)

- **Google Business Profile API**: Local business insights
- **CallRail API**: Call tracking analytics
- **HubSpot API**: CRM integration
- **Jobber API**: Field service management
- **ServiceTitan API**: Field service management
- **Housecall Pro API**: Field service management

These can be added to `analytics_connections` table with new `connection_type` values.

## Implementation Status

⚠️ **Scaffold/Placeholder Only** - Full implementation pending:

- [x] Database schema (SQL definitions)
- [x] API route placeholders
- [x] OAuth flow structure
- [x] Type definitions
- [ ] GA4 Data API integration
- [ ] Search Console API integration
- [ ] OAuth token exchange and refresh
- [ ] Token encryption (Supabase Vault)
- [ ] Sanity leads integration
- [ ] Analytics caching logic
- [ ] AI insights generation
- [ ] Dashboard UI components
- [ ] Site registration API
- [ ] Rate limiting per site
- [ ] Error handling and retries

