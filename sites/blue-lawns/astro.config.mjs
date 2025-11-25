import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import vercel from "@astrojs/vercel/serverless";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://bluelawns.com",
  output: "server", // Enable server-side rendering for API routes
  adapter: vercel(),
  integrations: [
    react(), // Enable React for AI chat component
    mdx(), 
    sitemap(), 
    icon()
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
