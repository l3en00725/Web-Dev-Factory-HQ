# 🤖 Blue Lawns Bot - Complete Build Guide

**Goal:** Build a lead capture bot that qualifies and captures customer information for Blue Lawns landscaping services.

**Access Your Bot:** https://studio.botpress.cloud/e1a8e8ce-61e1-4ba5-baa2-782a7ae7e4db

---

## 🎯 Bot Strategy: Lead Capture First

The bot's primary mission is to **capture qualified leads**. Every conversation should guide toward:
1. Understanding customer's needs
2. Collecting contact information
3. Routing to the sales team

---

## 📋 STEP 1: Set Up Bot Basics

### In Botpress Studio:

1. **Click "Settings" (⚙️ icon)**

2. **General Settings:**
   - **Bot Name:** Blue Lawns Landscaping Expert
   - **Bot Description:** Get instant quotes and expert lawn care advice
   - **Bot Avatar:** Upload Blue Lawns logo
   - **Language:** English

3. **Personality Settings:**
   - **Tone:** Friendly, professional, knowledgeable
   - **Role:** Cape May County landscaping consultant
   - **Instructions:** "You are an expert landscaping consultant for Blue Lawns, specializing in coastal properties in Cape May County, NJ. Your goal is to help customers and capture leads. Be knowledgeable about lawn care, landscaping, erosion control, and pool services."

---

## 🏗️ STEP 2: Create the Main Flow Structure

### Flow 1: Welcome & Navigation (Entry Point)

1. **Create New Flow:** Click "+ New Flow"
   - **Name:** `welcome-flow`
   - **Description:** Main entry point and service navigation

2. **Add Start Node (already there)**

3. **Add Text Card Node:**
   - **Name:** `welcome-message`
   - **Content:**
   ```
   👋 Welcome to Blue Lawns! I'm your Cape May County Landscaping Expert.

   I can help you with:
   🌱 Lawn Care & Maintenance
   🏡 Landscape Design & Installation  
   🌊 Coastal Erosion Control
   🧱 Hardscaping & Patios
   🍂 Seasonal Cleanup
   🏊 Pool Services

   What brings you here today?
   ```

4. **Add Choice Node:**
   - **Name:** `main-menu`
   - **Choices:**
     - "Get a Free Quote" → leads to `lead-capture-flow`
     - "Ask a Question" → leads to `faq-flow`
     - "View Services" → leads to `services-info`
     - "Pricing Information" → leads to `pricing-info`
     - "Talk to Someone" → leads to `human-handoff`

---

## 💰 STEP 3: Pricing Information Flow

### Flow 2: Pricing Info (Then Capture Lead)

1. **Create New Flow:** `pricing-info`

2. **Add Text Card:**
   ```
   Great question! We offer two popular membership packages:

   🌱 PRESERVE PACKAGE - $262/month
   • Weekly lawn cuttings
   • Spring clean up
   • Sprinkler winterization
   Perfect for essential maintenance!

   ⭐ NURTURE PACKAGE (Most Popular) - $315/month
   • Everything in Preserve, PLUS:
   • Fall lawn renovation with overseeding
   Creates that thick, lush lawn everyone wants!

   Both packages include:
   ✅ Locked-in monthly pricing
   ✅ Priority scheduling  
   ✅ Photo updates after each visit
   ✅ No surprises!

   We also offer:
   • Spring/Fall cleanup: $150-400
   • 3D Landscape Design: Starting at $500
   • Custom hardscaping & installation

   Would you like a free custom quote for your property?
   ```

3. **Add Choice Node:**
   - "Yes, Get My Quote" → leads to `lead-capture-flow`
   - "Tell Me More About Services" → leads to `services-info`
   - "I Have Questions" → leads to `faq-flow`

---

## 🎯 STEP 4: Lead Capture Flow (THE MOST IMPORTANT)

### Flow 3: Lead Capture (Core Conversion Flow)

1. **Create New Flow:** `lead-capture-flow`

