import React, { useState, useEffect } from 'react';
import RSSFlowPlugin from '../main';
import { App, Modal, Notice } from 'obsidian';
import { Introduction } from './Introduction';
import { RSSSource } from '../types';
// import { Sidebar } from './Sidebar';

interface ReadMeProps {
    app: App;
    plugin: RSSFlowPlugin;
    onLocaleChange?: (locale: string) => void;
}

// 添加解析OPML的函数
function parseOPML(xmlContent: string): RSSSource[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    // 检查解析错误
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('XML解析错误');
    }
    
    const sources: RSSSource[] = [];
    const outlines = xmlDoc.querySelectorAll('outline[type="rss"], outline[type="atom"], outline[xmlUrl]');
    
    outlines.forEach(outline => {
        const title = outline.getAttribute('title') || outline.getAttribute('text') || '未命名源';
        const url = outline.getAttribute('xmlUrl');
        // 尝试从父节点获取分类信息
        let folder = '默认分类';
        const parentOutline = outline.parentElement;
        if (parentOutline && parentOutline.tagName === 'outline' && !parentOutline.getAttribute('xmlUrl')) {
            folder = parentOutline.getAttribute('title') || parentOutline.getAttribute('text') || '默认分类';
        }
        
        if (url) {
            sources.push({
                name: title,
                url: url,
                folder: folder
            });
        }
    });
    
    return sources;
}

// 添加生成OPML的函数
function generateOPML(sources: RSSSource[]): string {
    // 按分类分组
    const folderMap = new Map<string, RSSSource[]>();
    sources.forEach(source => {
        if (!folderMap.has(source.folder)) {
            folderMap.set(source.folder, []);
        }
        folderMap.get(source.folder)?.push(source);
    });
    
    let opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head>
    <title>RSS Flow Subscriptions</title>
  </head>
  <body>
`;
    
    // 添加每个分类和源
    folderMap.forEach((sourcesInFolder, folder) => {
        opmlContent += `    <outline text="${folder}" title="${folder}">\n`;
        
        sourcesInFolder.forEach(source => {
            opmlContent += `      <outline text="${source.name}" title="${source.name}" type="rss" xmlUrl="${source.url}"/>\n`;
        });
        
        opmlContent += `    </outline>\n`;
    });
    
    opmlContent += `  </body>
</opml>`;

    return opmlContent;
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
                        const data = await plugin.loadData() || {};
                        await plugin.saveData({
                            ...data,
                            feeds: updatedSources
                        });
                        
                        // 同步新导入的源
                        if (plugin.syncRSSFeeds) {
                            await plugin.syncRSSFeeds();
                        }
                        
                        new Notice(`成功导入 ${newSources.length} 个RSS源`);
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
            downloadLink.download = 'rss_flow_subscriptions.opml';
            
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
