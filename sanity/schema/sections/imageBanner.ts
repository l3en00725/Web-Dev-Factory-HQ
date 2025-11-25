// /sanity/schema/sections/imageBanner.ts
// Full-width image banner section
// Blueprint: Visual break with optional text overlay

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'imageBanner',
  title: 'Image Banner',
  type: 'object',
  icon: () => '🖼️',
  fields: [
    defineField({
      name: 'image',
      title: 'Banner Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (Rule) => Rule.required().error('Alt text is required for accessibility'),
        }),
      ],
    }),
    defineField({
      name: 'overlayText',
      title: 'Overlay Text',
      type: 'string',
    }),
    defineField({
      name: 'overlaySubtext',
      title: 'Overlay Subtext',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'overlayPosition',
      title: 'Text Position',
      type: 'string',
      options: {
        list: [
          { title: 'Top Left', value: 'top-left' },
          { title: 'Top Center', value: 'top-center' },
          { title: 'Top Right', value: 'top-right' },
          { title: 'Center', value: 'center' },
          { title: 'Bottom Left', value: 'bottom-left' },
          { title: 'Bottom Center', value: 'bottom-center' },
          { title: 'Bottom Right', value: 'bottom-right' },
        ],
      },
      initialValue: 'center',
    }),
    defineField({
      name: 'height',
      title: 'Banner Height',
      type: 'string',
      options: {
        list: [
          { title: 'Small (200px)', value: 'sm' },
          { title: 'Medium (400px)', value: 'md' },
          { title: 'Large (600px)', value: 'lg' },
          { title: 'Full Viewport', value: 'full' },
        ],
      },
      initialValue: 'md',
    }),
    defineField({
      name: 'parallax',
      title: 'Enable Parallax Effect',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'overlayText', media: 'image' },
    prepare({ title, media }) {
      return {
        title: title || 'Image Banner',
        subtitle: 'Banner',
        media,
      };
    },
  },
});
