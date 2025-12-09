/**
 * Comprehensive JSON-LD Schema Generator
 * Implements LocalBusiness, Service, FAQPage, BreadcrumbList, Organization schemas
 * Per Sonnet SEO Specification
 */

import type { ImageMetadata } from 'astro';

// Type Definitions
interface Settings {
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
}

interface Location {
  id: string;
  town: string;
  slug: string;
  geo: {
    lat: number;
    lng: number;
  };
  description: string;
}

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

interface FAQ {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate LocalBusiness Schema
 * Used on: Homepage, Location pages, Location-Service pages
 */
export function generateLocalBusinessSchema(
  settings: Settings,
  location?: Location,
  siteUrl?: string
): object {
  const baseUrl = siteUrl || settings.siteUrl;
  
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#business`,
    name: settings.title,
    description: settings.description,
    url: baseUrl,
    telephone: settings.contact.phone,
    email: settings.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.contact.address.street,
      addressLocality: settings.contact.address.city,
      addressRegion: settings.contact.address.state,
      postalCode: settings.contact.address.zip,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location?.geo?.lat || 39.1751,
      longitude: location?.geo?.lng || -74.7268,
    },
    priceRange: '$$',
    image: `${baseUrl}/images/logo.svg`,
    logo: `${baseUrl}/images/logo.svg`,
  };

  // Add business hours if available
  if (settings.businessHours) {
    schema.openingHoursSpecification = [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '18:00',
      },
    ];
    
    if (settings.businessHours.saturday) {
      schema.openingHoursSpecification.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '16:00',
      });
    }
  }

  // Add social profiles if available
  if (settings.social) {
    schema.sameAs = Object.values(settings.social).filter(Boolean);
  }

  // If specific location provided, add areaServed
  if (location) {
    schema.areaServed = {
      '@type': 'City',
      name: location.town,
      containedInPlace: {
        '@type': 'State',
        name: 'New Jersey',
        containedInPlace: {
          '@type': 'Country',
          name: 'United States',
        },
      },
    };
  }

  return schema;
}

/**
 * Generate Organization Schema
 * Used on: Homepage
 */
export function generateOrganizationSchema(
  settings: Settings,
  siteUrl?: string
): object {
  const baseUrl = siteUrl || settings.siteUrl;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: settings.title,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/images/logo.svg`,
    },
    description: settings.description,
    telephone: settings.contact.phone,
    email: settings.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.contact.address.street,
      addressLocality: settings.contact.address.city,
      addressRegion: settings.contact.address.state,
      postalCode: settings.contact.address.zip,
      addressCountry: 'US',
    },
    sameAs: settings.social ? Object.values(settings.social).filter(Boolean) : [],
  };
}

/**
 * Generate Service Schema
 * Used on: Service pages, Location-Service pages
 */
export function generateServiceSchema(
  service: Service,
  settings: Settings,
  locations?: Location[],
  specificLocation?: Location,
  siteUrl?: string
): object {
  const baseUrl = siteUrl || settings.siteUrl;

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/services/${service.slug}#service`,
    serviceType: service.title,
    name: service.title,
    description: service.fullDescription || service.description,
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${baseUrl}/#business`,
      name: settings.title,
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      description: 'Free estimates available',
    },
  };

  // Area served
  if (specificLocation) {
    // Location-specific service page
    schema.areaServed = {
      '@type': 'City',
      name: specificLocation.town,
      containedInPlace: {
        '@type': 'State',
        name: 'New Jersey',
      },
    };
  } else if (locations && locations.length > 0) {
    // General service page - all locations
    schema.areaServed = locations.map((loc) => ({
      '@type': 'City',
      name: loc.town,
      containedInPlace: {
        '@type': 'State',
        name: 'New Jersey',
      },
    }));
  }

  return schema;
}

/**
 * Generate FAQPage Schema
 * Used on: Service pages, Location-Service pages with FAQs
 */
export function generateFAQSchema(faqs: FAQ[], siteUrl?: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList Schema
 * Used on: All non-homepage pages
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[],
  siteUrl: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Generate AreaServed Schema
 * Used on: Location pages, Service pages listing all locations
 */
export function generateAreaServedSchema(
  locations: Location[],
  siteUrl?: string
): object[] {
  return locations.map((location) => ({
    '@type': 'City',
    name: location.town,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.geo.lat,
      longitude: location.geo.lng,
    },
    containedInPlace: {
      '@type': 'State',
      name: 'New Jersey',
      containedInPlace: {
        '@type': 'Country',
        name: 'United States',
      },
    },
  }));
}

/**
 * Generate Review Schema (for testimonials)
 * Used on: Homepage, Service pages with testimonials
 */
export function generateReviewSchema(
  reviews: Array<{
    author: string;
    rating: number;
    text: string;
    date?: string;
  }>,
  settings: Settings,
  siteUrl?: string
): object[] {
  const baseUrl = siteUrl || settings.siteUrl;

  return reviews.map((review, index) => ({
    '@type': 'Review',
    '@id': `${baseUrl}/#review-${index + 1}`,
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
    datePublished: review.date || new Date().toISOString().split('T')[0],
    itemReviewed: {
      '@type': 'LocalBusiness',
      '@id': `${baseUrl}/#business`,
      name: settings.title,
    },
  }));
}

/**
 * Generate AggregateRating Schema
 * Used on: Homepage, Service pages
 */
export function generateAggregateRatingSchema(
  averageRating: number,
  reviewCount: number,
  settings: Settings,
  siteUrl?: string
): object {
  const baseUrl = siteUrl || settings.siteUrl;

  return {
    '@type': 'AggregateRating',
    ratingValue: averageRating,
    reviewCount: reviewCount,
    bestRating: 5,
    worstRating: 1,
    itemReviewed: {
      '@type': 'LocalBusiness',
      '@id': `${baseUrl}/#business`,
      name: settings.title,
    },
  };
}

/**
 * Combine multiple schemas into @graph format
 */
export function combineSchemas(...schemas: object[]): object {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.filter(Boolean),
  };
}

/**
 * Validate and clean schema object
 * Removes undefined values, empty arrays, etc.
 */
export function cleanSchema(schema: any): any {
  if (Array.isArray(schema)) {
    return schema.map(cleanSchema).filter(Boolean);
  }

  if (typeof schema === 'object' && schema !== null) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(schema)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value) && value.length === 0) continue;
      if (typeof value === 'string' && value.trim() === '') continue;
      cleaned[key] = cleanSchema(value);
    }
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  }

  return schema;
}

