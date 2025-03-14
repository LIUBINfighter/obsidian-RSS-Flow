import React, { useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';

interface ReadHeaderProps {
    fontSize: number;
    handleFontSizeChange: (change: number) => void;
    handleSync: () => void;
    handleRandomArticle: () => void;
    exportToMarkdown: () => void;
    tableOfContents: any[];
    scrollToToc: () => void;
}

export const ReadHeader: React.FC<ReadHeaderProps> = ({
    fontSize,
    handleFontSizeChange,
    handleSync,
    handleRandomArticle,
    exportToMarkdown,
    tableOfContents,
    scrollToToc
}) => {
    // 创建refs用于设置图标
    const randomBtnRef = useRef<HTMLButtonElement>(null);
    const syncBtnRef = useRef<HTMLButtonElement>(null);
    const exportBtnRef = useRef<HTMLButtonElement>(null);
    const fontDecreaseBtnRef = useRef<HTMLButtonElement>(null);
    const fontIncreaseBtnRef = useRef<HTMLButtonElement>(null);
    const tocBtnRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        // 设置按钮图标
        if (randomBtnRef.current) setIcon(randomBtnRef.current, 'shuffle');
        if (syncBtnRef.current) setIcon(syncBtnRef.current, 'refresh-cw');
        if (exportBtnRef.current) setIcon(exportBtnRef.current, 'download');
        if (fontDecreaseBtnRef.current) setIcon(fontDecreaseBtnRef.current, 'minus');
        if (fontIncreaseBtnRef.current) setIcon(fontIncreaseBtnRef.current, 'plus');
        if (tocBtnRef.current) setIcon(tocBtnRef.current, 'list');
    }, []);
    
    return (
        <div className="read-header">
            <h2>RSS Flow Reader</h2>
            <div className="read-actions">
                <div className="read-actions-group">
                    <button 
                        onClick={handleRandomArticle} 
                        className="mod-primary" 
                        aria-label="随机阅读"
                        title="随机阅读"
                        ref={randomBtnRef}
                    />
                    <button 
                        onClick={handleSync} 
                        className="mod-warning" 
                        aria-label="同步RSS"
                        title="同步RSS"
                        ref={syncBtnRef}
                    />
                    <button 
                        onClick={exportToMarkdown} 
                        className="mod-cta" 
                        aria-label="导出收藏为Markdown"
                        title="导出收藏为Markdown"
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
    );
};
