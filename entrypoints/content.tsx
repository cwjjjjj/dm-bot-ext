import { mountDMButton } from '~/lib/mount-dm-button';
import { isProfilePage, extractProfileInfo } from '~/lib/instagram-dom';

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
