import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    default_locale: 'en',
    version: '1.0.0',
    permissions: ['storage', 'activeTab'],
    host_permissions: ['https://*.instagram.com/*'],
    action: {
      default_popup: 'popup.html',
    },
  },
  webExt: {
    disabled: false,
  },
});
