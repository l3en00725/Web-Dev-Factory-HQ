// scripts/scraper/tier1-simple.mjs
// Tier 1: Simple HTML scraper using fetch + cheerio
// Fast and lightweight for standard marketing/WordPress sites

import * as cheerio from 'cheerio';
import { writeJson } from './utils.mjs';

/**
 * Scrape site using simple HTML fetch + cheerio parsing
 * @param {string} sourceUrl - Root URL to scrape
 * @param {object} options - Scraper options
 * @returns {Promise<object>} Scraped data
 */
export async function scrapeSimple(sourceUrl, options = {}) {
  const { maxPages = 50, userAgent = 'Web-Dev-Factory-HQ Bot' } = options;
  const domain = new URL(sourceUrl).origin;
  const visited = new Set();
  const pages = [];
  const images = [];
  const serviceAreas = new Set();
  const queue = ['/'];
  
  console.log('[Tier 1] Starting simple HTML scraper...');
  
  while (queue.length > 0 && pages.length < maxPages) {
    const path = queue.shift();
    if (visited.has(path)) continue;
    visited.add(path);
    
    const url = new URL(path, domain).toString();
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html',
        },
      });
      
      if (!response.ok) {
        console.warn(`[Tier 1] Failed to fetch ${url}: ${response.status}`);
        continue;
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract page data
      const title = $('title').text().trim() || '';
      const metaDesc = $('meta[name="description"]').attr('content') || '';
      const metaRobots = $('meta[name="robots"]').attr('content') || '';
      const canonical = $('link[rel="canonical"]').attr('href') || '';
      const h1 = $('h1').first().text().trim() || '';
      const h2s = $('h2').map((_, el) => $(el).text().trim()).get();
      
      // Extract JSON-LD structured data
      const jsonLd = [];
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const data = JSON.parse($(el).html());
          jsonLd.push(data);
        } catch (e) {
          // Invalid JSON, skip
        }
      });
      
      // Extract internal links
      const internalLinks = [];
      $('a[href^="/"], a[href^="' + domain + '"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href) {
          const normalized = normalizeLink(href, domain);
          if (normalized && !visited.has(normalized)) {
            internalLinks.push(normalized);
            if (queue.length < maxPages * 2) {
              queue.push(normalized);
            }
          }
        }
      });
      
      // Extract images (logo, hero, trust badges only)
      $('img').each((_, el) => {
        const src = $(el).attr('src');
        const alt = $(el).attr('alt') || '';
        if (src) {
          const imgUrl = new URL(src, url).toString();
          // Only capture logo, hero, or trust badge images
          if (isRelevantImage(src, alt)) {
            images.push({
              url: imgUrl,
              alt,
              path: path,
            });
          }
        }
      });
      
      // Extract service areas from JSON-LD or content
      extractServiceAreas($, jsonLd, serviceAreas);
      
      pages.push({
        url: path,
        title,
        metaDescription: metaDesc,
        metaRobots,
        canonical,
        h1,
        h2s,
        jsonLd,
        internalLinks,
      });
      
    } catch (error) {
      console.warn(`[Tier 1] Error scraping ${url}: ${error.message}`);
    }
  }
  
  return {
    pages,
    images: Array.from(new Set(images.map(img => img.url))).map(url => 
      images.find(img => img.url === url)
    ),
    serviceAreas: Array.from(serviceAreas),
    success: pages.length > 0,
  };
}

function normalizeLink(href, domain) {
  try {
    const url = new URL(href, domain);
    if (url.origin !== new URL(domain).origin) return null;
    let path = url.pathname || '/';
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path;
  } catch {
    return null;
  }
}

function isRelevantImage(src, alt) {
  const lowerSrc = src.toLowerCase();
  const lowerAlt = alt.toLowerCase();
  return (
    lowerSrc.includes('logo') ||
    lowerAlt.includes('logo') ||
    lowerSrc.includes('hero') ||
    lowerAlt.includes('hero') ||
    lowerSrc.includes('bbb') ||
    lowerSrc.includes('google') ||
    lowerSrc.includes('trust') ||
    lowerAlt.includes('badge')
  );
}

function extractServiceAreas($, jsonLd, serviceAreas) {
  // Extract from JSON-LD LocalBusiness serviceArea
  jsonLd.forEach(data => {
    if (data['@type'] === 'LocalBusiness' && data.serviceArea) {
      if (Array.isArray(data.serviceArea)) {
        data.serviceArea.forEach(area => {
          if (typeof area === 'string') serviceAreas.add(area);
          if (area.name) serviceAreas.add(area.name);
        });
      } else if (typeof data.serviceArea === 'string') {
        serviceAreas.add(data.serviceArea);
      }
    }
  });
  
  // Extract from address fields in JSON-LD
  jsonLd.forEach(data => {
    if (data.address && data.address.addressLocality) {
      serviceAreas.add(data.address.addressLocality);
    }
  });
}

