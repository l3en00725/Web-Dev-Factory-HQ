// templates/client-base/src/pages/robots.txt.ts
import type { APIRoute } from 'astro';
import { getGlobalSEO, getSettings } from '../lib/sanity/queries';
import { isStagingDomain } from '../lib/seo-utils';

export const GET: APIRoute = async ({ url }) => {
  const [globalSeo, settings] = await Promise.all([
    getGlobalSEO(),
    getSettings()
  ]);

  const siteUrl = settings?.siteUrl || url.origin;
  const sitemapUrl = `${siteUrl}/sitemap-index.xml`;

  // Check if staging environment
  const isStaging = isStagingDomain(siteUrl) || 
                    process.env.NODE_ENV === 'development' ||
                    process.env.VERCEL_ENV === 'preview';

  // Default rules
  let rules: string[] = [];

  // Staging: Disallow all by default
  if (isStaging || globalSeo?.noIndex) {
    rules = [
      'User-agent: *',
      'Disallow: /'
    ];
  } else {
    // Production: Allow with standard disallows
    rules = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      'Disallow: /dashboard/',
      'Disallow: /_image/',
    ];
  }

  return new Response(
    `${rules.join('\n')}

Sitemap: ${sitemapUrl}`,
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    }
  );
};

