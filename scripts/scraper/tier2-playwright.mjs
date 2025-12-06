// scripts/scraper/tier2-playwright.mjs
// Tier 2: Headless browser scraper using Playwright
// Used when Tier 1 cannot reliably extract content (JS-rendered sites)

import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { scrapeSimple } from './tier1-simple.mjs';

/**
 * Scrape site using Playwright for JS-rendered content
 * @param {string} sourceUrl - Root URL to scrape
 * @param {object} options - Scraper options
 * @returns {Promise<object>} Scraped data
 */
export async function scrapePlaywright(sourceUrl, options = {}) {
  const { maxPages = 50, userAgent = 'Web-Dev-Factory-HQ Bot' } = options;
  const domain = new URL(sourceUrl).origin;
  const visited = new Set();
  const pages = [];
  const images = [];
  const serviceAreas = new Set();
  const queue = ['/'];
  
  console.log('[Tier 2] Starting Playwright scraper...');
  
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent });
    
    while (queue.length > 0 && pages.length < maxPages) {
      const path = queue.shift();
      if (visited.has(path)) continue;
      visited.add(path);
      
      const url = new URL(path, domain).toString();
      const page = await context.newPage();
      
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Wait for main content to be visible
        await page.waitForSelector('main, article, [role="main"], body', { timeout: 5000 }).catch(() => {});
        
        const html = await page.content();
        const $ = cheerio.load(html);
        
        // Extract page data (same as Tier 1)
        const title = await page.title();
        const metaDesc = $('meta[name="description"]').attr('content') || '';
        const metaRobots = $('meta[name="robots"]').attr('content') || '';
        const canonical = $('link[rel="canonical"]').attr('href') || '';
        const h1 = $('h1').first().text().trim() || '';
        const h2s = $('h2').map((_, el) => $(el).text().trim()).get();
        
        // Extract JSON-LD
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
        const links = await page.$$eval('a[href]', (anchors) =>
          anchors.map(a => a.getAttribute('href'))
        );
        
        links.forEach(href => {
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
        
        // Extract images
        $('img').each((_, el) => {
          const src = $(el).attr('src');
          const alt = $(el).attr('alt') || '';
          if (src) {
            const imgUrl = new URL(src, url).toString();
            if (isRelevantImage(src, alt)) {
              images.push({
                url: imgUrl,
                alt,
                path: path,
              });
            }
          }
        });
        
        // Extract service areas
        extractServiceAreas($, jsonLd, serviceAreas);
        
        pages.push({
          url: path,
          title: title.trim(),
          metaDescription: metaDesc,
          metaRobots,
          canonical,
          h1,
          h2s,
          jsonLd,
          internalLinks,
        });
        
      } catch (error) {
        console.warn(`[Tier 2] Error scraping ${url}: ${error.message}`);
      } finally {
        await page.close();
      }
    }
    
    await browser.close();
    
    return {
      pages,
      images: Array.from(new Set(images.map(img => img.url))).map(url => 
        images.find(img => img.url === url)
      ),
      serviceAreas: Array.from(serviceAreas),
      success: pages.length > 0,
    };
    
  } catch (error) {
    if (browser) await browser.close();
    console.error(`[Tier 2] Playwright failed: ${error.message}`);
    throw error;
  }
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
    if (data.address && data.address.addressLocality) {
      serviceAreas.add(data.address.addressLocality);
    }
  });
}

