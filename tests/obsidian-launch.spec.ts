import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';
import { ElectronApplication } from 'playwright';

test.describe('Obsidian Launch Test', () => {
  test('should launch Obsidian successfully', async () => {
    const VAULT_PATH = path.resolve(__dirname, '../test-automation/test-vault');
    // macOS: Obsidian.app/Contents/MacOS/Obsidian
    // Linux: squashfs-root/obsidian
    const isMac = process.platform === 'darwin';
    const obsidianPath = isMac
      ? path.resolve(__dirname, '../test-automation/Obsidian.app/Contents/MacOS/Obsidian')
      : path.resolve(__dirname, '../test-automation/squashfs-root/obsidian');

    console.log(`Platform: ${process.platform}`);
    console.log(`Launching Obsidian from: ${obsidianPath}`);
    console.log(`Vault path: ${VAULT_PATH}`);

    let electronApp: ElectronApplication | null = null;

    try {
      // Launch Electron with Obsidian
      electronApp = await electron.launch({
        executablePath: obsidianPath,
        args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', VAULT_PATH],
        env: {
          ...process.env,
          NODE_ENV: 'test',
          OBSIDIAN_DISABLE_GPU: '1',
          ELECTRON_ENABLE_LOGGING: '1',
        },
        timeout: 300000, // 5 minutes for CI environment
      });

      console.log('Obsidian launched successfully!');

      // Get all windows
      const windows = electronApp.windows();
      console.log(`Number of windows: ${windows.length}`);

      // Try to get first window (with fallback)
      let page;
      if (windows.length > 0) {
        page = windows[0];
      } else {
        console.log('Waiting for window to appear...');
        page = await electronApp.firstWindow({ timeout: 60000 });
      }

      console.log('Got window reference');

      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/obsidian-launch.png' });
      console.log('Screenshot saved');

      // Get page title
      const title = await page.title();
      console.log(`Page title: ${title}`);

      expect(title).toBeTruthy();

    } catch (error) {
      console.error('Error during test:', error);
      throw error;
    } finally {
      if (electronApp) {
        console.log('Closing Obsidian...');
        await electronApp.close();
      }
    }
  });
});
