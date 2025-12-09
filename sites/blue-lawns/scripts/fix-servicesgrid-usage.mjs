#!/usr/bin/env node

import fs from 'fs/promises';
import { glob } from 'glob';

const files = await glob('src/pages/locations/*.astro', { ignore: 'src/pages/locations/index.astro' });

for (const file of files) {
  let content = await fs.readFile(file, 'utf-8');
  
  // Replace multi-line ServicesGrid component
  content = content.replace(
    /<ServicesGrid\s+heading=\{`Our Services in \$\{location\.town\}`\}\s+services=\{primaryServices\}\s+columns=\{3\}\s*\/>/gs,
    `<section class="py-section-mobile lg:py-section-desktop bg-white">
    <Container>
      <h2 class="font-display text-3xl font-bold mb-12 text-center text-brand-navy">Our Services in {location.town}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {primaryServices.map((service) => (
          <LocationServiceCard 
            service={service} 
            locationSlug={location.slug}
            locationTown={location.town}
          />
        ))}
      </div>
    </Container>
  </section>`
  );
  
  await fs.writeFile(file, content);
  console.log(`✅ Fixed: ${file}`);
}

console.log('\n✅ All location pages updated!');

