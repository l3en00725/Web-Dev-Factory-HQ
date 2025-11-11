import { Resend } from 'resend';

// Only initialize Resend if API key is available
const getResend = () => {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

export const POST = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const submittedAt = new Date().toISOString();
    let zapierSuccess = false;
    let emailSuccess = false;

    // PRIMARY: Send to Zapier webhook → Jobber
    try {
      if (import.meta.env.ZAPIER_WEBHOOK_URL) {
        const zapierResponse = await fetch(import.meta.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          service_type: data.service_type || 'Not specified',
          message: data.message || '',
          submitted_at: submittedAt,
          source: 'website'
        })
      });

      if (zapierResponse.ok) {
        zapierSuccess = true;
      } else {
        console.error('Zapier webhook failed:', zapierResponse.status);
      }
      }
    } catch (zapierError) {
      console.error('Zapier webhook error:', zapierError);
    }

    // BACKUP: Send email notification via Resend
    try {
      const resend = getResend();
      if (resend && import.meta.env.CONTACT_EMAIL) {
        const emailHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; margin-bottom: 24px;">New Contact Form Submission</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 8px 0;"><strong>Name:</strong> ${data.name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a></p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${data.phone}" style="color: #2563eb;">${data.phone}</a></p>
            <p style="margin: 8px 0;"><strong>Service:</strong> ${data.service_type || 'Not specified'}</p>
          </div>
          
          ${data.message ? `
          <div style="margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0;"><strong>Message:</strong></p>
            <p style="margin: 0; line-height: 1.6; color: #4b5563;">${data.message}</p>
          </div>
          ` : ''}
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1f2937;">Quick Actions</h3>
            <p style="margin: 0;">
              <a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none; display: inline-block; margin: 4px 0;">📞 Call ${data.phone}</a><br>
              <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none; display: inline-block; margin: 4px 0;">✉️ Reply via Email</a>
            </p>
            ${data.service_type ? `<p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">Requested service: <strong>${data.service_type}</strong></p>` : ''}
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          
          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            ${zapierSuccess ? '✓ Also sent to Jobber via Zapier' : '⚠️ Note: Zapier integration failed - please follow up manually'}
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">
            Submitted: ${new Date(submittedAt).toLocaleString()}
          </p>
        </div>
      `;

      await resend.emails.send({
        from: 'website@yourdomain.com',
        to: import.meta.env.CONTACT_EMAIL,
        subject: `New Contact Form: ${data.name}${data.service_type ? ` - ${data.service_type}` : ''}`,
        html: emailHtml
      });

      emailSuccess = true;
      }
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    // Return success if either integration worked, or if neither is configured (form still submitted)
    if (zapierSuccess || emailSuccess || (!import.meta.env.ZAPIER_WEBHOOK_URL && !import.meta.env.RESEND_API_KEY)) {
      return new Response(
        JSON.stringify({ 
          success: true,
          zapier: zapierSuccess,
          email: emailSuccess,
          message: (!import.meta.env.ZAPIER_WEBHOOK_URL && !import.meta.env.RESEND_API_KEY) 
            ? 'Form submitted - integrations not configured' 
            : undefined
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Both Zapier and email failed');
    }

  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to submit form' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

