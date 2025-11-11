export const prerender = false;

/**
 * Pool Lead Form Submission Handler
 * Routes pool service inquiries to Ecoast Pool Service
 * Tags leads with "Pool Lead" for tracking
 */
export async function POST({ request }) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const leadData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      city: formData.get('city'),
      service_type: formData.get('service_type'),
      message: formData.get('message'),
      // Hidden tracking fields
      lead_source: formData.get('lead_source'), // "Blue Lawns"
      lead_type: formData.get('lead_type'), // "Pool Lead"
      service_interest: formData.get('service_interest'), // "Pool Maintenance"
      referral_url: formData.get('referral_url'),
      timestamp: new Date().toISOString(),
    };

    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.phone) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare email content
    const emailSubject = `🏊 New Pool Lead from Blue Lawns - ${leadData.city}`;
    const emailBody = `
New Pool Service Inquiry

═══════════════════════════════════════
LEAD INFORMATION
═══════════════════════════════════════

Name: ${leadData.name}
Email: ${leadData.email}
Phone: ${leadData.phone}
City: ${leadData.city}
Service Requested: ${leadData.service_type}

═══════════════════════════════════════
MESSAGE
═══════════════════════════════════════

${leadData.message || 'No additional message provided'}

═══════════════════════════════════════
TRACKING INFORMATION
═══════════════════════════════════════

Lead Source: ${leadData.lead_source}
Lead Type: ${leadData.lead_type}
Service Interest: ${leadData.service_interest}
Referral URL: ${leadData.referral_url}
Timestamp: ${leadData.timestamp}

═══════════════════════════════════════
NEXT STEPS
═══════════════════════════════════════

1. Contact the customer within 24 hours
2. Schedule an initial consultation
3. Provide a customized pool service quote
4. Log this lead in your CRM system

This lead came from the Blue Lawns pool service landing page.
Please ensure timely follow-up for best conversion rates.
`;

    // Send to multiple destinations for reliability
    const responses = [];

    // 1. Send to Zapier webhook (if configured)
    const zapierWebhook = import.meta.env.ZAPIER_WEBHOOK_URL_POOL;
    if (zapierWebhook) {
      try {
        const zapierResponse = await fetch(zapierWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData)
        });
        responses.push({ service: 'Zapier', success: zapierResponse.ok });
      } catch (error) {
        console.error('Zapier webhook error:', error);
        responses.push({ service: 'Zapier', success: false, error: error.message });
      }
    }

    // 2. Send via Resend email service (if configured)
    const resendApiKey = import.meta.env.RESEND_API_KEY;
    const ecoastEmail = import.meta.env.ECOAST_POOL_EMAIL || 'leads@ecoastpools.com';
    
    if (resendApiKey && typeof globalThis !== 'undefined' && globalThis.process) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        const emailResponse = await resend.emails.send({
          from: 'Pool Leads <noreply@bluelawns.com>',
          to: [ecoastEmail],
          cc: ['info@bluelawns.com'], // CC Blue Lawns for tracking
          subject: emailSubject,
          text: emailBody,
          reply_to: leadData.email,
          tags: [
            { name: 'lead_type', value: 'pool' },
            { name: 'source', value: 'blue_lawns' },
            { name: 'city', value: leadData.city }
          ]
        });

        responses.push({ service: 'Resend', success: true, id: emailResponse.id });
      } catch (error) {
        console.error('Resend error:', error);
        responses.push({ service: 'Resend', success: false, error: error.message });
      }
    }

    // 3. Fallback: Log to console (development)
    console.log('Pool Lead Received:', {
      ...leadData,
      responses
    });

    // Check if at least one method succeeded
    const anySuccess = responses.length === 0 || responses.some(r => r.success);

    if (anySuccess) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Thank you! Your pool service request has been submitted. We\'ll contact you within 24 hours.',
        lead_id: `POOL-${Date.now()}`,
        responses
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('All submission methods failed');
    }

  } catch (error) {
    console.error('Pool lead submission error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to submit form. Please call us directly at 609-425-2954.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

