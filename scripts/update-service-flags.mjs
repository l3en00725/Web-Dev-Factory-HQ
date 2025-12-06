#!/usr/bin/env node
// scripts/update-service-flags.mjs
// Update isPrimaryService flags for services

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

// Primary services (FINAL per intake confirmation)
const primaryServices = [
  { id: '96b11d67-25b0-423e-943d-6144718fae2b', title: 'Landscape Maintenance' },
  { id: '54677dcf-5b7a-4987-8d25-5a0dec48adb4', title: 'Landscaping' },
  { id: '39bc7645-0485-4320-8e35-325c25a64429', title: 'Hardscaping' },
  { id: '08b16f1e-fea0-4f14-99d2-f76f615e17f7', title: 'Landscape Lighting' },
  { id: 'b8cca2db-3b0b-4ffb-bc0e-2a916fae2f2a', title: 'Pool Service & Maintenance' },
  { id: 'b4173304-e510-46e2-994c-c3c3fb303a10', title: 'Commercial Services' },
];

// Non-primary services (SECONDARY)
const nonPrimaryServices = [
  { id: 'b59cd306-9339-47a7-b134-48f2f627981b', title: 'Lawn Care' },
  { id: 'cbe2627e-6a9b-4817-9765-febecd0c69eb', title: 'Seasonal Cleanup' },
  { id: '5dc49767-1720-418d-89a1-1a7a3a19c88b', title: 'Fencing' },
  { id: 'dcb11376-7913-4fb2-b39c-5fc41ebf5d1c', title: 'Power Washing' },
];

async function updateServiceFlags() {
  try {
    console.log('📝 Updating service primary flags...\n');
    
    // Set primary services
    for (const service of primaryServices) {
      await client
        .patch(service.id)
        .set({ isPrimaryService: true })
        .commit({ publish: true });
      console.log(`✅ ${service.title}: Set as PRIMARY`);
    }
    
    // Set non-primary services
    for (const service of nonPrimaryServices) {
      await client
        .patch(service.id)
        .set({ isPrimaryService: false })
        .commit({ publish: true });
      console.log(`✅ ${service.title}: Set as NON-PRIMARY`);
    }
    
    console.log('\n✅ All service flags updated and published!');
    
  } catch (error) {
    console.error('❌ Error updating service flags:', error.message);
    process.exit(1);
  }
}

updateServiceFlags();

