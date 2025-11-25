// /sanity/schema/objects/geo.ts
// Geolocation object for service areas and location pages
// Blueprint: Required for GEO pages to rank in local search

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'geo',
  title: 'Geolocation',
  type: 'object',
  fields: [
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
      validation: (Rule) => Rule.required().error('City is required for local SEO'),
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      validation: (Rule) => Rule.required().error('State is required'),
    }),
    defineField({
      name: 'zip',
      title: 'ZIP Code',
      type: 'string',
      validation: (Rule) =>
        Rule.regex(/^\d{5}(-\d{4})?$/, { name: 'ZIP' }).warning('Enter a valid US ZIP code'),
    }),
    defineField({
      name: 'county',
      title: 'County',
      type: 'string',
    }),
    defineField({
      name: 'region',
      title: 'Region / Area Name',
      type: 'string',
      description: 'e.g. "South Jersey Shore", "Cape May County"',
    }),
    defineField({
      name: 'neighborhood',
      title: 'Neighborhood',
      type: 'string',
      description: 'Specific neighborhood or district',
    }),
    defineField({
      name: 'lat',
      title: 'Latitude',
      type: 'number',
      validation: (Rule) => Rule.min(-90).max(90),
    }),
    defineField({
      name: 'lng',
      title: 'Longitude',
      type: 'number',
      validation: (Rule) => Rule.min(-180).max(180),
    }),
    defineField({
      name: 'serviceRadius',
      title: 'Service Radius (miles)',
      type: 'number',
      description: 'How far from this location do you provide service?',
      validation: (Rule) => Rule.positive(),
    }),
  ],
  options: {
    collapsible: true,
    collapsed: false,
  },
});
