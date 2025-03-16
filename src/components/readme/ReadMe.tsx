import React, { useState, useEffect } from 'react';
import RSSFlowPlugin from '../../main';
import { App, Modal, Notice } from 'obsidian';
import { Introduction } from './Introduction';
import { RSSSource } from '../../types';
import { parseOPML, generateOPML } from '../../utils/xml-utils';
import { useTranslation } from 'react-i18next';
import { ensureString } from '../../utils/i18n-utils';

interface ReadMeProps {
    app: App;
    plugin: RSSFlowPlugin;
    onLocaleChange?: (locale: string) => void;
}

export const ReadMe: React.FC<ReadMeProps> = ({ app, plugin, onLocaleChange }) => {
    const { t } = useTranslation<"translation">();
    const [sources, setSources] = useState<RSSSource[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // 加载RSS源数据
    useEffect(() => {
        async function loadData() {
            if (!plugin || !plugin.loadData) {
                console.error('Plugin or plugin.loadData is undefined');
                return;
            }
            
            try {
                const data = await plugin.loadData() || {};
                setSources(data.feeds || []);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }
        loadData();
    }, [plugin]);
    
    // 添加源
    const handleAddSource = async () => {
        // 创建一个模态框让用户输入
        const modal = new Modal(app);
        modal.titleEl.setText(ensureString(t, 'rss.sources.add', '添加源'));

        const contentEl = modal.contentEl;
        
        // 添加表单
        const nameField = contentEl.createEl("div", { cls: "form-group" });
        nameField.createEl("label", { text: ensureString(t, 'rss.sources.name', '名称') });
        const nameInput = nameField.createEl("input", {
            type: "text",
            placeholder: ensureString(t, 'rss.sources.namePlaceholder', '请输入订阅源名称')
        });
        
        const urlField = contentEl.createEl("div", { cls: "form-group" });
        urlField.createEl("label", { text: ensureString(t, 'rss.sources.url', 'URL') });
        const urlInput = urlField.createEl("input", {
            type: "text",
            placeholder: ensureString(t, 'rss.sources.urlPlaceholder', '请输入订阅源URL')
        });
        
        const folderField = contentEl.createEl("div", { cls: "form-group" });
        folderField.createEl("label", { text: ensureString(t, 'rss.sources.folder', '分类') });
        const folderInput = folderField.createEl("input", {
            type: "text",
            placeholder: ensureString(t, 'rss.sources.folderPlaceholder', '请输入分类'),
            value: ensureString(t, 'rss.sources.folderPlaceholder', '请输入分类')
        });
        
        // 添加按钮
        const buttonContainer = contentEl.createEl("div", { cls: "form-actions" });
        
        // 取消按钮
        const cancelButton = buttonContainer.createEl("button", {
            cls: "form-cancel-btn",
            text: ensureString(t, 'rss.sources.cancel', '取消')
        });
        cancelButton.addEventListener("click", () => modal.close());
        
        // 添加按钮
        const submitButton = buttonContainer.createEl("button", {
            cls: "form-submit-btn",
            text: ensureString(t, 'rss.sources.add', '添加')
        });
        
        submitButton.addEventListener("click", async () => {
            if (!urlInput.value) {
                // URL 是必填的
                urlInput.addClass("error");
                return;
            }
            
            const newSource: RSSSource = {
                name: nameInput.value || ensureString(t, 'rss.sources.namePlaceholder', '请输入订阅源名称'),
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
        // 创建一个隐藏的文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.opml, .xml';
        
        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            
            if (files && files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                
                reader.onload = async (e) => {
                    try {
                        const content = e.target?.result as string;
                        // 添加日志以帮助调试
                        console.log('OPML内容预览:', content.substring(0, 200) + '...');
                        
                        try {
                            const parsedSources = parseOPML(content);
                            
                            if (parsedSources.length === 0) {
                                new Notice('未找到有效的RSS源');
                                return;
                            }
                            
                            // 合并现有源和新导入的源，避免重复
                            const existingUrls = new Set(sources.map(s => s.url));
                            const newSources = parsedSources.filter(s => !existingUrls.has(s.url));
                            
                            const updatedSources = [...sources, ...newSources];
                            setSources(updatedSources);
                            
                            // 保存到plugin数据
                            if (plugin && plugin.loadData && plugin.saveData) {
                                const data = await plugin.loadData() || {};
                                await plugin.saveData({
                                    ...data,
                                    feeds: updatedSources
                                });
                                
                                // 同步新导入的源
                                if (plugin.syncRSSFeeds) {
                                    await plugin.syncRSSFeeds();
                                }
                            } else {
                                console.error('插件方法不可用');
                            }
                            
                            new Notice(`成功导入 ${newSources.length} 个RSS源`);
                        } catch (error) {
                            console.error('导入OPML解析出错:', error);
                            new Notice('解析OPML文件失败: ' + (error as Error).message);
                        }
                    } catch (error) {
                        console.error('导入OPML出错:', error);
                        new Notice('导入OPML文件失败: ' + (error as Error).message);
                    }
                };
                
                reader.readAsText(file);
            }
        };
        
        // 触发文件选择对话框
        input.click();
    };
    
    // 导出OPML
    const handleExport = () => {
        try {
            const opmlContent = generateOPML(sources);
            
            // 创建一个blob并生成临时下载链接
            const blob = new Blob([opmlContent], { type: 'text/xml' });
            const url = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'feed.opml';
            
            // 触发下载
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // 释放URL对象
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            new Notice('OPML文件导出成功');
        } catch (error) {
            console.error('导出OPML出错:', error);
            new Notice('导出OPML文件失败: ' + (error as Error).message);
        }
    };
    
    // 保存源数据到插件
    const handleSaveSources = async (updatedSources: RSSSource[]) => {
        setSources(updatedSources);
        
        // 保存到plugin数据
        if (plugin && plugin.loadData && plugin.saveData) {
            const data = await plugin.loadData() || {};
            await plugin.saveData({
                ...data,
                feeds: updatedSources
            });
        } else {
            console.error('Plugin methods are unavailable');
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = e.target.value;
        onLocaleChange?.(newLocale);
    };

    return (
        <div className={`readme-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            /> */}
            <div className={`content ${isSidebarOpen ? 'with-sidebar' : ''}`}>
                <div className="language-selector">
                    <select onChange={handleLanguageChange}>
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                    </select>
                </div>
                <div className="readme-view-container">
                    <h1>RSS Flow</h1>
                    <p>{t('rss.readme.welcome')}</p>
                    
                    <Introduction 
                        app={app}
                        sources={sources}
                        onAddSource={handleAddSource}
                        onEditSource={handleEditSource}
                        onDeleteSource={handleDeleteSource}
                        onImport={handleImport}
                        onExport={handleExport}
                        onSaveSources={handleSaveSources}
                    />
                </div>
            </div>
        </div>
    );
};
