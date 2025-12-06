// sites/blue-lawns/src/lib/image-utils.ts
// Simplified image utilities for static site (no Sanity)

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Sanitize alt text for HTML attribute
 */
export function sanitizeAltText(alt: string | undefined, fallback: string = 'Image'): string {
  if (!alt) return fallback;
  return alt.replace(/"/g, '&quot;');
}

/**
 * Get image dimensions from URL if they're embedded in filename
 * Pattern: image-name-2000x3000.jpg
 */
export function getImageDimensions(url: string): ImageDimensions | null {
  const match = url.match(/-(\d+)x(\d+)\./);
  if (!match) return null;
  
  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);
  
  return { width, height, aspectRatio: width / height };
}

/**
 * Generate a placeholder blur data URL
 */
export function getPlaceholderDataUrl(width: number = 10, height: number = 10): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E`;
}
