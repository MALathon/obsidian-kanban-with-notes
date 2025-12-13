import { browser, expect } from '@wdio/globals'

describe('Basic Kanban Functionality', function() {
    before(async function() {
        await browser.reloadObsidian({vault: "./test/vaults/main"});
        await browser.pause(2000);

        await browser.execute(async () => {
            const file = app.vault.getAbstractFileByPath("Test Board.md");
            if (file) {
                await app.workspace.getLeaf(false).openFile(file);
            }
        });
        await browser.pause(2000);
    })

    it('should load Obsidian and open a Kanban board', async () => {
        const appContainer = await $('body.mod-windows, body.mod-macos, body.mod-linux');
        await expect(appContainer).toBeExisting();
    })

    it('should display the Kanban board view', async () => {
        const kanbanBoard = await $('.kanban-plugin');
        await expect(kanbanBoard).toBeExisting();
    })

    it('should have board columns', async () => {
        const columns = await $$('.kanban-plugin__lane');
        expect(columns.length).toBeGreaterThan(0);
    })

    it('should display cards in columns', async () => {
        const cards = await $$('.kanban-plugin__item');
        expect(cards.length).toBeGreaterThan(0);
    })
})

describe('Board Notes - Default State', function() {
    before(async function() {
        await browser.reloadObsidian({vault: "./test/vaults/main"});
        await browser.pause(2000);

        await browser.execute(async () => {
            const file = app.vault.getAbstractFileByPath("Test Board.md");
            if (file) {
                await app.workspace.getLeaf(false).openFile(file);
            }
        });
        await browser.pause(2000);
    })

    it('should have board notes disabled by default', async () => {
        const boardNotes = await $('.kanban-plugin__board-notes');
        await expect(boardNotes).not.toBeExisting();
    })
})

describe('Board Notes - Full Feature Suite', function() {
    before(async function() {
        await browser.reloadObsidian({vault: "./test/vaults/main"});
        await browser.pause(2000);

        // Enable board notes
        await browser.execute(async () => {
            const plugin = (app as any).plugins.plugins['kanban-with-notes'];
            if (plugin) {
                plugin.settings['board-notes-enable'] = true;
                plugin.settings['board-notes-collapse'] = false;
                plugin.settings['board-notes-max-height'] = 200;
                await plugin.saveSettings();
            }
        });

        // Open the test board
        await browser.execute(async () => {
            const file = app.vault.getAbstractFileByPath("Test Board.md");
            if (file) {
                await app.workspace.getLeaf(false).openFile(file);
            }
        });
        await browser.pause(3000);
    })

    it('should display board notes container', async () => {
        const boardNotes = await $('.kanban-plugin__board-notes');
        await expect(boardNotes).toBeExisting();
    })

    it('should display the notes content from the markdown file', async () => {
        const boardNotes = await $('.kanban-plugin__board-notes');
        const text = await boardNotes.getText();
        expect(text).toContain('This is a test board with notes content');
    })

    it('should NOT display frontmatter in board notes', async () => {
        const boardNotes = await $('.kanban-plugin__board-notes');
        const text = await boardNotes.getText();
        expect(text).not.toContain('kanban-plugin: board');
        expect(text).not.toContain('---');
    })

    it('should have a collapse/expand button', async () => {
        const collapseBtn = await $('.kanban-plugin__board-notes-collapse-button');
        await expect(collapseBtn).toBeExisting();
    })

    it('should collapse when clicking the collapse button', async () => {
        const collapseBtn = await $('.kanban-plugin__board-notes-collapse-button');
        await collapseBtn.click();
        await browser.pause(500);

        const boardNotes = await $('.kanban-plugin__board-notes');
        const className = await boardNotes.getAttribute('class');
        expect(className).toContain('board-notes-collapsed');
    })

    it('should expand when clicking the collapse button again', async () => {
        const collapseBtn = await $('.kanban-plugin__board-notes-collapse-button');
        await collapseBtn.click();
        await browser.pause(500);

        const boardNotes = await $('.kanban-plugin__board-notes');
        const className = await boardNotes.getAttribute('class');
        expect(className).not.toContain('board-notes-collapsed');
    })

    it('should have an edit button', async () => {
        const editBtn = await $('.kanban-plugin__board-notes-edit-button');
        await expect(editBtn).toBeExisting();
    })

    it('should enter edit mode when clicking the edit button', async () => {
        const editBtn = await $('.kanban-plugin__board-notes-edit-button');
        await editBtn.click();
        await browser.pause(500);

        const boardNotes = await $('.kanban-plugin__board-notes');
        const className = await boardNotes.getAttribute('class');
        expect(className).toContain('board-notes-editing');

        const saveBtn = await $('.kanban-plugin__board-notes-save-button');
        const cancelBtn = await $('.kanban-plugin__board-notes-cancel-button');
        await expect(saveBtn).toBeExisting();
        await expect(cancelBtn).toBeExisting();
    })

    it('should exit edit mode when clicking cancel', async () => {
        const cancelBtn = await $('.kanban-plugin__board-notes-cancel-button');
        await cancelBtn.click();
        await browser.pause(500);

        const boardNotes = await $('.kanban-plugin__board-notes');
        const className = await boardNotes.getAttribute('class');
        expect(className).not.toContain('board-notes-editing');
    })

    it('should respect the max-height setting', async () => {
        const content = await $('.kanban-plugin__board-notes-content');
        const style = await content.getAttribute('style');
        expect(style).toContain('max-height');
    })
})
