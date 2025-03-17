import { ItemView, WorkspaceLeaf } from "obsidian";
import { VIEW_TYPES } from "../types";
import { createRoot } from 'react-dom/client';
import React from 'react';
import { ReadMe } from '../components/readme/ReadMe';
import type RSSFlowPlugin from '../main';
import { i18n } from '../i18n';

export class ReadMeView extends ItemView {
    private plugin: RSSFlowPlugin;  // 修改类型定义
    private activeLeafHandler: () => void;
    private root: ReturnType<typeof createRoot> | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: any) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPES.README;
    }
    
    getIcon() {
        return 'settings';
    }
    
    getDisplayText() {
        return "RSS Flow README";
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
    
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('view-container');
        
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
            React.createElement(ReadMe, {
                app: this.app,
                plugin: this.plugin,  // 确保正确传递plugin实例
                onLocaleChange: async (locale: string) => {
                    // 更新插件设置
                    this.plugin.settings.locale = locale;
                    await this.plugin.saveSettings();
                    
                    // 更新i18n语言
                    i18n.changeLanguage(locale);
                    
                    // 保存数据
                    const data = await this.plugin.loadData() || {};
                    await this.plugin.saveData({ ...data, locale });
                }
            })
        );
    }

    async onClose() {
        // 取消注册选项卡切换事件监听器
        this.app.workspace.off('active-leaf-change', this.activeLeafHandler);
        this.clearStatusBar();
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        this.containerEl.empty();
    }
}
