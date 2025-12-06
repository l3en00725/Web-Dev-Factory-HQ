// templates/client-base/src/lib/sanity/queries.ts
// Central GROQ queries and thin wrappers for Web-Dev-Factory templates

import groq from "groq";
import {client} from "./client";

// Type definitions for Sanity documents
export interface Location {
  _id: string;
  title: string;
  slug: { current: string };
  headline?: string;
  description?: string;
  image?: any;
  geo?: {
    city?: string;
    state?: string;
    zip?: string;
    lat?: number;
    lng?: number;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    ogImage?: any;
  };
  pageBuilder?: any[];
}

export interface Service {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  image?: any;
  isPrimaryService?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    ogImage?: any;
  };
  pageBuilder?: any[];
}

// Homepage
const HOMEPAGE_QUERY = groq`
  *[_type == "homepage"][0]{
    _id,
    title,
    slug,
    pageBuilder[]{
      ...,
      _type == "servicesGrid" => {
        ...,
        services[]->{
          _id,
          title,
          slug,
          excerpt,
          image
        }
      }
    },
    seo,
    "selectedTemplate": *[_type == "settings"][0].selectedTemplate
  }
`;

export async function getHomepage() {
  return client.fetch(HOMEPAGE_QUERY);
}

// Services
const SERVICES_QUERY = groq`
  *[_type == "service" && defined(slug.current)] | order(title asc){
    _id,
    _updatedAt,
    title,
    slug,
    excerpt,
    image,
    seo,
    geo,
    pageBuilder[]{
      ...,
      _type == "servicesGrid" => {
        ...,
        services[]->{
          _id,
          title,
          slug,
          excerpt,
          image
        }
      }
    }
  }
`;

export async function getServices() {
  return client.fetch(SERVICES_QUERY);
}

// Locations
const LOCATIONS_QUERY = groq`
  *[_type == "location" && defined(slug.current)] | order(title asc){
    _id,
    _updatedAt,
    title,
    slug,
    headline,
    description,
    image,
    geo,
    seo,
    pageBuilder[]{
      ...,
      _type == "servicesGrid" => {
        ...,
        services[]->{
          _id,
          title,
          slug,
          excerpt,
          image
        }
      }
    }
  }
`;

export async function getLocations() {
  return client.fetch(LOCATIONS_QUERY);
}

// Single location by slug
const LOCATION_BY_SLUG_QUERY = groq`
  *[_type == "location" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    headline,
    description,
    image,
    geo,
    seo,
    services[]->{
      _id,
      title,
      slug,
      excerpt,
      image
    },
    pageBuilder[]{
      ...,
      _type == "servicesGrid" => {
        ...,
        services[]->{
          _id,
          title,
          slug,
          excerpt,
          image
        }
      }
    }
  }
`;

export async function getLocationBySlug(slug: string) {
  return client.fetch(LOCATION_BY_SLUG_QUERY, { slug });
}

// Settings (singleton)
const SETTINGS_QUERY = groq`
  *[_type == "settings"][0]{
    _id,
    title,
    logo,
    contactEmail,
    contactPhone,
    footerLinks[],
    socialLinks[],
    selectedTemplate,
    formDestination{
      destinationType,
      endpointUrl,
      toEmail,
      providerName,
      customEmbedCode
    }
  }
`;

export async function getSettings() {
  return client.fetch(SETTINGS_QUERY);
}

// Global SEO (singleton)
const GLOBAL_SEO_QUERY = groq`
  *[_type == "globalSEO"][0]{
    _id,
    title,
    description,
    defaultSeo,
    ogTemplate
  }
`;

export async function getGlobalSEO() {
  return client.fetch(GLOBAL_SEO_QUERY);
}

// Navigation
const NAV_ITEMS_QUERY = groq`
  *[_type == "navItem"] | order(order asc){
    _id,
    label,
    href,
    order,
    isExternal,
    highlight,
    children[]{
      label,
      href,
      description,
      icon
    },
    showInFooter,
    showInMobile
  }
`;

export async function getNavItems() {
  return client.fetch(NAV_ITEMS_QUERY);
}


