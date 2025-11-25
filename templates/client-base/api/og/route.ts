import React from 'react';
import { ImageResponse } from '@vercel/og';
import { OgTemplate } from '../../src/lib/og/og-template';
import { mapSanityTemplateToOgProps, getDefaultOgTemplate, parseOgRequestParams } from '../../src/lib/og/og-utils';

export const runtime = 'edge';

/**
 * Vercel Edge OG image route
 * Path: /api/og
 *
 * Renders React → SVG → PNG at 1200x630
 * Accepts query params:
 *   - title
 *   - subtitle
 *   - image
 *   - theme (light | dark | brand)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = parseOgRequestParams(url.searchParams);

  // In the base template we don't have a live Sanity client at runtime.
  // This uses a per-site default OG template that downstream pipelines
  // can override with values from Sanity `settings.ogTemplate`.
  const defaultTemplate = getDefaultOgTemplate(
    process.env.NEXT_PUBLIC_SITE_NAME || process.env.SITE_NAME || 'Web-Dev-Factory Site',
  );

  const ogProps = mapSanityTemplateToOgProps(defaultTemplate, params);

  // Fallback for missing titles
  if (!ogProps.title) {
    ogProps.title = defaultTemplate.defaultTitle || 'Web-Dev-Factory Site';
  }

  const element = React.createElement(OgTemplate, ogProps);

  return new ImageResponse(element, {
    width: 1200,
    height: 630,
  });
}


