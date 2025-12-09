// Test Resend email delivery
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const GET: APIRoute = async () => {
  try {
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        'Error sending test email: RESEND_API_KEY not configured',
        { status: 500, headers: { 'Content-Type': 'text/plain' } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const timestamp = new Date().toLocaleString();

    const result = await resend.emails.send({
      from: 'Blue Lawns Test <no-reply@bluelawns.com>',
      to: 'ben@bluehomesgroup.com',
      subject: 'Blue Lawns Resend Test Email',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1e293b;
                background-color: #f8fafc;
                padding: 0;
                margin: 0;
              }
              .email-wrapper {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
              }
              .header {
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                color: #ffffff;
                font-size: 28px;
                font-weight: 700;
                margin: 0;
                letter-spacing: -0.5px;
              }
              .content {
                padding: 40px 30px;
              }
              .greeting {
                font-size: 18px;
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 20px;
              }
              .message {
                font-size: 16px;
                color: #475569;
                line-height: 1.8;
                margin-bottom: 30px;
              }
              .test-info {
                background-color: #f1f5f9;
                border-left: 4px solid #0ea5e9;
                padding: 20px;
                margin: 30px 0;
                border-radius: 4px;
              }
              .test-info-title {
                font-size: 14px;
                font-weight: 600;
                color: #0ea5e9;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
              }
              .test-info-content {
                font-size: 14px;
                color: #64748b;
                font-family: 'Courier New', monospace;
              }
              .success-badge {
                display: inline-block;
                background-color: #10b981;
                color: #ffffff;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                margin: 20px 0;
              }
              .divider {
                height: 1px;
                background-color: #e2e8f0;
                margin: 30px 0;
              }
              .footer {
                background-color: #f8fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
              }
              .footer-text {
                font-size: 14px;
                color: #64748b;
                margin-bottom: 10px;
              }
              .footer-contact {
                font-size: 14px;
                color: #475569;
                margin-top: 15px;
              }
              .footer-contact a {
                color: #0ea5e9;
                text-decoration: none;
                font-weight: 600;
              }
              .footer-contact a:hover {
                text-decoration: underline;
              }
              .logo-placeholder {
                display: inline-block;
                width: 40px;
                height: 40px;
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                margin-bottom: 15px;
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <!-- Header -->
              <div class="header">
                <div class="logo-placeholder"></div>
                <h1>Blue Lawns</h1>
              </div>

              <!-- Content -->
              <div class="content">
                <div class="greeting">Hello!</div>
                
                <div class="message">
                  This is a test email sent from the Blue Lawns development environment to verify that our email delivery system is working correctly.
                </div>

                <div class="test-info">
                  <div class="test-info-title">Test Details</div>
                  <div class="test-info-content">
                    Timestamp: ${timestamp}<br>
                    Service: Resend API<br>
                    Status: Operational
                  </div>
                </div>

                <div style="text-align: center;">
                  <div class="success-badge">✓ Email Delivery Successful</div>
                </div>

                <div class="message">
                  If you received this email, it confirms that our contact form email notifications are properly configured and ready to deliver customer inquiries to our team.
                </div>

                <div class="divider"></div>

                <div class="message" style="font-size: 14px; color: #64748b;">
                  This is an automated test email. No action is required.
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <div class="footer-text">
                  <strong>Blue Lawns</strong><br>
                  Coastal Lawn Care & Landscaping
                </div>
                <div class="footer-contact">
                  <a href="tel:609-425-2954">609-425-2954</a> | 
                  <a href="mailto:info@bluelawns.com">info@bluelawns.com</a>
                </div>
                <div class="footer-text" style="margin-top: 20px; font-size: 12px;">
                  Serving Ocean View, Avalon, Stone Harbor, Sea Isle City, Cape May, and surrounding areas.
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Test email sent successfully:', result);
    
    return new Response(
      'Test email sent',
      { status: 200, headers: { 'Content-Type': 'text/plain' } }
    );
  } catch (error) {
    console.error('Error sending test email:', error);
    return new Response(
      'Error sending test email',
      { status: 500, headers: { 'Content-Type': 'text/plain' } }
    );
  }
};
