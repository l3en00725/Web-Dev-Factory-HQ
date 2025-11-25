// /sanity/schema/sections/contactSection.ts
// Contact section with form and/or map
// Blueprint: Lead capture section

import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'contactSection',
  title: 'Contact Section',
  type: 'object',
  icon: () => '📧',
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      initialValue: 'Get In Touch',
    }),
    defineField({
      name: 'subheading',
      title: 'Section Subheading',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'showForm',
      title: 'Show Contact Form',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'formType',
      title: 'Form Type',
      type: 'string',
      options: {
        list: [
          { title: 'General Contact', value: 'contact' },
          { title: 'Quote Request', value: 'quote' },
          { title: 'Service Inquiry', value: 'service' },
          { title: 'Callback Request', value: 'callback' },
        ],
      },
      initialValue: 'contact',
      hidden: ({ parent }) => !parent?.showForm,
    }),
    defineField({
      name: 'showMap',
      title: 'Show Map',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'showContactInfo',
      title: 'Show Contact Info',
      type: 'boolean',
      description: 'Display phone, email, and address from site settings',
      initialValue: true,
    }),
    defineField({
      name: 'showHours',
      title: 'Show Business Hours',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Form Left, Info Right', value: 'form-left' },
          { title: 'Form Right, Info Left', value: 'form-right' },
          { title: 'Stacked (Form on Top)', value: 'stacked' },
        ],
      },
      initialValue: 'form-left',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'string',
      description: 'Hex code or Tailwind class (e.g. bg-gray-100)',
    }),
  ],
  preview: {
    select: { title: 'heading', showForm: 'showForm', showMap: 'showMap' },
    prepare({ title, showForm, showMap }) {
      const features = [showForm && 'Form', showMap && 'Map'].filter(Boolean).join(' + ');
      return {
        title: title || 'Contact Section',
        subtitle: features || 'Contact',
      };
    },
  },
});
