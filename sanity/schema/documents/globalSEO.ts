// /sanity/schema/documents/globalSEO.ts
// Global SEO settings singleton
// Blueprint: Site-wide SEO defaults and verification codes

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'globalSEO',
  title: 'Global SEO',
  type: 'document',
  icon: () => '🔍',
  groups: [
    { name: 'defaults', title: 'Defaults', default: true },
    { name: 'verification', title: 'Verification' },
    { name: 'schema', title: 'Schema.org' },
  ],
  fields: [
    // Defaults
    defineField({
      name: 'defaultMetaTitle',
      title: 'Default Meta Title',
      type: 'string',
      group: 'defaults',
      description: "Fallback title when pages don't have one",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'titleTemplate',
      title: 'Title Template',
      type: 'string',
      group: 'defaults',
      description: 'e.g. "%s | Blue Lawns" where %s is the page title',
      initialValue: '%s | Site Name',
    }),
    defineField({
      name: 'defaultMetaDescription',
      title: 'Default Meta Description',
      type: 'text',
      rows: 3,
      group: 'defaults',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default OG Image',
      type: 'image',
      group: 'defaults',
      options: { hotspot: true },
      description: 'Default image for social sharing (1200x630 recommended)',
    }),
    defineField({
      name: 'defaultKeywords',
      title: 'Default Keywords',
      type: 'array',
      group: 'defaults',
      of: [{ type: 'string' }],
      description: 'Fallback keywords for pages without specific keywords',
    }),

    // Verification
    defineField({
      name: 'googleSiteVerification',
      title: 'Google Site Verification',
      type: 'string',
      group: 'verification',
      description: 'Google Search Console verification code',
    }),
    defineField({
      name: 'bingSiteVerification',
      title: 'Bing Site Verification',
      type: 'string',
      group: 'verification',
      description: 'Bing Webmaster Tools verification code',
    }),
    defineField({
      name: 'googleAnalyticsId',
      title: 'Google Analytics ID',
      type: 'string',
      group: 'verification',
      description: 'e.g. G-XXXXXXXXXX',
    }),
    defineField({
      name: 'googleTagManagerId',
      title: 'Google Tag Manager ID',
      type: 'string',
      group: 'verification',
      description: 'e.g. GTM-XXXXXXX',
    }),
    defineField({
      name: 'facebookPixelId',
      title: 'Facebook Pixel ID',
      type: 'string',
      group: 'verification',
    }),

    // Schema.org
    defineField({
      name: 'organizationType',
      title: 'Organization Type',
      type: 'string',
      group: 'schema',
      options: {
        list: [
          { title: 'Local Business', value: 'LocalBusiness' },
          { title: 'Home And Construction Business', value: 'HomeAndConstructionBusiness' },
          { title: 'Professional Service', value: 'ProfessionalService' },
          { title: 'Organization', value: 'Organization' },
        ],
      },
      initialValue: 'LocalBusiness',
    }),
    defineField({
      name: 'schemaOrg',
      title: 'Custom Schema.org JSON-LD',
      type: 'text',
      rows: 15,
      group: 'schema',
      description: 'Override with custom JSON-LD for LocalBusiness or Organization',
    }),
    defineField({
      name: 'sameAs',
      title: 'Same As (Social Profiles)',
      type: 'array',
      group: 'schema',
      of: [{ type: 'url' }],
      description: 'URLs of official social profiles for schema.org sameAs property',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Global SEO Settings',
        subtitle: 'Site-wide SEO configuration',
      };
    },
  },
});
