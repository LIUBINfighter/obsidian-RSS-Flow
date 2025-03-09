import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setIcon } from 'obsidian';
import { SourceForm } from './SourceForm';


interface RSSSource {
    title: string;
    url: string;
    category: string;
}

export const Introdcution: React.FC = () => {
    const { t } = useTranslation();
    const [showImportModal, setShowImportModal] = useState(false);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const [editingSource, setEditingSource] = useState<RSSSource | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
                // TODO: 显示错误提示
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
        // TODO: 保存RSS源数据
        setShowSourceForm(false);
        setEditingSource(null);
    }, []);

    const handleDeleteSource = useCallback((sourceUrl: string) => {
        if (deleteConfirm === sourceUrl) {
            // TODO: 执行删除操作
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(sourceUrl);
        }
    }, [deleteConfirm]);

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
                <div className="rss-source-list">
                    {/* RSS源列表项示例 */}
                    <div className="rss-source-item">
                        <div className="rss-source-info">
                            <div className="rss-source-title">AI - Google News</div>
                            <div className="rss-source-url">https://blog.google/technology/ai/rss/</div>
                        </div>
                        <div className="rss-source-actions">
                            <button 
                                className="rss-action-btn" 
                                aria-label="编辑" 
                                ref={el => el && setIcon(el, 'pencil')}
                                onClick={() => handleEditSource({ title: 'AI - Google News', url: 'https://blog.google/technology/ai/rss/', category: '' })}
                            ></button>
                            <button 
                                className={`rss-action-btn delete-btn ${deleteConfirm === 'https://blog.google/technology/ai/rss/' ? 'confirm-delete' : ''}`}
                                aria-label="删除" 
                                ref={el => el && setIcon(el, 'trash')}
                                onClick={() => handleDeleteSource('https://blog.google/technology/ai/rss/')}
                            ></button>
                        </div>
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
            </div>
        </div>
    );
};
