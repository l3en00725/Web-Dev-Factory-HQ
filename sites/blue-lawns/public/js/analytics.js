/**
 * Blue Lawns Analytics Helper
 * Universal GA4 event tracking for forms, CTAs, navigation, and conversions
 * 
 * @version 1.0.0
 */

(function() {
  'use strict';

  // Initialize dataLayer if not present
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  /**
   * Global event tracker
   * @param {string} name - Event name (e.g., "lead_submission", "cta_click")
   * @param {object} params - Additional event parameters
   */
  window.trackEvent = function(name, params = {}) {
    if (!window.dataLayer) window.dataLayer = [];
    
    window.dataLayer.push({
      event: name,
      ...params,
      page_location: window.location.pathname,
      timestamp: new Date().toISOString()
    });

    // Console log in development (not in production)
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
      console.log('[Analytics]', name, params);
    }
  };

  /**
   * Track form submissions
   * Attaches to all forms with data-form="lead"
   */
  function initFormTracking() {
    const forms = document.querySelectorAll('form[data-form="lead"]');
    
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        const formId = this.id || this.getAttribute('name') || 'unknown';
        const formAction = this.action || window.location.href;
        
        window.trackEvent('lead_submission', {
          form_id: formId,
          form_action: formAction,
          form_method: this.method || 'POST'
        });
        
        // Note: Form will submit naturally via fetch/AJAX in form handler
        // This ensures event fires before navigation
      });
    });
  }

  /**
   * Track CTA button clicks
   * Attaches to all buttons/links with data-track="cta"
   */
  function initCTATracking() {
    const ctas = document.querySelectorAll('[data-track="cta"]');
    
    ctas.forEach(cta => {
      cta.addEventListener('click', function(e) {
        const ctaText = this.textContent?.trim() || this.getAttribute('aria-label') || 'Unknown CTA';
        const ctaHref = this.getAttribute('href') || this.getAttribute('data-href') || '';
        
        window.trackEvent('cta_click', {
          cta_text: ctaText,
          cta_href: ctaHref,
          cta_type: this.tagName.toLowerCase()
        });
      });
    });
  }

  /**
   * Track phone number clicks
   * Attaches to all tel: links
   */
  function initPhoneTracking() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    phoneLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const phoneNumber = this.getAttribute('href')?.replace('tel:', '') || 'unknown';
        
        window.trackEvent('phone_click', {
          phone_number: phoneNumber,
          link_text: this.textContent?.trim()
        });
      });
    });
  }

  /**
   * Track internal navigation
   * Attaches to all internal links (not external, not anchors)
   */
  function initNavTracking() {
    const navLinks = document.querySelectorAll('a[href^="/"], a[href^="./"]');
    
    navLinks.forEach(link => {
      // Skip if already tracking as CTA or phone
      if (link.hasAttribute('data-track') || link.getAttribute('href')?.startsWith('tel:')) {
        return;
      }
      
      link.addEventListener('click', function(e) {
        const linkHref = this.getAttribute('href') || '';
        const linkText = this.textContent?.trim() || 'Unknown Link';
        const linkLocation = this.closest('nav') ? 'navigation' : 
                           this.closest('header') ? 'header' : 
                           this.closest('footer') ? 'footer' : 'content';
        
        window.trackEvent('internal_nav', {
          link_href: linkHref,
          link_text: linkText,
          link_location: linkLocation
        });
      });
    });
  }

  /**
   * Track outbound links
   * Attaches to all external links
   */
  function initOutboundTracking() {
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    
    externalLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      
      // Skip if it's an internal link (same domain)
      if (href.includes(window.location.hostname)) {
        return;
      }
      
      link.addEventListener('click', function(e) {
        window.trackEvent('outbound_click', {
          link_href: href,
          link_text: this.textContent?.trim() || 'Unknown',
          link_domain: new URL(href).hostname
        });
      });
    });
  }

  /**
   * Track page views (for SPA-like behavior)
   */
  function trackPageView() {
    window.trackEvent('page_view', {
      page_title: document.title,
      page_path: window.location.pathname,
      page_referrer: document.referrer
    });
  }

  /**
   * Initialize all tracking on page load
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all tracking modules
    initFormTracking();
    initCTATracking();
    initPhoneTracking();
    initNavTracking();
    initOutboundTracking();
    
    // Track initial page view
    trackPageView();
    
    console.log('[Analytics] Tracking initialized');
  }

  // Auto-initialize
  init();

  // Re-initialize on page transitions (for Astro view transitions if enabled)
  document.addEventListener('astro:page-load', init);
})();

