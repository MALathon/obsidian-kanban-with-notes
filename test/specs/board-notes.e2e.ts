import { browser, expect } from '@wdio/globals'

describe('Board Notes Feature', function() {
    before(async function() {
        // Reload Obsidian with test vault
        await browser.reloadObsidian({vault: "./test/vaults/main"});

        // Wait for Obsidian to fully load
        await browser.pause(3000);
    })

    it('should have board notes disabled by default', async () => {
        // Open the Test Board
        await browser.executeObsidianCommand("file-explorer:open-file");
        await browser.pause(1000);

        // Click on Test Board.md
        const testBoard = await $('div.nav-file-title[data-path="Test Board.md"]');
        await testBoard.click();
        await browser.pause(2000);

        // Board notes should not be visible by default
        const boardNotes = await $('.kanban-plugin__board-notes');
        await expect(boardNotes).not.toBeExisting();
    })

    it('should enable board notes in settings', async () => {
        // Open settings
        await browser.executeObsidianCommand("app:open-settings");
        await browser.pause(1000);

        // Navigate to plugin settings
        const pluginTab = await $('div.vertical-tab-header-group-title*=Community plugins');
        await pluginTab.click();
        await browser.pause(500);

        // Click on Kanban with Notes settings
        const kanbanSettings = await $('div.vertical-tab-nav-item*=Kanban with Notes');
        await kanbanSettings.click();
        await browser.pause(1000);

        // Toggle "Show board notes" setting
        const boardNotesToggle = await $('div.setting-item*=Show board notes').$('input.checkbox-container');
        await boardNotesToggle.click();
        await browser.pause(500);

        // Close settings
        await browser.keys(['Escape']);
        await browser.pause(1000);
    })

    it('should display board notes after enabling', async () => {
        // Board notes should now be visible
        const boardNotes = await $('.kanban-plugin__board-notes');
        await expect(boardNotes).toBeExisting();

        // Should contain the notes text
        const notesText = await boardNotes.getText();
        await expect(notesText).toContain('This is a test board with notes content');
    })

    it('should not display frontmatter in board notes', async () => {
        const boardNotes = await $('.kanban-plugin__board-notes');
        const notesText = await boardNotes.getText();

        // Should NOT contain frontmatter
        await expect(notesText).not.toContain('kanban-plugin: board');
        await expect(notesText).not.toContain('---');
    })

    it('should have collapse/expand functionality', async () => {
        // Find collapse button
        const collapseBtn = await $('.kanban-plugin__board-notes-collapse-btn');
        await expect(collapseBtn).toBeExisting();

        // Click to collapse
        await collapseBtn.click();
        await browser.pause(500);

        // Content should be hidden
        const content = await $('.kanban-plugin__board-notes-content');
        const isCollapsed = await content.getAttribute('class');
        await expect(isCollapsed).toContain('is-collapsed');

        // Click to expand
        await collapseBtn.click();
        await browser.pause(500);

        // Content should be visible
        const isExpanded = await content.getAttribute('class');
        await expect(isExpanded).not.toContain('is-collapsed');
    })

    it('should have edit button', async () => {
        const editBtn = await $('.kanban-plugin__board-notes-edit-btn');
        await expect(editBtn).toBeExisting();
    })

    it('should allow editing board notes', async () => {
        // Click edit button
        const editBtn = await $('.kanban-plugin__board-notes-edit-btn');
        await editBtn.click();
        await browser.pause(500);

        // Textarea should appear
        const textarea = await $('.kanban-plugin__board-notes textarea');
        await expect(textarea).toBeExisting();

        // Save and cancel buttons should exist
        const saveBtn = await $('.kanban-plugin__board-notes-save-btn');
        const cancelBtn = await $('.kanban-plugin__board-notes-cancel-btn');
        await expect(saveBtn).toBeExisting();
        await expect(cancelBtn).toBeExisting();

        // Click cancel
        await cancelBtn.click();
        await browser.pause(500);

        // Should return to view mode
        await expect(textarea).not.toBeDisplayed();
    })

    it('should respect max-height setting', async () => {
        const content = await $('.kanban-plugin__board-notes-content');

        // Get computed style
        const maxHeight = await browser.execute((el: HTMLElement) => {
            return window.getComputedStyle(el).maxHeight;
        }, content);

        // Should have max-height set (default 200px)
        expect(maxHeight).toBe('200px');
    })
})
