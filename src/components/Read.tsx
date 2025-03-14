import React, { useCallback } from 'react';
import RSSFlowPlugin from '../main';
import { FavoriteProvider, useFavorites } from '../contexts/favorite-context';
import { useArticle, useReadingProgress, useReadingSettings, useTableOfContents } from '../hooks';
import { ReadHeader, ArticleView, LoadingState, EmptyState } from './components';

interface ReadProps {
    plugin: RSSFlowPlugin;
}

// 主组件，提供FavoriteContext
export const Read: React.FC<ReadProps> = ({ plugin }) => {
    return (
        <FavoriteProvider plugin={plugin}>
            <ReadContent plugin={plugin} />
        </FavoriteProvider>
    );
};

// 内部组件，使用FavoriteContext
const ReadContent: React.FC<ReadProps> = ({ plugin }) => {
    const { article, contentBlocks, loading, handleRandomArticle, handleSync } = useArticle(plugin);
    const { readingProgress, saveReadingProgress } = useReadingProgress(plugin, article);
    const { fontSize, isDarkMode, handleFontSizeChange, handleThemeChange } = useReadingSettings(plugin);
    const { tableOfContents, showToc, toggleToc, scrollToHeading } = useTableOfContents(contentBlocks);
    const { exportToMarkdown } = useFavorites();
    
    // 添加滚动到目录的函数
    const scrollToToc = useCallback(() => {
        const tocElement = document.querySelector('.article-toc');
        if (tocElement) {
            tocElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    return (
        <div className="read-view-container" style={{ fontSize: `${fontSize}px` }}>
            <ReadHeader 
                fontSize={fontSize}
                handleFontSizeChange={handleFontSizeChange}
                handleSync={handleSync}
                handleRandomArticle={handleRandomArticle}
                exportToMarkdown={exportToMarkdown}
                tableOfContents={tableOfContents}
                scrollToToc={scrollToToc}
            />
            {loading ? (
                <LoadingState />
            ) : !article ? (
                <EmptyState 
                    plugin={plugin}
                    handleSync={handleSync} 
                    handleRandomArticle={handleRandomArticle} 
                />
            ) : (
                <ArticleView 
                    article={article}
                    contentBlocks={contentBlocks}
                    tableOfContents={tableOfContents}
                    showToc={showToc}
                    toggleToc={toggleToc}
                    scrollToHeading={scrollToHeading}
                    fontSize={fontSize}
                />
            )}
        </div>
    );
};
