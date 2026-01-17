/**
 * Instagram DM 选择器验证脚本
 *
 * 使用方法：
 * 1. 登录 Instagram
 * 2. 打开浏览器开发者工具（F12）
 * 3. 在 Console 中粘贴并运行此脚本
 * 4. 查看哪些选择器有效，哪些无效
 */

(function() {
  'use strict';

  const SELECTORS = {
    // 导航栏
    DIRECT_MESSAGE_ICON: 'a[href="/direct/inbox/"]',
    DIRECT_MESSAGE_ICON_FALLBACK: 'svg[aria-label="Messenger"]',
    DIRECT_MESSAGE_ICON_FALLBACK2: 'svg[aria-label="Direct"]',

    // 新消息按钮
    NEW_MESSAGE_BUTTON: 'div[role="button"]:has(svg[aria-label*="New"])',
    NEW_MESSAGE_BUTTON_FALLBACK: 'button:has(svg[aria-label*="ew"])',
    NEW_MESSAGE_BUTTON_FALLBACK2: 'div[tabindex="0"] svg[aria-label*="message"]',

    // 搜索输入框
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
  };

  console.log('%c🔍 Instagram DM 选择器验证工具', 'font-size: 16px; font-weight: bold; color: #0095f6;');
  console.log('当前页面:', window.location.href);
  console.log('---\n');

  // 检查选择器是否有效
  function checkSelector(name, selector) {
    try {
      const elements = document.querySelectorAll(selector);
      const visibleElements = Array.from(elements).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (elements.length === 0) {
        console.log(`❌ ${name}: 未找到元素`);
        console.log(`   选择器: ${selector}`);
        return false;
      } else if (visibleElements.length === 0) {
        console.log(`⚠️  ${name}: 找到 ${elements.length} 个元素，但都不可见`);
        console.log(`   选择器: ${selector}`);
        return false;
      } else {
        console.log(`✅ ${name}: 找到 ${visibleElements.length} 个可见元素`);
        console.log(`   选择器: ${selector}`);
        if (visibleElements.length > 0) {
          const first = visibleElements[0];
          console.log(`   第一个元素:`, first);
          console.log(`   位置:`, first.getBoundingClientRect());
        }
        return true;
      }
    } catch (error) {
      console.log(`❌ ${name}: 选择器语法错误`);
      console.log(`   选择器: ${selector}`);
      console.log(`   错误:`, error.message);
      return false;
    }
  }

  // 检查当前页面状态
  console.log('%c📍 当前页面状态', 'font-size: 14px; font-weight: bold; color: #666;');
  if (window.location.pathname.includes('/direct/inbox')) {
    console.log('✅ 在私信收件箱页面');
  } else if (window.location.pathname.includes('/direct/new')) {
    console.log('✅ 在新私信页面');
  } else if (window.location.pathname.includes('/direct/')) {
    console.log('✅ 在私信对话页面');
  } else if (window.location.pathname.includes('/')) {
    console.log('✅ 在首页');
  } else {
    console.log('ℹ️  在其他页面');
  }

  // 测试所有选择器
  console.log('\n%c🔎 测试所有选择器', 'font-size: 14px; font-weight: bold; color: #666;');

  const results = {};

  for (const [name, selector] of Object.entries(SELECTORS)) {
    results[name] = checkSelector(name, selector);
    console.log('');
  }

  // 总结
  console.log('%c📊 测试总结', 'font-size: 14px; font-weight: bold; color: #666;');
  const total = Object.keys(SELECTORS).length;
  const passed = Object.values(results).filter(v => v).length;
  const failed = total - passed;

  console.log(`总计: ${total} 个选择器`);
  console.log(`✅ 通过: ${passed} 个`);
  console.log(`❌ 失败: ${failed} 个`);

  // 提供建议
  if (failed > 0) {
    console.log('\n%c💡 建议', 'font-size: 14px; font-weight: bold; color: #f5a623;');

    if (!window.location.pathname.includes('/direct')) {
      console.log('1. 你不在私信页面，请点击导航栏的私信图标');
      console.log('2. 或访问: https://www.instagram.com/direct/inbox/');
    } else if (!window.location.pathname.includes('/direct/new')) {
      console.log('1. 你在新私信页面');
      console.log('2. 点击"新消息"按钮后重新运行此脚本');
    }

    console.log('3. 检查 Instagram 是否更新了 DOM 结构');
    console.log('4. 在开发者工具中手动检查元素属性');
  }

  // 交互式帮助函数
  console.log('\n%c🛠️  可用命令', 'font-size: 14px; font-weight: bold; color: #666;');
  console.log('highlightElement(selector) - 高亮显示选择器匹配的元素');
  console.log('findAllClickable() - 查找页面上所有可点击的按钮');

  window.highlightElement = function(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
      console.log('高亮元素:', el);
    });
    console.log(`高亮了 ${elements.length} 个元素`);
  };

  window.findAllClickable = function() {
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a[href]'));
    const visible = buttons.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });

    console.log(`找到 ${visible.length} 个可点击元素:`);
    visible.slice(0, 20).forEach((btn, i) => {
      const text = btn.textContent?.trim().substring(0, 30) || '(无文本)';
      const ariaLabel = btn.getAttribute('aria-label') || '(无标签)';
      console.log(`${i + 1}. "${text}" - aria-label: "${ariaLabel}"`);
    });

    if (visible.length > 20) {
      console.log(`... 还有 ${visible.length - 20} 个元素`);
    }
  };

  console.log('\n%c✨ 辅助函数已加载到 window 对象', 'color: #0095f6;');
})();
