/**
 * Astro Configuration - Blue Lawns
 * 
 * IMPORTANT: Environment variables are loaded via dotenv BEFORE Astro starts.
 * This ensures process.env is populated in all server contexts.
 */

// Load env vars FIRST - before any other imports that might need them
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const monorepoRoot = resolve(__dirname, '../..');

// Load env files in order (later files override earlier)
config({ path: resolve(__dirname, '.env') });           // Site .env
config({ path: resolve(monorepoRoot, '.env'), override: true });        // Monorepo .env
config({ path: resolve(monorepoRoot, '.env.local'), override: true });  // Monorepo .env.local

console.log('[ASTRO CONFIG] Env loaded. GOOGLE_OAUTH_CLIENT_ID:', process.env.GOOGLE_OAUTH_CLIENT_ID ? 'SET' : 'MISSING');
console.log('[ASTRO CONFIG] Env loaded. SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');

// Now import Astro dependencies
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  site: "https://www.bluelawns.com",
  trailingSlash: "never",
  
  // Server mode - ALL routes are server-rendered by default
  output: "server",
  
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  
  server: {
    port: 3000,
    host: true, // Bind to all interfaces
  },
  
  integrations: [react(), sitemap(), mdx()],
  
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      ],
    ],
    shikiConfig: {
      theme: "light-plus",
      wrap: false,
    },
  },
  
  vite: {
    plugins: [tailwindcss()],
    // Load env from monorepo root for Vite's import.meta.env
    envDir: monorepoRoot,
    resolve: {
      alias: {
        '@virgo/shared-oauth': resolve(__dirname, '../../packages/shared/oauth'),
      },
    },
    // Ensure server-side packages are bundled correctly for ESM
    ssr: {
      // These packages need to be bundled (not externalized) for ESM compatibility
      noExternal: ['@supabase/ssr'],
    },
    // Optimize deps to handle CJS/ESM issues
    optimizeDeps: {
      include: ['@supabase/supabase-js', '@supabase/ssr'],
    },
    // Define process.env for client-side (only PUBLIC_ vars)
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  },
});
