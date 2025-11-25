// /sanity/schema/sections/callToAction.ts
// Call-to-action banner section
// Blueprint: Conversion-focused section

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'callToAction',
  title: 'Call To Action',
  type: 'object',
  icon: () => '📢',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'body',
      title: 'Body Text',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button Label',
      type: 'string',
      validation: (Rule) => Rule.required().max(30),
    }),
    defineField({
      name: 'buttonLink',
      title: 'Button Link',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'secondaryButtonLabel',
      title: 'Secondary Button Label',
      type: 'string',
    }),
    defineField({
      name: 'secondaryButtonLink',
      title: 'Secondary Button Link',
      type: 'string',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Hex code (e.g. #1E40AF) or Tailwind class',
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'string',
      options: {
        list: [
          { title: 'Light (White)', value: 'light' },
          { title: 'Dark (Black)', value: 'dark' },
        ],
      },
      initialValue: 'light',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'heading', buttonLabel: 'buttonLabel' },
    prepare({ title, buttonLabel }) {
      return {
        title: title || 'Call To Action',
        subtitle: buttonLabel ? `Button: ${buttonLabel}` : 'CTA',
      };
    },
  },
});
