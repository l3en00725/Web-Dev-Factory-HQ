/**
 * SEO Content Generator
 * Generates unique, keyword-optimized content for location×service matrix pages
 * Implements 40% content differentiation per Sonnet SEO Specification
 * 
 * Based on logic from:
 * - .cursor/agents/factory/keyword_research_agent.yaml
 * - .cursor/agents/factory/seo_copy_agent.yaml
 */

import type { Service, Location } from '../types';

// Keyword modifiers for title variation (20% unique)
const TITLE_MODIFIERS = [
  'Expert',
  'Professional',
  'Top-Rated',
  'Local',
  'Trusted',
  'Reliable',
  'Affordable',
  'Quality',
];

// H1 templates with location-specific variations (40% unique)
const H1_TEMPLATES = [
  '{modifier} {service} in {town}',
  '{service} Services for {town} Properties',
  '{town} {service} Specialists',
  'Professional {service} Serving {town}, NJ',
  '{service} Experts for {town} Homeowners',
  '{modifier} {service} for {town} Residents',
];

// Intro paragraph templates with contextual variations
const INTRO_TEMPLATES = [
  `Looking for {modifier_lower} {service_lower} in {town}? Blue Lawns provides comprehensive {service_lower} services tailored to the unique needs of {town} properties. Our licensed team understands the {context} challenges and delivers results that last.`,
  `{town} homeowners trust Blue Lawns for {modifier_lower} {service_lower}. We combine years of local experience with proven techniques to deliver {service_lower} that enhances your property's beauty and value. Serving {town} since 2010.`,
  `Transform your {town} property with {modifier_lower} {service_lower} from Blue Lawns. Our team specializes in {context} {service_lower}, delivering professional results for residential and commercial properties throughout {town}, NJ.`,
  `Blue Lawns brings {modifier_lower} {service_lower} to {town} homeowners who demand excellence. Our comprehensive approach ensures your property receives the care it deserves, with attention to every detail. Licensed, insured, and satisfaction guaranteed.`,
];

// Service-specific context modifiers for geographic relevance
const SERVICE_CONTEXTS: Record<string, string[]> = {
  'landscape-maintenance': ['coastal', 'salt-tolerant', 'weather-resistant', 'year-round'],
  'landscaping': ['coastal', 'native plant', 'low-maintenance', 'sustainable'],
  'hardscaping': ['durable', 'weather-resistant', 'custom-designed', 'premium'],
  'landscape-lighting': ['energy-efficient', 'security-enhancing', 'architectural', 'low-voltage'],
  'pool-service': ['crystal-clear', 'maintenance-free', 'chemical-balanced', 'summer-ready'],
  'commercial-services': ['professional', 'maintenance-free', 'reliable', 'contract-based'],
  'lawn-care': ['weed-free', 'fertilization', 'thick and green', 'disease-resistant'],
  'seasonal-cleanup': ['spring', 'fall', 'debris removal', 'property preparation'],
  'power-washing': ['pressure washing', 'mold removal', 'exterior cleaning', 'surface restoration'],
  'fencing': ['privacy', 'security', 'vinyl or wood', 'property boundary'],
};

// Meta description templates (120-160 chars)
const META_DESC_TEMPLATES = [
  'Expert {service_lower} in {town}, NJ. Licensed, insured, and trusted by {town} homeowners. Free estimates. Call 609-425-2954 today.',
  'Professional {service_lower} for {town} properties. {modifier} service, guaranteed results. Serving Cape May County since 2010. Get a free quote.',
  '{service} services in {town}, NJ by Blue Lawns. {context_cap} solutions for residential and commercial properties. Licensed & insured.',
];

/**
 * Hash function to deterministically select template variants
 * Ensures same location+service always gets same variant (consistency)
 * But different combinations get different variants (uniqueness)
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Select template based on hash (deterministic)
 */
function selectTemplate<T>(templates: T[], seed: string): T {
  const hash = hashString(seed);
  return templates[hash % templates.length];
}

/**
 * Generate meta title for location×service page
 * Format: "{Service} in {Town}, NJ | Blue Lawns"
 */
export function generateMetaTitle(service: Service, location: Location): string {
  const modifier = selectTemplate(TITLE_MODIFIERS, `${location.slug}-${service.slug}-title`);
  
  // 30-60 character constraint
  if (service.title.length + location.town.length > 30) {
    // Short format
    return `${service.title} in ${location.town}, NJ | Blue Lawns`;
  } else {
    // Long format with modifier
    return `${modifier} ${service.title} in ${location.town}, NJ | Blue Lawns`;
  }
}

/**
 * Generate meta description for location×service page
 * 120-160 characters with location-modified keywords
 */
export function generateMetaDescription(service: Service, location: Location): string {
  const modifier = selectTemplate(TITLE_MODIFIERS, `${location.slug}-${service.slug}-modifier`);
  const context = selectTemplate(SERVICE_CONTEXTS[service.slug] || ['professional'], `${location.slug}-${service.slug}-context`);
  const template = selectTemplate(META_DESC_TEMPLATES, `${location.slug}-${service.slug}-desc`);
  
  let description = template
    .replaceAll('{service_lower}', service.title.toLowerCase())
    .replaceAll('{service}', service.title)
    .replaceAll('{town}', location.town)
    .replaceAll('{modifier}', modifier.toLowerCase())
    .replaceAll('{context_cap}', context.charAt(0).toUpperCase() + context.slice(1));
  
  // Ensure 120-160 chars
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }
  
  return description;
}

