// templates/client-base/src/lib/structured-data/LocalBusiness.ts
import type { Location } from '../sanity/queries';

export interface BusinessSettings {
  title: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  geo?: {
    lat: number;
    lng: number;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  hours?: {
    days: string;
    opens: string;
    closes: string;
  }[];
}

export function generateLocalBusinessSchema(
  settings: BusinessSettings,
  location?: Location,
  url?: string
) {
  // Use location-specific data if provided, otherwise fallback to global settings
  const name = location?.title 
    ? `${settings.title} - ${location.title}`
    : settings.title;

  const address = location?.geo ? {
    "@type": "PostalAddress",
    "streetAddress": "", // Locations typically don't have street addresses in this model
    "addressLocality": location.geo.city,
    "addressRegion": location.geo.state,
    "postalCode": location.geo.zip,
    "addressCountry": "US"
  } : {
    "@type": "PostalAddress",
    "streetAddress": settings.address?.street || "",
    "addressLocality": settings.address?.city,
    "addressRegion": settings.address?.state,
    "postalCode": settings.address?.zip,
    "addressCountry": settings.address?.country || "US"
  };

  const geo = location?.geo?.lat && location?.geo?.lng ? {
    "@type": "GeoCoordinates",
    "latitude": location.geo.lat,
    "longitude": location.geo.lng
  } : settings.geo ? {
    "@type": "GeoCoordinates",
    "latitude": settings.geo.lat,
    "longitude": settings.geo.lng
  } : undefined;

  const sameAs = [
    settings.social?.facebook,
    settings.social?.instagram,
    settings.social?.linkedin,
    settings.social?.twitter,
    settings.social?.youtube
  ].filter(Boolean);

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness", // Could be more specific like "LandscapingService" if available
    "name": name,
    "image": "", // TODO: Add default logo/image
    "@id": url,
    "url": url,
    "telephone": settings.contactPhone,
    "email": settings.contactEmail,
    "address": address,
    ...(geo && { "geo": geo }),
    ...(sameAs.length > 0 && { "sameAs": sameAs }),
    "priceRange": "$$", // Default
    "openingHoursSpecification": settings.hours?.map(h => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": h.days.split(',').map(d => d.trim()),
      "opens": h.opens,
      "closes": h.closes
    }))
  };

  return schema;
}

