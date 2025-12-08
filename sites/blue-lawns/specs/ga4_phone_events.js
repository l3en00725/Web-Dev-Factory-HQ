/**
 * GA4 Click-to-Call Tracking Snippets
 * Implementation Guide for Blue Lawns
 */

// 1. Initialize GA4 (if not already present in layouts/Base.astro)
// <script async src="https://www.googletagmanager.com/gtag/js?id=G-MSCK89LLJ1"></script>
// <script>
//   window.dataLayer = window.dataLayer || [];
//   function gtag(){dataLayer.push(arguments);}
//   gtag('js', new Date());
//   gtag('config', 'G-MSCK89LLJ1');
// </script>

/**
 * 2. Event Helper Function
 * Add this to a global script or utility file
 */
function trackPhoneClick(location) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'phone_click', {
      'event_category': 'lead',
      'event_label': location, // e.g., 'header', 'footer', 'hero_cta'
      'value': 1
    });
  } else {
    console.warn('GA4 not initialized');
  }
}

/**
 * 3. Implementation Examples
 * Add these event listeners to your Astro components
 */

// Header.astro
// <a href="tel:6094252954" onclick="trackPhoneClick('header_nav')">609-425-2954</a>

// Footer.astro
// <a href="tel:6094252954" onclick="trackPhoneClick('footer_link')">609-425-2954</a>

// Hero.astro (Mobile Call Button)
// <a href="tel:6094252954" class="btn-primary" onclick="trackPhoneClick('hero_cta_mobile')">Call Now</a>

// ContactSection.astro
// <a href="tel:6094252954" onclick="trackPhoneClick('contact_section')">609-425-2954</a>

/**
 * 4. Recommended Data Layer push for GTM users
 * (Optional alternative to direct gtag)
 */
/*
function trackPhoneClickGTM(location) {
  window.dataLayer.push({
    'event': 'phone_click',
    'location': location
  });
}
*/



