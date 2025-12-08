export interface SEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  type: 'primary' | 'secondary';
  description: string;
  fullDescription: string;
  icon: string;
  heroImage: string;
  galleryImages: string[];
  seo: SEO;
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
  heroImage: string;
}

