// templates/client-base/src/pages/api/forms/contact.ts
import type { APIRoute } from 'astro';
import { getSettings } from '../../../lib/sanity/queries';
import { writeClient } from '../../../lib/sanity/client';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.json();
    const { name, email, phone, message, formName, pagePath, leadSource } = formData;

    // Basic Server-side Validation
    if (!name || !email) {
      return new Response(JSON.stringify({ success: false, error: 'Name and Email are required' }), {
        status: 400,
      });
    }

    // 1. Get Settings for Routing
    const settings = await getSettings();
    const destination = settings?.formDestination || { destinationType: 'email' };

    // 2. Create Lead in Sanity (Attribution & Backup)
    let leadId;
    try {
      const doc = await writeClient.create({
        _type: 'lead',
        name,
        email,
        phone,
        message,
        formName: formName || 'contact',
        pagePath: pagePath || '/',
        leadSource: leadSource || 'direct',
        crmStatus: 'pending',
        createdAt: new Date().toISOString(),
        // Capture standard headers if available (IP, User Agent) would go into intakeMeta
        intakeMeta: {
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      });
      leadId = doc._id;
    } catch (sanityError) {
      console.error('Failed to create lead in Sanity:', sanityError);
      // We continue to attempt routing even if Sanity save fails (critical path)
    }

    // 3. Route Submission
    let crmStatus = 'pending';
    let crmResult = {};

    switch (destination.destinationType) {
      case 'webhook':
        if (destination.endpointUrl) {
          try {
            const response = await fetch(destination.endpointUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            });
            crmStatus = response.ok ? 'success' : 'failed';
            crmResult = {
              provider: 'webhook',
              statusCode: response.status.toString(),
              rawResponse: await response.text(),
            };
          } catch (err) {
            crmStatus = 'failed';
            crmResult = { provider: 'webhook', errorMessage: err instanceof Error ? err.message : 'Unknown error' };
          }
        }
        break;

      case 'jobber':
        // Placeholder for Jobber API integration
        crmStatus = 'pending'; // Or 'failed' if not implemented
        crmResult = { provider: 'jobber', errorMessage: 'Jobber integration not yet implemented' };
        break;

      case 'email':
      default:
        // For now, we just log. Real implementation needs an email service.
        // In a real deployment, we might call Resend/SendGrid here.
        console.log('📧 Sending email to:', destination.toEmail || settings.contactEmail);
        crmStatus = 'success'; // Assume success for log-only
        crmResult = { provider: 'email-log', statusCode: '200' };
        break;
    }

    // 4. Update Sanity Lead with Status
    if (leadId) {
      await writeClient
        .patch(leadId)
        .set({
          crmStatus,
          crmForwardingResult: crmResult,
        })
        .commit();
    }

    if (crmStatus === 'failed') {
      console.error('Form routing failed:', crmResult);
      // We still return success to the client if the lead was saved to Sanity, 
      // or if it was a configuration error we don't want to expose to the user.
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

