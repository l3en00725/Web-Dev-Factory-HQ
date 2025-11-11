# 🤖 Botpress Setup Checklist for Blue Lawns

**Bot Name:** Blue Lawns Assistant  
**Bot ID:** `blue-lawns-lead-bot`  
**Status:** ⚠️ Initialized (Awaiting Botpress Cloud Configuration)

---

## ✅ Pre-Deployment Checklist

Complete these steps **inside the Botpress Cloud dashboard** before the chatbot can go live.

---

## 1. 🆕 Create Your Botpress Account

### Step 1.1: Sign Up
- [ ] Go to [https://app.botpress.cloud](https://app.botpress.cloud)
- [ ] Click **"Sign Up"** (or "Start for Free")
- [ ] Create account using:
  - Email/Password, OR
  - Google Sign-In, OR
  - GitHub Sign-In

### Step 1.2: Verify Email
- [ ] Check your inbox for verification email
- [ ] Click verification link
- [ ] Complete profile setup

---

## 2. 🤖 Create Your Bot

### Step 2.1: Create New Bot
- [ ] From Botpress Dashboard, click **"Create Bot"** or **"New Bot"**
- [ ] Choose **"Start from Scratch"** (or "Blank Bot")

### Step 2.2: Configure Bot Identity
- [ ] **Bot Name:** `Blue Lawns Assistant`
- [ ] **Bot ID:** `blue-lawns-lead-bot` (or use auto-generated ID)
- [ ] **Description:** "Lead capture and customer service bot for Blue Lawns lawn care services"
- [ ] **Language:** English (en)

### Step 2.3: Save Configuration
- [ ] Click **"Create"** or **"Save"**
- [ ] Wait for bot to initialize (~30 seconds)

---

## 3. 🔌 Enable Webchat Integration

### Step 3.1: Navigate to Integrations
- [ ] In bot dashboard, click **"Integrations"** (left sidebar)
- [ ] Find **"Webchat"** integration
- [ ] Click **"Enable"** or **"Configure"**

### Step 3.2: Get Webchat Credentials
Copy the following values (you'll need these for your website):

| Field | Where to Find | Value to Copy |
|-------|---------------|---------------|
| **Bot ID** | Dashboard > Settings > Bot ID | `_________________` |
| **Messaging URL** | Integrations > Webchat > Config | `_________________` |
| **Host URL** | Integrations > Webchat > Config | `_________________` |
| **Webchat Token** (if required) | Integrations > Webchat > Security | `_________________` |

### Step 3.3: Configure Webchat Settings
- [ ] **Enable Persistent Chat:** ON (saves conversation history)
- [ ] **Show Avatar:** ON
- [ ] **Allow File Uploads:** Optional (OFF for now)
- [ ] **Download Transcripts:** OFF (for privacy)
- [ ] **Reset Conversation:** ON

---

## 4. 📝 Build Conversation Flow (Flows Tab)

### Step 4.1: Create Welcome Flow
- [ ] Go to **"Studio"** or **"Flows"** tab
- [ ] Click **"Create Flow"** → Name it: `welcome-flow`
- [ ] Add **Start Node**
- [ ] Add **Text Node** with welcome message:
  ```
  👋 Hi! Welcome to Blue Lawns. I'm here to help you with:
  
  • Free quotes for lawn care services
  • Information about our landscaping packages
  • Scheduling appointments
  • Pool maintenance services
  
  What can I help you with today?
  ```

### Step 4.2: Create Lead Capture Flow
- [ ] Create new flow: `lead-capture-flow`
- [ ] Add **User Input Nodes** for:
  - [ ] Full Name
  - [ ] Email Address
  - [ ] Phone Number
  - [ ] Service Type (Lawn Care / Landscaping / Pool Service)
  - [ ] Property Address (City)
  - [ ] Message/Details

### Step 4.3: Add Quick Replies
- [ ] Add **Choice Node** with options:
  - "Get a Free Quote"
  - "View Services"
  - "Schedule Appointment"
  - "Talk to Someone"

### Step 4.4: Create FAQ Responses
Add these common questions as **Q&A Nodes**:
- [ ] "What areas do you serve?"
  - Answer: "We serve all of Cape May County including Ocean View, Avalon, Stone Harbor, Wildwood, Cape May, and surrounding areas."
- [ ] "How much does lawn care cost?"
  - Answer: "Pricing varies based on property size and services needed. Most weekly lawn maintenance starts at $35-50 per visit. Let me help you get a custom quote!"
- [ ] "Do you offer pool services?"
  - Answer: "Yes! Through our Ecoast Pool Service partnership, we offer complete pool maintenance and cleaning. Would you like to schedule a service?"

---

## 5. 🔗 Connect to Database/CRM (Optional)

### Step 5.1: Enable Variables
- [ ] Go to **"Variables"** tab
- [ ] Create variables to store:
  - `user.name`
  - `user.email`
  - `user.phone`
  - `user.service_type`
  - `user.address`
  - `user.message`

### Step 5.2: Set Up Webhook (Optional - Advanced)
If you want leads sent to your CRM/email:
- [ ] Go to **"Integrations"** → **"Webhooks"**
- [ ] Add webhook URL for your backend or Zapier
- [ ] Configure to send lead data on form completion
- [ ] Test webhook integration

---

## 6. 🎨 Customize Bot Appearance

### Step 6.1: Upload Avatar
- [ ] Go to **"Settings"** → **"Bot Avatar"**
- [ ] Upload Blue Lawns logo: `/sites/blue-lawns/public/media/blue-lawns-logo.png`
- [ ] Save changes

### Step 6.2: Configure Branding
Already configured in code, but verify:
- [ ] **Theme:** Light
- [ ] **Primary Color:** #10B981 (Green)
- [ ] **Background:** #F2F7F3 (Light green)
- [ ] **Bot Name:** Blue Lawns Assistant

---

## 7. 🧪 Test Your Bot

### Step 7.1: Test in Botpress Emulator
- [ ] Click **"Emulator"** or **"Test"** button (top right)
- [ ] Test conversation flows:
  - [ ] Welcome message displays
  - [ ] Quick replies work
  - [ ] Lead capture form collects all fields
  - [ ] FAQs respond correctly
  - [ ] No errors in console

### Step 7.2: Test Edge Cases
- [ ] Try invalid email format
- [ ] Try empty inputs
- [ ] Test "back" button functionality
- [ ] Test reset conversation

---

## 8. 🔐 Configure Environment Variables (if needed)

If your bot requires authentication tokens, add to `.env`:

```bash
# Botpress Configuration
BOTPRESS_BOT_ID=blue-lawns-lead-bot  # Replace with actual bot ID
BOTPRESS_MESSAGING_URL=https://cdn.botpress.cloud/webchat
BOTPRESS_WEBCHAT_TOKEN=  # Only if required by your plan
```

**Location:** `/Users/benjaminhaberman/Web-Dev-Factory-HQ/sites/blue-lawns/.env`

**Note:** Most Botpress integrations don't require tokens for basic webchat embed. Check your plan details.

---

## 9. 📋 Update Website Code (Only If Needed)

If your **Bot ID** is different from `blue-lawns-lead-bot`:

### Step 9.1: Update botpress-init.js
- [ ] Open `/sites/blue-lawns/public/js/botpress-init.js`
- [ ] Find line: `botId: "blue-lawns-lead-bot"`
- [ ] Replace with your actual Bot ID from Botpress dashboard
- [ ] Save file

### Step 9.2: Add Webhook Token (if required)
If your plan requires webchat authentication:
- [ ] In `botpress-init.js`, add:
  ```javascript
  webchatToken: "YOUR_WEBCHAT_TOKEN_HERE",
  ```

---

## 10. 🚀 Deploy & Test

### Step 10.1: Test Locally
```bash
cd /Users/benjaminhaberman/Web-Dev-Factory-HQ/sites/blue-lawns
bun run dev
```

- [ ] Open browser to `http://localhost:4321`
- [ ] Scroll to chatbot section (below hero)
- [ ] Verify chat widget loads
- [ ] Test conversation flow
- [ ] Check browser console for errors

### Step 10.2: Deploy to Production
- [ ] Commit changes:
  ```bash
  git add .
  git commit -m "Add Botpress chatbot integration"
  git push
  ```
- [ ] Deploy site (Vercel/Netlify auto-deploys on push)

### Step 10.3: Verify Production
- [ ] Visit live site: `https://bluelawns.com`
- [ ] Test chatbot on production
- [ ] Verify leads are captured correctly
- [ ] Monitor first 24 hours for issues

---

## 11. 📊 Set Up Analytics (Optional)

### Step 11.1: Enable Botpress Analytics
- [ ] In Botpress Dashboard → **"Analytics"**
- [ ] Enable conversation tracking
- [ ] Set up goals:
  - Lead captured
  - Quote requested
  - Appointment scheduled

### Step 11.2: Integrate with Google Analytics (Optional)
- [ ] Add Google Analytics tracking to bot events
- [ ] Track bot engagement metrics
- [ ] Monitor conversion rates

---

## 12. 🔔 Configure Notifications

### Step 12.1: Email Notifications
- [ ] Set up email to receive new leads:
  - Go to **"Integrations"** → **"Email"**
  - Add notification email: `info@bluelawns.com`
  - Enable "New conversation" alerts
  - Enable "Lead captured" alerts

### Step 12.2: Slack Integration (Optional)
- [ ] Connect Slack workspace
- [ ] Send leads to #leads channel
- [ ] Get real-time notifications

---

## 📝 Botpress Plan Requirements

| Feature | Free Plan | Starter Plan | Pro Plan |
|---------|-----------|--------------|----------|
| **Conversations/month** | 1,000 | 10,000 | 100,000 |
| **Webchat Integration** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Custom Branding** | ❌ No | ✅ Yes | ✅ Yes |
| **Remove "Powered by Botpress"** | ❌ No | ✅ Yes | ✅ Yes |
| **Webhooks** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Analytics** | Basic | Advanced | Advanced |
| **Support** | Community | Email | Priority |

**Recommended for Blue Lawns:** Starter Plan ($49/month) - Removes branding, increases limits

---

## ⚠️ Important Notes

1. **Bot ID:** The bot will not load until you replace `blue-lawns-lead-bot` with your actual bot ID from Botpress
2. **Testing:** Always test in Botpress emulator before deploying
3. **Conversation Design:** Start simple, add complexity gradually
4. **Privacy:** Inform users their data is collected (add to privacy policy)
5. **Fallback:** Always provide a "Talk to a Human" option that links to contact form

---

## 🆘 Troubleshooting

### Bot Not Appearing on Website
- [ ] Check browser console for JavaScript errors
- [ ] Verify bot ID is correct in `botpress-init.js`
- [ ] Confirm Botpress CDN script loads (Network tab)
- [ ] Check if bot is published (not in draft mode)

### Bot Loads But Doesn't Respond
- [ ] Verify flows are connected properly in Botpress Studio
- [ ] Check start node is set correctly
- [ ] Test in Botpress emulator first
- [ ] Review bot logs in dashboard

### Leads Not Being Captured
- [ ] Verify variables are saved in flow
- [ ] Check webhook configuration
- [ ] Test form submission manually
- [ ] Review bot analytics for errors

---

## 📞 Support Resources

- **Botpress Documentation:** [https://botpress.com/docs](https://botpress.com/docs)
- **Botpress Community:** [https://discord.gg/botpress](https://discord.gg/botpress)
- **Blue Lawns Integration Files:**
  - Config: `/integrations/botpress/config.json`
  - Script: `/sites/blue-lawns/public/js/botpress-init.js`
  - Page: `/sites/blue-lawns/src/pages/index.astro`

---

## ✅ Final Checklist Before Going Live

- [ ] Bot created in Botpress Cloud
- [ ] Webchat integration enabled
- [ ] Conversation flows built and tested
- [ ] Welcome message configured
- [ ] Lead capture form working
- [ ] FAQs added for common questions
- [ ] Bot ID updated in code (if different)
- [ ] Tested locally
- [ ] Deployed to production
- [ ] Tested on live site
- [ ] Email notifications set up
- [ ] Analytics enabled
- [ ] Privacy policy updated (mentions chatbot data collection)

---

**Status:** 🟡 Awaiting Botpress Cloud setup  
**Next Step:** Create bot in Botpress dashboard and follow checklist above  
**Estimated Setup Time:** 30-60 minutes for basic setup

---

*Once you complete this checklist, your Blue Lawns chatbot will be live and ready to capture leads!* 🎉

