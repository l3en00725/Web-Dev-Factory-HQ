# AI Optimization Guide

How to make your Web-Dev-Factory-HQ sites discoverable and useful for AI search engines.

---

## Table of Contents

1. [Why AI Optimization Matters](#why-ai-optimization-matters)
2. [AI Crawler Configuration](#ai-crawler-configuration)
3. [FAQ Schema Implementation](#faq-schema-implementation)
4. [Semantic HTML Best Practices](#semantic-html-best-practices)
5. [Natural Language Content Guidelines](#natural-language-content-guidelines)
6. [Testing AI Discovery](#testing-ai-discovery)

---

## Why AI Optimization Matters

AI search engines and chatbots are becoming primary ways users discover businesses:

**AI Platforms:**
- ChatGPT (GPTBot crawler)
- Perplexity AI (PerplexityBot)
- Bing Chat (Microsoft)
- Google Bard (Googlebot)
- Claude (Claude-Web, Anthropic)

**User Behavior Shift:**
- Users ask questions in natural language
- AI provides direct answers with sources
- Businesses not optimized are invisible to AI

**Example Query:**
> "Find a reliable lawn care service in Burlington, VT"

**AI Response:**
> "I found XYZ Lawn Care in Burlington, VT. They offer weekly mowing, fertilization, and seasonal cleanup. Their service area covers Chittenden County..."

**How AI Found Them:**
- ✅ robots.txt allowed AI crawlers
- ✅ Schema included serviceArea
- ✅ FAQ answered common questions
- ✅ Natural language descriptions

---

## AI Crawler Configuration

### robots.txt Setup

**Always allow AI crawlers in your `robots.txt`:**

```
# AI Crawlers - Allow access
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Omgilibot
Allow: /

User-agent: Bytespider
Allow: /
```

**Why Allow?**
- AI crawlers respect robots.txt
- Blocking = invisible to AI platforms
- No cost to allow (same as Google/Bing)

**Already included in Web-Dev-Factory-HQ template:**
- `templates/client-base/public/robots.txt`

### Verification

Check your robots.txt is live:
```bash
curl https://yourdomain.com/robots.txt
```

Test crawler access:
```bash
# Simulate AI crawler
curl -A "GPTBot" https://yourdomain.com
```

---

## FAQ Schema Implementation

### Why FAQ Schema?

AI platforms love FAQs because they:
- Answer user questions directly
- Use natural language
- Provide structured Q&A format
- Include keywords naturally

### Schema Format

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What services do you offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer residential lawn mowing, fertilization, weed control, seasonal cleanup, and landscape maintenance throughout Chittenden County, Vermont."
      }
    },
    {
      "@type": "Question",
      "name": "What areas do you serve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We serve Burlington, Winooski, Essex, South Burlington, and surrounding areas in Chittenden County, Vermont."
      }
    },
    {
      "@type": "Question",
      "name": "How much does lawn mowing cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Residential lawn mowing starts at $35 per visit for standard-sized lawns. Pricing varies based on lawn size, frequency, and additional services. Contact us for a free quote."
      }
    }
  ]
}
```

### Creating FAQ Page in Astro

**File:** `src/pages/faq.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const faqs = [
  {
    question: "What services do you offer?",
    answer: "We offer residential lawn mowing, fertilization, weed control..."
  },
  {
    question: "What areas do you serve?",
    answer: "We serve Burlington, Winooski, Essex..."
  },
  // Add more FAQs
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};
---

<BaseLayout title="Frequently Asked Questions">
  <!-- FAQ Schema -->
  <script type="application/ld+json" set:html={JSON.stringify(faqSchema)} />
  
  <h1>Frequently Asked Questions</h1>
  
  {faqs.map(faq => (
    <div class="faq-item">
      <h2>{faq.question}</h2>
      <p>{faq.answer}</p>
    </div>
  ))}
