// templates/client-base/src/pages/api/410.ts
import type { APIRoute } from 'astro';

/**
 * Explicit 410 Gone endpoint for permanently removed content
 * Usage: Redirect old URLs to /api/410?url=/old-path
 */
export const GET: APIRoute = async ({ request }) => {
  return new Response('Gone', {
    status: 410,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};

