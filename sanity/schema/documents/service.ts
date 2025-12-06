// /sanity/schema/documents/service.ts
// Service document type
// Blueprint: Service pages with SEO, GEO, and pageBuilder

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: () => '🔧',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
    { name: 'seo', title: 'SEO' },
    { name: 'geo', title: 'Geolocation' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Service Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Short description for cards and listings',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'isPrimaryService',
      title: 'Is Primary Service',
      type: 'boolean',
      group: 'content',
      description: 'Mark as true for main services that should be prominently featured',
      initialValue: false,
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'array',
      group: 'content',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Service Gallery',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        },
      ],
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
    defineField({
      name: 'geo',
      title: 'Geolocation',
      type: 'geo',
      group: 'geo',
      description: 'Primary service area for this service',
    }),
    defineField({
      name: 'relatedServices',
      title: 'Related Services',
      type: 'array',
      group: 'content',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
      validation: (Rule) => Rule.max(4),
    }),
  ],
  orderings: [
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', media: 'image', excerpt: 'excerpt' },
    prepare({ title, media, excerpt }) {
      return {
        title: title || 'Untitled Service',
        subtitle: excerpt,
        media,
      };
    },
  },
});
