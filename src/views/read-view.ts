// CustomView1.tsx
import React from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import RSSFlowPlugin from '../main';
import { VIEW_TYPES } from '../types';
import { createRoot } from 'react-dom/client';
import { Read } from '../components/read/Read';
import { i18n } from '../i18n/index';

export class ReadView extends ItemView {
    private activeLeafHandler: () => void;
    private root: ReturnType<typeof createRoot> | null = null;
    private reactKey = Date.now(); // 添加一个key用于强制刷新React组件

    constructor(leaf: WorkspaceLeaf, private plugin: RSSFlowPlugin) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPES.READ;
    }
    
    getIcon() {
        return 'book-open';
    }

    getDisplayText() {
        return 'RSS Flow Read';
    }

    private clearStatusBar() {
        const statusBarEl = this.containerEl.querySelector('.status-bar');
        if (statusBarEl) {
            statusBarEl.empty();
        }
    }

    // 打开指定文章的方法
    async openArticle(articleId: string) {
        //console.log("ReadView: 准备打开文章ID:", articleId);
        
        // 设置currentArticleId
        this.plugin.currentArticleId = articleId;
        
        // 强制重新挂载React组件
        this.reactKey = Date.now();
        
        // 重新渲染视图
        await this.reloadView();
    }

    // 添加重新加载视图的方法
    private async reloadView() {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('view-container');
        container.addClass('main-content-container');
        
        const mountPoint = container.createDiv('react-root');
        
        this.root = createRoot(mountPoint);
        this.root.render(
            React.createElement(Read, {
                plugin: this.plugin,
                key: this.reactKey // 使用随机key强制重新挂载
            })
        );
    }

    async onOpen() {
        this.clearStatusBar();
        this.activeLeafHandler = () => this.clearStatusBar();
        this.app.workspace.on('active-leaf-change', this.activeLeafHandler);

        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('view-container');
        container.addClass('main-content-container');

        const mountPoint = container.createDiv('react-root');

        // 从设置中读取语言
        const savedData = await this.plugin.loadData() || {};
        if (savedData.locale) {
            i18n.changeLanguage(savedData.locale);
        }

        this.root = createRoot(mountPoint);
        this.root.render(
            React.createElement(Read, {
                plugin: this.plugin,
                key: this.reactKey
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
