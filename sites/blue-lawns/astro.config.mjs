import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  site: "https://www.bluelawns.com",
  trailingSlash: "never",
  output: "static",
  server: {
    host: "0.0.0.0",
    port: 4321
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
  },
});
