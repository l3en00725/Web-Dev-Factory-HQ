// /sanity/schema/sections/servicesGrid.ts
// Services grid section for Page Builder
// Blueprint: Display service cards with references

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'servicesGrid',
  title: 'Services Grid',
  type: 'object',
  icon: () => '🔧',
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
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'service' }],
        },
      ],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'showAll',
      title: 'Show All Services',
      type: 'boolean',
      description: 'If checked, displays all services instead of selected ones',
      initialValue: false,
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      options: { list: [2, 3, 4] },
      initialValue: 3,
    }),
    defineField({
      name: 'showImages',
      title: 'Show Service Images',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showExcerpts',
      title: 'Show Service Excerpts',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'heading', services: 'services', showAll: 'showAll' },
    prepare({ title, services, showAll }) {
      return {
        title: title || 'Services Grid',
        subtitle: showAll ? 'Showing all services' : `${services?.length || 0} services`,
      };
    },
  },
});
