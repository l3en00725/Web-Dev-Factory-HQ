# 🤖 Blue Lawns Botpress Integration

## Bot Information

**Bot ID:** `e1a8e8ce-61e1-4ba5-baa2-782a7ae7e4db`  
**Status:** 🟢 Connected  
**Created:** November 11, 2025

## 📁 Files in This Directory

- **`LANDSCAPING-EXPERT-KNOWLEDGE-BASE.md`** - Complete knowledge base for the bot (905 lines)
  - Service information (lawn care, landscaping, hardscaping, erosion control)
  - Pricing packages (Preserve $262/mo, Nurture $315/mo)
  - Conversation examples and expert responses
  - Lead qualification framework
  
- **`config.json`** - Bot configuration and integration settings

- **`build-bot.mjs`** - Script to programmatically create bot flows via API
  - Welcome flow with navigation
  - Lead capture flow with qualification
  - Service routing logic

## 🔧 Setup & Configuration

### 1. Environment Variables

The Personal Access Token is stored in `.env` (already configured):
```bash
BOTPRESS_PAT=bp_pat_ioxVfUcssAidPfLey5FucJXYV5BiOohv71Fs
BOTPRESS_BOT_ID=e1a8e8ce-61e1-4ba5-baa2-782a7ae7e4db
```

⚠️ **Security:** The `.env` file is already in `.gitignore` and will NOT be committed to version control.

### 2. Frontend Integration

The bot is integrated into the site via:
- **Script:** `/public/js/botpress-init.js`
- **Location:** Below hero section on homepage
- **Container:** `<div id="bp-webchat"></div>`

### 3. Bot Dashboard Access

**Botpress Studio:** https://studio.botpress.cloud/e1a8e8ce-61e1-4ba5-baa2-782a7ae7e4db

Here you can:
- Review and edit conversation flows
- Test the bot
- Monitor conversations
- Configure webhooks
- Publish updates

## 🚀 Building the Bot

To create/update bot flows programmatically:

```bash
cd /Users/benjaminhaberman/Web-Dev-Factory-HQ/Web-Dev-Factory-HQ/sites/blue-lawns
node botpress/build-bot.mjs
```

This will:
- Connect to Botpress Cloud API
- Create welcome flow
- Create lead capture flow
- Configure navigation and routing

## 📝 Knowledge Base Updates

When updating the knowledge base:
1. Edit `LANDSCAPING-EXPERT-KNOWLEDGE-BASE.md`
2. Update conversation flows in Botpress Studio to match
3. Test the bot with new knowledge
4. Publish changes

## 🎨 Customization

Bot appearance is configured in `/public/js/botpress-init.js`:
- **Brand colors:** Green gradient (#10B981 → #059669)
- **Layout:** Full-width below hero
- **Avatar:** Blue Lawns logo
- **Theme:** Light mode

## 🔗 Lead Delivery

Leads captured by the bot should be sent to:
- **Webhook:** (Configure in Botpress Studio)
- **Destination:** Zapier → Jobber CRM
- **Fields:** Name, email, phone, city, services, message

## ✅ Integration Checklist

- [x] Bot created in Botpress Cloud
- [x] Personal Access Token stored securely
- [x] Knowledge base documented (905 lines)
- [x] Bot ID configured in frontend
- [x] Integration script ready
- [ ] Bot flows created in Botpress Studio
- [ ] Webhook configured for lead delivery
- [ ] Bot tested and published
- [ ] Live on production site

## 📞 Support

**Botpress Documentation:** https://botpress.com/docs  
**Bot Dashboard:** https://app.botpress.cloud

---

**Last Updated:** November 11, 2025

