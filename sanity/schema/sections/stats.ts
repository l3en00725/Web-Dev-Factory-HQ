// /sanity/schema/sections/stats.ts
// Statistics/numbers section
// Blueprint: Social proof with key metrics

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'stats',
  title: 'Stats Section',
  type: 'object',
  icon: () => '📊',
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
      title: 'Stat Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'statItem',
          fields: [
            defineField({
              name: 'value',
              title: 'Value',
              type: 'string',
              description: 'e.g. "500+", "15", "99%"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'e.g. "Happy Customers", "Years Experience"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'prefix',
              title: 'Prefix',
              type: 'string',
              description: 'e.g. "$", ">"',
            }),
            defineField({
              name: 'suffix',
              title: 'Suffix',
              type: 'string',
              description: 'e.g. "+", "%", "K"',
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
            }),
          ],
          preview: {
            select: { value: 'value', label: 'label', prefix: 'prefix', suffix: 'suffix' },
            prepare({ value, label, prefix, suffix }) {
              return {
                title: `${prefix || ''}${value}${suffix || ''}`,
                subtitle: label,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(2).max(6),
    }),
    defineField({
      name: 'enableAnimation',
      title: 'Enable Count-Up Animation',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'heading', items: 'items' },
    prepare({ title, items }) {
      return {
        title: title || 'Stats Section',
        subtitle: `${items?.length || 0} stats`,
      };
    },
  },
});
