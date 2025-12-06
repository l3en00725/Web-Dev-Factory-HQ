// LocalBusiness structured data for static site

// Location from JSON data
export interface Location {
  title: string;
  slug?: string;
  city: string;
  state: string;
  zip?: string;
  description?: string;
}

// Settings from JSON
export interface BusinessSettings {
  title: string;
  siteUrl?: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  social?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
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

  const address = location ? {
    "@type": "PostalAddress",
    "addressLocality": location.city,
    "addressRegion": location.state,
    "postalCode": location.zip,
    "addressCountry": "US"
  } : {
    "@type": "PostalAddress",
    "streetAddress": settings.contact?.address?.street || "",
    "addressLocality": settings.contact?.address?.city,
    "addressRegion": settings.contact?.address?.state,
    "postalCode": settings.contact?.address?.zip,
    "addressCountry": "US"
  };

  const sameAs = [
    settings.social?.facebook,
    settings.social?.instagram,
    settings.social?.linkedin,
    settings.social?.twitter,
    settings.social?.youtube
  ].filter(Boolean);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": name,
    "image": settings.siteUrl ? `${settings.siteUrl}/images/logo.svg` : "",
    "@id": url,
    "url": url,
    "telephone": settings.contact?.phone,
    "email": settings.contact?.email,
    "address": address,
    "priceRange": "$$"
  };

  if (sameAs.length > 0) {
    schema.sameAs = sameAs;
  }

  return schema;
}

