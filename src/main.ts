import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, View } from 'obsidian';
import { VIEW_TYPES, ReactLabSettings } from "./types";
import { ReactLabSettingTab } from "./setting-tab";
import { ReadMeView } from "./views/readme-view";
import { ReadView } from './views/read-view';
import { GalleryView } from 'views/gallery-view';

const DEFAULT_SETTINGS: ReactLabSettings = {
    setting: 'default',
    sidebarWidth: 250
}

export default class RSSFlowPlugin extends Plugin {
    settings: ReactLabSettings;
    
    // 添加 activateView 方法
    async activateView(viewType: typeof VIEW_TYPES[keyof typeof VIEW_TYPES]) {
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

        this.registerView(
            VIEW_TYPES.READ,
            (leaf) => new ReadView(leaf, this)
        );        
        
        this.registerView(
            VIEW_TYPES.GALLERY,
            (leaf) => new GalleryView(leaf, this)
        );

        // 注册一个命令
        this.addCommand({
            id: 'open-readme-view',
            name: 'Open ReadMe View',
            callback: () => {
                // 打开一个新的叶子
                this.activateView(VIEW_TYPES.README);
            },
        },);

        this.addCommand({
            id: 'open-read-view',
            name: 'Read RSS messages',
            callback: () => {
                // 打开一个新的叶子
                this.activateView(VIEW_TYPES.READ);
            },
        });

        this.addCommand({
            id: 'open-read-view',
            name: 'RSS Gallery',
            callback: () => {
                // 打开一个新的叶子
                this.activateView(VIEW_TYPES.GALLERY);
            },
        });	

		// 添加 ribbon icon
		this.addRibbonIcon('file-volume-2','Manage RSS Setting',
			(evt: MouseEvent) => {
            // 激活视图
            this.activateView(VIEW_TYPES.README);
            }
        );

		this.addRibbonIcon('rss','Read RSS',
			(evt: MouseEvent) => {
            // 激活视图
            this.activateView(VIEW_TYPES.READ);
            }
        );
		this.addRibbonIcon('gallery-vertical-end','Open RSS Gallery',
			(evt: MouseEvent) => {
            // 激活视图
            this.activateView(VIEW_TYPES.GALLERY);
            }
        );

// 在之后 这个icon按钮应当给大家选择的空间
    

    }

async onunload() {
    // 清除所有已注册的视图
	// 测试环境下可以注释掉
	// 生产环境下，需要加载以下代码，否则会导致插件无法卸载
    // this.app.workspace.getLeavesOfType(VIEW_TYPES.README).forEach(leaf => {
    //     leaf.detach();
    // });
}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	
}