2. **Node 1: Introduction**
   - **Type:** Text Card
   ```
   Excellent! Let's get you a free, no-obligation quote.

   I'll need just a few details about your property and what you're looking for. This takes about 2 minutes.

   Ready to get started?
   ```
   - **Add Choice:**
     - "Yes, Let's Do It!" → Continue
     - "I Have Questions First" → Back to FAQ

3. **Node 2: Capture Name**
   - **Type:** Capture Information
   - **Variable:** `user.name`
   - **Validation:** Required, Text
   - **Prompt:**
   ```
   Great! First, what's your name?
   ```

4. **Node 3: Capture City/Location**
   - **Type:** Choice (Single Select)
   - **Variable:** `user.city`
   - **Prompt:**
   ```
   Thanks {{user.name}}! Where is your property located?
   ```
   - **Choices:**
     - Ocean View
     - Avalon
     - Stone Harbor
     - Cape May
     - Sea Isle City
     - Wildwood
     - Wildwood Crest
     - Other Cape May County

5. **Node 4: Property Type**
   - **Type:** Choice (Single Select)
   - **Variable:** `user.property_type`
   - **Prompt:**
   ```
   Perfect! What type of property is this?
   ```
   - **Choices:**
     - Year-Round Residence
     - Vacation Home
     - Rental Property
     - Commercial Property

6. **Node 5: Services Interested In**
   - **Type:** Choice (Multiple Select)
   - **Variable:** `user.services`
   - **Prompt:**
   ```
   Great! What services are you interested in? (Select all that apply)
   ```
   - **Choices:**
     - 🌱 Weekly Lawn Mowing
     - 🌿 Full Lawn Care Program (Preserve or Nurture Package)
     - 🏡 Landscape Design (3D Design Package)
     - 🧱 Hardscaping (Patios, Walkways, Walls)
     - 🌊 Coastal Erosion Control
     - 🍂 Spring/Fall Cleanup
     - 🏊 Pool Service

7. **Node 6: Capture Email**
   - **Type:** Capture Information
   - **Variable:** `user.email`
   - **Validation:** Email format
   - **Prompt:**
   ```
   Excellent choices! What's the best email to send your quote to?
   ```

8. **Node 7: Capture Phone**
   - **Type:** Capture Information
   - **Variable:** `user.phone`
   - **Validation:** Phone format
   - **Prompt:**
   ```
   And your phone number? (We'll only use this for your quote)
   ```

9. **Node 8: Additional Details (Optional)**
   - **Type:** Capture Information
   - **Variable:** `user.message`
   - **Validation:** Optional
   - **Prompt:**
   ```
   Almost done! Any specific details about your property or concerns we should know?

   Examples:
   • Property size
   • Coastal erosion issues
   • Special requests
   • Timing/urgency

   (Or type "none" to skip)
   ```

10. **Node 9: Lead Confirmation**
    - **Type:** Text Card with Webhook
    - **Content:**
    ```
    🎉 Perfect! Thanks {{user.name}}!

    **Your Quote Request:**
    📍 Location: {{user.city}}
    🏡 Property Type: {{user.property_type}}
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

    Is there anything else I can help you with today?
    ```

11. **Node 10: Execute Code (Send Lead)**
    - **Type:** Execute Code
    - **Purpose:** Send lead data to webhook
    - **Code:**
    ```javascript
    const leadData = {
      name: workflow.user.name,
      email: workflow.user.email,
      phone: workflow.user.phone,
      city: workflow.user.city,
      property_type: workflow.user.property_type,
      services: workflow.user.services,
      message: workflow.user.message || "None provided",
      timestamp: new Date().toISOString(),
      source: "website-chatbot"
    };
    
    // Send to webhook (configure webhook URL in Botpress)
    await webhook.send('lead-capture', leadData);
    
    console.log('Lead captured:', leadData);
    ```

12. **Node 11: Post-Lead Options**
    - **Type:** Choice
    - **Choices:**
      - "Ask Another Question" → Back to FAQ
      - "Learn About Services" → Services info
      - "That's All, Thanks!" → End conversation gracefully

---

## 📚 STEP 5: FAQ Flow

### Flow 4: FAQ Responses

Create this flow to handle common questions before or after lead capture:

**Common FAQs to Include:**

