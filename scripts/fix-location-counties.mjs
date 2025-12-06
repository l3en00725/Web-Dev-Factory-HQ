#!/usr/bin/env node
// scripts/fix-location-counties.mjs
// Fix county field for all Cape May County locations

import { createClient } from '@sanity/client';
import 'dotenv/config';

const projectId = process.env.SANITY_PROJECT_ID || 'm8m8m99r';
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error('❌ Error: SANITY_WRITE_TOKEN is required');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-10-01',
  token,
  useCdn: false,
});

// Locations that need county fix
const locationsToFix = [
  { id: '234d96b8-9bba-465f-97b3-dd36df8312a2', title: 'Sea Isle City' }, // Currently "Sea Isle City", should be "Cape May County"
  { id: 'a8e4f698-56be-4330-b64d-a7987ccf81eb', title: 'Avalon' }, // null
  { id: '61f2ef72-e20e-4d55-99a9-5bb8feffb4c6', title: 'Cape May' }, // null
  { id: '9904d869-32b8-48e2-ad5a-4fb2c9a5ef64', title: 'Ocean City' }, // null
  { id: '50c0b10d-fe14-4d94-8b20-7fc1d3680a94', title: 'Stone Harbor' }, // null
];

async function fixCounties() {
  try {
    console.log('📝 Fixing county fields for Cape May County locations...\n');
    
    for (const location of locationsToFix) {
      await client
        .patch(location.id)
        .set({ 'geo.county': 'Cape May County' })
        .commit({ publish: true });
      console.log(`✅ ${location.title}: Set county to "Cape May County"`);
    }
    
    console.log('\n✅ All county fields fixed and published!');
    
  } catch (error) {
    console.error('❌ Error fixing counties:', error.message);
    process.exit(1);
  }
}

fixCounties();

