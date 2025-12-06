// Service structured data for static site

export interface Service {
  title: string;
  slug?: string;
  excerpt?: string;
  description?: string;
  image?: string;
  features?: string[];
}

export interface ServiceSettings {
  title: string;
  siteUrl?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: {
      city?: string;
      state?: string;
      zip?: string;
    };
  };
}

export function generateServiceSchema(service: Service, settings: ServiceSettings, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "provider": {
      "@type": "LocalBusiness",
      "name": settings.title,
      "image": settings.siteUrl ? `${settings.siteUrl}/images/logo.svg` : "",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": settings.contact?.address?.city,
        "addressRegion": settings.contact?.address?.state,
        "postalCode": settings.contact?.address?.zip,
        "addressCountry": "US"
      },
      "telephone": settings.contact?.phone,
      "priceRange": "$$"
    },
    "description": service.description || service.excerpt || service.title,
    "areaServed": {
      "@type": "State",
      "name": settings.contact?.address?.state || "NJ"
    },
    "url": url,
    "image": service.image ? {
      "@type": "ImageObject",
      "url": service.image.startsWith('http') ? service.image : `${settings.siteUrl}${service.image}`
    } : undefined
  };
}

