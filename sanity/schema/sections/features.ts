// /sanity/schema/sections/features.ts
// Features grid section for Page Builder
// Blueprint: Showcase key benefits or features

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'features',
  title: 'Features Section',
  type: 'object',
  icon: () => '✨',
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
      name: 'items',
      title: 'Feature Items',
      type: 'array',
      validation: (Rule) => Rule.max(12).warning('Consider limiting to 12 features for readability'),
      of: [
        {
          type: 'object',
          name: 'featureItem',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icon Name',
              type: 'string',
              description: 'Icon identifier (e.g. "check", "star", "shield")',
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required().max(50),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.max(200),
            }),
            defineField({
              name: 'link',
              title: 'Link',
              type: 'string',
              description: 'Optional link for this feature',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'description' },
          },
        },
      ],
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      options: { list: [2, 3, 4] },
      initialValue: 3,
    }),
  ],
  preview: {
    select: { title: 'heading', items: 'items' },
    prepare({ title, items }) {
      return {
        title: title || 'Features Section',
        subtitle: `${items?.length || 0} features`,
      };
    },
  },
});
