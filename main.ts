import { Plugin, ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

export const VIEW_TYPE_LIFE_RPG = 'life-rpg-view';

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
        const container = (this as any).containerEl.children[1];
        container.empty();
        
        // Mount React App
        // We cast this.app to any to pass it to React without importing complex types in App.tsx
        this.root = ReactDOM.createRoot(container);
        this.root.render(
            React.createElement(App, {
                app: (this as any).app,
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