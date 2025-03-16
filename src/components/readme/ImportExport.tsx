import React, { useCallback } from 'react';
import { setIcon, App, Modal, Notice } from 'obsidian';
import { useTranslation } from 'react-i18next';
import { parseOPML, generateOPML } from '../../utils/xml-utils';
import { RSSSource } from '../../types';
import { ensureString } from '../../utils/i18n-utils';

interface ImportExportProps {
    app: App;
    feeds: RSSSource[];
    onImportComplete: (newFeeds: RSSSource[]) => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({ app, feeds, onImportComplete }) => {
    const { t } = useTranslation<"translation">();

    const handleImport = useCallback(() => {const modal = new Modal(app);
        modal.titleEl.setText(ensureString(t, 'rss.sources.import', '导入OPML文件'));
        
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
                            // 添加日志以帮助调试
                            console.log('OPML内容预览:', content.substring(0, 200) + '...');
                            
                            try {
                                const parsedSources = parseOPML(content);
                                
                                if (parsedSources.length === 0) {
                                    new Notice(ensureString(t, 'rss.sources.importNoSource', '未找到有效的RSS源'));
                                    return;
                                }
                                
                                // 合并现有源和新导入的源，避免重复
                                const existingUrls = new Set(feeds.map(s => s.url));
                                const newSources = parsedSources.filter(s => !existingUrls.has(s.url));
                                
                                const updatedFeeds = [...feeds, ...newSources];
                                onImportComplete(updatedFeeds);
                                
                                new Notice(ensureString(t, 'rss.sources.importSuccess', `成功导入${newSources.length}个源`));
                            } catch (error) {
                                console.error('导入OPML解析出错:', error);
                                new Notice(ensureString(t, 'rss.sources.importError', `导入失败：${(error as Error).message}`));
                            }
                        } catch (error) {
                            console.error('导入OPML出错:', error);
                            new Notice(ensureString(t, 'rss.sources.importError', `导入失败：${(error as Error).message}`));
                        }
                    };
                    reader.readAsText(file);
                } catch (error) {
                    console.error('读取文件错误:', error);
                    new Notice(ensureString(t, 'rss.sources.importError', '读取文件失败'));
                }
                modal.close();
            } else {
                new Notice(ensureString(t, 'rss.sources.importNoSource', '请选择有效的OPML文件'));
            }
        };
        
        modal.open();
    }, [feeds, app, onImportComplete]);

    const handleExport = useCallback(() => {
        try {
            const opmlContent = generateOPML(feeds);
            
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
            
            new Notice(ensureString(t, 'rss.sources.exportSuccess', 'OPML文件导出成功'));
        } catch (error) {
            console.error('导出OPML出错:', error);
            new Notice(ensureString(t, 'rss.sources.exportError', `导出失败：${(error as Error).message}`));
        }
    }, [feeds]);

    return (
        <div className="rss-import-export">
            <div className="rss-import-export-actions">
                <button className="rss-action-btn" aria-label={ensureString(t, 'rss.importExport.import', '导入')} ref={(el) => { if (el) setIcon(el, 'download'); }} onClick={handleImport}>
                    {ensureString(t, 'rss.importExport.import', '导入')}
                </button>
                <button className="rss-action-btn" aria-label={ensureString(t, 'rss.importExport.export', '导出')} ref={(el) => { if (el) setIcon(el, 'upload'); }} onClick={handleExport}>
                    {ensureString(t, 'rss.importExport.export', '导出')}
                </button>
            </div>
        </div>
    );
};
