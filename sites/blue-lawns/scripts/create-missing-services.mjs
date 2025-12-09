#!/usr/bin/env node

/**
 * Create missing service pages
 * landscape-maintenance, hardscaping, landscape-lighting, pool-service
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICES_DIR = path.join(__dirname, '..', 'src', 'pages', 'services');

const missingServices = [
  'landscape-maintenance',
  'hardscaping',
  'landscape-lighting',
  'pool-service',
  'power-washing' // Also missing based on file list
];

const template = (slug) => `---
import Base from '../../layouts/Base.astro';
import Container from '../../components/layout/Container.astro';
import Hero from '../../components/sections/Hero.astro';
import CTA from '../../components/sections/CTA.astro';
import { generateBreadcrumbSchema } from '../../lib/structured-data/Breadcrumbs';
import { generateServiceSchema } from '../../lib/structured-data/Service';
import settings from '../../content/settings.json';
import services from '../../content/services.json';

const service = services.find(s => s.slug === '${slug}')!;
const title = \`\${service.title} Services | \${settings.title}\`;
const description = \`Expert \${service.title.toLowerCase()} services in Cape May County. \${service.description} Licensed, insured, and satisfaction guaranteed.\`;

const siteUrl = settings.siteUrl;
const breadcrumbSchema = generateBreadcrumbSchema(
  [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.title, url: \`/services/\${service.slug}\` },
  ],
  siteUrl
);
const serviceSchema = generateServiceSchema(service, settings, siteUrl);

const structuredData = {
  '@graph': [breadcrumbSchema, serviceSchema],
};
---

<Base 
  title={title} 
  description={description}
  structuredData={structuredData}
>
  <Hero
    title={service.title}
    subtitle={service.description}
    primaryCta={{ label: "Get a Free Quote", href: "/contact" }}
    backgroundImage={service.heroImage}
    alignment="center"
  />

  <section class="py-section-mobile lg:py-section-desktop bg-background">
    <Container>
      <div class="max-w-3xl mx-auto">
        <h2 class="font-display text-3xl font-bold mb-6 text-slate-900">About Our {service.title} Services</h2>
        <p class="text-lg text-slate-600 mb-8">{service.fullDescription || service.description}</p>
      </div>
    </Container>
  </section>

  <CTA
    title="Ready to Transform Your Property?"
    text="Contact us today for a free landscape consultation and quote."
    primaryCtaLabel="Get Started"
    primaryCtaLink="/contact"
    secondaryCtaLabel="Call Us"
    secondaryCtaLink={\`tel:\${settings.contact?.phone.replace(/\\s/g, '')}\`}
  />
</Base>
`;

async function main() {
  console.log('🔧 Creating missing service pages...\n');
  
  let created = 0;
  for (const slug of missingServices) {
    const filePath = path.join(SERVICES_DIR, `${slug}.astro`);
    
    // Check if already exists
    try {
      await fs.access(filePath);
      console.log(`⏭️  Skipped: ${slug}.astro (already exists)`);
      continue;
    } catch {
      // Doesn't exist, create it
    }
    
    try {
      await fs.writeFile(filePath, template(slug));
      console.log(`✅ Created: ${slug}.astro`);
      created++;
    } catch (error) {
      console.error(`❌ Failed: ${slug}.astro - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Created ${created} new service pages`);
  console.log(`📊 Total service pages now: ${services.length}/10`);
}

main().catch(console.error);

