// templates/client-base/src/lib/structured-data/Service.ts
import type { Service } from '../sanity/queries';

export function generateServiceSchema(service: Service, settings: any, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "provider": {
      "@type": "LocalBusiness",
      "name": settings.title,
      "image": "", // TODO: Add logo
      "address": {
        "@type": "PostalAddress",
        "addressLocality": settings.address?.city,
        "addressRegion": settings.address?.state,
        "postalCode": settings.address?.zip,
        "addressCountry": "US"
      },
      "telephone": settings.contactPhone,
      "priceRange": "$$"
    },
    "description": service.excerpt || service.title,
    "areaServed": {
      "@type": "State", // Can be refined to City list
      "name": settings.address?.state || "US"
    },
    "url": url,
    "image": service.image ? {
      "@type": "ImageObject",
      "url": service.image.asset?.url || service.image // Placeholder for URL resolution
    } : undefined
  };
}

