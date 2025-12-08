#!/usr/bin/env node

/**
 * Blue Lawns Bot Builder
 * Programmatically creates conversation flows using Botpress Cloud API
 */

import https from 'https';

const BOTPRESS_TOKEN = process.env.BOTPRESS_PAT;
const BOT_ID = 'e1a8e8ce-61e1-4ba5-baa2-782a7ae7e4db';
const BOTPRESS_API = 'https://api.botpress.cloud/v1';

// API Helper
async function botpressRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BOTPRESS_API}${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${BOTPRESS_TOKEN}`,
        'Content-Type': 'application/json',
        'x-bot-id': BOT_ID
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Create Welcome Flow
async function createWelcomeFlow() {
  console.log('🌱 Creating welcome flow...');
  
  const welcomeFlow = {
    name: 'welcome-landscaping-expert',
    description: 'Expert landscaping welcome and navigation',
    nodes: [
      {
        id: 'entry',
        type: 'entry',
        next: 'welcome-message'
      },
      {
        id: 'welcome-message',
        type: 'say-something',
        content: {
          type: 'text',
          text: `👋 Welcome to Blue Lawns! I'm your Cape May County Landscaping Expert.

I can help you with:
🌱 Lawn Care & Maintenance
🏡 Landscape Design & Installation
🌊 Coastal Erosion Control
🧱 Hardscaping & Patios
🍂 Seasonal Cleanup
🏊 Pool Services (via Ecoast Pools)

What brings you here today?`,
          choices: [
            { text: 'Get a Free Quote', value: 'quote' },
            { text: 'Ask a Question', value: 'faq' },
            { text: 'View Services', value: 'services' },
            { text: 'Coastal Erosion Help', value: 'erosion' },
            { text: 'Talk to Someone', value: 'human' }
          ]
        },
        next: 'route-selection'
      },
      {
        id: 'route-selection',
        type: 'router',
        branches: [
          { condition: '{{event.payload.choice}} === "quote"', next: 'start-lead-capture' },
          { condition: '{{event.payload.choice}} === "faq"', next: 'faq-menu' },
          { condition: '{{event.payload.choice}} === "services"', next: 'services-info' },
          { condition: '{{event.payload.choice}} === "erosion"', next: 'erosion-expert' },
          { condition: '{{event.payload.choice}} === "human"', next: 'human-handoff' }
        ]
      }
    ]
  };

  try {
    const result = await botpressRequest('POST', `/bots/${BOT_ID}/flows`, welcomeFlow);
    console.log('✅ Welcome flow created:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating welcome flow:', error.message);
  }
}

// Create Lead Capture Flow
async function createLeadCaptureFlow() {
  console.log('📋 Creating lead capture flow...');
  
  const leadFlow = {
    name: 'lead-capture-expert',
    description: 'Capture qualified landscaping leads',
    nodes: [
      {
        id: 'entry',
        type: 'entry',
        next: 'intro-message'
      },
      {
        id: 'intro-message',
        type: 'say-something',
        content: {
          type: 'text',
          text: `Excellent! Let's get you a free, no-obligation quote.

I'll need just a few details about your property and what you're looking for. This takes about 2 minutes.

Ready to get started?`,
          choices: [
            { text: 'Yes, Let\'s Do It!', value: 'yes' },
            { text: 'I Have Questions First', value: 'questions' }
          ]
        },
        next: 'check-ready'
      },
      {
        id: 'check-ready',
        type: 'router',
        branches: [
          { condition: '{{event.payload.choice}} === "yes"', next: 'get-name' },
          { condition: '{{event.payload.choice}} === "questions"', next: 'go-to-faq' }
        ]
      },
      {
        id: 'get-name',
        type: 'capture-information',
        variable: 'user.name',
        content: {
          type: 'text',
          text: 'Great! First, what\'s your name?'
        },
        next: 'get-city'
      },
      {
        id: 'get-city',
        type: 'say-something',
        content: {
          type: 'text',
          text: 'Thanks {{user.name}}! Where is your property located?',
          choices: [
            { text: 'Ocean View', value: 'Ocean View' },
            { text: 'Avalon', value: 'Avalon' },
            { text: 'Stone Harbor', value: 'Stone Harbor' },
            { text: 'Cape May', value: 'Cape May' },
            { text: 'Sea Isle City', value: 'Sea Isle City' },
            { text: 'Wildwood', value: 'Wildwood' },
            { text: 'Other Cape May County', value: 'Other' }
          ]
        },
        onReceive: [{
          type: 'set-variable',
          variable: 'user.city',
          value: '{{event.payload.choice}}'
        }],
        next: 'get-services'
      },
      {
        id: 'get-services',
        type: 'say-something',
        content: {
          type: 'text',
          text: 'Perfect! What services are you interested in? (You can select multiple)',
          multipleChoice: true,
          choices: [
            { text: '🌱 Weekly Lawn Mowing', value: 'mowing' },
            { text: '🌿 Full Lawn Care Program', value: 'full-care' },
            { text: '🏡 Landscape Design', value: 'design' },
            { text: '🧱 Hardscaping', value: 'hardscape' },
            { text: '🌊 Coastal Erosion Control', value: 'erosion' },
            { text: '🍂 Spring/Fall Cleanup', value: 'cleanup' },
            { text: '🏊 Pool Service', value: 'pool' }
          ]
        },
        onReceive: [{
          type: 'set-variable',
          variable: 'user.services',
          value: '{{event.payload.choices}}'
        }],
        next: 'get-email'
      },
      {
        id: 'get-email',
        type: 'capture-information',
        variable: 'user.email',
        validation: 'email',
        content: {
          type: 'text',
          text: 'Excellent choices! What\'s the best email to send your quote to?'
        },
        next: 'get-phone'
      },
      {
        id: 'get-phone',
        type: 'capture-information',
        variable: 'user.phone',
        validation: 'phone',
        content: {
          type: 'text',
          text: 'And your phone number? (We\'ll only use this for your quote)'
        },
        next: 'get-details'
      },
      {
        id: 'get-details',
        type: 'capture-information',
        variable: 'user.message',
        required: false,
        content: {
          type: 'text',
          text: `Almost done! Any specific details about your property or concerns we should know?

Examples:
• Property size
• Coastal erosion issues
• Special requests
• Timing/urgency

(Or type "none" to skip)`
        },
        next: 'confirmation'
      },
      {
        id: 'confirmation',
        type: 'say-something',
        content: {
          type: 'text',
          text: `🎉 Perfect! Thanks {{user.name}}!

**Your Quote Request:**
📍 Location: {{user.city}}
🌱 Services: {{user.services}}
📧 Email: {{user.email}}
📞 Phone: {{user.phone}}

**What happens next:**
✅ Our team will review your request
✅ We'll contact you within 24 hours
✅ You'll receive a detailed quote
✅ No obligation - completely free!

**Need immediate help?**
Call us directly: 609-425-2954
(Mon-Sat, 7am-6pm)

Is there anything else I can help you with today?`,
          choices: [
            { text: 'Ask Another Question', value: 'faq' },
            { text: 'Learn About Services', value: 'services' },
            { text: 'That\'s All, Thanks!', value: 'done' }
          ]
        },
        onReceive: [{
          type: 'execute-code',
          code: `
            // Send lead to webhook/CRM
            const leadData = {
              name: workflow.user.name,
              email: workflow.user.email,
              phone: workflow.user.phone,
              city: workflow.user.city,
              services: workflow.user.services,
              message: workflow.user.message,
              timestamp: new Date().toISOString(),
              source: 'website-chatbot'
            };
            
            console.log('Lead captured:', leadData);
            // TODO: Send to your CRM/webhook
          `
        }],
        next: 'route-next-action'
      }
    ]
  };

  try {
    const result = await botpressRequest('POST', `/bots/${BOT_ID}/flows`, leadFlow);
    console.log('✅ Lead capture flow created:', result);
    return result;
  } catch (error) {
    console.error('❌ Error creating lead capture flow:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🤖 Building Blue Lawns Landscaping Expert Bot...\n');
  console.log(`Bot ID: ${BOT_ID}`);
  console.log(`API: ${BOTPRESS_API}\n`);

  try {
    // Check API connection
    console.log('🔌 Testing API connection...');
    const botInfo = await botpressRequest('GET', `/bots/${BOT_ID}`);
    console.log('✅ Connected to bot:', botInfo.name || 'Blue Lawns Bot');
    console.log('');

    // Create flows
    await createWelcomeFlow();
    await createLeadCaptureFlow();

    console.log('\n🎉 Bot build complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Go to Botpress Studio: https://studio.botpress.cloud/' + BOT_ID);
    console.log('2. Review and test the flows');
    console.log('3. Add FAQ responses');
    console.log('4. Configure webhooks for lead delivery');
    console.log('5. Publish your bot!');

  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    console.log('\n💡 This script uses the Botpress Cloud API.');
    console.log('   You may need to create flows manually in Botpress Studio.');
    console.log('   Go to: https://studio.botpress.cloud/' + BOT_ID);
  }
}

main();

