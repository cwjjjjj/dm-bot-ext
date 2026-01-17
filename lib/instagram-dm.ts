/**
 * Instagram DM Interface - 拟人化自动化操作
 *
 * 核心策略：
 * 1. 使用真实点击而非 URL 跳转
 * 2. 模拟鼠标移动轨迹
 * 3. 随机化所有操作时间
 * 4. 模拟真实打字行为（包括停顿、回退）
 * 5. 多重后备选择器
 */

/**
 * DOM 选择器配置（带多重后备）
 */
export const DM_SELECTORS = {
  // 顶部导航栏
  NAVIGATION: 'nav',
  DIRECT_MESSAGE_ICON: 'a[href="/direct/inbox/"]',
  DIRECT_MESSAGE_ICON_FALLBACK: 'svg[aria-label="Messenger"]',
  DIRECT_MESSAGE_ICON_FALLBACK2: 'svg[aria-label="Direct"]',

  // 新消息按钮
  NEW_MESSAGE_BUTTON: 'div[role="button"]:has(svg[aria-label*="New"])',
  NEW_MESSAGE_BUTTON_FALLBACK: 'button:has(svg[aria-label*="ew"])', // "New" in some fonts
  NEW_MESSAGE_BUTTON_FALLBACK2: 'div[tabindex="0"] svg[aria-label*="message"]',

  // 搜索用户输入框
  SEARCH_INPUT: 'input[name="queryInput"]',
  SEARCH_INPUT_FALLBACK: 'input[placeholder*="Search"]',
  SEARCH_INPUT_FALLBACK2: 'input[type="text"]',
  SEARCH_INPUT_FALLBACK3: 'textarea[placeholder*="Search"]',

  // 搜索结果
  USER_SEARCH_RESULT: 'div[role="option"]',
  USER_SEARCH_RESULT_FALLBACK: 'div[role="grid"] > div[role="presentation"]',
  USER_ITEM: 'div[role="row"]',

  // 消息输入框
  MESSAGE_INPUT: 'div[contenteditable="true"][role="textbox"]',
  MESSAGE_INPUT_FALLBACK: 'div[contenteditable="true"]',
  MESSAGE_INPUT_FALLBACK2: 'textarea[placeholder*="Message"]',

  // 发送按钮 - 通过多种方式查找
  SEND_BUTTON: 'div[role="button"]',
  SEND_BUTTON_FALLBACK: 'button[type="submit"]',

  // 聊天容器
  CHAT_CONTAINER: 'div[role="main"]',
  MESSAGE_LIST: 'div[role="log"]',

  // 错误提示文本
  ERROR_TEXTS: [
    'You cannot message this account',
    'You need to follow',
    'blocked',
    'restricted',
    'cannot be messaged',
    'try again later',
    'action blocked',
  ],

  // 加载指示器
  LOADING_INDICATORS: [
    'svg[role="img"]',
    'span[aria-busy="true"]',
    '.coreClientLoadingIndicator',
  ],
};

/**
 * 模拟鼠标移动（贝塞尔曲线路径）
 */
async function simulateMouseMove(
  element: HTMLElement,
  duration: number = 500
): Promise<void> {
  const rect = element.getBoundingClientRect();
  const targetX = rect.left + rect.width / 2;
  const targetY = rect.top + rect.height / 2;

  // 获取当前鼠标位置（默认为中心）
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2;

  const steps = 20;
  const stepDuration = duration / steps;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // 贝塞尔曲线插值
    const x = startX + (targetX - startX) * t;
    const y = startY + (targetY - startY) * t;

    // 创建鼠标移动事件
    element.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      })
    );

    await sleep(stepDuration + randomDelay(-10, 10));
  }
}

/**
 * 拟人化点击元素
 */
async function humanClick(element: HTMLElement, delay: number = 200): Promise<void> {
  // 鼠标移动到元素
  await simulateMouseMove(element, delay);

  // 随机延迟（模拟思考时间）
  await sleep(randomDelay(100, 300));

  // 触发鼠标按下
  element.dispatchEvent(
    new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      buttons: 1,
    })
  );

  // 短暂延迟
  await sleep(randomDelay(50, 150));

  // 触发鼠标抬起
  element.dispatchEvent(
    new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      buttons: 1,
    })
  );

  // 触发点击事件
  element.click();

  // 点击后延迟
  await sleep(randomDelay(100, 200));
}

