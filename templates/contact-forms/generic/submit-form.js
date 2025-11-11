export const POST = async ({ request }) => {
  try {
    const data = await request.json();
    
    if (!data.name || !data.email || !data.phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log submission (in production, save to database or forward to webhook)
    console.log('Form submission:', {
      ...data,
      submitted_at: new Date().toISOString()
    });

    // TODO: Connect to client's preferred system
    // Options:
    // - POST to custom webhook
    // - Save to Supabase/Firebase
    // - Send to Slack channel
    // - Add to Google Sheet
    // - Email via Resend (see email-resend template)
    // - Zapier webhook → CRM (see jobber-zapier template)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Form submitted - integration pending'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Form submission error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

