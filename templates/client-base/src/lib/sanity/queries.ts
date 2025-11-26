// templates/client-base/src/lib/sanity/queries.ts
// Central GROQ queries and thin wrappers for Web-Dev-Factory templates

import groq from "groq";
import {client} from "./client";

// Homepage
const HOMEPAGE_QUERY = groq`
  *[_type == "homepage"][0]{
    _id,
    title,
    slug,
    pageBuilder[],
    seo
  }
`;

export async function getHomepage() {
  return client.fetch(HOMEPAGE_QUERY);
}

// Services
const SERVICES_QUERY = groq`
  *[_type == "service" && defined(slug.current)] | order(title asc){
    _id,
    title,
    slug,
    excerpt,
    seo,
    geo,
    pageBuilder[]
  }
`;

export async function getServices() {
  return client.fetch(SERVICES_QUERY);
}

// Locations
const LOCATIONS_QUERY = groq`
  *[_type == "location" && defined(slug.current)] | order(title asc){
    _id,
    title,
    slug,
    geo,
    seo,
    pageBuilder[]
  }
`;

export async function getLocations() {
  return client.fetch(LOCATIONS_QUERY);
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
    socialLinks[]
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
  *[_type == "navItem"] | order(orderRank asc){
    _id,
    title,
    href,
    type,
    reference->{
      _type,
      slug
    }
  }
`;

export async function getNavItems() {
  return client.fetch(NAV_ITEMS_QUERY);
}


