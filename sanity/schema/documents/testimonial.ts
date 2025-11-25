// /sanity/schema/documents/testimonial.ts
// Testimonial document type
// Blueprint: Customer reviews and social proof

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: () => '⭐',
  fields: [
    defineField({
      name: 'name',
      title: 'Customer Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'e.g. "Homeowner", "Property Manager"',
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().min(20).max(500),
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1-5)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
      initialValue: 5,
    }),
    defineField({
      name: 'image',
      title: 'Customer Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'reference',
      to: [{ type: 'location' }],
      description: 'Where this customer is located',
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{ type: 'service' }],
      description: 'Service this testimonial relates to',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      description: 'When the testimonial was given',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Website', value: 'website' },
          { title: 'Google', value: 'google' },
          { title: 'Yelp', value: 'yelp' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'Email', value: 'email' },
          { title: 'Other', value: 'other' },
        ],
      },
      initialValue: 'website',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show this testimonial prominently',
      initialValue: false,
    }),
    defineField({
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      description: 'Approved for display on website',
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: 'Rating (High to Low)',
      name: 'ratingDesc',
      by: [{ field: 'rating', direction: 'desc' }],
    },
    {
      title: 'Date (Newest First)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: { name: 'name', quote: 'quote', rating: 'rating', media: 'image' },
    prepare({ name, quote, rating, media }) {
      const stars = '⭐'.repeat(rating || 0);
      return {
        title: name || 'Anonymous',
        subtitle: `${stars} — ${quote?.slice(0, 50)}...`,
        media,
      };
    },
  },
});