</BaseLayout>
```

### FAQ Best Practices

**Good FAQs:**
- ✅ Answer actual customer questions
- ✅ Use natural language
- ✅ Include location keywords
- ✅ Mention pricing (if comfortable)
- ✅ Specify service area
- ✅ Address common objections

**Avoid:**
- ❌ Keyword stuffing
- ❌ Marketing fluff
- ❌ Generic answers
- ❌ Too technical jargon

### Recommended FAQ Topics

**For Local Businesses:**
1. What services do you offer?
2. What areas do you serve?
3. How much does it cost?
4. Are you licensed/insured?
5. How do I get a quote?
6. What's your availability?
7. Do you offer emergency services?
8. What payment methods do you accept?

**For Educational Institutions:**
1. What programs do you offer?
2. How long are the programs?
3. What are the admission requirements?
4. How much does tuition cost?
5. Do you offer financial aid?
6. What's your job placement rate?
7. Are you accredited?
8. Can I visit the campus?

---

## Semantic HTML Best Practices

### Why Semantic HTML?

AI platforms parse HTML structure to understand content hierarchy and relationships.

### Core Semantic Tags

**Use these consistently:**

```html
<!-- Page Structure -->
<header>
  <nav>
    <!-- Navigation links -->
  </nav>
</header>

<main>
  <article>
    <h1>Main Title</h1>
    <section>
      <h2>Section Title</h2>
      <p>Content...</p>
    </section>
  </article>
</main>

<aside>
  <!-- Related content, sidebar -->
</aside>

<footer>
  <!-- Footer content -->
</footer>
```

### Heading Hierarchy

**Always follow proper heading order:**

```html
✅ Good:
<h1>Main Service Title</h1>
  <h2>Residential Services</h2>
    <h3>Lawn Mowing</h3>
    <h3>Fertilization</h3>
  <h2>Commercial Services</h2>
    <h3>Property Maintenance</h3>

❌ Bad:
<h1>Main Service Title</h1>
  <h3>Residential Services</h3>  <!-- Skipped H2 -->
    <h2>Lawn Mowing</h2>         <!-- Wrong order -->
```

**Why It Matters:**
- AI understands content structure
- Helps identify main topics vs. subtopics
- Improves content extraction accuracy

### Lists for Services

**Use semantic lists:**

```html
<h2>Our Services</h2>
<ul>
  <li>Lawn Mowing</li>
  <li>Fertilization</li>
  <li>Weed Control</li>
  <li>Seasonal Cleanup</li>
</ul>
```

AI recognizes this as a service list and can extract each item.

### Contact Information

**Use address markup:**

```html
<address>
  <strong>XYZ Lawn Care</strong><br>
  123 Main Street<br>
  Burlington, VT 05401<br>
  Phone: <a href="tel:+18025551234">(802) 555-1234</a><br>
  Email: <a href="mailto:info@xyzlawn.com">info@xyzlawn.com</a>
</address>
```

---

## Natural Language Content Guidelines

### Write for Humans, Optimize for AI

AI platforms extract content that answers user questions directly.

### Content Structure

**Question-Answer Format:**

```html
<section>
  <h2>How do we handle billing?</h2>
  <p>
    We send invoices after each service via email. 
    Payment is due within 10 days and can be made via 
    credit card, check, or bank transfer. We also offer 
    automatic monthly billing for recurring services.
  </p>
</section>
```

**Why This Works:**
- Heading is the question
- Paragraph is the answer
- Natural language
- Specific details

### Location Mentions

**Always include location naturally:**

```
❌ Bad:
"We provide lawn care services."

✅ Good:
"We provide lawn care services throughout Burlington, 
Vermont and surrounding Chittenden County communities."
```

**Benefits:**
- AI understands service area
- Appears in local searches
- Helps AI recommend to local users

### Service Descriptions

**Be specific and descriptive:**

```
❌ Bad:
"Full-service lawn care"

