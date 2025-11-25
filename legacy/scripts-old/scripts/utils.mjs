#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { mkdir, writeFile, readFile, access, copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import crypto from 'node:crypto';

export function getArgs(options = {}) {
  return parseArgs({ options, strict: false }).values;
}

export async function ensureDir(targetPath) {
  await mkdir(targetPath, { recursive: true });
}

export async function ensureFileDir(filePath) {
  await ensureDir(dirname(filePath));
}

export async function writeJson(filePath, data) {
  await ensureFileDir(filePath);
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function writeText(filePath, text) {
  await ensureFileDir(filePath);
  await writeFile(filePath, text, 'utf8');
}

export async function readJson(filePath, fallback = {}) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[utils] Could not read ${filePath}: ${error.message}. Using fallback.`);
    return fallback;
  }
}

export async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function resolvePath(base, target) {
  return resolve(base, target ?? '');
}

export function hashedId(input) {
  return crypto.createHash('sha1').update(input).digest('hex').slice(0, 8);
}

export async function touch(filePath) {
  await ensureFileDir(filePath);
  await writeFile(filePath, '', { flag: 'a' });
}

export async function copyIfExists(source, destination) {
  if (await fileExists(source)) {
    await ensureFileDir(destination);
    await copyFile(source, destination);
  }
}

export async function uniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}

export async function writeCsv(filePath, rows) {
  const content = rows.map((row, index) => {
    if (Array.isArray(row)) {
      return row.map((col) => escapeCsv(col ?? '')).join(',');
    }
    if (index === 0 && typeof row === 'object') {
      const header = Object.keys(row);
      const headerLine = header.join(',');
      const dataLine = header.map((key) => escapeCsv(row[key] ?? '')).join(',');
      return `${headerLine}\n${dataLine}`;
    }
    if (typeof row === 'object') {
      const cols = Object.values(row);
      return cols.map((col) => escapeCsv(col ?? '')).join(',');
    }
    return String(row);
  }).join('\n');
  await writeText(filePath, content.endsWith('\n') ? content : `${content}\n`);
}

function escapeCsv(value) {
  const stringValue = String(value ?? '');
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function logStep(message) {
  console.log(`[automation] ${message}`);
}

export function timestamp() {
  return new Date().toISOString();
}

export async function writeReportHeader(filePath, title) {
  await writeText(filePath, `# ${title}\nGenerated: ${timestamp()}\n`);
}

export function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function samplePages() {
  return [
    {
      url: '/',
      title: 'Aveda Institute',
      h1: 'Aveda Institute Salon & Spa Education',
      sections: [
        {
          heading: 'Transform Your Passion Into A Career',
          content: 'Join a renowned network of beauty professionals with programs in cosmetology, esthiology, and massage therapy.'
        },
        {
          heading: 'Why Choose Aveda Institute',
          content: 'Hands-on training, industry partnerships, and holistic wellness practices come together for an immersive experience.'
        }
      ]
    },
    {
      url: '/services',
      title: 'Student Salon Services',
      h1: 'Industry-Leading Guest Services',
      sections: [
        {
          heading: 'Salon Services',
          content: 'Cosmetology students deliver personalized cuts, color, and styling using plant-powered Aveda products.'
        },
        {
          heading: 'Spa & Body Therapies',
          content: 'Discover facial, body care, and wellness enhancements performed by highly trained esthiology students.'
        }
      ]
    },
    {
      url: '/about',
      title: 'About Aveda Institute',
      h1: 'Aveda Institute Heritage',
      sections: [
        {
          heading: 'Mission & Vision',
          content: 'We elevate the beauty industry through environmental leadership, creativity, and mindful education.'
        },
        {
          heading: 'Accredited Programs',
          content: 'Our campuses are accredited and offer licensing-ready curriculum designed with real-world expectations.'
        }
      ]
    },
    {
      url: '/contact',
      title: 'Book A Services Appointment',
      h1: 'Schedule Aveda Institute Services',
      sections: [
        {
          heading: 'Guest Reservations',
          content: 'Plan your salon or spa visit. Our student team is ready to craft a relaxing, results-driven experience.'
        },
        {
          heading: 'Admissions Team',
          content: 'Connect with admissions to learn about program start dates, campus tours, and financial aid resources.'
        }
      ]
    }
  ];
}

export async function ensurePlaceholderImage(directory, name) {
  const target = join(directory, name);
  if (await fileExists(target)) return target;
  await ensureDir(directory);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#1C1C1C" rx="36"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#F4F4F5" font-size="32" font-family="sans-serif">
    Aveda Institute
  </text>
</svg>`;
  await writeText(target, svg);
  return target;
}
