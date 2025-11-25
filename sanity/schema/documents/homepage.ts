// /sanity/schema/documents/homepage.ts
// Homepage document type
// Blueprint: Single homepage document with pageBuilder

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: () => '🏠',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().error('Title is required'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) => input.toLowerCase().replace(/\s+/g, '-').slice(0, 96),
      },
      validation: (Rule) => Rule.required().error('Slug is required'),
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page Builder',
      type: 'array',
      group: 'content',
      of: [
        { type: 'hero' },
        { type: 'features' },
        { type: 'servicesGrid' },
        { type: 'imageBanner' },
        { type: 'contactSection' },
        { type: 'callToAction' },
        { type: 'gallery' },
        { type: 'pricing' },
        { type: 'faq' },
        { type: 'contentBlock' },
        { type: 'stats' },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return {
        title: title || 'Homepage',
        subtitle: 'Homepage',
      };
    },
  },
});
