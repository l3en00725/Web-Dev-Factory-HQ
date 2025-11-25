// /sanity/schema/objects/socialLink.ts
// Social media link object for settings
// Blueprint: Used in site settings for social profiles

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'socialLink',
  title: 'Social Link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: 'Facebook', value: 'facebook' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'Twitter / X', value: 'twitter' },
          { title: 'LinkedIn', value: 'linkedin' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'TikTok', value: 'tiktok' },
          { title: 'Pinterest', value: 'pinterest' },
          { title: 'Yelp', value: 'yelp' },
          { title: 'Google Business', value: 'google' },
          { title: 'Nextdoor', value: 'nextdoor' },
          { title: 'Houzz', value: 'houzz' },
          { title: 'Thumbtack', value: 'thumbtack' },
          { title: 'Angi', value: 'angi' },
          { title: 'HomeAdvisor', value: 'homeadvisor' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'url',
      title: 'Profile URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'label',
      title: 'Custom Label',
      type: 'string',
      description: 'Override the default platform name for display',
    }),
  ],
  preview: {
    select: {
      platform: 'platform',
      url: 'url',
      label: 'label',
    },
    prepare({ platform, url, label }) {
      const platformName = platform?.charAt(0).toUpperCase() + platform?.slice(1);
      return {
        title: label || platformName || 'Social Link',
        subtitle: url,
      };
    },
  },
});
