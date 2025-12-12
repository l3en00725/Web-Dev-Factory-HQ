// Contact form handler with Resend email delivery
import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Hardcoded Blue Lawns company_id for MVP
const BLUE_LAWNS_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

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

    // Send user confirmation email
    try {
      await resend.emails.send({
        from: 'Blue Lawns <no-reply@bluelawns.com>',
        to: email,
        subject: 'We received your message - Blue Lawns',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; margin-bottom: 20px; }
                h2 { color: #0ea5e9; margin: 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Blue Lawns</h2>
                </div>
                
                <p>Hi ${name.split(' ')[0]},</p>
                
                <p>Thanks for contacting us. We've received your message and will get back to you shortly.</p>
                
                <p><strong>Your details:</strong><br>
                Phone: ${phone}<br>
                Address: ${address}</p>
                
                <p>If you need immediate assistance, please call us at <a href="tel:609-425-2954">609-425-2954</a>.</p>
                
                <div class="footer">
                  <p>Blue Lawns - Coastal Lawn Care & Landscaping<br>
                  Serving Cape May County</p>
                </div>
              </div>
            </body>
          </html>
        `
      });
    } catch (userEmailError) {
      console.error('Failed to send user confirmation email:', userEmailError);
      // We don't fail the request here because the internal notification was successful
    }
    
    // Extract UTM and click ID parameters
    const utm_source = data.utm_source || null;
    const utm_medium = data.utm_medium || null;
    const utm_campaign = data.utm_campaign || null;
    const utm_term = data.utm_term || null;
    const utm_content = data.utm_content || null;
    const gclid = data.gclid || null;
    const fbclid = data.fbclid || null;

    // Save lead to Supabase with tracking data
    const supabaseUrl = import.meta.env.SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        await supabase.from('website_leads').insert({
          company_id: BLUE_LAWNS_COMPANY_ID,
          name,
          email,
          phone: phone || null,
          address: address || null,
          message: message || null,
          reviewed: false,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          gclid,
          fbclid,
        });
      } catch (supabaseError) {
        // Log error but don't fail the request if email was sent
        console.error('Failed to save lead to Supabase:', supabaseError);
      }
    }

    // Get tracking settings for conversion event response
    let googleAdsId = null;
    let googleAdsConversionLabel = null;
    
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: settingsData } = await supabase
          .from('website_settings')
          .select('settings')
          .eq('company_id', BLUE_LAWNS_COMPANY_ID)
          .single();
        
        if (settingsData?.settings?.tracking) {
          googleAdsId = settingsData.settings.tracking.google_ads_id;
          googleAdsConversionLabel = settingsData.settings.tracking.google_ads_conversion_label;
        }
      } catch (error) {
        // Silently fail - conversion tracking is optional
        console.warn('Could not load tracking settings for conversion:', error);
      }
    }

    // Build Google Ads conversion ID if both ID and label are present
    const googleAdsConversionId = googleAdsId && googleAdsConversionLabel 
      ? `${googleAdsId}/${googleAdsConversionLabel}`
      : null;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message sent successfully! We will get back to you soon.',
        googleAdsConversionId // Pass to client for conversion event
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

