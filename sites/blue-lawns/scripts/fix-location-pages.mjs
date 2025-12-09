#!/usr/bin/env node

/**
 * Batch fix location pages - SEO compliance
 * Fixes template variables, adds proper titles/descriptions, H1 tags
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCATIONS_DIR = path.join(__dirname, '..', 'src', 'pages', 'locations');

const locations = [
  'cape-may',
  'cape-may-court-house',
  'north-wildwood',
  'ocean-view',
  'rio-grande',
  'sea-isle-city',
  'stone-harbor',
  'wildwood',
  'wildwood-crest'
];

const template = (slug) => `---
import Base from '../../layouts/Base.astro';
import Container from '../../components/layout/Container.astro';
import Hero from '../../components/sections/Hero.astro';
import ServicesGrid from '../../components/sections/ServicesGrid.astro';
import CTA from '../../components/sections/CTA.astro';
import { generateBreadcrumbSchema } from '../../lib/structured-data/Breadcrumbs';
import { generateLocalBusinessSchema } from '../../lib/structured-data/LocalBusiness';
import settings from '../../content/settings.json';
import services from '../../content/services.json';
import locations from '../../content/locations.json';

const location = locations.find(l => l.slug === '${slug}')!;
const title = \`Landscaping in \${location.town}, NJ | \${settings.title}\`;
const description = \`Professional lawn care and landscaping services in \${location.town}, NJ. \${location.description} Get a free quote today.\`;

const siteUrl = settings.siteUrl;
const breadcrumbSchema = generateBreadcrumbSchema(
  [
    { name: 'Home', url: '/' },
    { name: 'Service Areas', url: '/locations' },
    { name: location.town, url: \`/locations/\${location.slug}\` },
  ],
  siteUrl
);
const localBusinessSchema = generateLocalBusinessSchema(settings, location, siteUrl);

const structuredData = {
  '@graph': [breadcrumbSchema, localBusinessSchema],
};

const primaryServices = services.filter(s => s.type === 'primary');
---

<Base 
  title={title} 
  description={description}
  structuredData={structuredData}
>
  <Hero
    title={\`Lawn Care in \${location.town}\`}
    subtitle={\`Professional landscaping and lawn maintenance services for \${location.town}, NJ. Licensed, insured, and satisfaction guaranteed.\`}
    primaryCta={{ label: "Get a Free Quote", href: "/contact" }}
    alignment="center"
  />

  <section class="py-section-mobile lg:py-section-desktop bg-background">
    <Container>
      <div class="max-w-3xl mx-auto text-center mb-12">
        <h2 class="font-display text-3xl font-bold mb-6 text-slate-900">Serving {location.town}, NJ</h2>
        <p class="text-lg text-slate-600">{location.description}</p>
      </div>
    </Container>
  </section>

  <ServicesGrid 
    heading={\`Our Services in \${location.town}\`}
    services={primaryServices}
    columns={3}
  />

  <CTA
    title={\`Ready to Get Started in \${location.town}?\`}
    text="Contact us today for a free estimate. We're proud to serve the residents of this beautiful coastal community."
    primaryCtaLabel="Contact Us"
    primaryCtaLink="/contact"
    secondaryCtaLabel="Call Now"
    secondaryCtaLink={\`tel:\${settings.contact?.phone.replace(/\\s/g, '')}\`}
  />
</Base>
`;

async function main() {
  console.log('🔧 Fixing location pages...\n');
  
  let fixed = 0;
  for (const slug of locations) {
    const filePath = path.join(LOCATIONS_DIR, `${slug}.astro`);
    try {
      await fs.writeFile(filePath, template(slug));
      console.log(`✅ Fixed: ${slug}.astro`);
      fixed++;
    } catch (error) {
      console.error(`❌ Failed: ${slug}.astro - ${error.message}`);
    }
  }
  
  console.log(`\n✅ Fixed ${fixed}/${locations.length} location pages`);
}

main().catch(console.error);

