import * as path from "path"
import type { Options } from '@wdio/types'

export const config: Options.Testrunner = {
    runner: 'local',
    framework: 'mocha',
    specs: ['./test/specs/**/*.e2e.ts'],
    maxInstances: 4,

    capabilities: [{
        browserName: 'obsidian',
        browserVersion: "latest",
        'wdio:obsidianOptions': {
            installerVersion: "earliest",
            plugins: ["."],
            vault: "test/vaults/main",
        },
    }],

    services: ["obsidian"],
    reporters: ['obsidian'],

    cacheDir: path.resolve(".obsidian-cache"),

    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },

    logLevel: "warn",
}
