// Contact form handler with Resend email delivery
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    const { name, email, address } = data;
    const phone = data.phone || '';
    const message = data.message || '';

    // Check all required fields (message is optional)
    if (!name || !email || !address || !phone) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields. Name, email, phone, and address are required.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log submission for debugging
    console.log('Contact form submission:', {
      name,
      email,
      phone,
      address,
      message: message || 'Not provided',
      pagePath: data.pagePath,
      timestamp: new Date().toISOString(),
    });

    // Send email via Resend
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    const CONTACT_TO_EMAIL = import.meta.env.CONTACT_TO_EMAIL || 'info@bluelawns.com';

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured. Please contact us directly at info@bluelawns.com' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
      from: 'Blue Lawns Website <no-reply@bluelawns.com>',
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New Lead from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              h2 { color: #0ea5e9; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #555; }
              .value { margin-left: 10px; }
              .message-box { background: #f9fafb; padding: 15px; border-left: 4px solid #0ea5e9; margin-top: 20px; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>New Contact Form Submission</h2>
              
              <div class="field">
                <span class="label">Name:</span>
                <span class="value">${name}</span>
              </div>
              
              <div class="field">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:${email}">${email}</a></span>
              </div>
              
              ${phone ? `
              <div class="field">
                <span class="label">Phone:</span>
                <span class="value"><a href="tel:${phone}">${phone}</a></span>
              </div>
              ` : ''}
              
              <div class="field">
                <span class="label">Property Address:</span>
                <span class="value">${address}</span>
              </div>
              
              ${message ? `
              <div class="message-box">
                <div class="label">Message:</div>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>
              ` : ''}
              
              <div class="footer">
                <p>Submitted from: ${data.pagePath || 'Contact Page'}</p>
                <p>Lead Source: ${data.leadSource || 'Website'}</p>
                <p>Timestamp: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully! We will get back to you soon.' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Unable to send message. Please try again or call us directly at 609-425-2954.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Reject other methods
export const ALL: APIRoute = () => {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
};

