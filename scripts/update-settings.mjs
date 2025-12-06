#!/usr/bin/env node
// scripts/update-settings.mjs
// Update Settings document with selectedTemplate and formDestination

import { createClient } from '@sanity/client';
import 'dotenv/config';

const projectId = process.env.SANITY_PROJECT_ID || 'm8m8m99r';
const dataset = process.env.SANITY_DATASET || 'production';
const token = process.env.SANITY_WRITE_TOKEN;

if (!token) {
  console.error('❌ Error: SANITY_WRITE_TOKEN is required');
  console.error('   Get it from: https://sanity.io/manage/project/m8m8m99r/api');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2023-10-01',
  token,
  useCdn: false,
});

const settingsId = '9cc07637-2bf7-472f-ac9a-04064df1b01b';

async function updateSettings() {
  try {
    console.log('📝 Updating Settings document...');
    
    const result = await client
      .patch(settingsId)
      .set({
        selectedTemplate: 'client-base',
        formDestination: {
          destinationType: 'jobber',
          providerName: 'Jobber',
        },
      })
      .commit();

    console.log('✅ Settings updated successfully!');
    console.log(`   selectedTemplate: ${result.selectedTemplate}`);
    console.log(`   formDestination: ${JSON.stringify(result.formDestination)}`);
    
    // Publish the document (patch with publish option)
    await client
      .patch(settingsId)
      .set({})
      .commit({ publish: true });
    console.log('✅ Settings published!');
    
  } catch (error) {
    console.error('❌ Error updating settings:', error.message);
    process.exit(1);
  }
}

updateSettings();

