import { BotEngine } from '~/lib/bot-engine';
import { initializeStorage } from '~/lib/storage';
import type { Settings } from '~/types/storage';

// Initialize bot engine
let botEngine: BotEngine;

export default defineBackground(() => {
  console.log('[DM Bot] Background service worker started');

  // Initialize storage and bot engine
  initializeStorage().then(() => {
    botEngine = new BotEngine();
    console.log('[DM Bot] Bot engine initialized');
  });

  // Listen for extension installation
  browser.runtime.onInstalled.addListener(async (details) => {
    console.log('[DM Bot] Extension installed:', details.reason);

    if (details.reason === 'install') {
      // Initialize storage with defaults
      await initializeStorage();

      // Open welcome page (popup)
      browser.tabs.create({
        url: browser.runtime.getURL('/popup.html'),
      });
    }
  });

  // Listen for messages from content scripts and popup
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log('[DM Bot] Received message:', message);

    try {
      switch (message.type) {
        case 'START_QUEUE':
          if (!botEngine) {
            sendResponse({ success: false, error: 'Bot engine not initialized' });
            break;
          }
          const startResult = await botEngine.startQueue(
            message.listId,
            message.templateId,
            message.name
          );
          sendResponse(startResult);
          break;

        case 'PAUSE_QUEUE':
          if (!botEngine) {
            sendResponse({ success: false, error: 'Bot engine not initialized' });
            break;
          }
          await botEngine.pauseQueue();
          sendResponse({ success: true });
          break;

        case 'RESUME_QUEUE':
          if (!botEngine) {
            sendResponse({ success: false, error: 'Bot engine not initialized' });
            break;
          }
          await botEngine.resumeQueue();
          sendResponse({ success: true });
          break;

        case 'STOP_QUEUE':
          if (!botEngine) {
            sendResponse({ success: false, error: 'Bot engine not initialized' });
            break;
          }
          await botEngine.stopQueue();
          sendResponse({ success: true });
          break;

        case 'GET_QUEUE_STATUS':
          const { storage: bgStorage } = await import('@wxt-dev/storage');
          const queue = await bgStorage.getItem('local:activeQueue');
          sendResponse({ success: true, queue });
          break;

        case 'GET_PROFILE':
          // Handle profile info request (legacy)
          sendResponse({ success: true });
          break;

        case 'SEND_DM':
          // Handle DM sending (legacy)
          sendResponse({ success: true });
          break;

        case 'SEND_SINGLE_DM': {
          // Handle single DM sending
          const { storage: bgStorage } = await import('@wxt-dev/storage');
          const settings = (await bgStorage.getItem('local:settings')) as Settings;

          if (!settings) {
            sendResponse({ success: false, error: 'Settings not found' });
            break;
          }

          // Check daily limit
          if (settings.todaySentCount >= settings.dailyLimit) {
            sendResponse({
              success: false,
              error: `Daily limit reached (${settings.dailyLimit})`,
            });
            break;
          }

          // Open Instagram tab
          const tab = await browser.tabs.create({
            url: 'https://www.instagram.com/',
            active: true,
          });

          if (!tab.id) {
            sendResponse({ success: false, error: 'Failed to create tab' });
            break;
          }

          // Wait for tab to load
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Send DM command to content script
          try {
            const response = await browser.tabs.sendMessage(tab.id, {
              type: 'EXECUTE_SINGLE_DM',
              username: message.username,
              message: message.message,
            });

            if (response.success) {
              // Increment daily count
              const { storageOps } = await import('~/lib/storage');
              await storageOps.incrementDailyCount();
              await storageOps.addLog({
                type: 'success',
                category: 'task',
                message: `Quick DM sent to @${message.username}`,
              });
            }

            sendResponse(response);
          } catch (error) {
            sendResponse({
              success: false,
              error: (error as Error).message,
            });
          }
          break;
        }

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('[DM Bot] Error handling message:', error);
      sendResponse({
        success: false,
        error: (error as Error).message,
      });
    }

    return true; // Keep message channel open for async response
  });

  // Set up daily limit reset alarm
  browser.alarms.create('dailyReset', {
    when: getNextMidnight(),
    periodInMinutes: 24 * 60, // Daily
  });

  browser.alarms.onAlarm.addListener(async (alarm: any) => {
    if (alarm.name === 'dailyReset') {
      console.log('[DM Bot] Resetting daily count');
      const { storageOps } = await import('~/lib/storage');
      await storageOps.resetDailyCount();
    }
  });
});

/**
 * Get next midnight timestamp
 */
function getNextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}
