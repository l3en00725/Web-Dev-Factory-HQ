// dashboard-api/routes/status.ts
// Dashboard connection status endpoint
// Returns which analytics/services are connected for a given site

import type { Request, Response } from 'express';

/**
 * GET /api/status
 * Get connection status for all dashboard services
 * 
 * Query params:
 * - siteId: UUID of the site (from sites.dashboard_uuid)
 * 
 * Returns:
 * {
 *   analyticsConnected: boolean,
 *   searchConsoleConnected: boolean,
 *   keywordResearchReady: boolean,
 *   sanityLeadsConfigured: boolean
 * }
 */
export async function getStatus(req: Request, res: Response) {
  const { siteId } = req.query;
  
  if (!siteId) {
    return res.status(400).json({ error: 'siteId query parameter is required' });
  }
  
  // TODO: Implement status checking
  // 1. Look up site by dashboard_uuid
  // 2. Check analytics_connections table for:
  //    - connection_type='ga4' AND sync_status='success' → analyticsConnected
  //    - connection_type='search_console' AND sync_status='success' → searchConsoleConnected
  // 3. Check if KEYWORDS_EVERYWHERE_API_KEY is set → keywordResearchReady
  // 4. Check if site has sanity_project_id and sanity_dataset → sanityLeadsConfigured
  
  // Placeholder response
  res.json({
    analyticsConnected: false,
    searchConsoleConnected: false,
    keywordResearchReady: !!process.env.KEYWORDS_EVERYWHERE_API_KEY,
    sanityLeadsConfigured: false,
    siteId,
    note: 'Status checking implementation pending'
  });
}

