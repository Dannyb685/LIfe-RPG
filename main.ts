import { Plugin, ItemView, WorkspaceLeaf, PluginSettingTab, App as ObsidianApp } from 'obsidian';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import Settings from './components/Settings';
import { loadGameData, saveGameData } from './services/persistenceService';
import { parseVault } from './services/markdownService';

export const VIEW_TYPE_LIFE_RPG = 'life-rpg-view';

class LifeRPGSettingTab extends PluginSettingTab {
    plugin: LifeRPGPlugin;
    root: ReactDOM.Root | null = null;

    constructor(app: ObsidianApp, plugin: LifeRPGPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('life-rpg-settings');

        // Mount React Settings
        this.root = ReactDOM.createRoot(containerEl);

        // Load data on open
        const init = async () => {
            const data = await loadGameData(this.plugin);
            // We need to parse vault for unknown sources
            const files = this.app.vault.getMarkdownFiles();
            const relevantFiles = files.filter(f => f.path.includes('Daily/') || f.path.includes('Journal/'));
            // This might be slow on large vaults, ideally we cache unknown sources? 
            // For now, we run it live to catch latest unknowns.
            const gameState = await parseVault(this.app, relevantFiles, data.settings.defaultXp, data.settings.customMappings);

            const assetBasePath = this.app.vault.adapter.getResourcePath(`${this.plugin.manifest.dir}/assets`);

            this.root?.render(
                React.createElement(Settings, {
                    defaultXp: data.settings.defaultXp,
                    soundEnabled: data.settings.soundEnabled,
                    themeMode: data.settings.themeMode,
                    manualThemeId: data.settings.manualThemeId,
                    vaultMappings: data.settings.vaultMappings,
                    customMappings: data.settings.customMappings,
                    unknownSources: gameState.unknownSources,
                    onSave: (newSettings) => {
                        const updatedData = { ...data, settings: { ...data.settings, ...newSettings } };
                        saveGameData(this.plugin, updatedData);
                    },
                    assetBasePath: assetBasePath
                })
            );
        };
        init();
    }

    hide() {
        if (this.root) {
            this.root.unmount();
        }
    }
}

class LifeRPGView extends ItemView {
    plugin: LifeRPGPlugin;
    root: ReactDOM.Root | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: LifeRPGPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE_LIFE_RPG;
    }

    getDisplayText() {
        return 'Life RPG';
    }

    getIcon() {
        return 'sword'; // Obsidian icon name
    }

    async onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('life-rpg-view');

        // Mount React App
        this.root = ReactDOM.createRoot(contentEl);
        this.root.render(
            React.createElement(App, {
                app: this.app,
                plugin: this.plugin
            })
        );
    }

    async onClose() {
        if (this.root) {
            this.root.unmount();
        }
    }
}

export default class LifeRPGPlugin extends Plugin {
    async onload() {
        (this as any).registerView(
            VIEW_TYPE_LIFE_RPG,
            (leaf: WorkspaceLeaf) => new LifeRPGView(leaf, this)
        );

        this.addSettingTab(new LifeRPGSettingTab(this.app, this));

        (this as any).addRibbonIcon('sword', 'Life RPG', () => {
            this.activateView();
        });

        (this as any).addCommand({
            id: 'open-life-rpg',
            name: 'Open Dashboard',
            callback: () => {
                this.activateView();
            }
        });
    }

    async activateView() {
        const { workspace } = (this as any).app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_LIFE_RPG);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE_LIFE_RPG, active: true });
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }
}