# Templates Guide

Complete documentation for all Web-Dev Factory HQ templates.

---

## Table of Contents

1. [Contact Form Templates](#contact-form-templates)
2. [Client Base Template](#client-base-template)
3. [Creating Custom Templates](#creating-custom-templates)

---

## Contact Form Templates

**Location:** `templates/contact-forms/`

### Overview

Three pre-built contact form integrations ready to install:

| Template | Best For | Monthly Cost | Setup Time | Difficulty |
|----------|----------|--------------|------------|------------|
| **jobber-zapier** | Jobber users | $30 | 5 min | Easy |
| **email-resend** | No CRM needed | $0* | 10 min | Easy |
| **generic** | Placeholder | $0 | 2 min | Easy |

*Free tier: 100 emails/day

---

### 1. Jobber-Zapier Template

**Location:** `templates/contact-forms/jobber-zapier/`

**Files:**
```
jobber-zapier/
├── ContactForm.astro      # Form component
├── submit-form.js         # API route handler
└── README.md             # Setup instructions
```

**When to use:**
✅ Client uses Jobber for service management  
✅ Client can afford $30/month for Zapier  
✅ Want zero maintenance (OAuth handled by Zapier)  
✅ May need additional automations later

**How it works:**
1. User submits form on website
2. API route receives data
3. Data sent to Zapier webhook
4. Zapier forwards to Jobber (creates client request)
5. Backup email sent via Resend

**Installation:**
```bash
bun run install-form --site [client-name] --type jobber-zapier
```

**Interactive prompts:**
- Zapier webhook URL (from Zapier dashboard)
- Resend API key (from resend.com)
- Contact email address

**Environment variables:**
```bash
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/xxxxx/xxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=owner@clientwebsite.com
```

**Zapier setup:**
1. Create Zap: Webhooks by Zapier → Catch Hook
2. Copy webhook URL
3. Add Jobber action → Create Client Request
4. Connect Jobber account (OAuth handled by Zapier)
5. Map fields:
   - First Name: Split from `name` field
   - Last Name: Split from `name` field  
   - Email: `email` field
   - Phone: `phone` field
   - Request details: `service_type` + `message`

**Testing:**
```bash
# Local test
curl -X POST http://localhost:4321/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"555-1234","service_type":"Lawn mowing","message":"Test"}'

# Check Zapier task history
# Visit: https://zapier.com/app/history
```

**Email template includes:**
- All form data
- Quick Actions section:
  - Click-to-call link
  - Click-to-email reply link
  - Service requested
- Timestamp
- Zapier submission status

**Pros:**
- OAuth handled automatically
- Visual workflow editor
- Easy for client to modify
- Very reliable (99.9% uptime)
- Can add extra automations

**Cons:**
- $30/month ongoing cost
- Slight delay (~200-300ms)

---

### 2. Email-Resend Template

**Location:** `templates/contact-forms/email-resend/`

**Files:**
```
email-resend/
├── ContactForm.astro      # Form component
├── submit-form.js         # API route handler
└── README.md             # Setup instructions
```

**When to use:**
✅ Client doesn't use any CRM  
✅ Just needs email notifications  
✅ Simple lead collection  
✅ Budget-conscious

**How it works:**
1. User submits form on website
2. API route receives data
3. Email sent via Resend API
4. Owner receives email notification
5. Manual follow-up with lead

**Installation:**
```bash
bun run install-form --site [client-name] --type email-resend
```

**Interactive prompts:**
- Resend API key
- Contact email address

**Environment variables:**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
CONTACT_EMAIL=owner@clientwebsite.com
```

**Resend setup:**
1. Sign up: https://resend.com
2. Verify domain (or use resend.dev for testing)
3. Create API key
4. Add to environment variables

**Testing:**
```bash
# Test locally
curl -X POST http://localhost:4321/api/submit-form \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"555-1234"}'

# Check email inbox
```

**Email template includes:**
- All form data
- Quick Actions section
- Timestamp
- Clean HTML formatting

**Pros:**
- 100 emails/day free
- Clean, reliable service
- Easy API
- No ongoing cost

**Cons:**
- No CRM integration
- Manual lead follow-up
- Limited to email only

---

### 3. Generic Template

**Location:** `templates/contact-forms/generic/`

**Files:**
```
generic/
├── ContactForm.astro      # Form component
├── submit-form.js         # API route handler (logs to console)
└── README.md             # Setup instructions
```

**When to use:**
✅ Building MVP  
✅ Client undecided on CRM  
✅ Will add integration later  
✅ Testing/development

**How it works:**
1. User submits form
2. API route logs data to console
3. Returns success message
4. **No actual integration yet**

**Installation:**
```bash
bun run install-form --site [client-name] --type generic
```

**No credentials needed** - it's just a placeholder

**Customization:**
Add custom webhook or integration to `submit-form.js`:
```javascript
// Example: Custom webhook
const response = await fetch('https://your-webhook-url.com/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

**Pros:**
- No setup required
- Form works immediately
- Easy to customize later

**Cons:**
- Doesn't actually send data anywhere
- Requires custom integration

---

## Contact Form Features

### Common to All Templates

**Form fields:**
- Name (required)
- Email (required)
- Phone (required, formatted: 555-555-5555)
- Service type (dropdown, optional)
- Message (textarea, optional)

**UI features:**
- Loading state during submission
- Success/error messages
- Form validation
- Responsive design (mobile-friendly)
- Tailwind styling
- Accessible (ARIA labels)

**Security:**
- Server-side validation
- Rate limiting (via Vercel)
- CSRF protection (via API route)
- No client-side API keys

**Analytics:**
- Google Analytics event tracking (gtag)
- Meta Pixel event tracking (fbq)
- Conversion tracking ready

**Customization:**
Add/remove fields in `ContactForm.astro`:
```astro
<div>
  <label for="custom_field">Custom Field</label>
  <input
    type="text"
    id="custom_field"
    name="custom_field"
    class="w-full px-4 py-3 border rounded-lg"
  />
</div>
```

Update API route in `submit-form.js` to handle new fields:
```javascript
const data = await request.json();
// Access new field: data.custom_field
```

---

## Client Base Template

**Location:** `templates/client-base/`

### Overview

The foundation for every new Web-Dev Factory site.

**Copied when running:**
```bash
bun run new-site [client-name]
```

### Structure

```
client-base/
├── public/
│   └── robots.txt              # AI crawler-friendly
├── src/
│   ├── layouts/
│   │   └── Base.astro          # Base HTML layout
│   ├── pages/
│   │   ├── index.astro         # Homepage template
│   │   ├── services.astro      # Services page template
│   │   ├── about.astro         # About page template
│   │   └── contact.astro       # Contact page template
│   └── components/
│       ├── Header.astro        # Site header
│       └── Footer.astro        # Site footer
├── astro.config.mjs            # Astro configuration
├── tailwind.config.mjs         # Tailwind configuration
├── package.json                # Dependencies
└── .gitignore                  # Git ignore rules
```

### Key Files

**public/robots.txt**
- Allows all search engines
- Includes AI crawler permissions (GPTBot, CCBot, etc.)
- Sitemap reference

**src/layouts/Base.astro**
- HTML structure
- Meta tags (title, description, OG tags)
- Preconnect hints
- Schema placeholder
- Analytics placeholder

**src/pages/index.astro**
- Homepage template
- Hero section
- Services overview
- Call-to-action

**tailwind.config.mjs**
- Tailwind v3 configuration
- Content paths for purging
- Custom colors (can be modified)
- Typography defaults

**package.json**
- Astro v4
- Tailwind CSS
- Basic dependencies
- Build scripts

### Customization

**Add new pages:**
```bash
cd sites/[client-name]/src/pages
touch new-page.astro
```

**Modify colors:**
Edit `tailwind.config.mjs`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#yourcolor',
      secondary: '#yourcolor'
    }
  }
}
```

**Add components:**
```bash
cd sites/[client-name]/src/components
touch NewComponent.astro
```

---

## Creating Custom Templates

### When to Create Custom Templates

**Create custom template when:**
- Building sites for specific industry repeatedly
- Need industry-specific components
- Have standardized content structure
- Want faster site creation

**Examples:**
- Restaurant template (menu, hours, reservations)
- Salon template (services, booking, gallery)
- Medical template (providers, insurance, appointments)
- Education template (programs, admissions, calendar)

### Template Structure

```
templates/[template-name]/
├── public/                    # Static assets
├── src/
│   ├── layouts/
│   ├── pages/                # Industry-specific pages
│   ├── components/           # Custom components
│   └── data/                 # Sample data
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
└── README.md                 # Template documentation
```

### Creating Template Step-by-Step

**1. Start with client-base:**
```bash
cp -r templates/client-base templates/restaurant-template
cd templates/restaurant-template
```

**2. Add industry-specific pages:**
```bash
touch src/pages/menu.astro
touch src/pages/reservations.astro
touch src/pages/gallery.astro
```

**3. Create specialized components:**
```bash
touch src/components/MenuSection.astro
touch src/components/HoursDisplay.astro
touch src/components/LocationMap.astro
```

**4. Add sample data:**
```bash
mkdir src/data
touch src/data/menu.json
touch src/data/hours.json
```

Example `menu.json`:
```json
{
  "categories": [
    {
      "name": "Appetizers",
      "items": [
        {"name": "Bruschetta", "price": "$8", "description": "..."}
      ]
    }
  ]
}
```

**5. Document template:**
Create `README.md`:
```markdown
# Restaurant Template

For restaurant and food establishment websites.

## Features
- Menu display with categories
- Hours of operation
- Online reservation integration
- Photo gallery
- Location map

## Usage
```bash
bun run scripts/clone-template.mjs --name [client-name] --template restaurant-template
```

## Customization
- Edit src/data/menu.json for menu items
- Edit src/data/hours.json for hours
- Add photos to public/gallery/
```

**6. Test template:**
```bash
bun run scripts/clone-template.mjs --name test-restaurant --template restaurant-template
cd sites/test-restaurant
bun install
bun run dev
```

**7. Add to scripts/clone-template.mjs:**

Update template list:
```javascript
const templates = [
  'client-base',
  'restaurant-template',
  'salon-template'
  // Add new templates here
];
```

### Template Best Practices

**✅ Do:**
- Include README with instructions
- Use sample data (JSON files)
- Document customization points
- Test template before using
- Keep dependencies minimal
- Include common industry features

**❌ Don't:**
- Hardcode client-specific data
- Include unnecessary dependencies
- Over-customize (keep flexible)
- Forget to update documentation

### Template Maintenance

**Updating existing templates:**
```bash
# Make changes to template
cd templates/[template-name]
# Edit files...

# Test with new site
bun run scripts/clone-template.mjs --name test-site --template [template-name]
cd sites/test-site
bun run dev

# Verify all features work
```

**Version control:**
```bash
git add templates/[template-name]
git commit -m "Update [template-name]: [description]"
```

---

## Template Comparison

| Template | Use Case | Pages | Forms | Complexity |
|----------|----------|-------|-------|------------|
| **client-base** | Generic sites | 4 | Optional | Low |
| **folex-lite** | Agency sites | 8+ | Yes | Medium |
| *(Future)* **restaurant** | Food/dining | 6 | Reservations | Medium |
| *(Future)* **salon** | Beauty/wellness | 5 | Booking | Medium |
| *(Future)* **medical** | Healthcare | 7 | Appointments | High |

---

## Form Template Decision Matrix

| Client Need | Template | Why |
|-------------|----------|-----|
| Uses Jobber + budget | jobber-zapier | Best integration |
| Uses Jobber + no budget | email-resend | Can't afford Zapier |
| Uses HubSpot | generic + webhook | Custom integration |
| Uses Salesforce | jobber-zapier | Via Zapier |
| No CRM | email-resend | Simple & free |
| Undecided | generic | Placeholder |

---

**For detailed setup instructions, see the README.md in each template folder.**

*Templates Guide for Web-Dev Factory HQ v0.1.0*
