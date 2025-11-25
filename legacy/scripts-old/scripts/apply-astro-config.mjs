#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    'astro-config': { type: 'string' },
    'psi-target': { type: 'string' },
    'image-service': { type: 'string' },
    islands: { type: 'string' }
  },
  strict: false
});

const astroConfigPath = resolve(values['astro-config'] ?? 'astro.config.mjs');

const template = `// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://aveda-institute.local',
  output: 'static',
  experimental: {
    assets: true
  },
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [],
  security: {
    checkOrigin: true
  }
});
`;

try {
  await writeFile(astroConfigPath, template, 'utf8');
  logStep(`Astro config updated at ${astroConfigPath}`);
} catch (error) {
  console.error(`[apply-astro-config] Failed to update config: ${error.message}`);
  process.exit(1);
}
