// Simple contact form handler
// For static site - processes form submissions without Sanity

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    const { name, email, message } = data;
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
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

    // In production, you would:
    // 1. Send to email service (Resend, SendGrid, etc.)
    // 2. Forward to webhook (Zapier, Make, etc.)
    // 3. Store in database
    
    // For now, log and return success
    console.log('Contact form submission:', {
      name,
      email,
      phone: data.phone || 'Not provided',
      message,
      pagePath: data.pagePath,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement actual email sending
    // const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    // const ZAPIER_WEBHOOK = import.meta.env.ZAPIER_WEBHOOK_URL_BLUE_LAWNS;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Form submitted successfully' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
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

