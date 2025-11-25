// /sanity/schema/sections/pricing.ts
// Pricing table section
// Blueprint: Display service packages or plans

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'pricing',
  title: 'Pricing Section',
  type: 'object',
  icon: () => '💰',
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
      name: 'plans',
      title: 'Pricing Plans',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'pricingPlan',
          fields: [
            defineField({
              name: 'name',
              title: 'Plan Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Price',
              type: 'string',
              description: 'e.g. "$99", "Starting at $149", "Custom"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'frequency',
              title: 'Frequency',
              type: 'string',
              description: 'e.g. "/month", "/visit", "per project"',
            }),
            defineField({
              name: 'description',
              title: 'Plan Description',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'features',
              title: 'Features',
              type: 'array',
              of: [{ type: 'string' }],
            }),
            defineField({
              name: 'ctaLabel',
              title: 'CTA Button Label',
              type: 'string',
              initialValue: 'Get Started',
            }),
            defineField({
              name: 'ctaLink',
              title: 'CTA Button Link',
              type: 'string',
            }),
            defineField({
              name: 'highlighted',
              title: 'Highlight This Plan',
              type: 'boolean',
              description: 'Make this plan stand out as "popular" or "recommended"',
              initialValue: false,
            }),
            defineField({
              name: 'badge',
              title: 'Badge Text',
              type: 'string',
              description: 'e.g. "Most Popular", "Best Value"',
              hidden: ({ parent }) => !parent?.highlighted,
            }),
          ],
          preview: {
            select: { title: 'name', price: 'price', highlighted: 'highlighted' },
            prepare({ title, price, highlighted }) {
              return {
                title: highlighted ? `⭐ ${title}` : title,
                subtitle: price,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'footnote',
      title: 'Footnote',
      type: 'text',
      rows: 2,
      description: 'Additional pricing notes or disclaimers',
    }),
  ],
  preview: {
    select: { title: 'heading', plans: 'plans' },
    prepare({ title, plans }) {
      return {
        title: title || 'Pricing Section',
        subtitle: `${plans?.length || 0} plans`,
      };
    },
  },
});
