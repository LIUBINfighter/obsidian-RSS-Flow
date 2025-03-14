import React, { useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';
import { VIEW_TYPES } from '../types';
import RSSFlowPlugin from '../main';

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
    tableOfContents: any[];
    scrollToToc: () => void;
    articleLink?: string;
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
    tableOfContents,
    scrollToToc,
    articleLink
}) => {
    // 创建refs用于设置图标
    const randomBtnRef = useRef<HTMLButtonElement>(null);
    const syncBtnRef = useRef<HTMLButtonElement>(null);
    const exportBtnRef = useRef<HTMLButtonElement>(null);
    const fontDecreaseBtnRef = useRef<HTMLButtonElement>(null);
    const fontIncreaseBtnRef = useRef<HTMLButtonElement>(null);
    const tocBtnRef = useRef<HTMLButtonElement>(null);
    const readmeBtnRef = useRef<HTMLButtonElement>(null);
    const galleryBtnRef = useRef<HTMLButtonElement>(null);
    
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
        if (tocBtnRef.current) setIcon(tocBtnRef.current, 'list');
        if (readmeBtnRef.current) setIcon(readmeBtnRef.current, 'info');
        if (galleryBtnRef.current) setIcon(galleryBtnRef.current, 'layout-grid');
        
        // 设置第二排按钮图标
        if (prevBtnRef.current) setIcon(prevBtnRef.current, 'arrow-left');
        if (nextBtnRef.current) setIcon(nextBtnRef.current, 'arrow-right');
        if (browserBtnRef.current) setIcon(browserBtnRef.current, 'external-link');
        if (saveNoteBtnRef.current) setIcon(saveNoteBtnRef.current, 'file-text');
        if (saveHighlightsBtnRef.current) setIcon(saveHighlightsBtnRef.current, 'text-select');
    }, []);
    
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
                <h2>RSS Flow Reader</h2>
                <div className="read-actions primary-actions">
                    <div className="read-actions-group">
                        <button 
                            onClick={handleRandomArticle} 
                            className="clickable-icon" 
                            aria-label="随机阅读"
                            title="随机阅读"
                            ref={randomBtnRef}
                        />
                        <button 
                            onClick={handleSync} 
                            className="clickable-icon" 
                            aria-label="同步RSS"
                            title="同步RSS"
                            ref={syncBtnRef}
                        />
                        <button 
                            onClick={exportToMarkdown} 
                            className="clickable-icon" 
                            aria-label="导出收藏为Markdown"
                            title="导出收藏"
                            ref={exportBtnRef}
                        />
                    </div>
                    
                    <div className="font-size-controls">
                        <button 
                            onClick={() => handleFontSizeChange(-1)} 
                            className="clickable-icon" 
                            aria-label="减小字体"
                            title="减小字体"
                            ref={fontDecreaseBtnRef}
                        />
                        <span className="font-size-display">{fontSize}px</span>
                        <button 
                            onClick={() => handleFontSizeChange(1)} 
                            className="clickable-icon" 
                            aria-label="增大字体"
                            title="增大字体"
                            ref={fontIncreaseBtnRef}
                        />
                    </div>
                    
                    {/* 移除目录按钮 */}
                    
                    <div className="view-navigation-buttons">
                        <button 
                            onClick={goToReadmeView} 
                            className="clickable-icon" 
                            aria-label="查看帮助"
                            title="帮助"
                            ref={readmeBtnRef}
                        />
                        <button 
                            onClick={goToGalleryView} 
                            className="clickable-icon" 
                            aria-label="文章库"
                            title="文章库"
                            ref={galleryBtnRef}
                        />
                    </div>
                </div>
            </div>
            
            <div className="read-header-bottom">
                <div className="read-actions secondary-actions">
                    <div className="article-navigation-buttons">
                        <button 
                            onClick={handlePrevArticle} 
                            className="clickable-icon" 
                            aria-label="上一篇"
                            title="上一篇文章"
                            ref={prevBtnRef}
                        />
                        <button 
                            onClick={handleNextArticle} 
                            className="clickable-icon" 
                            aria-label="下一篇"
                            title="下一篇文章"
                            ref={nextBtnRef}
                        />
                    </div>
                    
                    <div className="article-action-buttons">
                        <button 
                            onClick={openInBrowser} 
                            className="clickable-icon" 
                            aria-label="在浏览器中打开"
                            title="在浏览器中打开"
                            ref={browserBtnRef}
                            disabled={!articleLink}
                        />
                        <button 
                            onClick={handleSaveToNote} 
                            className="clickable-icon" 
                            aria-label="保存全文为笔记"
                            title="保存全文为笔记"
                            ref={saveNoteBtnRef}
                        />
                        <button 
                            onClick={handleSaveHighlightsToNote} 
                            className="clickable-icon" 
                            aria-label="保存收藏段落为笔记"
                            title="保存收藏段落为笔记"
                            ref={saveHighlightsBtnRef}
                        />
                        
                        {/* 添加目录按钮到这里 */}
                        {tableOfContents.length > 0 && (
                            <button 
                                onClick={scrollToToc} 
                                className="clickable-icon" 
                                aria-label="跳转到文章目录"
                                title="目录"
                                ref={tocBtnRef}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
