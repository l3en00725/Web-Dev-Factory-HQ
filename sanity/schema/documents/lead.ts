// /sanity/schema/documents/lead.ts
// Lead document type
// Neutral, reusable lead capture with rich attribution metadata

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  icon: () => '📥',
  groups: [
    { name: 'core', title: 'Core Lead Info', default: true },
    { name: 'attribution', title: 'Attribution' },
    { name: 'system', title: 'System & CRM' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'core',
      validation: (Rule) => Rule.required().min(2).error('Lead name is required'),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'core',
      validation: (Rule) =>
        Rule.required()
          .email()
          .error('A valid email address is required'),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      group: 'core',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 4,
      group: 'core',
    }),
    defineField({
      name: 'formName',
      title: 'Form Name',
      type: 'string',
      group: 'core',
      description: 'Identifier for the form that captured this lead (e.g. contact, quote, hero-cta).',
    }),
    defineField({
      name: 'pagePath',
      title: 'Page Path',
      type: 'string',
      group: 'attribution',
      description: 'Path of the page where the form was submitted (e.g. /services/pool-installation).',
    }),
    defineField({
      name: 'leadSource',
      title: 'Lead Source',
      type: 'string',
      group: 'attribution',
      description: 'High-level source bucket for this lead.',
      options: {
        list: [
          { title: 'Direct', value: 'direct' },
          { title: 'Organic', value: 'organic' },
          { title: 'Paid', value: 'paid' },
          { title: 'Referral', value: 'referral' },
          { title: 'Social', value: 'social' },
          { title: 'Unknown', value: 'unknown' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'utm_source',
      title: 'UTM Source',
      type: 'string',
      group: 'attribution',
    }),
    defineField({
      name: 'utm_medium',
      title: 'UTM Medium',
      type: 'string',
      group: 'attribution',
    }),
    defineField({
      name: 'utm_campaign',
      title: 'UTM Campaign',
      type: 'string',
      group: 'attribution',
    }),
    defineField({
      name: 'utm_term',
      title: 'UTM Term',
      type: 'string',
      group: 'attribution',
    }),
    defineField({
      name: 'utm_content',
      title: 'UTM Content',
      type: 'string',
      group: 'attribution',
    }),
    defineField({
      name: 'referer',
      title: 'HTTP Referer',
      type: 'string',
      group: 'attribution',
      description: 'Raw referer URL reported by the browser at submission time.',
    }),
    defineField({
      name: 'ipAddress',
      title: 'IP Address',
      type: 'string',
      group: 'system',
      description: 'IP address captured at the time of submission (respecting privacy/local laws).',
    }),
    defineField({
      name: 'crmStatus',
      title: 'CRM Status',
      type: 'string',
      group: 'system',
      description: 'Status of forwarding this lead to the upstream CRM.',
      options: {
        list: [
          { title: 'Success', value: 'success' },
          { title: 'Failed', value: 'failed' },
          { title: 'Pending', value: 'pending' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'crmForwardingResult',
      title: 'CRM Forwarding Result',
      type: 'object',
      group: 'system',
      description: 'Optional payload describing how this lead was handled by the CRM.',
      fields: [
        defineField({
          name: 'provider',
          title: 'Provider',
          type: 'string',
          description: 'Name of the downstream CRM or integration (e.g. HubSpot, Jobber, Zapier).',
        }),
        defineField({
          name: 'statusCode',
          title: 'Status Code',
          type: 'string',
          description: 'HTTP or application status code returned by the provider.',
        }),
        defineField({
          name: 'errorMessage',
          title: 'Error Message',
          type: 'text',
        }),
        defineField({
          name: 'rawResponse',
          title: 'Raw Response (Redacted)',
          type: 'text',
          description: 'Redacted snapshot of the provider response for debugging.',
        }),
      ],
    }),
    defineField({
      name: 'intakeMeta',
      title: 'Intake Meta',
      type: 'object',
      group: 'system',
      description: 'Additional runtime metadata captured at submission time.',
      fields: [
        defineField({
          name: 'userAgent',
          title: 'User Agent',
          type: 'string',
        }),
        defineField({
          name: 'timezone',
          title: 'Timezone',
          type: 'string',
        }),
        defineField({
          name: 'locale',
          title: 'Locale',
          type: 'string',
        }),
        defineField({
          name: 'extra',
          title: 'Extra Data (JSON)',
          type: 'text',
          description: 'Optional JSON payload for implementation-specific metadata.',
        }),
      ],
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      group: 'system',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      pagePath: 'pagePath',
      createdAt: 'createdAt',
    },
    prepare({ title, subtitle, pagePath, createdAt }) {
      const parts = [];
      if (pagePath) parts.push(pagePath);
      if (createdAt) parts.push(new Date(createdAt).toLocaleString());

      return {
        title: title || 'Unnamed Lead',
        subtitle: subtitle || parts.join(' • '),
      };
    },
  },
});


