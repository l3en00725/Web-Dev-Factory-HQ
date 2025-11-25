# 🤖 Blue Lawns AI Chat - Quick Start

## ✅ Setup Complete!

Your Blue Lawns site now has an AI-powered chat assistant using the Vercel AI SDK instead of Botpress.

---

## 🚀 To Test Locally

### 1. Install Dependencies
```bash
cd /Users/benjaminhaberman/Web-Dev-Factory-HQ/sites/blue-lawns
bun install
# or
npm install
```

### 2. Add OpenAI API Key
Edit `.env` file and replace the placeholder:
```
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

Get your key: https://platform.openai.com/api-keys

### 3. Run Dev Server
```bash
bun run dev
# or
npm run dev
```

### 4. Test the Chat
- Open: http://localhost:4321
- Look for chat widget in bottom-right corner
- Click to open, start chatting!

---

## 📁 What Changed

**Added:**
- `/src/pages/api/chat.ts` - AI API endpoint
- `/src/components/Chat.tsx` - React chat UI
- `/src/docs/landscaping.md` - 25KB knowledge base

**Updated:**
- `package.json` - Added AI SDK deps
- `astro.config.mjs` - Added React integration
- `index.astro` - Integrated Chat component
- `Layout.astro` - Removed Botpress script

**Removed:**
- Botpress initialization (kept files for reference)

---

## 💡 Key Features

✅ **Smarter:** Uses GPT-4o-mini with 25KB of Blue Lawns knowledge  
✅ **Cheaper:** ~$2-20/month vs $0-49 for Botpress  
✅ **Full Control:** Direct code access, instant updates  
✅ **Better UX:** Custom React component, Blue Lawns branding  
✅ **Faster:** Optimized for Vercel Edge network  

---

## 📖 Full Documentation

See `VERCEL-AI-SDK-SETUP.md` for complete details.

---

**Ready to test!** 🎉

