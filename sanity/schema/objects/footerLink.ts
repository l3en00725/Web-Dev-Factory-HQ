// /sanity/schema/objects/footerLink.ts
// Footer navigation link object
// Blueprint: Used in site settings for footer navigation

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'footerLink',
  title: 'Footer Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required().max(50),
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'string',
      description: 'Internal path (e.g. /about) or external URL',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isExternal',
      title: 'External Link',
      type: 'boolean',
      description: 'Opens in new tab if checked',
      initialValue: false,
    }),
    defineField({
      name: 'column',
      title: 'Footer Column',
      type: 'number',
      description: 'Which column this link appears in (1, 2, 3, etc.)',
      validation: (Rule) => Rule.integer().positive().max(4),
      initialValue: 1,
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'href',
      isExternal: 'isExternal',
    },
    prepare({ title, subtitle, isExternal }) {
      return {
        title: title || 'Untitled Link',
        subtitle: isExternal ? `↗ ${subtitle}` : subtitle,
      };
    },
  },
});
