import React from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import RSSFlowPlugin from '../main';
import { VIEW_TYPES } from '../types';
import { createRoot } from 'react-dom/client';
import { Gallery } from '../components/gallery/Gallery';
import { i18n } from '../i18n/index';
import { dbService } from '../services/db-service';

export class GalleryView extends ItemView {
    private activeLeafHandler: () => void;
    private root: ReturnType<typeof createRoot> | null = null;
    
    constructor(leaf: WorkspaceLeaf, private plugin: RSSFlowPlugin) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPES.GALLERY;
    }
    
    getIcon() {
        return 'image-file';
    }

    getDisplayText() {
        return 'RSS Flow Gallery';
    }

    private clearStatusBar() {
        const statusBarEl = this.containerEl.querySelector('.status-bar');
        if (statusBarEl) {
            statusBarEl.empty();
        }
    }

    async onOpen() {
        this.clearStatusBar();
        this.activeLeafHandler = () => this.clearStatusBar();
        this.app.workspace.on('active-leaf-change', this.activeLeafHandler);
    
        // 在加载视图前进行数据同步
        try {
            // 从插件设置中获取有效的Feed列表
            const pluginData = await this.plugin.loadData() || {};
            const validFeeds = pluginData.feeds || [];
            
            // 同步数据库与配置文件
            await dbService.synchronizeWithConfig(validFeeds);
            //console.log('Gallery视图打开时已同步数据库与配置');
        } catch (error) {
            console.error('Gallery视图打开时同步数据失败:', error);
        }
        
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('gallery-view-container');
        
        // 添加主容器类名，用于响应式布局
        container.addClass('main-content-container');
        
        const mountPoint = container.createDiv('react-root');
        
        // 从设置中读取语言
        const savedData = await this.plugin.loadData() || {};
        if (savedData.locale) {
            i18n.changeLanguage(savedData.locale);
        }
        
        this.root = createRoot(mountPoint);
        this.root.render(
            React.createElement(Gallery, {
                plugin: this.plugin
            })
        );
    }

    async onClose() {
        this.app.workspace.off('active-leaf-change', this.activeLeafHandler);
        this.clearStatusBar();
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        this.containerEl.empty();
    }
}
