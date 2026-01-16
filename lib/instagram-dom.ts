/**
 * Instagram DOM selectors and utilities
 */

// Primary selectors for Instagram profile pages
export const INSTAGRAM_SELECTORS = {
  // Profile header container
  PROFILE_HEADER: 'header[role="banner"]',
  PROFILE_ARTICLE: 'article header',

  // Action buttons container (Follow, Message, etc.)
  ACTION_BUTTONS: 'div[role="button"][tabindex="0"]',

  // User information
  USERNAME: 'h2',
  USER_BIO: 'div.-v3Dir span',

  // Navigation indicators
  MAIN_CONTENT: 'main[role="main"]',
};

/**
 * Check if current URL is an Instagram profile page
 */
export function isProfilePage(url: string = window.location.href): boolean {
  const profilePattern = /^https:\/\/(www\.)?instagram\.com\/[^\/]+\/?$/;
  return profilePattern.test(url);
}

/**
 * Extract username from Instagram profile URL
 */
export function extractUsername(url: string = window.location.href): string | null {
  if (!isProfilePage(url)) return null;

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Remove leading/trailing slashes
    const username = pathname.replace(/^\/|\/$/g, '');
    return username || null;
  } catch {
    return null;
  }
}

/**
 * Wait for profile header to appear in DOM
 */
export function waitForProfileHeader(timeout = 5000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const header = document.querySelector(INSTAGRAM_SELECTORS.PROFILE_HEADER);
    if (header instanceof HTMLElement) {
      resolve(header);
      return;
    }

    const observer = new MutationObserver(() => {
      const header = document.querySelector(INSTAGRAM_SELECTORS.PROFILE_HEADER);
      if (header instanceof HTMLElement) {
        observer.disconnect();
        resolve(header);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Timeout fallback
    setTimeout(() => {
      observer.disconnect();
      reject(new Error('Profile header not found within timeout'));
    }, timeout);
  });
}

/**
 * Extract profile information from current page
 */
export function extractProfileInfo(): {
  username: string | null;
  displayName: string | null;
  bio: string | null;
} {
  const username = extractUsername();
  const displayName = document.querySelector(INSTAGRAM_SELECTORS.USERNAME)?.textContent?.trim() || null;
  const bio = document.querySelector(INSTAGRAM_SELECTORS.USER_BIO)?.textContent?.trim() || null;

  return { username, displayName, bio };
}

/**
 * Navigate to Instagram DM page for a user
 */
export function navigateToDM(username: string): void {
  const dmUrl = `https://www.instagram.com/direct/new/${username}/`;
  window.location.href = dmUrl;
}
