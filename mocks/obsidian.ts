
export class App { }
export class Plugin { }
export class PluginSettingTab { }
export class ItemView { }
export class TFile {
    basename: string;
    path: string;
    constructor() {
        this.basename = 'mock-file';
        this.path = 'mock-path';
    }
}
export class WorkspaceLeaf { }
export const debounce = (fn: Function, delay: number, immediate: boolean) => fn;
export const Notice = class { };
export const setIcon = () => { };
