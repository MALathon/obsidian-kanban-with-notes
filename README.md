# Kanban with Notes

A fork of [obsidian-kanban](https://github.com/mgmeyers/obsidian-kanban) by mgmeyers with **inline board notes** support.

Create markdown-backed Kanban boards in [Obsidian](https://obsidian.md/) with a dedicated notes section at the top of each board.

## New Feature: Board Notes

Add notes directly to your Kanban board that appear above the columns. Perfect for:
- Project descriptions and goals
- Quick reference information
- Task checklists (compatible with Tasks plugin)
- Links to related notes

### How it works

Content placed before the first `## Heading` in your Kanban markdown file is rendered as board notes:

```markdown
---
kanban-plugin: basic
---

These are my board notes! They support **full markdown**.

- [ ] Checklist item 1
- [ ] Checklist item 2

## Backlog

- [ ] Task 1

## In Progress

- [ ] Task 2
```

### Features

- **Collapsible** - Click the chevron to collapse/expand notes
- **Edit button** - Click the pencil icon to edit (or double-click the notes area)
- **Scrollable** - Long notes scroll within a configurable max height
- **Full markdown** - Supports formatting, links, embeds, checklists, etc.

## Settings

**Note: Board notes are disabled by default.** To enable them, go to Settings → Kanban with Notes → Board Notes and toggle "Enable board notes" on.

| Setting | Description | Default |
|---------|-------------|---------|
| Enable board notes | Toggle the feature on/off | Off |
| Collapse by default | Start with notes collapsed when opening a board | Off |
| Max height | Maximum height in pixels (0 = no limit) | 200px |

## Installation

### Via BRAT (recommended for beta testing)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from Community Plugins
2. Open BRAT settings → Add Beta Plugin
3. Enter: `MALathon/obsidian-kanban-with-notes`
4. Enable the plugin

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/MALathon/obsidian-kanban-with-notes/releases)
2. Create folder: `<your-vault>/.obsidian/plugins/kanban-with-notes/`
3. Copy the files into that folder
4. Reload Obsidian and enable the plugin

## Credits

This plugin is a fork of [obsidian-kanban](https://github.com/mgmeyers/obsidian-kanban) by [mgmeyers](https://github.com/mgmeyers). All credit for the core Kanban functionality goes to the original author.

### Original Plugin Support

If you find the core Kanban functionality useful, please consider supporting the original author:

[![GitHub Sponsors](https://img.shields.io/github/sponsors/mgmeyers?label=Sponsor&logo=GitHub%20Sponsors&style=for-the-badge)](https://github.com/sponsors/mgmeyers)

## License

MIT - See [LICENSE](LICENSE) for details.
