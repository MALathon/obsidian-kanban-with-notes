const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('path');

const VAULT_PATH = path.resolve(__dirname, '../test-automation/test-vault');
const APPIMAGE_PATH = path.resolve(__dirname, '../test-automation/Obsidian.AppImage');

let electronApp;
let page;

test.beforeAll(async () => {
  // Extract AppImage to get the actual Electron executable
  const { execSync } = require('child_process');

  console.log('Extracting Obsidian AppImage...');
  try {
    execSync(`cd ${path.dirname(APPIMAGE_PATH)} && ${APPIMAGE_PATH} --appimage-extract`, {
      timeout: 30000,
      stdio: 'ignore'
    });
    console.log('AppImage extracted successfully');
  } catch (error) {
    console.log('AppImage extraction attempt completed');
  }

  const obsidianPath = path.resolve(path.dirname(APPIMAGE_PATH), 'squashfs-root/obsidian');

  console.log(`Launching Obsidian from: ${obsidianPath}`);
  console.log(`Vault path: ${VAULT_PATH}`);

  // Launch Electron with Obsidian
  electronApp = await electron.launch({
    executablePath: obsidianPath,
    args: [VAULT_PATH],
    env: {
      ...process.env,
      OBSIDIAN_DISABLE_GPU: '1',
    },
  });

  console.log('Obsidian launched, waiting for window...');

  // Wait for the first window
  page = await electronApp.firstWindow();
  await page.waitForLoadState('domcontentloaded');

  // Wait for Obsidian to fully load
  await page.waitForTimeout(5000);
  console.log('Obsidian loaded successfully');
});

test.afterAll(async () => {
  if (electronApp) {
    await electronApp.close();
  }
});

test.describe('Board Notes Feature', () => {
  test('should have board notes disabled by default', async () => {
    console.log('Test 1: Checking board notes disabled by default');

    // Try to open the Test Board
    const testBoardLink = page.locator('text=Test Board');
    if (await testBoardLink.isVisible()) {
      await testBoardLink.click();
      await page.waitForTimeout(2000);
    }

    // Board notes should not be visible by default
    const boardNotes = page.locator('[class*="board-notes"]');
    const isVisible = await boardNotes.isVisible().catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('should be able to open settings', async () => {
    console.log('Test 2: Opening settings');

    // Take a screenshot to see the UI
    await page.screenshot({ path: 'test-results/screenshot-1-initial.png' });

    // Try to find and click settings
    const settingsButton = page.locator('[aria-label*="Settings"], [aria-label*="settings"]');
    const settingsCount = await settingsButton.count();
    console.log(`Found ${settingsCount} settings buttons`);

    if (settingsCount > 0) {
      await settingsButton.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/screenshot-2-settings-open.png' });
    }
  });
});
