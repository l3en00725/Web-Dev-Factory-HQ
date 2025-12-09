/**
 * Global type definitions for Blue Lawns site
 */

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription?: string;
  heroImage?: string;
  alt?: string;
  type?: 'primary' | 'secondary';
  isPrimary?: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  galleryImages?: string[];
}

export interface Location {
  id: string;
  town: string;
  slug: string;
  geo: {
    lat: number;
    lng: number;
  };
  description: string;
  badges?: string[];
  heroImage?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface Settings {
  title: string;
  description: string;
  siteUrl: string;
  logo: string;
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  businessHours?: {
    weekdays: string;
    saturday?: string;
    sunday?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
  };
}
