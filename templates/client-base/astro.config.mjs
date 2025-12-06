import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import node from "@astrojs/node";

export default defineConfig({
  site: "https://example.com",
  trailingSlash: "never",
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
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

