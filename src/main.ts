import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, View } from 'obsidian';
import { VIEW_TYPES, ReactLabSettings, RSSSource } from "./types";
import { ReactLabSettingTab } from "./setting-tab";
import { ReadMeView } from "./views/readme-view";
import { ReadView } from './views/read-view';
import { GalleryView } from './views/gallery-view';
import { dbService } from './services/db-service';
import { rssService } from './services/rss-service';

const DEFAULT_SETTINGS: ReactLabSettings = {
    setting: 'default',
    sidebarWidth: 250
}

export default class RSSFlowPlugin extends Plugin {
    settings: ReactLabSettings;
    currentArticleId: string | null = null;
    
    // 同步RSS数据
    async syncRSSFeeds(): Promise<void> {
        try {
            new Notice('正在同步RSS订阅...');
            
            // 读取data.json中保存的RSS源
            const data = await this.loadData() || {};
            const feeds: RSSSource[] = data.feeds || [];
            
            if (feeds.length === 0) {
                new Notice('没有找到RSS订阅源');
                return;
            }
            
            // 初始化数据库
            await dbService.init();
            
            // 同步计数器
            let successCount = 0;
            let failCount = 0;
            let totalItems = 0;
            
            // 显示进度通知
            const progressNotice = new Notice(`正在同步: 0/${feeds.length}`, 0);
            
            // 依次处理每个源
            for (let i = 0; i < feeds.length; i++) {
                try {
                    progressNotice.setMessage(`正在同步: ${i+1}/${feeds.length}`);
                    const items = await rssService.fetchAndParseRSS(feeds[i]);
                    if (items.length > 0) {
                        successCount++;
                        totalItems += items.length;
                    } else {
                        console.log(`源 ${feeds[i].name} 没有新文章或同步失败`);
                        failCount++;
                    }
                } catch (error) {
                    console.error(`同步源失败: ${feeds[i].name}`, error);
                    failCount++;
                }
            }
            
            // 关闭进度通知
            progressNotice.hide();
            
            // 显示详细的结果通知
            new Notice(`RSS同步完成: ${successCount}个成功, ${failCount}个失败, 共${totalItems}篇文章`);
            
            // 如果有失败但也有成功，说明部分源可用，保持积极
            if (failCount > 0 && successCount > 0) {
                new Notice('部分RSS源同步失败，您仍可阅读成功同步的内容', 5000);
            }
        } catch (error) {
            console.error('RSS同步失败', error);
            new Notice('RSS同步失败，查看控制台了解详情');
        }
    }
    
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

    // 添加激活ReadView并打开特定文章的方法
    async activateReadView(articleId?: string): Promise<void> {
        if (articleId) {
            this.currentArticleId = articleId;
        }
        
        await this.activateView(VIEW_TYPES.READ);
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

        // 注册命令
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
                this.activateReadView();
            },
        });

        // 修复gallery命令ID重复的问题
        this.addCommand({
            id: 'open-gallery-view',
            name: 'RSS Gallery',
            callback: () => {
                // 打开一个新的叶子
                this.activateView(VIEW_TYPES.GALLERY);
            },
        });
        
        // 添加同步RSS的命令
        this.addCommand({
            id: 'sync-rss-feeds',
            name: '同步RSS订阅',
            callback: async () => {
                await this.syncRSSFeeds();
            }
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
        
        this.addRibbonIcon('gallery-vertical-end','RSS Gallery',
            (evt: MouseEvent) => {
                // 激活视图
                this.activateView(VIEW_TYPES.GALLERY);
            }
        );
        
        // 在插件加载时自动同步RSS
        this.app.workspace.onLayoutReady(() => this.syncRSSFeeds());
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


