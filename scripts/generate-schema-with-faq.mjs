#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve, join } from 'node:path';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import * as cheerio from 'cheerio';

const { values } = parseArgs({
  options: {
    site: { type: 'string' },
    model: { type: 'string' },
    business: { type: 'string' },
    content: { type: 'string' },
    out: { type: 'string' },
    'price-range': { type: 'string' }
  },
  strict: false
});

if (!values.site && !values.out) {
  throw new Error('generate-schema-with-faq.mjs requires --site or --out');
}

const sitePath = values.site ? resolve(`sites/${values.site}`) : process.cwd();
const outputPath = values.out ? resolve(values.out) : resolve(sitePath, 'src/components/site-schema.json');

// Helper functions
async function readJson(path, defaultValue = {}) {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2));
}

// Infer price range from business type
const inferPriceRange = (businessType) => {
  const type = (businessType || '').toLowerCase();
  if (type.includes('lawn') || type.includes('landscap')) return '$$';
  if (type.includes('plumb') || type.includes('hvac') || type.includes('electric')) return '$$$';
  if (type.includes('premium') || type.includes('luxury')) return '$$$$';
  if (type.includes('budget') || type.includes('affordable')) return '$';
  return '$$';
};

// Detect FAQ sections in HTML/Astro files
async function detectFAQs(sitePath) {
  const faqs = [];
  const pagesDir = join(sitePath, 'src/pages');
  const componentsDir = join(sitePath, 'src/components');
  
  if (!existsSync(pagesDir)) return faqs;
  
  const searchDirs = [pagesDir];
  if (existsSync(componentsDir)) searchDirs.push(componentsDir);
  
  for (const dir of searchDirs) {
    const files = await readdir(dir, { recursive: true });
    
    for (const file of files) {
      if (!file.endsWith('.astro') && !file.endsWith('.html') && !file.endsWith('.md')) continue;
      
      const filePath = join(dir, file);
      const content = await readFile(filePath, 'utf-8');
      
      // Load with cheerio
      const $ = cheerio.load(content, { xmlMode: false });
      
      // Strategy 1: Look for elements with FAQ in class/id
      $('[class*="faq"], [id*="faq"], [class*="FAQ"], [id*="FAQ"]').each((i, elem) => {
        const $elem = $(elem);
        
        // Look for question/answer patterns
        const questions = $elem.find('dt, [class*="question"], h3, h4').toArray();
        const answers = $elem.find('dd, [class*="answer"], p').toArray();
        
        questions.forEach((q, idx) => {
          const question = $(q).text().trim();
          const answer = answers[idx] ? $(answers[idx]).text().trim() : '';
          
          if (question && answer && question.includes('?')) {
            faqs.push({ question, answer });
          }
        });
      });
      
      // Strategy 2: Look for accordion/details patterns
      $('details, .accordion-item').each((i, elem) => {
        const $elem = $(elem);
        const question = $elem.find('summary, .accordion-title, .accordion-header').first().text().trim();
        const answer = $elem.find('p, .accordion-content, .accordion-body').first().text().trim();
        
        if (question && answer && question.includes('?')) {
          faqs.push({ question, answer });
        }
      });
      
      // Strategy 3: Markdown headers followed by content
      const lines = content.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if ((line.startsWith('###') || line.startsWith('##')) && line.includes('?')) {
          const question = line.replace(/^#+\s*/, '').trim();
          let answer = '';
          
          // Collect answer from following lines
          for (let j = i + 1; j < lines.length && !lines[j].startsWith('#'); j++) {
            if (lines[j].trim()) answer += lines[j].trim() + ' ';
          }
          
          if (question && answer) {
            faqs.push({ question, answer: answer.trim() });
          }
        }
      }
    }
  }
  
  // Remove duplicates
  const uniqueFaqs = [];
  const seen = new Set();
  
  for (const faq of faqs) {
    const key = faq.question.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueFaqs.push(faq);
    }
  }
  
  return uniqueFaqs.slice(0, 20); // Limit to 20 FAQs
}

// Main execution
async function main() {
  console.log('📋 Generating schema with FAQ detection...');
  
  // Load base schema
  const base = values.model 
    ? await readJson(resolve(values.model))
    : {
        '@context': 'https://schema.org',
        '@type': values.business ?? 'LocalBusiness'
      };
  
  // Load content
  const content = values.content 
    ? await readJson(resolve(values.content))
    : { pages: [] };
  
  // Build main schema
  const schema = {
    ...base,
    name: base.name ?? 'Business Name',
    description: base.description ?? 'Business description',
    url: base.url ?? 'https://example.com',
    areaServed: content.pages?.map((page) => page.title).slice(0, 5) ?? []
  };
  
  // Add priceRange for LocalBusiness
  if (schema['@type'] === 'LocalBusiness' || schema['@type']?.includes('LocalBusiness')) {
    schema.priceRange = values['price-range'] || base.priceRange || inferPriceRange(values.business);
  }
  
  // Detect FAQs
  console.log('🔍 Scanning for FAQ sections...');
  const faqs = await detectFAQs(sitePath);
  
  if (faqs.length > 0) {
    console.log(`✅ Found ${faqs.length} FAQ entries`);
    
    // Create FAQPage schema
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
    
    // If main schema exists, create an array, otherwise use FAQ as main
    const finalSchema = base['@type'] ? [schema, faqSchema] : faqSchema;
    
    await writeJson(outputPath, finalSchema);
    console.log(`✅ Schema with FAQ written to ${outputPath}`);
    console.log(`   - Main schema: ${schema['@type']}`);
    console.log(`   - FAQ entries: ${faqs.length}`);
  } else {
    console.log('ℹ️  No FAQ sections detected');
    await writeJson(outputPath, schema);
    console.log(`✅ Schema written to ${outputPath}`);
  }
}

main().catch(console.error);

