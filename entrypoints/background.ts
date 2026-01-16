export default defineBackground(() => {
  console.log('[DM Bot] Background service worker started');

  // Listen for extension installation
  browser.runtime.onInstalled.addListener((details) => {
    console.log('[DM Bot] Extension installed:', details.reason);

    if (details.reason === 'install') {
      // Open welcome page or setup
      browser.tabs.create({
        url: 'https://www.instagram.com/',
      });
    }
  });

  // Listen for messages from content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[DM Bot] Received message:', message);

    // Handle different message types
    if (message.type === 'GET_PROFILE') {
      // Handle profile info request
      sendResponse({ success: true });
    } else if (message.type === 'SEND_DM') {
      // Handle DM sending
      sendResponse({ success: true });
    }

    return true; // Keep message channel open for async response
  });
});
