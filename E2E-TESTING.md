# E2E Testing with wdio-obsidian-service

This project uses **wdio-obsidian-service** for end-to-end testing of the Kanban with Notes plugin.

## 🎯 What is wdio-obsidian-service?

[wdio-obsidian-service](https://github.com/jesse-r-s-hines/wdio-obsidian-service) is a WebdriverIO service specifically designed for testing Obsidian plugins. Unlike generic Electron testing tools, it:

- ✅ **Built for Obsidian** - Understands Obsidian's architecture and APIs
- ✅ **Helper functions** - `executeObsidianCommand()`, `reloadObsidian()`, etc.
- ✅ **Works in CI** - Proven to work in GitHub Actions
- ✅ **Multi-platform** - Windows, macOS, Linux support

## 🚀 Quick Start

### Run Tests Locally

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Run E2E tests
npm run test:e2e
```

### First Run

On first run, wdio-obsidian-service will:
1. Download the appropriate Obsidian version
2. Cache it in `.obsidian-cache/`
3. Set up a test vault
4. Run your tests

Subsequent runs are much faster due to caching.

## 📁 Test Structure

```
test/
├── vaults/
│   └── main/           # Test vault with sample Kanban boards
│       └── Test Board.md
└── specs/
    └── board-notes.e2e.ts  # E2E tests for board notes feature
```

## ✍️ Writing Tests

Tests use the WebdriverIO + Mocha framework with Obsidian-specific helpers:

```typescript
import { browser, expect } from '@wdio/globals'

describe('My Feature', function() {
    before(async function() {
        await browser.reloadObsidian({vault: "./test/vaults/main"});
    })

    it('should work correctly', async () => {
        // Execute Obsidian commands
        await browser.executeObsidianCommand("my-plugin:my-command");

        // Find elements
        const element = await $('.my-selector');
        await expect(element).toExist();

        // Interact with UI
        await element.click();
        await expect(element).toHaveText('Expected text');
    })
})
```

## 🧪 Available Test Helpers

### Browser Commands

- `browser.reloadObsidian({vault: "path"})` - Reload with a specific vault
- `browser.executeObsidianCommand("command-id")` - Execute any Obsidian command
- `browser.pause(ms)` - Wait for specified milliseconds

### Element Selectors

Use standard CSS selectors:
- `$('.class-name')` - Find single element
- `$$('.class-name')` - Find multiple elements
- `$('div.modal-container .modal-content')` - Complex selectors

### Assertions

- `expect(element).toExist()` - Element exists in DOM
- `expect(element).toBeDisplayed()` - Element is visible
- `expect(element).toHaveText('text')` - Element contains text
- `expect(element).toHaveAttribute('attr', 'value')` - Check attributes

## 🔧 Configuration

Edit `wdio.conf.mts` to customize:

```typescript
capabilities: [{
    browserName: 'obsidian',
    browserVersion: "latest",  // or "1.5.0", "earliest"
    'wdio:obsidianOptions': {
        installerVersion: "earliest",
        plugins: ["."],  // Your plugin
        vault: "test/vaults/main",
    },
}]
```

## 🎬 CI/CD (GitHub Actions)

Tests run automatically on every push and PR via `.github/workflows/test.yml`.

The workflow:
1. Builds the plugin
2. Caches Obsidian binaries for faster runs
3. Sets up virtual display (xvfb + herbstluftwm)
4. Runs E2E tests
5. Uploads test results as artifacts

## 🐛 Troubleshooting

### Tests fail with "Cannot find Obsidian"

Make sure you've built the plugin first:
```bash
npm run build
npm run test:e2e
```

### Tests timeout

Increase timeout in `wdio.conf.mts`:
```typescript
mochaOpts: {
    timeout: 120000,  // 2 minutes
}
```

### Clear cache and retry

```bash
rm -rf .obsidian-cache
npm run test:e2e
```

## 📚 Resources

- [wdio-obsidian-service Documentation](https://jesse-r-s-hines.github.io/wdio-obsidian-service/)
- [WebdriverIO Documentation](https://webdriver.io/docs/gettingstarted)
- [Sample Plugin](https://github.com/jesse-r-s-hines/wdio-obsidian-service-sample-plugin)