/**
 * 拟人化输入文字（包括停顿、回退、修正）
 */
async function humanType(
  element: HTMLElement,
  text: string,
  speed: { min: number; max: number }
): Promise<void> {
  // 清空现有内容
  element.textContent = '';
  element.focus();
  await sleep(randomDelay(100, 300));

  let currentText = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // 模拟真实打字行为
    const shouldPause = Math.random() < 0.1; // 10% 概率停顿
    const shouldBackspace = Math.random() < 0.03; // 3% 概率打错回退

    if (shouldPause) {
      // 随机停顿 500-1500ms（思考时间）
      await sleep(randomDelay(500, 1500));
    }

    if (shouldBackspace && i > 3) {
      // 模拟打错字，回退 1-2 个字符
      const backspaces = Math.random() < 0.5 ? 1 : 2;
      for (let j = 0; j < backspaces && currentText.length > 0; j++) {
        currentText = currentText.slice(0, -1);
        element.textContent = currentText;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(randomDelay(80, 200));
      }
      // 稍微停顿后重新输入
      await sleep(randomDelay(200, 400));
    }

    // 输入字符
    currentText += char;
    element.textContent = currentText;

    // 触发 React 的 input 事件
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: char }));

    // 随机打字速度
    await sleep(randomDelay(speed.min, speed.max));
  }

  // 完成后的最终事件
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

  // 打完后短暂停顿
  await sleep(randomDelay(300, 600));
}

/**
 * 等待元素出现（带超时）
 */
async function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<HTMLElement | null> {
  const startTime = Date.now();
  const checkInterval = 100;

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element && isElementVisible(element)) {
      return element;
    }
    await sleep(checkInterval);
  }

  return null;
}

/**
 * 检查元素是否可见
 */
function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    window.getComputedStyle(element).display !== 'none' &&
    window.getComputedStyle(element).visibility !== 'hidden'
  );
}

/**
 * 等待多个选择器中的任意一个
 */
async function waitForAnyElement(
  selectors: string[],
  timeout: number = 5000
): Promise<HTMLElement | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector) as HTMLElement;
        if (element && isElementVisible(element)) {
          return element;
        }
      } catch (e) {
        // 选择器可能无效，继续尝试下一个
      }
    }
    await sleep(100);
  }

  return null;
}

/**
 * 打开私信界面（使用点击操作）
 */
