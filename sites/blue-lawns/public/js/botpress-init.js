/**
 * Botpress Webchat Initialization Script
 * Blue Lawns Lead Capture Bot
 * 
 * This script loads the Botpress webchat widget and initializes it
 * with Blue Lawns branding and configuration.
 * 
 * NOTE: Before this works, you must:
 * 1. Create a bot in Botpress Cloud (https://app.botpress.cloud)
 * 2. Get your bot ID from the dashboard
 * 3. Replace placeholder values below with actual credentials
 */

// Defer Botpress initialization to reduce TBT
// Load after user interaction or after page is idle
function initBotpress() {
  console.log("🤖 Initializing Botpress webchat...");
  
  // Create script element for Botpress CDN
  const s = document.createElement("script");
  s.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
  s.async = true;
  
  s.onload = () => {
    try {
      window.botpressWebChat.init({
        // Bot Configuration - Blue Lawns Bot
        botId: "e1a8e8ce-61e1-4ba5-baa2-782a7ae7e4db",
        hostUrl: "https://cdn.botpress.cloud/webchat/v1",
        messagingUrl: "https://cdn.botpress.cloud/webchat",
        
        // Layout Configuration
        containerWidth: "100%",
        layoutWidth: "100%",
        showCloseButton: false,
        showPoweredBy: false,
        
        // Bot Identity
        botName: "Blue Lawns Assistant",
        botDescription: "Get instant quotes and service information",
        avatarUrl: "/media/blue-lawns-logo.png",
        
        // Styling
        theme: "light",
        backgroundColor: "#F2F7F3",
        textColor: "#1F2937",
        accentColor: "#10B981", // Green accent matching Blue Lawns brand
        
        // Behavior
        enableReset: true,
        enableTranscriptDownload: false,
        showConversationsButton: false,
        
        // Welcome Message (optional - can be set in Botpress dashboard instead)
        welcomeMessage: "👋 Hi! I'm the Blue Lawns Assistant. How can I help you today?",
        
        // Custom styling overrides
        stylesheet: `
          /* Custom Blue Lawns styling */
          .bpw-layout {
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .bpw-header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            border-radius: 12px 12px 0 0;
          }
          
          .bpw-from-bot .bpw-message-bubble {
            background-color: #F3F4F6;
            color: #1F2937;
          }
          
          .bpw-from-user .bpw-message-bubble {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
          }
          
          .bpw-send-button {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          }
          
          .bpw-send-button:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
          }
        `
      });
      
      console.log("✅ Botpress webchat initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Botpress:", error);
    }
  };
  
  s.onerror = () => {
    console.error("❌ Failed to load Botpress script from CDN");
  };
  
  // Append script to body
  document.body.appendChild(s);
}

// Initialize after a delay to not block critical rendering
if (document.readyState === 'complete') {
  setTimeout(initBotpress, 3000); // 3 second delay
} else {
  window.addEventListener('load', () => {
    setTimeout(initBotpress, 3000);
  });
}

// Or initialize on first user interaction
const interactionEvents = ['mousemove', 'touchstart', 'keydown', 'scroll'];
let hasInitialized = false;

function initOnInteraction() {
  if (!hasInitialized) {
    hasInitialized = true;
    initBotpress();
    // Remove event listeners after first init
    interactionEvents.forEach(event => {
      document.removeEventListener(event, initOnInteraction);
    });
  }
}

interactionEvents.forEach(event => {
  document.addEventListener(event, initOnInteraction, { once: true, passive: true });
});

/**
 * TODO: Replace the following placeholders with actual values from Botpress dashboard:
 * 
 * 1. botId: "blue-lawns-lead-bot"
 *    → Get this from: Botpress Dashboard > Your Bot > Settings > Bot ID
 * 
 * 2. If your bot requires authentication, you may need to add:
 *    - webhookToken: "your-webhook-token"
 *    - clientId: "your-client-id"
 * 
 * 3. Test the integration locally before deploying
 */