1. **"Do you work in [city]?"**
   ```
   Absolutely! Blue Lawns serves all of Cape May County. We're especially experienced in {{user.city if exists}} and understand the unique challenges coastal properties face here.

   We're based in Ocean View and serve:
   • Avalon & Stone Harbor (coastal specialists)
   • Cape May (historic properties)  
   • Wildwood, Sea Isle City, and all surrounding areas

   Ready for a free quote?
   ```

2. **"Can you help with coastal erosion?"**
   ```
   YES! Coastal erosion control is one of our specialties. Living on the shore is beautiful, but it comes with challenges.

   Here's how we help:
   🌾 Native Plant Installations (Beach Grass with 6-20' deep roots!)
   🧱 Strategic Hardscaping (retaining walls, terracing)
   💧 Drainage Solutions (French drains, grading)
   🍂 Ground Cover & Mulching

   We've done dozens of successful erosion control projects in Avalon, Stone Harbor, and throughout 7 Mile Island.

   Want to schedule a free site assessment?
   ```

3. **"I have a vacation home - can you maintain it when I'm not there?"**
   ```
   Absolutely! We LOVE working with vacation home owners.

   Here's how we make it easy:
   • Year-round maintenance even when you're away
   • Photo updates sent after each service
   • Work with your property manager
   • Storm response and emergency cleanup
   • Easy remote setup and billing

   Many of our clients are seasonal residents in Avalon, Stone Harbor, and Wildwood.

   Ready to set up care for your vacation home?
   ```

4. **"What's included in your packages?"**
   → Link back to pricing-info flow

---

## 🛠️ STEP 6: Services Info Flow

### Flow 5: Service Details

Brief overview with CTAs back to lead capture:

```
Blue Lawns provides comprehensive outdoor property care:

🌱 **LAWN CARE**
Weekly maintenance, fertilization, aeration, overseeding
Preserve Package ($262/mo) or Nurture Package ($315/mo)

🏡 **LANDSCAPE DESIGN**
3D Design Package starting at $500
Complete installation services
Coastal-resilient plantings

🌊 **EROSION CONTROL**
Native plantings, hardscaping, drainage solutions
Specialized for coastal properties

🧱 **HARDSCAPING**
Patios, walkways, retaining walls, Belgian block
Custom designs

🍂 **SEASONAL SERVICES**
Spring/Fall cleanup, storm damage response

🏊 **POOL SERVICES**
Weekly maintenance via Ecoast Pools partnership

Want a free quote? Let's get you set up!
```

Then: Choice → "Get My Quote" leads back to `lead-capture-flow`

---

## 🤝 STEP 7: Human Handoff Flow

### Flow 6: Connect to Human

```
I'd be happy to connect you with our team!

**Call Us:**
📞 609-425-2954  
🕐 Mon-Sat, 7am-6pm

**Or:** I can have someone call you back within a few hours.

Would you like to:
- Leave your number for a callback?
- Continue chatting with me?
```

If callback: Capture name, phone, best time → Send to webhook

---

## 🔗 STEP 8: Set Up Webhook for Lead Delivery

### Configure Webhook in Botpress:

1. **Go to Integrations → Webhooks**

2. **Create New Webhook:**
   - **Name:** `lead-capture`
   - **URL:** Your Zapier webhook URL (or direct to Jobber API)
   - **Method:** POST
   - **Headers:**
     ```
     Content-Type: application/json
     ```

3. **Payload Format:**
   ```json
   {
     "name": "{{user.name}}",
     "email": "{{user.email}}",
     "phone": "{{user.phone}}",
     "city": "{{user.city}}",
     "property_type": "{{user.property_type}}",
     "services": "{{user.services}}",
     "message": "{{user.message}}",
     "timestamp": "{{timestamp}}",
     "source": "website-chatbot"
   }
   ```

4. **Test the webhook** with dummy data

5. **Connect Zapier:**
   - Trigger: Catch Webhook (from Botpress)
   - Action: Create Job in Jobber CRM
   - Map fields accordingly

---

## 🎨 STEP 9: Customize Bot Personality with AI

### In Bot Settings → AI Task:

