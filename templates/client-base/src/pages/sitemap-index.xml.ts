// templates/client-base/src/pages/sitemap-index.xml.ts
import type { APIRoute } from 'astro';
import { getServices, getLocations, getSettings } from '../lib/sanity/queries';
import { buildCanonicalUrl } from '../lib/seo-utils';

export const GET: APIRoute = async () => {
  const [services, locations, settings] = await Promise.all([
    getServices(),
    getLocations(),
    getSettings(),
  ]);

  const siteUrl = settings?.siteUrl || 'https://example.com';
  const now = new Date().toISOString();

  const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }> = [];

  // Homepage
  urls.push({
    loc: buildCanonicalUrl('/', siteUrl),
    lastmod: now,
    changefreq: 'daily',
    priority: '1.0',
  });

  // Services (exclude noIndex)
  services
    .filter((service: any) => !service.seo?.noIndex)
    .forEach((service: any) => {
      urls.push({
        loc: buildCanonicalUrl(`/services/${service.slug.current}`, siteUrl, service.seo?.canonicalUrl),
        lastmod: service._updatedAt || now,
        changefreq: 'weekly',
        priority: '0.8',
      });
    });

  // Locations (exclude noIndex)
  locations
    .filter((location: any) => !location.seo?.noIndex)
    .forEach((location: any) => {
      urls.push({
        loc: buildCanonicalUrl(`/locations/${location.slug.current}`, siteUrl, location.seo?.canonicalUrl),
        lastmod: location._updatedAt || now,
        changefreq: 'weekly',
        priority: '0.8',
      });
    });

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `    <changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `    <priority>${url.priority}</priority>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