/**
 * Generate H1 tag for location×service page
 * Location-modified keyword with semantic variation
 */
export function generateH1(service: Service, location: Location): string {
  const modifier = selectTemplate(TITLE_MODIFIERS, `${location.slug}-${service.slug}-h1-mod`);
  const template = selectTemplate(H1_TEMPLATES, `${location.slug}-${service.slug}-h1`);
  
  return template
    .replaceAll('{modifier}', modifier)
    .replaceAll('{service}', service.title)
    .replaceAll('{town}', location.town);
}

/**
 * Generate intro paragraph for location×service page
 * 40% unique content with contextual variations
 */
export function generateIntroParagraph(service: Service, location: Location): string {
  const modifier = selectTemplate(TITLE_MODIFIERS, `${location.slug}-${service.slug}-intro-mod`);
  const context = selectTemplate(SERVICE_CONTEXTS[service.slug] || ['professional'], `${location.slug}-${service.slug}-intro-ctx`);
  const template = selectTemplate(INTRO_TEMPLATES, `${location.slug}-${service.slug}-intro`);
  
  return template
    .replaceAll('{modifier_lower}', modifier.toLowerCase())
    .replaceAll('{service_lower}', service.title.toLowerCase())
    .replaceAll('{service}', service.title)
    .replaceAll('{town}', location.town)
    .replaceAll('{context}', context);
}

/**
 * Generate location-specific call-out text
 * Adds authentic local touch
 */
export function generateLocalCallout(service: Service, location: Location): string {
  const callouts = [
    `Proudly serving ${location.town} homeowners since 2010.`,
    `${location.town} residents trust Blue Lawns for ${service.title.toLowerCase()}.`,
    `Licensed and insured in ${location.town}, NJ.`,
    `Your neighbors in ${location.town} choose Blue Lawns.`,
    `${location.town}'s premier ${service.title.toLowerCase()} company.`,
  ];
  
  return selectTemplate(callouts, `${location.slug}-${service.slug}-callout`);
}

/**
 * Generate FAQ questions for location×service page
 * Service-specific with location context
 */
export function generateFAQs(service: Service, location: Location): Array<{ question: string; answer: string }> {
  // Generic location-modified FAQs
  const faqs = [
    {
      question: `How much does ${service.title.toLowerCase()} cost in ${location.town}?`,
      answer: `${service.title} costs vary based on property size, scope of work, and specific needs. Blue Lawns offers free estimates for all ${location.town} properties. Contact us at 609-425-2954 for a customized quote.`,
    },
    {
      question: `Do you offer ${service.title.toLowerCase()} in ${location.town} year-round?`,
      answer: `Yes! Blue Lawns provides ${service.title.toLowerCase()} services to ${location.town} customers throughout the year. Our team is experienced with Cape May County's climate and seasonal requirements.`,
    },
    {
      question: `Are you licensed and insured in ${location.town}, NJ?`,
      answer: `Absolutely. Blue Lawns is fully licensed, insured, and bonded to operate in ${location.town} and throughout Cape May County. Your property and our team are always protected.`,
    },
  ];
  
  return faqs;
}

/**
 * Generate breadcrumb items for location×service page
 */
export function generateBreadcrumbs(service: Service, location: Location): Array<{ name: string; url: string }> {
  return [
    { name: 'Home', url: '/' },
    { name: 'Service Areas', url: '/locations' },
    { name: location.town, url: `/locations/${location.slug}` },
    { name: service.title, url: `/locations/${location.slug}/${service.slug}` },
  ];
}

/**
 * Generate SEO keywords for location×service page
 * Location-modified primary + secondary keywords
 */
export function generateKeywords(service: Service, location: Location): string[] {
  const baseKeywords = [
    `${service.title.toLowerCase()} ${location.town}`,
    `${service.title.toLowerCase()} near me`,
    `${location.town} ${service.title.toLowerCase()}`,
    `${service.title.toLowerCase()} Cape May County`,
    `${location.town} NJ ${service.title.toLowerCase()}`,
  ];
  
  // Add service-specific keywords
  const serviceKeywords = SERVICE_CONTEXTS[service.slug] || [];
  const contextKeywords = serviceKeywords.map(
    (context) => `${context} ${service.title.toLowerCase()} ${location.town}`
  );
  
  return [...baseKeywords, ...contextKeywords];
}

/**
 * Complete SEO package for location×service page
 */
export function generateLocationServiceSEO(service: Service, location: Location) {
  return {
    title: generateMetaTitle(service, location),
    description: generateMetaDescription(service, location),
    h1: generateH1(service, location),
    introParagraph: generateIntroParagraph(service, location),
    localCallout: generateLocalCallout(service, location),
    faqs: generateFAQs(service, location),
    breadcrumbs: generateBreadcrumbs(service, location),
    keywords: generateKeywords(service, location),
  };
}

