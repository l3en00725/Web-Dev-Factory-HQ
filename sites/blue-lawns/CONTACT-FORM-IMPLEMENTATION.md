# Contact Form Implementation Guide

## Overview
The Blue Lawns contact form has been enhanced with Google Places Autocomplete for address input and Resend email delivery service.

## Features Implemented

### 1. Google Places Autocomplete
- **Location:** `src/components/form/ContactForm.astro`
- **Purpose:** Auto-suggest property addresses as users type
- **Configuration:** 
  - Restricted to US addresses
  - Returns formatted address, address components, and geometry
  - Automatically populates the address field when user selects a place

### 2. Resend Email Handler
- **Location:** `src/pages/api/contact.ts`
- **Purpose:** Send contact form submissions via email
- **Features:**
  - Full validation of required fields (name, email, address, message)
  - Email format validation
  - Formatted HTML email with company branding
  - Reply-to set to customer's email for easy response
  - Error handling with user-friendly messages

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Resend API Key for email delivery
# Get your API key from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Google Places API Key for address autocomplete
# Get your API key from: https://console.cloud.google.com/google/maps-apis
GOOGLE_PLACES_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email address to receive contact form submissions
CONTACT_TO_EMAIL=info@bluelawns.com
```

## Setup Instructions

### 1. Get Resend API Key
1. Sign up at https://resend.com
2. Verify your domain (bluelawns.com)
3. Generate an API key
4. Add to `.env` file

### 2. Get Google Places API Key
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable "Places API" in the API Library
4. Create credentials (API Key)
5. Restrict the key to "Places API" and your domain
6. Add to `.env` file

### 3. Deploy Environment Variables
When deploying to Vercel/Netlify, add these environment variables in your hosting platform's dashboard.

## Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | text | Yes | Customer's full name |
| Email | email | Yes | Customer's email address |
| Phone | tel | No | Customer's phone number |
| Property Address | text | Yes | Address with Google Places autocomplete |
| Message | textarea | Yes | Customer's message/inquiry |

## Validation Rules

### Frontend Validation
- All required fields must be filled
- Email must be valid format
- Address field triggers Google Places autocomplete

### Backend Validation
- Required fields checked: name, email, address, message
- Email format validated with regex
- Returns appropriate HTTP status codes:
  - `200` - Success
  - `400` - Validation error (missing/invalid fields)
  - `500` - Server error (Resend API failure or missing config)

## Email Template

The email sent to `CONTACT_TO_EMAIL` includes:
- Customer name
- Customer email (with mailto link)
- Customer phone (if provided, with tel link)
- Property address
- Message content
- Submission metadata (page path, timestamp, lead source)

## Testing

### Test Form Locally
1. Set environment variables in `.env`
2. Run `npm run dev`
3. Navigate to `/contact`
4. Fill out the form with test data
5. Submit and check:
   - Success message displays
   - Email received at `CONTACT_TO_EMAIL`
   - No console errors

### Test Google Places Autocomplete
1. Start typing an address in the "Property Address" field
2. Verify dropdown suggestions appear
3. Select an address from suggestions
4. Verify field populates with formatted address

## Error Handling

### If Resend API Key is Missing
- Returns 500 error
- Message: "Email service not configured. Please contact us directly at info@bluelawns.com"

### If Email Sending Fails
- Returns 500 error
- Message: "Unable to send message. Please try again or call us directly at 609-425-2954."

### If Google Places API Key is Missing
- Form still works but without autocomplete
- Users can manually type addresses

## Files Modified

1. **src/components/form/ContactForm.astro**
   - Added "Property Address" field
   - Added Google Places Autocomplete initialization
   - Updated form submission to include address

2. **src/layouts/Base.astro**
   - Added Google Places API script tag
   - Conditionally loads based on environment variable

3. **src/pages/api/contact.ts**
   - Complete rewrite with Resend integration
   - Added address field validation
   - Implemented HTML email template
   - Enhanced error handling

4. **.env.example**
   - Created with all required environment variables
   - Includes documentation and links to get API keys

## Package Dependencies

```json
{
  "resend": "^4.0.1"
}
```

## Security Considerations

1. **API Keys:**
   - Never commit API keys to version control
   - Always use environment variables
   - Restrict Google Places API key to specific domains

2. **Email Validation:**
   - Backend validates email format
   - Frontend HTML5 validation as first line of defense

3. **Rate Limiting:**
   - Consider adding rate limiting to prevent spam
   - Can be implemented at API route level or via hosting platform

## Troubleshooting

### Autocomplete Not Working
- Check browser console for errors
- Verify `GOOGLE_PLACES_API_KEY` is set
- Ensure Places API is enabled in Google Cloud Console
- Check API key restrictions

### Emails Not Sending
- Check browser console for API errors
- Verify `RESEND_API_KEY` is set correctly
- Confirm domain is verified in Resend dashboard
- Check Resend dashboard for error logs

### Form Not Submitting
- Open browser developer tools
- Check Network tab for failed requests
- Look for validation errors in console
- Verify all required fields are filled

## Future Enhancements

Potential improvements for future iterations:
- Add honeypot field for spam protection
- Implement CAPTCHA (reCAPTCHA or hCaptcha)
- Store submissions in database (Sanity/Supabase)
- Add email confirmation to customer
- Integrate with CRM (Jobber) via Zapier webhook
- Add file upload for project photos
- Implement progressive form (multi-step)

## Support

For issues or questions:
- Email: info@bluelawns.com
- Phone: 609-425-2954


