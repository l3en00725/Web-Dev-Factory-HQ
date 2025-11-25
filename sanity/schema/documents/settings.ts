// /sanity/schema/documents/settings.ts
// Site settings singleton document
// Blueprint: Global site configuration

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  icon: () => '⚙️',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'branding', title: 'Branding' },
    { name: 'contact', title: 'Contact' },
    { name: 'navigation', title: 'Navigation' },
    { name: 'social', title: 'Social' },
    { name: 'og', title: 'OG Template' },
  ],
  fields: [
    // General
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      group: 'general',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'siteTagline',
      title: 'Site Tagline',
      type: 'string',
      group: 'general',
    }),
    defineField({
      name: 'siteUrl',
      title: 'Site URL',
      type: 'url',
      group: 'general',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }),
    }),

    // Branding
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'branding',
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
      name: 'logoDark',
      title: 'Logo (Dark Mode)',
      type: 'image',
      group: 'branding',
      options: { hotspot: true },
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      group: 'branding',
    }),
    defineField({
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'string',
      group: 'branding',
      description: 'Hex code, e.g. #1E40AF',
      validation: (Rule) =>
        Rule.regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { name: 'hex' }).warning('Enter a valid hex color'),
    }),
    defineField({
      name: 'secondaryColor',
      title: 'Secondary Color',
      type: 'string',
      group: 'branding',
      description: 'Hex code, e.g. #10B981',
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color',
      type: 'string',
      group: 'branding',
    }),

    // Contact
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      group: 'contact',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'contactPhoneDisplay',
      title: 'Phone Display Format',
      type: 'string',
      group: 'contact',
      description: 'How the phone number appears on the site, e.g. (609) 555-1234',
    }),
    defineField({
      name: 'address',
      title: 'Business Address',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({ name: 'street', title: 'Street Address', type: 'string' }),
        defineField({ name: 'street2', title: 'Street Address 2', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'state', title: 'State', type: 'string' }),
        defineField({ name: 'zip', title: 'ZIP Code', type: 'string' }),
        defineField({ name: 'country', title: 'Country', type: 'string', initialValue: 'USA' }),
      ],
    }),
    defineField({
      name: 'businessHours',
      title: 'Business Hours',
      type: 'array',
      group: 'contact',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'days',
              title: 'Days',
              type: 'string',
              description: 'e.g. "Monday - Friday", "Weekends"',
            }),
            defineField({
              name: 'hours',
              title: 'Hours',
              type: 'string',
              description: 'e.g. "8:00 AM - 5:00 PM", "Closed"',
            }),
          ],
          preview: {
            select: { days: 'days', hours: 'hours' },
            prepare({ days, hours }) {
              return { title: days, subtitle: hours };
            },
          },
        },
      ],
    }),

    // Navigation
    defineField({
      name: 'footerLinks',
      title: 'Footer Links',
      type: 'array',
      group: 'navigation',
      of: [{ type: 'footerLink' }],
    }),
    defineField({
      name: 'footerText',
      title: 'Footer Text',
      type: 'text',
      group: 'navigation',
      rows: 2,
      description: 'Copyright or additional footer text',
    }),

    // Social
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      group: 'social',
      of: [{ type: 'socialLink' }],
    }),
    // OG Template
    defineField({
      name: 'ogTemplate',
      title: 'OG Template',
      type: 'ogTemplate',
      group: 'og',
      description: 'Defaults for dynamic OG images generated via /api/og.',
    }),
  ],
  preview: {
    select: { title: 'siteName', media: 'logo' },
    prepare({ title, media }) {
      return {
        title: title || 'Site Settings',
        subtitle: 'Global Configuration',
        media,
      };
    },
  },
});
