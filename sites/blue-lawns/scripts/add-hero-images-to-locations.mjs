#!/usr/bin/env node

/**
 * Add backgroundImage prop to Hero components on location pages
 */

import fs from 'fs/promises';
import { glob } from 'glob';

const files = await glob('src/pages/locations/*.astro', { ignore: 'src/pages/locations/index.astro' });

for (const file of files) {
  let content = await fs.readFile(file, 'utf-8');
  
  // Add backgroundImage prop to Hero component if not already present
  if (content.includes('<Hero') && !content.includes('backgroundImage=')) {
    content = content.replace(
      /(<Hero\s+variant="simple"\s+title=\{[^}]+\}\s+subtitle=\{[^}]+\}\s+primaryCta=\{[^}]+\})/,
      '$1\n    backgroundImage={location.heroImage}'
    );
    
    await fs.writeFile(file, content);
    console.log(`✅ Added backgroundImage to: ${file}`);
  } else if (content.includes('backgroundImage=')) {
    console.log(`⏭️  Already has backgroundImage: ${file}`);
  } else {
    console.log(`⚠️  Could not update: ${file}`);
  }
}

console.log('\n✅ All location pages updated!');