export async function openNewDM(username: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`[Instagram DM] Opening DM for user: @${username}`);

    // 步骤 1: 检查是否已经在私信页面
    if (window.location.pathname.includes('/direct/')) {
      console.log('[Instagram DM] Already on DM page');
      // 如果已经在私信页面但不是新消息页面，点击新消息按钮
      if (!window.location.pathname.includes('/direct/new/')) {
        await clickNewMessageButton();
      }
      return await searchAndSelectUser(username);
    }

    // 步骤 2: 点击导航栏的私信图标
    console.log('[Instagram DM] Clicking direct message icon');
    const dmIconClicked = await clickDirectMessageIcon();
    if (!dmIconClicked) {
      throw new Error('无法找到或点击私信图标');
    }

    // 等待页面加载
    await sleep(randomDelay(1500, 2500));

    // 步骤 3: 点击新消息按钮
    console.log('[Instagram DM] Clicking new message button');
    const newMessageClicked = await clickNewMessageButton();
    if (!newMessageClicked) {
      throw new Error('无法找到或点击新消息按钮');
    }

    // 等待新消息页面加载
    await sleep(randomDelay(1000, 2000));

    // 步骤 4: 搜索并选择用户
    return await searchAndSelectUser(username);
  } catch (error) {
    console.error('[Instagram DM] Error in openNewDM:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * 点击导航栏的私信图标
 */
async function clickDirectMessageIcon(): Promise<boolean> {
  try {
    // 尝试多个选择器
    const dmIcon = await waitForAnyElement(
      [
        DM_SELECTORS.DIRECT_MESSAGE_ICON,
        DM_SELECTORS.DIRECT_MESSAGE_ICON_FALLBACK,
        DM_SELECTORS.DIRECT_MESSAGE_ICON_FALLBACK2,
      ],
      5000
    );

    if (!dmIcon) {
      // 如果找不到特定的图标，尝试查找包含 "Messenger" 或 "Direct" 的链接
      const allLinks = Array.from(document.querySelectorAll('a[href*="/direct"]'));
      const dmLink = allLinks.find(
        (link) =>
          link.textContent?.toLowerCase().includes('messenger') ||
          link.textContent?.toLowerCase().includes('direct')
      ) as HTMLElement;

      if (dmLink) {
        await humanClick(dmLink, 300);
        return true;
      }

      return false;
    }

    await humanClick(dmIcon, 300);
    return true;
  } catch (error) {
    console.error('[Instagram DM] Error clicking DM icon:', error);
    return false;
  }
}

/**
 * 点击新消息按钮
 */
async function clickNewMessageButton(): Promise<boolean> {
  try {
    const newMessageBtn = await waitForAnyElement(
      [
        DM_SELECTORS.NEW_MESSAGE_BUTTON,
        DM_SELECTORS.NEW_MESSAGE_BUTTON_FALLBACK,
        DM_SELECTORS.NEW_MESSAGE_BUTTON_FALLBACK2,
      ],
      5000
    );

    if (!newMessageBtn) {
      return false;
    }

    await humanClick(newMessageBtn, 250);
    return true;
  } catch (error) {
    console.error('[Instagram DM] Error clicking new message button:', error);
    return false;
  }
}

/**
 * 搜索并选择用户
 */
async function searchAndSelectUser(username: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`[Instagram DM] Searching for user: @${username}`);

    // 等待搜索输入框出现
    const searchInput = await waitForAnyElement(
      [
        DM_SELECTORS.SEARCH_INPUT,
        DM_SELECTORS.SEARCH_INPUT_FALLBACK,
        DM_SELECTORS.SEARCH_INPUT_FALLBACK2,
        DM_SELECTORS.SEARCH_INPUT_FALLBACK3,
      ],
      5000
    );

    if (!searchInput) {
      throw new Error('找不到搜索输入框');
    }

    // 聚焦并输入用户名
    searchInput.focus();
    await sleep(randomDelay(200, 400));

    // 使用拟人化输入
    await humanType(searchInput, username, { min: 80, max: 200 });

    // 等待搜索结果加载
    await sleep(randomDelay(1500, 2500));

    // 检查是否有错误提示
    const errorCheck = checkForErrors();
    if (errorCheck.hasError) {
      return { success: false, error: errorCheck.error };
    }

    // 查找并点击用户
    const userFound = await clickSearchResult(username);
    if (!userFound) {
      throw new Error(`在搜索结果中未找到用户: @${username}`);
    }

    // 等待聊天界面加载
    await sleep(randomDelay(1000, 2000));

    return { success: true };
  } catch (error) {
    console.error('[Instagram DM] Error in searchAndSelectUser:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * 在搜索结果中查找并点击用户
 */
async function clickSearchResult(username: string): Promise<boolean> {
  try {
    // 等待搜索结果出现
    await sleep(randomDelay(1000, 1500));

    // 尝试多种方式查找用户
    const userSelectors = [
      DM_SELECTORS.USER_SEARCH_RESULT,
      DM_SELECTORS.USER_SEARCH_RESULT_FALLBACK,
      DM_SELECTORS.USER_ITEM,
    ];

    for (const selector of userSelectors) {
      const results = Array.from(document.querySelectorAll(selector));

      for (const result of results) {
        const text = result.textContent?.toLowerCase() || '';
        // 匹配用户名（不区分大小写）
        if (text.includes(username.toLowerCase().replace('@', ''))) {
          console.log(`[Instagram DM] Found user in results: @${username}`);
          const element = result as HTMLElement;
          await humanClick(element, 200);
          return true;
        }
      }
    }

    // 如果还没找到，尝试通过文本内容查找
    const allElements = Array.from(document.querySelectorAll('*'));
    for (const element of allElements) {
      const text = element.textContent?.trim();
      if (
        text &&
        text.toLowerCase() === username.toLowerCase().replace('@', '') &&
        element.children.length === 0 // 确保是文本节点
      ) {
        const parent = element.parentElement as HTMLElement;
        if (parent && parent.getAttribute('role') !== 'button') {
          await humanClick(parent, 200);
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('[Instagram DM] Error clicking search result:', error);
    return false;
  }
}

/**
 * 发送消息（拟人化）
 */
export async function sendMessage(
  message: string,
  typingSpeed: { min: number; max: number }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log('[Instagram DM] Sending message:', message.substring(0, 50) + '...');

    // 再次检查错误
    const errorCheck = checkForErrors();
    if (errorCheck.hasError) {
      return { success: false, error: errorCheck.error };
    }

    // 等待消息输入框出现
    const messageInput = await waitForAnyElement(
      [
        DM_SELECTORS.MESSAGE_INPUT,
        DM_SELECTORS.MESSAGE_INPUT_FALLBACK,
        DM_SELECTORS.MESSAGE_INPUT_FALLBACK2,
      ],
      5000
    );

    if (!messageInput) {
      throw new Error('找不到消息输入框');
    }

    // 聚焦输入框
    messageInput.focus();
    await sleep(randomDelay(200, 400));

    // 拟人化输入消息
    console.log('[Instagram DM] Typing message with human-like behavior');
    await humanType(messageInput, message, typingSpeed);

    // 输入完成后短暂停顿（模拟用户检查消息）
    await sleep(randomDelay(500, 1500));

    // 查找并点击发送按钮
    console.log('[Instagram DM] Looking for send button');
    const sendClicked = await clickSendButton();
    if (!sendClicked) {
      throw new Error('找不到或无法点击发送按钮');
    }

    // 等待消息发送完成
    await sleep(randomDelay(1000, 2000));

    console.log('[Instagram DM] Message sent successfully');
    return { success: true };
  } catch (error) {
    console.error('[Instagram DM] Error sending message:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * 查找并点击发送按钮
 */
async function clickSendButton(): Promise<boolean> {
  try {
    // 等待一下，确保发送按钮出现
    await sleep(randomDelay(500, 1000));

    // 方法 1: 通过文本查找
    const allButtons = Array.from(document.querySelectorAll('div[role="button"], button'));
    for (const button of allButtons) {
      const text = button.textContent?.trim().toLowerCase() || '';
      // 查找包含 "send" 的按钮
      if (text === 'send' || text === 'send message' || text === '发送') {
        console.log('[Instagram DM] Found send button by text');
        await humanClick(button as HTMLElement, 150);
        return true;
      }
    }

    // 方法 2: 查找发送图标（通常是纸飞机图标）
    const iconButtons = Array.from(document.querySelectorAll('svg'));
    for (const icon of iconButtons) {
      const ariaLabel = icon.getAttribute('aria-label')?.toLowerCase() || '';
      if (ariaLabel.includes('send')) {
        const parent = icon.closest('div[role="button"]') as HTMLElement;
        if (parent) {
          console.log('[Instagram DM] Found send button by icon');
          await humanClick(parent, 150);
          return true;
        }
      }
    }

    // 方法 3: 查找提交按钮
    const submitBtn = document.querySelector('button[type="submit"]') as HTMLElement;
    if (submitBtn) {
      console.log('[Instagram DM] Found submit button');
      await humanClick(submitBtn, 150);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Instagram DM] Error clicking send button:', error);
    return false;
  }
}

/**
 * 检查错误状态
 */
export function checkForErrors(): {
  hasError: boolean;
  error?: string;
} {
  const bodyText = document.body.textContent?.toLowerCase() || '';

  for (const errorText of DM_SELECTORS.ERROR_TEXTS) {
    if (bodyText.includes(errorText.toLowerCase())) {
      console.warn('[Instagram DM] Error detected:', errorText);
      return {
        hasError: true,
        error: `检测到错误: ${errorText}`,
      };
    }
  }

  return { hasError: false };
}

/**
 * 生成随机延迟
 */
function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 休眠函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
