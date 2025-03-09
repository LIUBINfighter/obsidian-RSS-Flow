import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setIcon, App } from 'obsidian';
import { SourceForm } from './SourceForm';

interface RSSSource {
    name: string;
    url: string;
    folder: string;
}

export const Introdcution: React.FC<{ app: App }> = ({ app }) => {
    const [feeds, setFeeds] = useState<RSSSource[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

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

    const { t } = useTranslation();
    const [showImportModal, setShowImportModal] = useState(false);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const [editingSource, setEditingSource] = useState<RSSSource | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
            attr: { accept: '.opml' }
        });
        
        fileInput.onchange = async () => {
            const file = fileInput.files?.[0];
            if (file && file.name.toLowerCase().endsWith('.opml')) {
                // TODO: 实现OPML文件解析和数据保存
                modal.close();
            } else {
                console.error('请上传.opml文件');
            }
        };
        
        modal.open();
    }, []);

    const handleExport = useCallback(() => {
        // TODO: 实现数据导出为OPML文件
    }, []);

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
                        <button className="rss-action-btn" aria-label="导入" ref={el => el && setIcon(el, 'download')} onClick={() => setShowImportModal(true)}></button>
                        <button className="rss-action-btn" aria-label="导出" ref={el => el && setIcon(el, 'upload')} onClick={handleExport}></button>
                    </div>
                </div>
                <button className="add-source-btn" ref={el => el && setIcon(el, 'plus')} onClick={handleAddSource}>
                    {t('rss.sources.add', '添加新订阅源')}
                </button>

                {showSourceForm && (
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
