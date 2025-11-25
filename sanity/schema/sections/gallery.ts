// /sanity/schema/sections/gallery.ts
// Image gallery section
// Blueprint: Showcase work, before/after, portfolio

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'object',
  icon: () => '🖼️',
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
    }),
    defineField({
      name: 'subheading',
      title: 'Section Subheading',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'images',
      title: 'Gallery Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              description: 'For filtering (e.g. "Before/After", "Residential")',
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.min(1).error('Add at least one image'),
    }),
    defineField({
      name: 'layout',
      title: 'Layout Style',
      type: 'string',
      options: {
        list: [
          { title: 'Grid', value: 'grid' },
          { title: 'Masonry', value: 'masonry' },
          { title: 'Carousel', value: 'carousel' },
        ],
      },
      initialValue: 'grid',
    }),
    defineField({
      name: 'columns',
      title: 'Columns (for Grid)',
      type: 'number',
      options: { list: [2, 3, 4, 5] },
      initialValue: 3,
      hidden: ({ parent }) => parent?.layout === 'carousel',
    }),
    defineField({
      name: 'enableLightbox',
      title: 'Enable Lightbox',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'enableFiltering',
      title: 'Enable Category Filtering',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'heading', images: 'images' },
    prepare({ title, images }) {
      return {
        title: title || 'Gallery',
        subtitle: `${images?.length || 0} images`,
      };
    },
  },
});