✅ Good:
"Our lawn care includes weekly mowing with edging and 
trimming, seasonal fertilization, weed control, aeration, 
and fall/spring cleanup for residential properties."
```

### Pricing Transparency

**If comfortable, include pricing:**

```
✅ Good:
"Lawn mowing starts at $35 per visit for standard residential 
lawns up to 5,000 square feet. Larger properties are quoted 
based on square footage and complexity."
```

**Benefits:**
- Answers user's question immediately
- Reduces tire-kicker calls
- AI can provide pricing info
- Builds trust

**If Not Comfortable:**
```
"Pricing varies based on property size and services needed. 
Contact us for a free, no-obligation quote."
```

### Avoid

**Don't do these:**

❌ **Keyword stuffing:**
"Burlington VT lawn care, lawn mowing Burlington, Burlington landscaping..."

❌ **Marketing speak:**
"We're the #1 premier award-winning best lawn care..."

❌ **Vague descriptions:**
"Quality services at affordable prices"

❌ **Complex jargon:**
"Utilizing advanced turf management methodologies..."

---

## Testing AI Discovery

### ChatGPT Test

1. Go to: [chat.openai.com](https://chat.openai.com)
2. Ask a question your customers would ask:
   ```
   "Find a lawn care service in Burlington, Vermont"
   ```
3. Check if your business appears
4. Review what information ChatGPT extracts

**What to Look For:**
- Does it mention your business name?
- Is the information accurate?
- Does it include your services?
- Is your contact info correct?

### Perplexity AI Test

1. Go to: [perplexity.ai](https://www.perplexity.ai)
2. Ask similar questions
3. Check citations - does it link to your site?

**Perplexity shows sources:**
- Your site should appear as a citation
- Click through to verify it extracted correct info

### Bing Chat Test

1. Open Microsoft Edge
2. Click Bing Chat icon
3. Ask questions about your business
4. Check if it finds your site

### Google SGE (Search Generative Experience)

1. Google search with question format
2. Check if AI overview includes your business
3. Currently rolling out - may not be available everywhere

### What Questions to Test

**For Local Services:**
- "Find a [service] in [city]"
- "Who does [service] in [area]?"
- "Best [service] near me"
- "How much does [service] cost in [city]?"

**For Educational Institutions:**
- "Beauty schools in Vermont"
- "How long is a cosmetology program?"
- "Accredited massage therapy schools near Burlington"

### If Your Business Doesn't Appear

**Check:**
1. Is site indexed by Google?
   ```
   site:yourdomain.com
   ```
2. Does robots.txt allow AI crawlers?
3. Is schema markup present and valid?
4. Is content answering questions?
5. Is FAQ page created?

**Timeline:**
- Can take 2-4 weeks after launch
- AI platforms need to crawl and process
- Content quality matters

---

## AI Optimization Checklist

### Configuration
- [ ] robots.txt allows all AI crawlers
- [ ] Schema markup present and validated
- [ ] Sitemap includes all pages
- [ ] No noindex tags on important pages

### Content Structure
- [ ] FAQ page created with schema
- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] Semantic HTML used throughout
- [ ] Services listed clearly
- [ ] Location mentioned in multiple places

### Content Quality
- [ ] Natural language (not keyword-stuffed)
- [ ] Answers common customer questions
- [ ] Includes pricing or pricing guidance
- [ ] Service area clearly defined
- [ ] Contact information visible

### Testing
- [ ] Tested in ChatGPT
- [ ] Tested in Perplexity AI
- [ ] Tested in Bing Chat
- [ ] Business appears in results
- [ ] Information extracted is accurate

### Monitoring
- [ ] Check AI platforms monthly
- [ ] Update FAQ based on customer questions
- [ ] Refresh content quarterly
- [ ] Monitor for accuracy

---

## Quick Wins

**Immediate Actions:**

1. **Add FAQ Page** (30 min)
   - List 8-10 common questions
   - Provide detailed answers
   - Add FAQ schema

2. **Verify robots.txt** (5 min)
   - Check all AI crawlers allowed
   - Update if needed

3. **Review Headings** (15 min)
   - Ensure proper H1 → H2 → H3 order
   - Make headings descriptive

4. **Location Audit** (10 min)
   - Search for location mentions
   - Add to homepage, about, contact
   - Include in service descriptions

5. **Test Discovery** (20 min)
   - Run ChatGPT test
   - Run Perplexity test
   - Document what AI finds

---

**Resources:**

- [AI Readiness Checker](../scripts/check-ai-readiness.mjs)
- [FAQ Schema Generator](https://technicalseo.com/tools/schema-markup-generator/)
- [Schema.org FAQPage](https://schema.org/FAQPage)
- [ChatGPT](https://chat.openai.com)
- [Perplexity AI](https://www.perplexity.ai)

