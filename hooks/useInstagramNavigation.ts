/**
 * Monitor Instagram's SPA navigation
 * Instagram uses client-side routing, so we need to detect URL changes
 */

type NavigationCallback = (url: string) => void;

/**
 * Observe URL changes for Instagram SPA navigation
 */
export function observeNavigation(callback: NavigationCallback): () => void {
  // Method 1: Use Navigation API (modern browsers)
  if ('navigation' in window) {
    const nav = (window as any).navigation;
    nav.addEventListener('navigatesuccess', () => {
      callback(window.location.href);
    });

    return () => {
      nav.removeEventListener('navigatesuccess', callback);
    };
  }

  // Method 2: Fallback - observe DOM changes and URL changes
  let lastUrl = window.location.href;

  // Check URL periodically
  const urlCheckInterval = setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      callback(currentUrl);
    }
  }, 500);

  // Also observe DOM changes as backup
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      callback(currentUrl);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Return cleanup function
  return () => {
    clearInterval(urlCheckInterval);
    observer.disconnect();
  };
}

/**
 * Monitor navigation and trigger callback when entering a profile page
 */
export function observeProfileNavigation(
  onEnterProfile: (username: string) => void,
  onLeaveProfile: () => void
): () => void {
  let currentProfile: string | null = null;

  const cleanup = observeNavigation((url) => {
    const { isProfilePage, extractUsername } = require('~/lib/instagram-dom');
    const isProfile = isProfilePage(url);
    const username = extractUsername(url);

    if (isProfile && username) {
      // Entered or navigated to a profile page
      if (currentProfile !== username) {
        currentProfile = username;
        onEnterProfile(username);
      }
    } else {
      // Left profile page
      if (currentProfile !== null) {
        currentProfile = null;
        onLeaveProfile();
      }
    }
  });

  return cleanup;
}
