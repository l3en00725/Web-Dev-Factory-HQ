# Central Dashboard Service

Multi-tenant analytics and insights dashboard service for Web-Dev-Factory HQ sites.

## Architecture

The dashboard service is **NOT** inside each client site. Instead, it's a centralized service that:

- Manages OAuth connections to Google Analytics 4 and Search Console
- Stores encrypted tokens in Supabase
- Caches analytics data to reduce API calls
- Provides unified API endpoints for all sites
- Generates AI insights from analytics data

## Tech Stack

- **Backend**: Node.js/TypeScript (Express or similar)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (Google OAuth)
- **APIs Integrated**:
  - Google Analytics Data API (GA4)
  - Google Search Console API
  - Keywords Everywhere API (via proxy)
  - Sanity API (for leads)

## Folder Structure

```
dashboard-api/
├── db/
│   └── schema.sql              # Supabase schema (multi-tenant tables)
├── routes/
│   ├── analytics/
│   │   ├── ga4.ts             # GA4 traffic/events endpoints
│   │   └── search-console.ts  # Search Console queries/pages endpoints
│   ├── keyword-research.ts    # Keywords Everywhere proxy
│   ├── leads.ts               # Sanity leads integration
│   └── status.ts              # Connection status endpoint
├── lib/
│   ├── oauth/
│   │   └── google.ts          # Google OAuth flow
│   ├── fetchers/
│   │   ├── ga4.ts             # GA4 API fetcher
│   │   └── search-console.ts  # Search Console API fetcher
│   └── types.ts               # TypeScript type definitions
└── README.md
```

## Database Schema

See `db/schema.sql` for complete schema. Key tables:

- **sites**: Site information and dashboard UUIDs
- **analytics_connections**: OAuth tokens (encrypted)
- **dashboard_settings**: Per-site dashboard configuration
- **analytics_cache**: Cached analytics snapshots
- **ai_insights**: AI-generated insights per site

## API Endpoints

### Status Check
- `GET /api/status?siteId=<uuid>` - Connection status for all services

### Analytics
- `GET /api/analytics/ga4/traffic?siteId=<uuid>&startDate=<iso>&endDate=<iso>`
- `GET /api/analytics/ga4/events?siteId=<uuid>`
- `GET /api/analytics/ga4/conversions?siteId=<uuid>`
- `GET /api/analytics/search-console/queries?siteId=<uuid>`
- `GET /api/analytics/search-console/pages?siteId=<uuid>`
- `GET /api/analytics/search-console/performance?siteId=<uuid>`

### Keyword Research
- `POST /api/keyword-research/single` - Research single keyword
- `POST /api/keyword-research/batch` - Research multiple keywords

### Leads
- `GET /api/leads/summary?siteId=<uuid>` - Aggregated lead statistics
- `GET /api/leads/recent?siteId=<uuid>` - Recent leads (paginated)

## OAuth Flow

1. User clicks "Connect Google Analytics" in dashboard
2. Redirects to Google OAuth consent screen
3. User authorizes access
4. Callback receives authorization code
5. Exchange code for access + refresh tokens
6. Store encrypted tokens in `analytics_connections` table
7. Redirect back to dashboard with success message

## Site Registration

When a new site is built (Phase 10 in orchestrator):

1. Create entry in `sites` table
2. Generate unique `dashboard_uuid`
3. Inject `dashboard_uuid` into site's environment/config
4. Site can now call `/api/status?siteId=<dashboard_uuid>` to check connections

## Environment Variables

```bash
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Keywords Everywhere (already in env.template)
KEYWORDS_EVERYWHERE_API_KEY=
```

## Implementation Status

⚠️ **Placeholder/Scaffold Only** - Full implementation pending:

- [ ] GA4 Data API integration
- [ ] Search Console API integration
- [ ] OAuth token exchange and refresh
- [ ] Token encryption (Supabase Vault)
- [ ] Sanity leads integration
- [ ] Analytics caching logic
- [ ] AI insights generation
- [ ] Rate limiting per site
- [ ] Error handling and retries

## Next Steps

1. Set up Supabase project and run `db/schema.sql`
2. Configure Google OAuth credentials
3. Implement OAuth flow
4. Implement GA4 fetcher
5. Implement Search Console fetcher
6. Add caching layer
7. Integrate with Keyword Research Agent
8. Build dashboard UI components

