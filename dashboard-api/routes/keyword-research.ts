// dashboard-api/routes/keyword-research.ts
// Keyword Research API proxy
// Proxies requests to Keywords Everywhere API via the Keyword Research Agent

import type { Request, Response } from 'express';
import { researchKeyword, researchKeywordsBatch } from '../../packages/utils/keywords-everywhere';

/**
 * POST /api/keyword-research/single
 * Research a single keyword
 * 
 * Body:
 * {
 *   keyword: string,
 *   location?: string,
 *   service?: string
 * }
 */
export async function researchSingleKeyword(req: Request, res: Response) {
  const { keyword, location, service } = req.body;
  
  if (!keyword) {
    return res.status(400).json({ error: 'keyword is required' });
  }
  
  try {
    // TODO: Add siteId validation and rate limiting per site
    // TODO: Cache results in analytics_cache table
    // TODO: Log usage for billing/analytics
    
    const result = await researchKeyword(keyword, location, service);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Keyword research failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * POST /api/keyword-research/batch
 * Research multiple keywords in batch
 * 
 * Body:
 * {
 *   keywords: string[],
 *   location?: string
 * }
 */
export async function researchBatchKeywords(req: Request, res: Response) {
  const { keywords, location } = req.body;
  
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return res.status(400).json({ error: 'keywords array is required' });
  }
  
  try {
    // TODO: Add siteId validation and rate limiting
    // TODO: Cache results in analytics_cache table
    
    const results = await researchKeywordsBatch(keywords, location);
    
    // Convert Map to object for JSON response
    const resultsObj = Object.fromEntries(results);
    
    res.json({
      success: true,
      data: resultsObj
    });
  } catch (error) {
    res.status(500).json({
      error: 'Batch keyword research failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

