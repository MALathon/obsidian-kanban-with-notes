# E2E Testing - Board Notes Feature Validation

This project uses **[wdio-obsidian-service](https://github.com/jesse-r-s-hines/wdio-obsidian-service)** for comprehensive end-to-end testing of the Board Notes feature.

## 🎯 What We Test

### Test Suite Overview: 15 Tests, All Passing ✅

**1. Basic Kanban Functionality (4 tests)**
- Obsidian loads correctly
- Kanban board view renders
- Columns display properly
- Cards appear in columns

**2. Board Notes - Default State (1 test)**
- Board notes are disabled by default (as documented)

**3. Board Notes - Full Feature Suite (10 tests)**
- ✅ Board notes container displays when enabled
- ✅ Notes content renders from markdown (text before first `##`)
- ✅ Frontmatter is properly excluded from display
- ✅ Collapse/expand button exists and functions
- ✅ Collapsing/expanding changes visual state
- ✅ Edit button exists
- ✅ Edit mode activates with save/cancel buttons
- ✅ Cancel button exits edit mode
- ✅ Max-height setting is respected

---

## 🔬 Why wdio-obsidian-service?

[wdio-obsidian-service](https://github.com/jesse-r-s-hines/wdio-obsidian-service) is a **purpose-built** WebdriverIO service for testing Obsidian plugins:

- ✅ **Built for Obsidian** - Understands Obsidian's architecture and APIs
- ✅ **Helper functions** - `executeObsidianCommand()`, `reloadObsidian()`, etc.
- ✅ **CI/CD Ready** - Proven to work in GitHub Actions
- ✅ **Cross-platform** - Windows, macOS, Linux support
- ✅ **Real UI Testing** - Actual Obsidian app runs, not mocked

### Why Not Playwright?

We initially tried Playwright for Electron testing, but encountered:
- Timeouts connecting to packaged Electron apps
- Chrome DevTools Protocol connection issues
- No Obsidian-specific helpers

**wdio-obsidian-service solved all these problems** and is maintained specifically for Obsidian plugin developers.

---

## 🚀 Running Tests Locally

### Prerequisites

```bash
# Install dependencies (one time)
npm install

# Build the plugin
npm run build
```

### Run E2E Tests

```bash
# Run all tests
npm run test:e2e

# Run with verbose output
npx wdio run ./wdio.conf.mts --logLevel trace
```

### First Run Behavior

On first run, wdio-obsidian-service will:
1. Download Obsidian (v1.10.6) - cached in `.obsidian-cache/`
2. Download appropriate chromedriver
3. Set up test vault
4. Run tests

**Subsequent runs are much faster** due to caching.

---

## 📁 Test Structure

```
test/
├── vaults/
│   └── main/              # Test vault with sample boards
│       └── Test Board.md  # Kanban board with board notes
└── specs/
    └── board-notes.e2e.ts # E2E test suite (15 tests)
```

### Test Vault (`test/vaults/main/Test Board.md`)

```markdown
---
kanban-plugin: board
---

This is a test board with notes content before the columns.
This should appear in the board notes section when enabled.

## To Do
- [ ] Task 1
- [ ] Task 2

## In Progress
- [ ] Task 3

## Done
- [x] Completed task
```

---

## ✍️ Writing Tests

Tests use WebdriverIO + Mocha with Obsidian-specific helpers:

```typescript
import { browser, expect } from '@wdio/globals'

describe('My Feature', function() {
    before(async function() {
        // Reload Obsidian with test vault
        await browser.reloadObsidian({vault: "./test/vaults/main"});
        await browser.pause(2000);

        // Open a file using Obsidian API
        await browser.execute(async () => {
            const file = app.vault.getAbstractFileByPath("Test Board.md");
            if (file) {
                await app.workspace.getLeaf(false).openFile(file);
            }
        });
    })

    it('should verify board notes display', async () => {
        // Find UI elements
        const boardNotes = await $('.kanban-plugin__board-notes');
        await expect(boardNotes).toBeExisting();

        // Read rendered text
        const text = await boardNotes.getText();
        expect(text).toContain('This is a test board');
    })
})
```

### Available Helpers

**Browser Commands:**
- `browser.reloadObsidian({vault: "path"})` - Reload with specific vault
- `browser.execute(async () => { /* code */ })` - Execute code in Obsidian context
- `browser.pause(ms)` - Wait for specified time

**Element Selectors:**
- `$('.class-name')` - Find single element
- `$$('.class-name')` - Find multiple elements

**Assertions:**
- `expect(element).toBeExisting()` - Element exists in DOM
- `expect(element).toBeDisplayed()` - Element is visible
- `expect(element).toHaveText('text')` - Element contains text

---

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

**Key Settings:**
- `browserVersion`: Obsidian version to test against
- `installerVersion`: Obsidian installer version
- `plugins`: Array of plugin paths to load
- `vault`: Path to test vault

---

## 🎬 CI/CD (GitHub Actions)

Tests run automatically on every push and PR via `.github/workflows/test.yml`.

### What Happens in CI:

1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Build plugin
5. ✅ Cache Obsidian binaries (faster subsequent runs)
6. ✅ Setup virtual display (xvfb + herbstluftwm for headless Linux)
7. ✅ Run E2E tests
8. ✅ Upload test results as artifacts

### View Test Results:

1. Go to repository → **Actions** tab
2. Click on latest workflow run
3. See test results and logs
4. Download test artifacts if available

---

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

### Check test logs

Logs are saved to `wdio-logs/` directory:
```bash
ls -la wdio-logs/
cat wdio-logs/wdio-*.log
```

---

## 📊 Test Output Example

```
» test/specs/board-notes.e2e.ts
Basic Kanban Functionality
   ✓ should load Obsidian and open a Kanban board
   ✓ should display the Kanban board view
   ✓ should have board columns
   ✓ should display cards in columns

Board Notes - Default State
   ✓ should have board notes disabled by default

Board Notes - Full Feature Suite
   ✓ should display board notes container
   ✓ should display the notes content from the markdown file
   ✓ should NOT display frontmatter in board notes
   ✓ should have a collapse/expand button
   ✓ should collapse when clicking the collapse button
   ✓ should expand when clicking the collapse button again
   ✓ should have an edit button
   ✓ should enter edit mode when clicking the edit button
   ✓ should exit edit mode when clicking cancel
   ✓ should respect the max-height setting

15 passing (18.5s)
```

---

## 📚 Resources

- **[wdio-obsidian-service Documentation](https://jesse-r-s-hines.github.io/wdio-obsidian-service/)**
- **[WebdriverIO Documentation](https://webdriver.io/docs/gettingstarted)**
- **[Sample Plugin with Tests](https://github.com/jesse-r-s-hines/wdio-obsidian-service-sample-plugin)**
- **[Mocha Test Framework](https://mochajs.org/)**

---

## 🎯 Coverage Goals

Current coverage focuses on **Board Notes** feature. Future enhancements:

- [ ] Test board notes with very long content (scrolling)
- [ ] Test board notes with embeds and images
- [ ] Test board notes editing and saving changes
- [ ] Test interaction with Tasks plugin checklists
- [ ] Add visual regression testing
- [ ] Test on multiple Obsidian versions

Contributions welcome!
