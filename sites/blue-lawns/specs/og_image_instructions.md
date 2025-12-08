# Open Graph Image Generation Instructions

To maintain the "Coastal Premium" brand aesthetic across social media, all OG images must be generated using the following system.

## Technical Specifications
- **Dimensions**: 1200 x 630 pixels
- **Format**: JPG (Quality 90) or PNG
- **Size Limit**: < 300KB recommended

## Design Template Structure

1.  **Background Layer**:
    - High-quality photo of a finished Blue Lawns project (Lawn or Hardscape).
    - Overlay: Gradient Map using Brand Colors (Primary-900 at 80% opacity to Transparent).
    - ensure text readability.

2.  **Branding Layer**:
    - **Logo**: White version of Blue Lawns logo, placed Top Left or Centered.
    - **Tagline**: "Professional Lawn Care & Landscaping" in `DM Sans` (Medium), roughly 32px size.

3.  **Content Layer (Dynamic)**:
    - **Page Title**: Large, Bold Typography (`Outfit` Bold), White text. 
    - **Location/Context**: Optional subtitle for location pages (e.g., "Serving Avalon, NJ").
    - **CTA Button Visual**: "Get a Quote" badge graphic (optional).

## Generation Logic (Automated)

When generating OG images via code (e.g., `@vercel/og` or `satori`):

```javascript
// Pseudo-code for layout
<div style={{ display: 'flex', width: '100%', height: '100%', backgroundImage: 'url(...)', ... }}>
  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #082f49dd, #082f4900)' }} />
  <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px' }}>
    <img src="/logo-white.svg" height={60} />
    <h1 style={{ fontSize: '64px', color: 'white', fontFamily: 'Outfit', marginTop: '40px' }}>
      {pageTitle}
    </h1>
    <p style={{ fontSize: '32px', color: '#bae6fd', fontFamily: 'DM Sans' }}>
      Cape May County's Premier Landscaping
    </p>
  </div>
</div>
```

## Variations

1.  **Default/Home**: Generic "Green & Blue" lush lawn background.
2.  **Service Pages**: Relevant background (e.g., Mower for Lawn Care, Patio for Hardscaping).
3.  **Location Pages**: Map graphic or iconic local landmark photo blended with lawn image.



