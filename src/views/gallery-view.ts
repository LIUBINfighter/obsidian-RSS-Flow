// CustomView1.tsx
import React from 'react';
import { ItemView, WorkspaceLeaf } from 'obsidian';
import RSSFlowPlugin from '../main';
import { VIEW_TYPES } from '../types';
import { createRoot } from 'react-dom/client';

export class GalleryView extends ItemView {
    private activeLeafHandler: () => void; // 添加属性定义
    private root: ReturnType<typeof createRoot> | null = null; // 添加属性定义
    constructor(leaf: WorkspaceLeaf, private plugin: RSSFlowPlugin) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPES.GALLERY;
    }

    getDisplayText() {
        return 'RSS Flow GALLERY';
    }

    async onOpen() {
        // 在视图打开时执行的操作
        this.renderView();
    }

    async onClose() {
        // 在视图关闭时执行的操作
        this.app.workspace.off('active-leaf-change', this.activeLeafHandler);
        this.clearStatusBar();
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
        this.containerEl.empty();
    }

    renderView() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('h2', { text: 'This is RSS Flow GALLERY View' });
        // 添加您的 React 组件内容
    }

    clearStatusBar() {
        // 实现清除状态栏的逻辑
    }
}