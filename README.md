# DM Bot Extension

A browser extension that allows you to quickly send DMs to Instagram creators directly from their profile pages.

## Features

- ✅ Quick DM button on Instagram profile pages
- ✅ Quick message templates
- ✅ Cross-browser support (Chrome, Firefox, Edge)
- ✅ Built with WXT framework + React + TypeScript
- ✅ Shadow DOM for style isolation
- ✅ Instagram SPA navigation monitoring

## Tech Stack

- **Framework**: [WXT](https://wxt.dev/) - Modern web extension framework
- **UI**: React 19 + TypeScript
- **Package Manager**: pnpm
- **Manifest Version**: V3

## Installation

```bash
# Install dependencies
pnpm install

# Development mode (Chrome)
pnpm dev

# Development mode (Firefox)
pnpm dev:firefox

# Build for production
pnpm build

# Build for Firefox
pnpm build:firefox
```

## Loading the Extension

### Chrome

1. Run `pnpm dev` or `pnpm build`
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `.output/chrome-mv3/` directory
6. Visit any Instagram profile to see the DM button

### Firefox

1. Run `pnpm dev:firefox` or `pnpm build:firefox`
2. Open `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select `.output/firefox-mv2/manifest.json`
5. Visit any Instagram profile

### Edge

1. Run `pnpm build`
2. Open `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `.output/chrome-mv3/` directory

## Project Structure

```
dm-bot-ext/
├── entrypoints/
│   ├── background.ts          # Background service worker
│   ├── content.tsx            # Main content script
│   └── popup/                 # Extension popup UI
├── components/
│   └── DMButton.tsx           # Injected DM button
├── lib/
│   ├── instagram-dom.ts       # Instagram DOM utilities
│   └── mount-dm-button.ts     # Shadow DOM mounting logic
├── hooks/
│   └── useInstagramNavigation.ts  # SPA navigation
├── types/
│   └── instagram.ts           # Type definitions
└── assets/
    └── icon.svg               # Extension icon
```

## How It Works

1. **Content Script Injection**: The extension injects a content script into Instagram pages
2. **Profile Detection**: Detects when you're on a profile page using URL patterns
3. **Shadow DOM**: Uses Shadow DOM to isolate the button from Instagram's styles
4. **Navigation Monitoring**: Monitors Instagram's client-side navigation to re-inject the button when navigating between profiles
5. **Quick DM**: Click the button to quickly navigate to the DM page for that user

## Development

```bash
# Type checking
pnpm compile

# Build for all browsers
pnpm build
pnpm build:firefox

# Create ZIP for store submission
pnpm zip
pnpm zip:firefox
```

## License

MIT

## Author

Created with ❤️ using WXT framework
