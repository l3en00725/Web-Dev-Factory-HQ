// /sanity/schema/index.ts
// Central export for all Sanity schema types
// Blueprint: Import this in sanity.config.ts

// ============================================
// OBJECT TYPES
// ============================================
import seo from './objects/seo';
import geo from './objects/geo';
import socialLink from './objects/socialLink';
import footerLink from './objects/footerLink';
import ogTemplate from './objects/ogTemplate';

// ============================================
// SECTION TYPES (Page Builder Modules)
// ============================================
import hero from './sections/hero';
import features from './sections/features';
import servicesGrid from './sections/servicesGrid';
import imageBanner from './sections/imageBanner';
import contactSection from './sections/contactSection';
import callToAction from './sections/callToAction';
import gallery from './sections/gallery';
import pricing from './sections/pricing';
import faq from './sections/faq';
import contentBlock from './sections/contentBlock';
import stats from './sections/stats';

// ============================================
// DOCUMENT TYPES
// ============================================
import homepage from './documents/homepage';
import service from './documents/service';
import location from './documents/location';
import testimonial from './documents/testimonial';
import settings from './documents/settings';
import navItem from './documents/navItem';
import globalSEO from './documents/globalSEO';
import lead from './documents/lead';

// ============================================
// EXPORT ALL SCHEMA TYPES
// ============================================
export const schemaTypes = [
  // Objects (must be registered before documents that use them)
  seo,
  geo,
  socialLink,
  footerLink,
   ogTemplate,

  // Sections (page builder modules)
  hero,
  features,
  servicesGrid,
  imageBanner,
  contactSection,
  callToAction,
  gallery,
  pricing,
  faq,
  contentBlock,
  stats,

  // Documents
  homepage,
  service,
  location,
  testimonial,
  settings,
  navItem,
  globalSEO,
  lead,
];

// Default export for convenience
export default schemaTypes;
