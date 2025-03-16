import React, { useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';
import { VIEW_TYPES } from '../../types';
import RSSFlowPlugin from '../../main';
import { useTranslation } from 'react-i18next';
import { FolderSelector } from '../gallery/FolderSelector';
import { ReadOrderSelector, ReadOrder, ReadFilter } from './ReadOrderSelector';
import { ensureString } from '../../utils/i18n-utils';

interface ReadHeaderProps {
    fontSize: number;
    plugin: RSSFlowPlugin;
    handleFontSizeChange: (change: number) => void;
    handleSync: () => void;
    handleRandomArticle: () => void;
    handleNextArticle: () => Promise<void>;
    handlePrevArticle: () => Promise<void>;
    handleSaveToNote: () => Promise<void>;
    handleSaveHighlightsToNote: () => Promise<void>;
    exportToMarkdown: () => void;
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
    articleLink?: string;
    folders: string[];
    selectedFolder: string;
    onFolderChange: (folder: string) => void;
    readOrder: ReadOrder;
    readFilter: ReadFilter;
    onReadOrderChange: (order: ReadOrder) => void;
    onReadFilterChange: (filter: ReadFilter) => void;
}

export const ReadHeader: React.FC<ReadHeaderProps> = ({
    fontSize,
    plugin,
    handleFontSizeChange,
    handleSync,
    handleRandomArticle,
    handleNextArticle,
    handlePrevArticle,
    handleSaveToNote,
    handleSaveHighlightsToNote,
    exportToMarkdown,
    toggleSidebar,
    isSidebarOpen,
    articleLink,
    folders,
    selectedFolder,
    onFolderChange,
    readOrder,
    readFilter,
    onReadOrderChange,
    onReadFilterChange
}) => {
    const { t } = useTranslation();
    
    // 创建refs用于设置图标
    const randomBtnRef = useRef<HTMLButtonElement>(null);
    const syncBtnRef = useRef<HTMLButtonElement>(null);
    const exportBtnRef = useRef<HTMLButtonElement>(null);
    const fontDecreaseBtnRef = useRef<HTMLButtonElement>(null);
    const fontIncreaseBtnRef = useRef<HTMLButtonElement>(null);
    const readmeBtnRef = useRef<HTMLButtonElement>(null);
    const galleryBtnRef = useRef<HTMLButtonElement>(null);
    const sidebarBtnRef = useRef<HTMLButtonElement>(null);
    
    // 创建第二组按钮的refs
    const prevBtnRef = useRef<HTMLButtonElement>(null);
    const nextBtnRef = useRef<HTMLButtonElement>(null);
    const browserBtnRef = useRef<HTMLButtonElement>(null);
    const saveNoteBtnRef = useRef<HTMLButtonElement>(null);
    const saveHighlightsBtnRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        // 设置第一排按钮图标
        if (randomBtnRef.current) setIcon(randomBtnRef.current, 'shuffle');
        if (syncBtnRef.current) setIcon(syncBtnRef.current, 'refresh-cw');
        if (exportBtnRef.current) setIcon(exportBtnRef.current, 'download');
        if (fontDecreaseBtnRef.current) setIcon(fontDecreaseBtnRef.current, 'minus');
        if (fontIncreaseBtnRef.current) setIcon(fontIncreaseBtnRef.current, 'plus');
        if (readmeBtnRef.current) setIcon(readmeBtnRef.current, 'info');
        if (galleryBtnRef.current) setIcon(galleryBtnRef.current, 'layout-grid');
        if (sidebarBtnRef.current) setIcon(sidebarBtnRef.current, isSidebarOpen ? 'star-fill' : 'star');
        
        // 设置第二排按钮图标
        if (prevBtnRef.current) setIcon(prevBtnRef.current, 'arrow-left');
        if (nextBtnRef.current) setIcon(nextBtnRef.current, 'arrow-right');
        if (browserBtnRef.current) setIcon(browserBtnRef.current, 'external-link');
        if (saveNoteBtnRef.current) setIcon(saveNoteBtnRef.current, 'file-text');
        if (saveHighlightsBtnRef.current) setIcon(saveHighlightsBtnRef.current, 'text-select');
    }, [isSidebarOpen]);
    
    // 添加导航视图函数
    const goToReadmeView = () => {
        plugin.activateView(VIEW_TYPES.README);
    };
    
    const goToGalleryView = () => {
        plugin.activateView(VIEW_TYPES.GALLERY);
    };
    
    // 添加在浏览器中打开链接函数
    const openInBrowser = () => {
        if (articleLink) {
            window.open(articleLink, '_blank');
        }
    };
    
    return (
        <div className="read-header">
            <div className="read-header-top">
                <div className="read-header-left">
                    <h2>{ensureString(t, 'read.header.title', 'RSS Flow Reader')}</h2>
                    
                    {/* 添加文件夹选择器 */}
                    <div className="read-folder-selector">
                        <FolderSelector
                            folders={folders}
                            selectedFolder={selectedFolder}
                            onChange={onFolderChange}
                        />
                    </div>
                </div>
                
                {/* 添加阅读顺序选择器 */}
                <div className="read-header-right">
                    <ReadOrderSelector
                        readOrder={readOrder}
                        readFilter={readFilter}
                        onOrderChange={onReadOrderChange}
                        onFilterChange={onReadFilterChange}
                    />
                </div>
            </div>
            
            <div className="read-header-bottom">
                <div className="read-actions">
                    <div className="read-actions-group">
                        <button 
                            onClick={handleRandomArticle} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.random', '随机文章')}
                            ref={randomBtnRef}
                        />
                        <button 
                            onClick={handleSync} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.sync', '同步')}
                            ref={syncBtnRef}
                        />
                        <button 
                            onClick={exportToMarkdown} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.export', '导出')}
                            ref={exportBtnRef}
                        />
                    </div>
                    
                    <div className="font-size-controls">
                        <button 
                            onClick={() => handleFontSizeChange(-1)} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.decreaseFont', '减小字号')}
                            ref={fontDecreaseBtnRef}
                        />
                        <span className="font-size-display">{fontSize}px</span>
                        <button 
                            onClick={() => handleFontSizeChange(1)} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.increaseFont', '增大字号')}
                            ref={fontIncreaseBtnRef}
                        />
                    </div>
                    
                    <div className="view-navigation-buttons">
                        <button 
                            onClick={toggleSidebar}
                            className={`clickable-icon ${isSidebarOpen ? 'active' : ''}`} 
                            aria-label={ensureString(t, 'read.header.tooltip.sidebar', '侧边栏')}
                            ref={sidebarBtnRef}
                        />
                        <button 
                            onClick={goToReadmeView} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.readme', '帮助')}
                            ref={readmeBtnRef}
                        />
                        <button 
                            onClick={goToGalleryView} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.gallery', '图库')}
                            ref={galleryBtnRef}
                        />
                    </div>
                    
                    <div className="article-navigation-buttons">
                        <button 
                            onClick={handlePrevArticle} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.prev', '上一篇')}
                            ref={prevBtnRef}
                        />
                        <button 
                            onClick={handleNextArticle} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.next', '下一篇')}
                            ref={nextBtnRef}
                        />
                    </div>
                    
                    <div className="article-action-buttons">
                        <button 
                            onClick={openInBrowser} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.browser', '在浏览器中打开')}
                            ref={browserBtnRef}
                            disabled={!articleLink}
                        />
                        <button 
                            onClick={handleSaveToNote} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.saveArticle', '保存文章')}
                            ref={saveNoteBtnRef}
                        />
                        <button 
                            onClick={handleSaveHighlightsToNote} 
                            className="clickable-icon" 
                            aria-label={ensureString(t, 'read.header.tooltip.saveHighlights', '保存收藏')}
                            ref={saveHighlightsBtnRef}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
