import { mountDMButton } from '~/lib/mount-dm-button';
import { isProfilePage, extractProfileInfo } from '~/lib/instagram-dom';
import * as InstagramDM from '~/lib/instagram-dm';
import type { DMTask, Settings } from '~/types/storage';

export default defineContentScript({
  matches: ['https://www.instagram.com/*'],
  runAt: 'document_idle',
  cssInjectionMode: 'ui',

  main(ctx) {
    console.log('[DM Bot] Content script loaded');

    let currentUi: any = null;

    // Function to mount the DM button
    const mountButton = async () => {
      try {
        // Remove existing UI if any
        if (currentUi) {
          currentUi.remove();
          currentUi = null;
        }

        // Check if we're on a profile page
        if (!isProfilePage()) {
          return;
        }

        const profile = extractProfileInfo();
        console.log('[DM Bot] Profile detected:', profile);

        // Mount the button
        currentUi = await mountDMButton(ctx);
      } catch (error) {
        console.error('[DM Bot] Error mounting button:', error);
      }
    };

    // Initial check
    mountButton();

    // Monitor SPA navigation
    const cleanup = (window as any).observeNavigation?.(() => {
      console.log('[DM Bot] Navigation detected');
      mountButton();
    });

    // Listen for messages from background script
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      console.log('[DM Bot] Received message in content script:', message);

      if (message.type === 'EXECUTE_DM') {
        const result = await executeDM(message.task);
        sendResponse(result);
      } else if (message.type === 'EXECUTE_SINGLE_DM') {
        const result = await executeSingleDM(message.username, message.message);
        sendResponse(result);
      }

      return true; // Keep message channel open for async response
    });

    // Cleanup on invalidation
    ctx.onInvalidated(() => {
      console.log('[DM Bot] Content script invalidated');
      if (cleanup) cleanup();
      if (currentUi) {
        currentUi.remove();
      }
    });
  },
});

/**
 * Execute DM task
 */
async function executeDM(task: DMTask): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log('[DM Bot] Executing DM task:', task);

    // Check for error states first
    const errorCheck = InstagramDM.checkForErrors();
    if (errorCheck.hasError) {
      return {
        success: false,
        error: errorCheck.error,
      };
    }

    // Open new DM with user
    const openResult = await InstagramDM.openNewDM(task.username);
    if (!openResult.success) {
      return openResult;
    }

    // Wait for UI to load
    await sleep(2000);

    // Check for errors again
    const errorCheck2 = InstagramDM.checkForErrors();
    if (errorCheck2.hasError) {
      return {
        success: false,
        error: errorCheck2.error,
      };
    }

    // Get typing speed from settings
    const { storage: contentStorage } = await import('@wxt-dev/storage');
    const settings = await contentStorage.getItem<Settings>('local:settings');
    const typingSpeed = {
      min: settings?.typingSpeedMin || 50,
      max: settings?.typingSpeedMax || 250,
    };

    // Send message
    const sendResult = await InstagramDM.sendMessage(task.message, typingSpeed);
    return sendResult;
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Execute single DM (quick DM)
 */
async function executeSingleDM(username: string, message: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log('[DM Bot] Executing single DM to:', username);

    // Check for error states first
    const errorCheck = InstagramDM.checkForErrors();
    if (errorCheck.hasError) {
      return {
        success: false,
        error: errorCheck.error,
      };
    }

    // Open new DM with user
    const openResult = await InstagramDM.openNewDM(username);
    if (!openResult.success) {
      return openResult;
    }

    // Wait for UI to load
    await sleep(2000);

    // Check for errors again
    const errorCheck2 = InstagramDM.checkForErrors();
    if (errorCheck2.hasError) {
      return {
        success: false,
        error: errorCheck2.error,
      };
    }

    // Get typing speed from settings
    const { storage: contentStorage } = await import('@wxt-dev/storage');
    const settings = await contentStorage.getItem<Settings>('local:settings');
    const typingSpeed = {
      min: settings?.typingSpeedMin || 50,
      max: settings?.typingSpeedMax || 250,
    };

    // Send message
    const sendResult = await InstagramDM.sendMessage(message, typingSpeed);
    return sendResult;
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
