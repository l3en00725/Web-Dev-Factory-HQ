#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve, join, dirname } from 'node:path';
import { createReadStream, existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import readline from 'node:readline';
import { ensureDir, writeText, samplePages, logStep, writeCsv } from './utils.mjs';

const { values, positionals } = parseArgs({
  options: {
    domain: { type: 'string' },
    pages: { type: 'string', multiple: true },
    urls: { type: 'string' },
    out: { type: 'string' },
    'user-agent': { type: 'string' },
    log: { type: 'string' }
  },
  strict: false,
  allowPositionals: true
});

if (!values.out) {
  throw new Error('crawl-site.mjs requires --out');
}

const outputDir = resolve(values.out);
const logPath = resolve(values.log ?? join(dirname(outputDir), 'logs', 'crawl.log'));
const userAgent = values['user-agent'] ?? 'Web-Dev-Factory-HQ Bot';
await ensureDir(outputDir);
await ensureDir(dirname(logPath));

let pages;
if (values.domain) {
  pages = await crawlDomain(
    values.domain,
    values.pages?.length ? values.pages : ['/', '/programs', '/about', '/contact'],
    outputDir,
    userAgent
  );
} else if (values.urls) {
  pages = await loadFromCsv(resolve(values.urls));
  await generateHtmlFromStructured(pages, outputDir);
} else {
  pages = samplePages();
  await generateHtmlFromStructured(pages, outputDir);
}

const summary = pages.map((page) => `${page.url} -> ${page.title}`).join('\n');
await writeText(logPath, `Crawl completed at ${new Date().toISOString()}\n${summary}\n`);

// write url inventory alongside output
const inventoryPath = resolve(dirname(outputDir), 'url_map.csv');
await writeCsv(inventoryPath, [['url', 'title'], ...pages.map((page) => [page.url, page.title])]);

logStep(`Crawl complete. ${pages.length} pages captured.`);

async function crawlDomain(domain, pageSlugs, destDir, agent) {
  const initialSlugs = pageSlugs?.length ? pageSlugs : ['/'];
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: agent });
    const origin = new URL(domain).origin;
    const maxPages = 12;
    const results = [];
    const queue = [];
    const visited = new Set();

    const enqueue = (href) => {
      if (!href) return;
      let normalized;
      try {
        const url = new URL(href, origin);
        if (url.origin !== origin) return;
        normalized = url.pathname || '/';
      } catch {
        return;
      }
      if (!normalized.startsWith('/')) normalized = `/${normalized}`;
      if (normalized.length > 1 && normalized.endsWith('/')) normalized = normalized.slice(0, -1);
      if (normalized === '') normalized = '/';
      if (/\.(png|jpe?g|gif|svg|ico|css|js|webp|mp4|pdf)$/i.test(normalized)) return;
      if (!visited.has(normalized) && !queue.includes(normalized)) {
        queue.push(normalized);
      }
    };

    initialSlugs.forEach(enqueue);

    while (queue.length && results.length < maxPages) {
      const slug = queue.shift();
      if (!slug || visited.has(slug)) continue;
      visited.add(slug);

      const url = new URL(slug, origin).toString();
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle' });
        const html = await page.content();
        const title = await page.title();
        const discovered = await page.$$eval('a[href^="/"]', (anchors) =>
          anchors
            .map((anchor) => anchor.getAttribute('href'))
            .filter(Boolean)
        );

        discovered.forEach(enqueue);

        const fileName = slug === '/' ? 'index.html' : `${slug.replace(/^\//, '').replace(/\//g, '-') || 'index'}.html`;
        await writeText(join(destDir, fileName), html);
        results.push({ url: slug, title: title?.trim() || url });
      } catch (error) {
        console.warn(`[crawl-site] Failed to render ${url}: ${error.message}`);
      } finally {
        await page.close();
      }
    }

    await browser.close();
    return results.length ? results : await fallbackFetch(domain, initialSlugs, destDir, agent);
  } catch (error) {
    console.warn(`[crawl-site] Playwright crawl failed (${error.message}). Falling back to static fetch.`);
    return fallbackFetch(domain, initialSlugs, destDir, agent);
  }
}

async function fallbackFetch(domain, pageSlugs, destDir, agent) {
  const results = [];
  const controller = new AbortController();
  for (const slug of pageSlugs) {
    const url = new URL(slug, domain).toString();
    const response = await fetch(url, {
      headers: { 'User-Agent': agent, Accept: 'text/html' },
      signal: controller.signal
    });
    if (!response.ok) {
      console.warn(`[crawl-site] Failed to fetch ${url}: ${response.status}`);
      continue;
    }
    const html = await response.text();
    const fileName = slug === '/' ? 'index.html' : `${slug.replace(/^\//, '').replace(/\//g, '-') || 'index'}.html`;
    const filePath = join(destDir, fileName);
    await writeText(filePath, html);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    results.push({ url: slug.startsWith('/') ? slug : `/${slug}`, title: titleMatch ? titleMatch[1].trim() : url });
  }
  return results.length ? results : samplePages();
}

async function loadFromCsv(path) {
  const rows = [];
  if (!existsSync(path)) return samplePages();
  const stream = createReadStream(path, 'utf8');
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim() || line.startsWith('url')) continue;
    const [url, title] = line.split(',');
    rows.push({ url: url.trim(), title: title?.trim() ?? 'Page' });
  }
  return rows.length ? rows : samplePages();
}

async function generateHtmlFromStructured(structuredPages, destDir) {
  for (const page of structuredPages) {
    const fileName = page.url === '/' ? 'index.html' : `${page.url.replace(/^\//, '').replace(/\//g, '-')}.html`;
    const target = join(destDir, fileName);
    const html = `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>${page.title}</title>\n</head>\n<body>\n  <main>Placeholder for ${page.title}</main>\n</body>\n</html>`;
    await writeText(target, html);
  }
}
