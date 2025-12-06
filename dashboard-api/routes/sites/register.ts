// dashboard-api/routes/sites/register.ts
// Site registration endpoint for Phase 10
// Registers new sites in Supabase and returns dashboard UUID

import type { Request, Response } from 'express';
import { validateOrInsertSite, isSupabaseConfigured, type SiteData } from '../../lib/db';

/**
 * POST /api/sites/register
 * Register a new site with the Central Dashboard Service
 * 
 * Body:
 * {
 *   siteName: string (required),
 *   domain?: string (optional, can be placeholder),
 *   sanityProjectId: string (required),
 *   sanityDataset: string (required, default: 'production'),
 *   templateName: string (required)
 * }
 * 
 * Returns:
 * {
 *   success: boolean,
 *   siteId: string (UUID from sites.id),
 *   dashboardUuid: string (UUID from sites.dashboard_uuid),
 *   mock?: boolean (true if using mock mode)
 * }
 */
export async function registerSite(req: Request, res: Response) {
  const { siteName, domain, sanityProjectId, sanityDataset, templateName } = req.body;
  
  // Validation
  if (!siteName) {
    return res.status(400).json({ 
      success: false, 
      error: 'siteName is required' 
    });
  }
  
  if (!sanityProjectId) {
    return res.status(400).json({ 
      success: false, 
      error: 'sanityProjectId is required' 
    });
  }
  
  if (!templateName) {
    return res.status(400).json({ 
      success: false, 
      error: 'templateName is required' 
    });
  }
  
  // Default domain if not provided
  const siteUrl = domain || `https://${siteName.replace(/-/g, '')}.com`;
  const dataset = sanityDataset || 'production';
  
  try {
    // Check if Supabase is configured
    const usingMockMode = !isSupabaseConfigured();
    
    if (usingMockMode) {
      console.log('[Dashboard API] Supabase not configured, using mock mode');
    }
    
    // Prepare site data
    const siteData: SiteData = {
      siteName,
      siteUrl,
      sanityProjectId,
      sanityDataset: dataset,
      templateName,
    };
    
    // Register site (uses mock mode if Supabase not configured)
    const result = await validateOrInsertSite(siteData);
    
    // Log registration
    console.log('[Dashboard API] Site registration:', {
      siteName,
      siteUrl,
      sanityProjectId,
      sanityDataset: dataset,
      templateName,
      mode: result.mock ? 'mock' : 'real',
      dashboardUuid: result.dashboardUuid,
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('[Dashboard API] Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Site registration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

