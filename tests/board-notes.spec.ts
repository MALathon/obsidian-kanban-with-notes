import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';
import { ElectronApplication, Page } from 'playwright';

let electronApp: ElectronApplication;
let page: Page;

const VAULT_PATH = path.resolve(__dirname, '../test-automation/test-vault');
const APPIMAGE_PATH = path.resolve(__dirname, '../test-automation/Obsidian.AppImage');

test.beforeAll(async () => {
  // Extract AppImage to get the actual Electron executable
  const { execSync } = require('child_process');

  // AppImages can be extracted using --appimage-extract
  // This creates a squashfs-root directory with the app contents
  const extractDir = path.resolve(__dirname, '../test-automation/obsidian-extracted');

  try {
    execSync(`cd ${path.dirname(APPIMAGE_PATH)} && ${APPIMAGE_PATH} --appimage-extract > /dev/null 2>&1`, {
      timeout: 30000
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
    args: ['--no-sandbox', '--disable-gpu', VAULT_PATH],
    env: {
      ...process.env,
      OBSIDIAN_DISABLE_GPU: '1', // Disable GPU for headless testing
    },
    timeout: 120000, // Increase timeout to 2 minutes
  });

  console.log('Obsidian process launched, waiting for window...');

  // Wait for the first window (with increased timeout)
  page = await electronApp.firstWindow({ timeout: 60000 });
  console.log('Window detected, waiting for DOM to load...');

  await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
  console.log('DOM loaded, waiting for Obsidian initialization...');

  // Wait for Obsidian to fully load (increase timeout for plugin loading)
  await page.waitForTimeout(10000);
  console.log('Obsidian should be fully loaded now');
}, 180000); // Set beforeAll timeout to 3 minutes

test.afterAll(async () => {
  await electronApp?.close();
});

test.describe('Board Notes Feature', () => {
  test('should have board notes disabled by default', async () => {
    // Open the Test Board
    await page.click('text=Test Board');
    await page.waitForTimeout(2000);

    // Board notes should not be visible by default (disabled setting)
    const boardNotes = await page.locator('.kanban-plugin__board-notes');
    await expect(boardNotes).not.toBeVisible();
  });

  test('should enable board notes in settings', async () => {
    // Open settings
    await page.click('[aria-label="Settings"]');
    await page.waitForTimeout(1000);

    // Navigate to Kanban with Notes settings
    await page.click('text=Kanban with Notes');
    await page.waitForTimeout(500);

    // Find and enable board notes
    const enableToggle = await page.locator('text=Enable board notes').locator('..').locator('input[type="checkbox"]');
    await enableToggle.click();
    await page.waitForTimeout(500);

    // Close settings
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  });

  test('should display board notes after enabling', async () => {
    // Board notes should now be visible
    const boardNotes = await page.locator('.kanban-plugin__board-notes');
    await expect(boardNotes).toBeVisible();

    // Check that the notes content is displayed
    const notesContent = await page.locator('.kanban-plugin__board-notes-content');
    await expect(notesContent).toContainText('This is a test board with notes content');
  });

  test('should not display frontmatter in board notes', async () => {
    const notesContent = await page.locator('.kanban-plugin__board-notes-content');

    // Verify frontmatter is NOT in the notes
    await expect(notesContent).not.toContainText('kanban-plugin: board');
    await expect(notesContent).not.toContainText('---');
  });

  test('should have collapse/expand functionality', async () => {
    // Find collapse button
    const collapseButton = await page.locator('.kanban-plugin__board-notes-collapse-button');
    await expect(collapseButton).toBeVisible();

    // Click to collapse
    await collapseButton.click();
    await page.waitForTimeout(300);

    // Content should be hidden
    const notesContent = await page.locator('.kanban-plugin__board-notes-content');
    await expect(notesContent).not.toBeVisible();

    // Click to expand
    await collapseButton.click();
    await page.waitForTimeout(300);

    // Content should be visible again
    await expect(notesContent).toBeVisible();
  });

  test('should have edit button', async () => {
    // Edit button should be visible when not editing
    const editButton = await page.locator('.kanban-plugin__board-notes-edit-button');
    await expect(editButton).toBeVisible();
  });

  test('should allow editing board notes', async () => {
    // Click edit button
    const editButton = await page.locator('.kanban-plugin__board-notes-edit-button');
    await editButton.click();
    await page.waitForTimeout(500);

    // Editor should be visible
    const editor = await page.locator('.kanban-plugin__board-notes-input');
    await expect(editor).toBeVisible();

    // Save and Cancel buttons should be visible
    const saveButton = await page.locator('.kanban-plugin__board-notes-save-button');
    const cancelButton = await page.locator('.kanban-plugin__board-notes-cancel-button');
    await expect(saveButton).toBeVisible();
    await expect(cancelButton).toBeVisible();

    // Cancel the edit
    await cancelButton.click();
    await page.waitForTimeout(300);
  });

  test('should respect max-height setting', async () => {
    // Open settings
    await page.click('[aria-label="Settings"]');
    await page.waitForTimeout(1000);

    // Navigate to Kanban with Notes settings
    await page.click('text=Kanban with Notes');
    await page.waitForTimeout(500);

    // Find max height input (default should be 200)
    const maxHeightInput = await page.locator('text=Board notes max height').locator('..').locator('input[type="number"]');
    const currentValue = await maxHeightInput.inputValue();
    expect(currentValue).toBe('200');

    // Close settings
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Check that max-height CSS is applied
    const notesContent = await page.locator('.kanban-plugin__board-notes-content');
    const maxHeight = await notesContent.evaluate((el) => getComputedStyle(el).maxHeight);
    expect(maxHeight).toBe('200px');
  });

  test('should allow disabling board notes', async () => {
    // Open settings
    await page.click('[aria-label="Settings"]');
    await page.waitForTimeout(1000);

    // Navigate to Kanban with Notes settings
    await page.click('text=Kanban with Notes');
    await page.waitForTimeout(500);

    // Disable board notes
    const enableToggle = await page.locator('text=Enable board notes').locator('..').locator('input[type="checkbox"]');
    await enableToggle.click();
    await page.waitForTimeout(500);

    // Close settings
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Board notes should no longer be visible
    const boardNotes = await page.locator('.kanban-plugin__board-notes');
    await expect(boardNotes).not.toBeVisible();
  });
});
