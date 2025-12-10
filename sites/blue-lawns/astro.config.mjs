import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import { fileURLToPath } from 'url';
import { resolve } from 'path';

export default defineConfig({
  site: "https://www.bluelawns.com",
  trailingSlash: "never",
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  server: {
    port: 3000  // Blue Lawns dev server - update Google OAuth redirect URI to: http://localhost:3000/api/admin/oauth/google/callback
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
    resolve: {
      alias: {
        '@virgo/shared-oauth': resolve(fileURLToPath(new URL('.', import.meta.url)), '../../packages/shared/oauth'),
      },
    },
  },
});
