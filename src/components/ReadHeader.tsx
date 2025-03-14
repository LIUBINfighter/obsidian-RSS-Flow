import React from 'react';

interface ReadHeaderProps {
    fontSize: number;
    handleFontSizeChange: (change: number) => void;
    handleSync: () => void;
    handleRefresh: () => void;
    exportToMarkdown: () => void;
    tableOfContents: any[];
    scrollToToc: () => void;
}

export const ReadHeader: React.FC<ReadHeaderProps> = ({
    fontSize,
    handleFontSizeChange,
    handleSync,
    handleRefresh,
    exportToMarkdown,
    tableOfContents,
    scrollToToc
}) => {
    return (
        <div className="read-header">
            <h2>RSS Flow Reader</h2>
            <div className="read-actions">
                <button onClick={handleRefresh} className="read-refresh-btn" title="随机文章">随机</button>
                <button onClick={handleSync} className="sync-btn" title="同步RSS">同步RSS</button>
                <button onClick={exportToMarkdown} className="export-btn" title="导出收藏为Markdown">导出收藏</button>
                <div className="font-size-controls">
                    <button onClick={() => handleFontSizeChange(-1)} className="font-size-btn decrease" title="减小字体">A-</button>
                    <span className="font-size-display">{fontSize}px</span>
                    <button onClick={() => handleFontSizeChange(1)} className="font-size-btn increase" title="增大字体">A+</button>
                </div>
                {tableOfContents.length > 0 && (
                    <button onClick={scrollToToc} className="toc-btn" title="跳转到文章目录">目录</button>
                )}
            </div>
        </div>
    );
};
