#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve, join, dirname } from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import { ensureDir, writeJson, samplePages, logStep } from './utils.mjs';
import { load } from 'cheerio';

const { values } = parseArgs({
  options: {
    html: { type: 'string' },
    out: { type: 'string' }
  },
  strict: false
});

if (!values.out) {
  throw new Error('extract-semantic-structure.mjs requires --out');
}

const htmlDir = values.html ? resolve(values.html) : undefined;
const outFile = resolve(values.out);
await ensureDir(dirname(outFile));

const structured = await generateContentMap(htmlDir);
await writeJson(outFile, structured);

logStep(`Semantic structure written to ${outFile}`);

async function generateContentMap(htmlDirectory) {
  if (!htmlDirectory) {
    return defaultMap();
  }
  try {
    const files = await readdir(htmlDirectory);
    const pages = [];
    for (const file of files) {
      if (!file.endsWith('.html')) continue;
      const raw = await readFile(join(htmlDirectory, file), 'utf8');
      const $ = load(raw);
      const canonicalUrl = file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '').replace(/-/g, '/')}`;
      const title = $('title').first().text().trim() || canonicalUrl;
      const h1 = $('h1').first().text().trim() || title;
      const sections = extractSections($);
      const summary = $('meta[name="description"]').attr('content') || sections[0]?.content || '';
      pages.push({ url: canonicalUrl, title, h1, summary, sections });
    }
    if (!pages.length) return defaultMap();
    return {
      site: {
        name: 'Aveda Institute',
        origin: 'https://aveda-institute-site-35t9.bolt.host',
        description: pages.find((page) => page.summary)?.summary || 'Aveda Institute site copy.'
      },
      pages
    };
  } catch (error) {
    console.warn(`[extract-semantic-structure] ${error.message}. Using defaults.`);
    return defaultMap();
  }
}

function extractSections($) {
  const sections = [];
  const scope = $('main').length ? $('main') : $('body');
  scope.find('section').each((_, section) => {
    const section$ = $(section);
    const heading = section$.find('h2, h3').first().text().trim();
    const content = section$.find('p, li').map((__, el) => $(el).text().trim()).get().filter(Boolean).join('\n\n');
    if (heading || content) {
      sections.push({ heading: heading || 'Section', content });
    }
  });

  if (!sections.length) {
    scope.find('h2').each((_, headingEl) => {
      const heading = $(headingEl).text().trim();
      const paragraph = collectSiblingParagraphs($, headingEl);
      if (heading || paragraph) {
        sections.push({ heading: heading || 'Section', content: paragraph });
      }
    });
  }

  return sections;
}

function collectSiblingParagraphs($, headingEl) {
  const paragraphs = [];
  let next = $(headingEl).next();
  let depth = 0;
  while (next.length && depth < 10) {
    if (next.is('h1, h2, h3, section')) break;
    if (next.is('p, ul, ol')) {
      paragraphs.push(next.text().trim());
    }
    next = next.next();
    depth += 1;
  }
  return paragraphs.filter(Boolean).join('\n\n');
}

function defaultMap() {
  return { site: { name: 'Aveda Institute', origin: 'https://www.aveda.edu' }, pages: samplePages() };
}
