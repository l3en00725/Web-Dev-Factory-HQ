// /sanity/schema/documents/location.ts
// Location / GEO page document type
// Blueprint: City/town pages for local SEO

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  icon: () => '📍',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'services', title: 'Services' },
    { name: 'seo', title: 'SEO' },
    { name: 'geo', title: 'Geolocation' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Location Name',
      type: 'string',
      group: 'content',
      description: 'e.g. "Avalon", "Cape May", "Stone Harbor"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Page Headline',
      type: 'string',
      group: 'content',
      description: 'e.g. "Professional Lawn Care in Avalon, NJ"',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      group: 'content',
    }),
    defineField({
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'services',
      title: 'Services Available',
      type: 'array',
      group: 'services',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
      description: 'Services offered in this location',
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page Builder',
      type: 'array',
      group: 'content',
      of: [
        { type: 'hero' },
        { type: 'features' },
        { type: 'servicesGrid' },
        { type: 'imageBanner' },
        { type: 'contactSection' },
        { type: 'callToAction' },
        { type: 'gallery' },
        { type: 'pricing' },
        { type: 'faq' },
        { type: 'contentBlock' },
        { type: 'stats' },
      ],
    }),
    defineField({
      name: 'testimonials',
      title: 'Location Testimonials',
      type: 'array',
      group: 'content',
      of: [{ type: 'reference', to: [{ type: 'testimonial' }] }],
      description: 'Testimonials from customers in this area',
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      group: 'seo',
    }),
    defineField({
      name: 'geo',
      title: 'Geolocation',
      type: 'geo',
      group: 'geo',
      validation: (Rule) => Rule.required().error('Geolocation is required for location pages'),
    }),
    defineField({
      name: 'nearbyLocations',
      title: 'Nearby Locations',
      type: 'array',
      group: 'geo',
      of: [{ type: 'reference', to: [{ type: 'location' }] }],
      validation: (Rule) => Rule.max(6),
    }),
  ],
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', city: 'geo.city', state: 'geo.state', media: 'image' },
    prepare({ title, city, state, media }) {
      return {
        title: title || 'Untitled Location',
        subtitle: city && state ? `${city}, ${state}` : 'Location',
        media,
      };
    },
  },
});
