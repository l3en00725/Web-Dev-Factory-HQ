// templates/client-base/src/lib/image-utils.ts
import { client } from './sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const builder = createImageUrlBuilder(client);

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Extract dimensions from a Sanity asset ID
 * Pattern: image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg
 */
export function getSanityDimensions(asset: any): ImageDimensions | null {
  const id = asset?._ref || asset?._id || asset?.asset?._ref || asset?.asset?._id;
  if (!id || typeof id !== 'string') return null;

  const dimensions = id.split('-')[2];
  if (!dimensions) return null;

  const [width, height] = dimensions.split('x').map(Number);
  if (!width || !height) return null;

  return { width, height, aspectRatio: width / height };
}

/**
 * Build a Sanity Image URL with standard optimizations
 */
export function buildSanityImageUrl(source: any, width?: number, height?: number) {
  let img = builder.image(source).auto('format');
  
  if (width) img = img.width(Math.round(width));
  if (height) img = img.height(Math.round(height));
  
  return img.url();
}

/**
 * Generate standard srcset for responsive images
 */
export function getSrcSet(source: any, maxWidth: number = 2000) {
  const widths = [400, 800, 1200, 1600, 2000].filter(w => w <= maxWidth);
  
  return widths
    .map(w => {
      const url = builder.image(source).width(w).auto('format').url();
      return `${url} ${w}w`;
    })
    .join(', ');
}

export function sanitizeAltText(alt: string | undefined, fallback: string = 'Image'): string {
  if (!alt) return fallback;
  return alt.replace(/"/g, '&quot;');
}

