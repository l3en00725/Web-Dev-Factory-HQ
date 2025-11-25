// /sanity/schema/sections/faq.ts
// FAQ accordion section
// Blueprint: SEO-friendly FAQ with schema.org support

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'faq',
  title: 'FAQ Section',
  type: 'object',
  icon: () => '❓',
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      initialValue: 'Frequently Asked Questions',
    }),
    defineField({
      name: 'subheading',
      title: 'Section Subheading',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'items',
      title: 'FAQ Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required().max(200),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required().max(1000),
            }),
          ],
          preview: {
            select: { title: 'question' },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'enableSchema',
      title: 'Enable FAQ Schema',
      type: 'boolean',
      description: 'Generate FAQPage schema.org markup for SEO',
      initialValue: true,
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Accordion', value: 'accordion' },
          { title: 'Two Columns', value: 'two-column' },
          { title: 'Expandable Cards', value: 'cards' },
        ],
      },
      initialValue: 'accordion',
    }),
  ],
  preview: {
    select: { title: 'heading', items: 'items' },
    prepare({ title, items }) {
      return {
        title: title || 'FAQ Section',
        subtitle: `${items?.length || 0} questions`,
      };
    },
  },
});
