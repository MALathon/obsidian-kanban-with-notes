import { browser } from '@wdio/globals'
import * as path from 'path'

describe('Fix Board Screenshot', function() {
    it('should capture board with notes properly visible', async () => {
        await browser.reloadObsidian({vault: "./test/vaults/main"});
        await browser.pause(3000);

        // Enable board notes first
        await browser.execute(async () => {
            const plugin = (app as any).plugins.plugins['kanban-with-notes'];
            if (plugin) {
                plugin.settings['board-notes-enable'] = true;
                plugin.settings['board-notes-collapse'] = false;
                plugin.settings['board-notes-max-height'] = 300;
                await plugin.saveSettings();
            }
        });
        await browser.pause(1000);

        // Open Demo Board
        await browser.execute(async () => {
            const file = app.vault.getAbstractFileByPath("Demo Board.md");
            if (file) {
                await app.workspace.getLeaf(false).openFile(file);
            }
        });

        // Wait longer for board to render
        await browser.pause(5000);

        // Verify board notes are visible
        const boardNotes = await $('.kanban-plugin__board-notes');
        const isVisible = await boardNotes.isDisplayed();
        console.log('Board notes visible:', isVisible);

        // Take screenshot of the entire view
        const boardPath = path.join(process.cwd(), 'docs', 'board-with-notes.png');
        await browser.saveScreenshot(boardPath);
        console.log(`Full screenshot saved to: ${boardPath}`);

        // Also try just the kanban container
        const kanbanView = await $('.kanban-plugin');
        if (await kanbanView.isExisting()) {
            const kanbanPath = path.join(process.cwd(), 'docs', 'board-with-notes-crop.png');
            await kanbanView.saveScreenshot(kanbanPath);
            console.log(`Kanban view screenshot saved to: ${kanbanPath}`);
        }
    })
})
