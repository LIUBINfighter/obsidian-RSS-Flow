import React, { useState, useEffect } from 'react';
import RSSFlowPlugin from '../main';
import { App } from 'obsidian';
import { Introduction } from './Introduction';
import { RSSSource } from '../types';
import { Sidebar } from './Sidebar';

interface ReadMeProps {
    app: App;
    plugin: RSSFlowPlugin;
    onLocaleChange?: (locale: string) => void;
}

export const ReadMe: React.FC<ReadMeProps> = ({ app, plugin, onLocaleChange }) => {
    const [sources, setSources] = useState<RSSSource[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // 加载RSS源数据
    useEffect(() => {
        async function loadData() {
            const data = await plugin.loadData() || {};
            setSources(data.feeds || []);
        }
        loadData();
    }, [plugin]);
    
    // 添加源
    const handleAddSource = async () => {
        // 创建一个模态框让用户输入
        const modal = new Modal(app);
        modal.titleEl.setText("添加新的RSS源");

        const contentEl = modal.contentEl;
        
        // 添加表单
        const nameField = contentEl.createEl("div", { cls: "form-group" });
        nameField.createEl("label", { text: "名称" });
        const nameInput = nameField.createEl("input", {
            type: "text",
            placeholder: "订阅源名称"
        });
        
        const urlField = contentEl.createEl("div", { cls: "form-group" });
        urlField.createEl("label", { text: "URL" });
        const urlInput = urlField.createEl("input", {
            type: "text",
            placeholder: "https://example.com/feed"
        });
        
        const folderField = contentEl.createEl("div", { cls: "form-group" });
        folderField.createEl("label", { text: "分类" });
        const folderInput = folderField.createEl("input", {
            type: "text",
            placeholder: "默认分类",
            value: "默认分类"
        });
        
        // 添加按钮
        const buttonContainer = contentEl.createEl("div", { cls: "form-actions" });
        
        // 取消按钮
        const cancelButton = buttonContainer.createEl("button", {
            cls: "form-cancel-btn",
            text: "取消"
        });
        cancelButton.addEventListener("click", () => modal.close());
        
        // 添加按钮
        const submitButton = buttonContainer.createEl("button", {
            cls: "form-submit-btn",
            text: "添加"
        });
        
        submitButton.addEventListener("click", async () => {
            if (!urlInput.value) {
                // URL 是必填的
                urlInput.addClass("error");
                return;
            }
            
            const newSource: RSSSource = {
                name: nameInput.value || "未命名源",
                url: urlInput.value,
                folder: folderInput.value || "默认分类"
            };
            
            const updatedSources = [...sources, newSource];
            setSources(updatedSources);
            
            // 保存到plugin数据
            const data = await plugin.loadData() || {};
            await plugin.saveData({
                ...data,
                feeds: updatedSources
            });
            
            modal.close();
            
            // 立即同步新添加的源
            await plugin.syncRSSFeeds();
        });
        
        modal.open();
    };
    
    // 编辑源
    const handleEditSource = async (source: RSSSource) => {
        // 在实际应用中，这里应该打开一个编辑模态框
        console.log("编辑源:", source);
        
        // 这里只是演示，实际上应该根据用户输入来更新
        const updatedSources = sources.map(s => 
            s.url === source.url ? { ...s, name: s.name + " (已编辑)" } : s
        );
        
        setSources(updatedSources);
        
        // 保存到plugin数据
        const data = await plugin.loadData() || {};
        await plugin.saveData({
            ...data,
            feeds: updatedSources
        });
    };
    
    // 删除源
    const handleDeleteSource = async (source: RSSSource) => {
        const updatedSources = sources.filter(s => s.url !== source.url);
        setSources(updatedSources);
        
        // 保存到plugin数据
        const data = await plugin.loadData() || {};
        await plugin.saveData({
            ...data,
            feeds: updatedSources
        });
    };
    
    // 导入OPML
    const handleImport = () => {
        // 实现导入逻辑
        console.log("导入OPML");
    };
    
    // 导出OPML
    const handleExport = () => {
        // 实现导出逻辑
        console.log("导出OPML");
    };
    
    // 更新源顺序
    const handleSaveOrder = async (updatedSources: RSSSource[]) => {
        setSources(updatedSources);
        
        // 保存到plugin数据
        const data = await plugin.loadData() || {};
        await plugin.saveData({
            ...data,
            feeds: updatedSources
        });
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = e.target.value;
        onLocaleChange?.(newLocale);
    };

    return (
        <div className={`readme-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <div className={`content ${isSidebarOpen ? 'with-sidebar' : ''}`}>
                <div className="language-selector">
                    <select onChange={handleLanguageChange}>
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                    </select>
                </div>
                <div className="readme-view-container">
                    <h1>RSS Flow</h1>
                    <p>欢迎使用 RSS Flow，一个用于在 Obsidian 中阅读和管理 RSS 源的插件。</p>
                    
                    <Introduction 
                        app={app}
                        sources={sources}
                        onAddSource={handleAddSource}
                        onEditSource={handleEditSource}
                        onDeleteSource={handleDeleteSource}
                        onImport={handleImport}
                        onExport={handleExport}
                        onSaveOrder={handleSaveOrder}
                    />
                </div>
            </div>
        </div>
    );
};
