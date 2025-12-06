// templates/client-base/src/lib/seo-utils.ts

/**
 * Normalize a URL by removing UTM parameters, trailing slashes, and fragments
 */
export function normalizeCanonicalUrl(url: string, siteUrl: string): string {
  try {
    const urlObj = new URL(url, siteUrl);
    
    // Remove UTM parameters
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmParams.forEach(param => urlObj.searchParams.delete(param));
    
    // Remove fragment
    urlObj.hash = '';
    
    // Normalize pathname (remove trailing slash except for root)
    let pathname = urlObj.pathname;
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    urlObj.pathname = pathname;
    
    return urlObj.toString();
  } catch (e) {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Build a canonical URL with override support
 */
export function buildCanonicalUrl(
  path: string,
  siteUrl: string,
  override?: string
): string {
  if (override) {
    return normalizeCanonicalUrl(override, siteUrl);
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizeCanonicalUrl(`${siteUrl}${normalizedPath}`, siteUrl);
}

/**
 * Check if a domain is a staging/preview environment
 */
export function isStagingDomain(domain: string): boolean {
  const stagingIndicators = ['staging', 'preview', 'dev', 'test', 'localhost', '127.0.0.1'];
  const lowerDomain = domain.toLowerCase();
  return stagingIndicators.some(indicator => lowerDomain.includes(indicator));
}

