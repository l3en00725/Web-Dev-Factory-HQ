// /sanity/schema/documents/navItem.ts
// Navigation item document type
// Blueprint: Main navigation menu items

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'navItem',
  title: 'Navigation Item',
  type: 'document',
  icon: () => '🔗',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required().max(30),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'string',
      description: 'Internal path (e.g. /services) or external URL',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first',
      validation: (Rule) => Rule.integer().positive(),
      initialValue: 10,
    }),
    defineField({
      name: 'isExternal',
      title: 'External Link',
      type: 'boolean',
      description: 'Opens in new tab',
      initialValue: false,
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight',
      type: 'boolean',
      description: 'Style as a button/CTA',
      initialValue: false,
    }),
    defineField({
      name: 'children',
      title: 'Dropdown Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'dropdownItem',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'string',
              description: 'Optional description for mega menus',
            }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'href' },
          },
        },
      ],
    }),
    defineField({
      name: 'showInFooter',
      title: 'Show in Footer',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'showInMobile',
      title: 'Show in Mobile Menu',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'Menu Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'label', href: 'href', order: 'order', highlight: 'highlight' },
    prepare({ title, href, order, highlight }) {
      return {
        title: highlight ? `🔘 ${title}` : title,
        subtitle: `#${order || '?'} — ${href}`,
      };
    },
  },
});
