#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve, join } from 'node:path';
import { readdir, copyFile } from 'node:fs/promises';
import { readJson, writeText, samplePages, ensureDir, logStep } from './utils.mjs';

const { values } = parseArgs({
  options: {
    content: { type: 'string' },
    media: { type: 'string' },
    out: { type: 'string' },
    business: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('import-content.mjs requires --out directory');
}

const contentPath = values.content ? resolve(values.content) : undefined;
const mediaPath = values.media ? resolve(values.media) : undefined;
const outDir = resolve(values.out);

const map = contentPath ? await readJson(contentPath, { pages: samplePages() }) : { pages: samplePages() };
await ensureDir(outDir);

for (const page of map.pages) {
  const segments = page.url === '/' ? ['index'] : page.url.replace(/^\//, '').split('/');
  const fileName = segments.pop() || 'index';
  const directory = join(outDir, ...segments);
  await ensureDir(directory);
  const target = join(directory, `${fileName}.astro`);
  const content = buildPage(page);
  await writeText(target, content);
}

if (mediaPath) {
  const publicDir = resolve(outDir, '../..', 'public', 'media');
  await ensureDir(publicDir);
  try {
    const files = await readdir(mediaPath);
    for (const file of files) {
      await copyFile(join(mediaPath, file), join(publicDir, file));
    }
  } catch (error) {
    console.warn(`[import-content] Unable to copy media: ${error.message}`);
  }
}

logStep(`Imported ${map.pages.length} pages into ${outDir}`);

function buildPage(page) {
  const sections = page.sections
    .map(
      (section) => `      <section class="section">
        <div class="section__inner">
          <h2 class="section__heading">${section.heading}</h2>
          <p class="section__body">${section.content}</p>
        </div>
      </section>`
    )
    .join('\n');

  return `---
import BaseLayout from '../layouts/BaseLayout.astro';
import Button from '../components/ui/button.astro';
import Card from '../components/ui/card.astro';
import Badge from '../components/ui/badge.astro';

const meta = {
  title: '${page.title}',
  description: '${page.sections[0]?.content ?? 'Aveda Institute empowers future beauty professionals.'}'
};
---

<BaseLayout title={meta.title} description={meta.description}>
  <section class="hero">
    <div class="hero__content space-y-4">
      <Badge>${page.title}</Badge>
      <h1 class="hero__title">${page.h1}</h1>
      <p class="hero__lead">${page.sections[0]?.content ?? 'Aveda Institute empowers future beauty professionals.'}</p>
      <div class="hero__actions">
        <Button href="/contact">Book a visit</Button>
        <Button variant="outline" href="/about">Explore programs</Button>
      </div>
    </div>
  </section>

  <div class="grid gap-8 md:grid-cols-2">
${page.sections
  .map((section) => `    <Card title="${section.heading}" description="${section.content}" />`)
  .join('\n')}
  </div>

${sections}
</BaseLayout>
`;
}
