import { browser, expect } from '@wdio/globals'

describe('Kanban Plugin - Basic Integration', function() {
    before(async function() {
        // Reload Obsidian with test vault
        await browser.reloadObsidian({vault: "./test/vaults/main"});
        await browser.pause(2000);

        // Open Test Board.md using Obsidian API
        await browser.execute(async () => {
            const file = app.vault.getAbstractFileByPath("Test Board.md");
            if (file) {
                await app.workspace.getLeaf(false).openFile(file);
            }
        });
        await browser.pause(2000);
    })

    it('should load Obsidian and open a Kanban board', async () => {
        // Verify Obsidian loaded
        const appContainer = await $('body.mod-windows, body.mod-macos, body.mod-linux');
        await expect(appContainer).toBeExisting();
    })

    it('should display the Kanban board view', async () => {
        // Check for kanban board container
        const kanbanBoard = await $('.kanban-plugin');
        await expect(kanbanBoard).toBeExisting();
    })

    it('should have board columns', async () => {
        // Verify columns exist (To Do, In Progress, Done from Test Board.md)
        const columns = await $$('.kanban-plugin__lane');
        expect(columns.length).toBeGreaterThan(0);
    })

    it('should display cards in columns', async () => {
        // Verify there are cards (items) in the board
        const cards = await $$('.kanban-plugin__item');
        expect(cards.length).toBeGreaterThan(0);
    })
})
