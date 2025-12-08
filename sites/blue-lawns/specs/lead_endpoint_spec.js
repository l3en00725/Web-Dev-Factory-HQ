/**
 * JOBBER LEAD AUTOMATION & ZAPIER FALLBACK SPEC
 * Endpoint: POST /api/lead
 */

import type { APIRoute } from 'astro';

/**
 * Payload Interface
 */
interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  address?: string;
  serviceInterest?: string[]; // e.g., ['lawn-care', 'fencing']
  message?: string;
  source?: string; // e.g., 'website-contact-form'
}

/**
 * Configuration Constants (Environment Variables)
 */
// JOBBER_API_TOKEN
// ZAPIER_WEBHOOK_URL
// SUPABASE_URL (Optional)
// SUPABASE_KEY (Optional)

/**
 * Main Handler Logic
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body: LeadPayload = await request.json();

    // 1. Validation
    if (!body.name || !body.email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const tasks = [];

    // 2. Jobber Integration (GraphQL)
    // See Jobber Docs: https://developer.getjobber.com/docs/
    const jobberMutation = `
      mutation CreateRequest($client: ClientInput!, $request: RequestInput!) {
        createRequest(client: $client, request: $request) {
          request {
            id
            title
          }
          userErrors {
            message
          }
        }
      }
    `;

    // Note: This is a pseudo-implementation. Actual Jobber API requires strict Client/Property matching.
    // A simplified approach creates a "Request" which usually creates a Client if not found.
    const jobberTask = fetch('https://api.getjobber.com/api/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.JOBBER_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: jobberMutation,
        variables: {
          client: {
             firstName: body.name.split(' ')[0],
             lastName: body.name.split(' ').slice(1).join(' ') || 'Client',
             email: { address: body.email },
             phones: [{ number: body.phone, type: "MOBILE" }]
          },
          request: {
            title: `New Website Lead: ${body.serviceInterest?.join(', ') || 'General Inquiry'}`,
            description: body.message,
            source: "Blue Lawns Website"
          }
        }
      })
    }).then(res => res.json()).catch(err => ({ error: err }));

    tasks.push(jobberTask);

    // 3. Zapier Webhook Fallback (Reliable)
    // If Jobber integration is complex or fails, Zapier catches the raw JSON.
    if (import.meta.env.ZAPIER_WEBHOOK_URL) {
      const zapierTask = fetch(import.meta.env.ZAPIER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      tasks.push(zapierTask);
    }

    // 4. Await All Integrations (Non-blocking for user if we didn't care about response, 
    // but here we want to ensure at least one succeeds or log errors)
    const results = await Promise.allSettled(tasks);
    
    // Log results for debugging
    console.log('Lead Automation Results:', results);

    return new Response(JSON.stringify({ success: true, message: 'Lead received' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Lead API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};



