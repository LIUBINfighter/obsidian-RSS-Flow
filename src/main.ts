import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { VIEW_TYPES, ReactLabSettings } from "./types";
import { ReactLabSettingTab } from "./setting-tab";
import { ReadMeView } from "./views/readme-view";


const DEFAULT_SETTINGS: ReactLabSettings = {
    setting: 'default',
    kanbanLayout: 'horizontal',
    sidebarWidth: 250
}

export default class ReactLabPlugin extends Plugin {
    settings: ReactLabSettings;
    
    // 添加 activateView 方法
    async activateView(viewType = VIEW_TYPES.README) {
        const { workspace } = this.app;
        
        // 检查视图是否已经打开
        let leaf = workspace.getLeavesOfType(viewType)[0];
        
        if (!leaf) {
            // 如果视图未打开，创建新的叶子并打开视图
            leaf = workspace.getLeaf(false);
            await leaf.setViewState({
                type: viewType,
                active: true
            });
        }
        
        // 聚焦到视图
        workspace.revealLeaf(leaf);
    }

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new ReactLabSettingTab(this.app, this));

        // 注册 ReadMe 视图
        // 确保在注册视图时传递 plugin 实例
        this.registerView(
            VIEW_TYPES.README,
            (leaf) => new ReadMeView(leaf, this)  // 传递 this
        );
        // 注册一个命令
        this.addCommand({
            id: 'open-readme-view',
            name: 'Open ReadMe View',
            callback: () => {
                // 打开一个新的叶子
                this.activateView(VIEW_TYPES.README);
            },
        });
				
		// 添加 ribbon icon
		this.addRibbonIcon('flask-conical','React Lab',
			(evt: MouseEvent) => {
            // 激活视图
            this.activateView();
            }
        );
    }

async onunload() {
    // 清除所有已注册的视图
    this.app.workspace.getLeavesOfType(VIEW_TYPES.README).forEach(leaf => {
        leaf.detach();
    });
}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	
}


