// /sanity/schema/objects/ogTemplate.ts
// OG image template configuration object
// Blueprint: Per-site dynamic OG styling defaults

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'ogTemplate',
  title: 'OG Template',
  type: 'object',
  fields: [
    defineField({
      name: 'templateStyle',
      title: 'Template Style',
      type: 'string',
      description: 'Theme preset for OG images.',
      options: {
        list: [
          { title: 'Brand', value: 'brand' },
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
        layout: 'radio',
      },
      initialValue: 'brand',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Hex color override for OG background (e.g. #00382A).',
      validation: (Rule) =>
        Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
          name: 'hex',
        }).warning('Enter a valid hex color (e.g. #00382A)'),
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'string',
      description: 'Hex color override for OG text.',
      validation: (Rule) =>
        Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
          name: 'hex',
        }).warning('Enter a valid hex color (e.g. #ffffff)'),
    }),
    defineField({
      name: 'overlayImage',
      title: 'Overlay Image',
      type: 'image',
      description: 'Optional overlay image layered on top of the background.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'defaultTitle',
      title: 'Default Title',
      type: 'string',
      description: 'Fallback title when an OG image is generated without a title.',
    }),
    defineField({
      name: 'defaultSubtitle',
      title: 'Default Subtitle',
      type: 'string',
      description: 'Fallback subtitle for OG images.',
    }),
  ],
  options: {
    collapsible: true,
    collapsed: true,
  },
});


