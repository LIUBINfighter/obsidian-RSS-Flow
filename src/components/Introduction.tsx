import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setIcon, App, Modal, Notice } from 'obsidian';
import { SourceForm } from './SourceForm';

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

interface RSSSource {
    name: string;
    url: string;
    folder: string;
}

export const Introduction: React.FC<{ app: App }> = ({ app }) => {
    const [feeds, setFeeds] = useState<RSSSource[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
    const { t } = useTranslation();
    const [showImportModal, setShowImportModal] = useState(false);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const [editingSource, setEditingSource] = useState<RSSSource | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        const loadFeeds = async () => {
            try {
                const adapter = app.vault.adapter;
                const filePath = '.obsidian/plugins/obsidian-RSS-Flow/data.json';
                let content;
                try {
                    content = await adapter.read(filePath);
                } catch (error) {
                    const initialData = { feeds: [] };
                    await adapter.write(filePath, JSON.stringify(initialData, null, 2));
                    content = JSON.stringify(initialData);
                }
                const data = JSON.parse(content);
                setFeeds(data.feeds);
            } catch (error) {
                console.error('Error loading feeds:', error);
            }
        };

        loadFeeds();
    }, [app.vault.adapter]);

    const saveFeeds = async (updatedFeeds: RSSSource[]) => {
        try {
            const adapter = app.vault.adapter;
            const filePath = '.obsidian/plugins/obsidian-RSS-Flow/data.json';
            await adapter.write(filePath, JSON.stringify({ feeds: updatedFeeds }, null, 2));
            setFeeds(updatedFeeds);
        } catch (error) {
            console.error('Error saving feeds:', error);
        }
    };

    const handleImport = useCallback(() => {
        const modal = new Modal(app);
        modal.titleEl.setText('导入OPML文件');
        
        const fileInput = modal.contentEl.createEl('input', {
            type: 'file',
            attr: { accept: '.opml, .xml' }
        });
        
        fileInput.onchange = async () => {
            const file = fileInput.files?.[0];
            if (file) {
                try {
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
                            const existingUrls = new Set(feeds.map(s => s.url));
                            const newSources = parsedSources.filter(s => !existingUrls.has(s.url));
                            
                            const updatedFeeds = [...feeds, ...newSources];
                            saveFeeds(updatedFeeds);
                            
                            new Notice(`成功导入 ${newSources.length} 个RSS源`);
                        } catch (error) {
                            console.error('导入OPML出错:', error);
                            new Notice('导入OPML文件失败: ' + (error as Error).message);
                        }
                    };
                    reader.readAsText(file);
                } catch (error) {
                    console.error('读取文件错误:', error);
                    new Notice('读取文件失败');
                }
                modal.close();
            } else {
                new Notice('请选择有效的OPML文件');
            }
        };
        
        modal.open();
    }, [feeds, saveFeeds]);

    const handleExport = useCallback(() => {
        try {
            const opmlContent = generateOPML(feeds);
            
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
    }, [feeds]);

    const handleAddSource = useCallback(() => {
        setEditingSource(null);
        setShowSourceForm(true);
    }, []);

    const handleEditSource = useCallback((source: RSSSource) => {
        setEditingSource(source);
        setShowSourceForm(true);
    }, []);

    const handleSourceSubmit = useCallback((data: RSSSource) => {
        const updatedFeeds = editingSource
            ? feeds.map(feed => feed.url === editingSource.url ? data : feed)
            : [...feeds, data];
        saveFeeds(updatedFeeds);
        setShowSourceForm(false);
        setEditingSource(null);
    }, [feeds, editingSource]);

    const handleDeleteSource = useCallback((sourceUrl: string) => {
        if (deleteConfirm === sourceUrl) {
            const updatedFeeds = feeds.filter(feed => feed.url !== sourceUrl);
            saveFeeds(updatedFeeds);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(sourceUrl);
        }
    }, [deleteConfirm, feeds]);

    const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
        setDraggedIndex(index);
        e.currentTarget.classList.add('dragging');
    }, []);

    const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedIndex(null);
        setDropTargetIndex(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        setDropTargetIndex(index);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDropTargetIndex(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (sourceIndex !== targetIndex) {
            const updatedFeeds = [...feeds];
            const [movedItem] = updatedFeeds.splice(sourceIndex, 1);
            updatedFeeds.splice(targetIndex, 0, movedItem);
            saveFeeds(updatedFeeds);
        }
        setDraggedIndex(null);
        setDropTargetIndex(null);
    }, [feeds, saveFeeds]);

    return (
        <div className="rss-flow-container">
            <div className="rss-sources-section">
                <div className="rss-sources-header">
                    <h2>{t('rss.sources.title', '订阅源')}</h2>
                    <div className="rss-sources-actions">
                        <button className="rss-action-btn" aria-label="导入" ref={(el) => { if (el) setIcon(el, 'download'); }} onClick={handleImport}></button>
                        <button className="rss-action-btn" aria-label="导出" ref={(el) => { if (el) setIcon(el, 'upload'); }} onClick={handleExport}></button>
                    </div>
                </div>
                <button className="add-source-btn" ref={(el) => { if (el) setIcon(el, 'plus'); }} onClick={handleAddSource}>
                    {t('rss.sources.add', '添加新订阅源')}
                </button>

                {showSourceForm && !editingSource && (
                    <SourceForm
                        initialData={editingSource || undefined}
                        onSubmit={handleSourceSubmit}
                        onCancel={() => {
                            setShowSourceForm(false);
                            setEditingSource(null);
                        }}
                    />
                )}
                <div className="rss-source-list">
                    {feeds.map((feed, index) => (
                        <div
                            key={feed.url}
                            className={`rss-source-item ${draggedIndex === index ? 'dragging' : ''} ${dropTargetIndex === index ? 'drop-target' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            <div className="rss-source-info">
                                <div className="rss-source-title">
                                    <span className="rss-source-name">{feed.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    <span className="rss-source-folder">#{feed.folder}</span>
                                </div>
                                <div className="rss-source-url">{feed.url}</div>
                            </div>
                            {editingSource && editingSource.url === feed.url && (
                                <SourceForm
                                    initialData={editingSource}
                                    onSubmit={handleSourceSubmit}
                                    onCancel={() => setEditingSource(null)}
                                />
                            )}
                            <div className="rss-source-actions">
                                <button 
                                    className="rss-action-btn" 
                                    aria-label="编辑" 
                                    ref={el => el && setIcon(el, 'pencil')}
                                    onClick={() => handleEditSource({ name: feed.name, url: feed.url, folder: feed.folder })}
                                ></button>
                                <button 
                                    className={`rss-action-btn delete-btn ${deleteConfirm === feed.url ? 'confirm-delete' : ''}`}
                                    aria-label="删除" 
                                    ref={el => el && setIcon(el, 'trash')}
                                    onClick={() => handleDeleteSource(feed.url)}
                                ></button>
                            </div>
                            {showSourceForm && editingSource?.url === feed.url && (
                                <SourceForm
                                    initialData={editingSource}
                                    onSubmit={handleSourceSubmit}
                                    onCancel={() => {
                                        setShowSourceForm(false);
                                        setEditingSource(null);
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
