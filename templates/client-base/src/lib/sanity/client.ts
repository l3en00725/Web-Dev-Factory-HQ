// templates/client-base/src/lib/sanity/client.ts
// Shared Sanity client for Astro runtime (server-side only)

import {createClient, type ClientConfig} from "@sanity/client";

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET || "production";
const apiVersion = import.meta.env.SANITY_API_VERSION || "2023-10-01";

// For public, cacheable content we can use the CDN.
// Allow override via env (e.g. SANITY_USE_CDN=false for preview).
const useCdn = import.meta.env.SANITY_USE_CDN !== "false";

// Read token should be set only in server environments.
// Do NOT expose this client in browser-executed code.
const token = import.meta.env.SANITY_READ_TOKEN;

if (!projectId) {
  console.warn(
    "[sanity/client] SANITY_PROJECT_ID is not set. Sanity queries will fail until configured.",
  );
}

export const sanityConfig: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn,
  token,
};

export const client = createClient(sanityConfig);

// Client with write access (server-side only)
// Requires SANITY_API_WRITE_TOKEN in environment
export const writeClient = createClient({
  ...sanityConfig,
  token: import.meta.env.SANITY_API_WRITE_TOKEN,
  useCdn: false, // Always fresh for writes
});

export function getClient(overrides: Partial<ClientConfig> = {}) {
  return createClient({
    ...sanityConfig,
    ...overrides,
  });
}