**Personality Instructions:**
```
You are the Blue Lawns Landscaping Expert, a knowledgeable and friendly consultant for Cape May County coastal properties.

YOUR EXPERTISE:
- Lawn care and maintenance
- Coastal landscaping (salt tolerance, erosion control, sandy soil)
- Hardscaping and outdoor design
- Vacation home maintenance
- Pool services

YOUR GOAL: 
Capture qualified leads by being helpful and building trust. Guide every conversation toward getting customer contact information.

YOUR TONE:
Professional but friendly. Use emojis sparingly. Show deep knowledge of coastal challenges.

PRICING TO MENTION:
- Preserve Package: $262/month
- Nurture Package: $315/month (most popular)
- 3D Design: Starting at $500
- Individual services: Custom quotes

LOCATIONS WE SERVE:
All of Cape May County - especially Avalon, Stone Harbor, Cape May, Ocean View, Sea Isle City, Wildwood

ALWAYS:
- Demonstrate expertise on coastal landscaping
- Mention specific solutions (beach grass, drainage, native plants)
- Guide toward free quote / lead capture
- Be honest about limitations

NEVER:
- Give exact prices without property details
- Make commitments the human team can't fulfill
- Promise work outside Cape May County
```

---

## ✅ STEP 10: Test Your Bot

### Testing Checklist:

1. **Test Welcome Flow:**
   - [ ] Bot greets properly
   - [ ] All menu options work
   - [ ] Navigation is clear

2. **Test Pricing Info:**
   - [ ] Package details display correctly
   - [ ] Prices are accurate ($262, $315, $500)
   - [ ] CTAs lead to lead capture

3. **Test Lead Capture (MOST IMPORTANT):**
   - [ ] All fields capture correctly
   - [ ] Name is stored in `user.name`
   - [ ] Email validates properly
   - [ ] Phone validates properly
   - [ ] City dropdown works
   - [ ] Multi-select services work
   - [ ] Optional message field works
   - [ ] Confirmation displays all info
   - [ ] Webhook fires successfully
   - [ ] Lead appears in Zapier/Jobber

4. **Test FAQ:**
   - [ ] Common questions answered well
   - [ ] Responses match knowledge base
   - [ ] CTAs back to lead capture work

5. **Test Human Handoff:**
   - [ ] Phone number displays correctly (609-425-2954)
   - [ ] Callback option works
   - [ ] Leads captured properly

---

## 🚀 STEP 11: Publish & Deploy

1. **In Botpress Studio:**
   - Click "Publish" button (top right)
   - Confirm publication
   - Bot is now live!

2. **Test on Your Site:**
   ```bash
   cd /Users/benjaminhaberman/Web-Dev-Factory-HQ/Web-Dev-Factory-HQ/sites/blue-lawns
   pnpm dev
   ```
   - Visit homepage
   - Bot should appear below hero
   - Test complete conversation flow
   - Verify lead submission

3. **Monitor Leads:**
   - Check Botpress Analytics
   - Verify leads in Jobber CRM
   - Monitor webhook success rate

---

## 📊 Success Metrics to Track

After launch, monitor:
- **Conversation Rate:** % of visitors who interact with bot
- **Lead Capture Rate:** % of conversations that capture leads
- **Qualification Rate:** % of leads that are "hot" (ready to buy)
- **Response Time:** How fast team follows up on leads
- **Conversion Rate:** % of bot leads that become customers

---

## 🛠️ Troubleshooting

**Bot not responding:**
- Check if bot is published
- Verify Bot ID matches in botpress-init.js
- Check browser console for errors

**Leads not delivering:**
- Test webhook in Botpress
- Verify Zapier connection
- Check webhook logs

**Wrong information displayed:**
- Edit flow nodes in Botpress Studio
- Update and republish

---

## 📞 Need Help?

**Botpress Docs:** https://botpress.com/docs  
**Studio Access:** https://studio.botpress.cloud/e1a8e8ce-61e1-4ba5-baa2-782a7ae7e4db  
**Support:** Botpress Community Forum

---

**Now go build your bot! Focus on lead capture - that's the #1 goal.** 🎯

