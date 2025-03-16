import React, { useCallback, useState, useEffect } from 'react';
import { Notice } from 'obsidian'; // 导入 Notice 类
import RSSFlowPlugin from '../../main';
import { FavoriteProvider, useFavorites } from './favorite-context';
import { useArticle, useReadingProgress, useReadingSettings } from '../../hooks';
import { ReadHeader } from './ReadHeader';
import { ArticleView } from '../gallery/ArticleView';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ReadSidebar } from './ReadSidebar';
// 导入工具函数
import { saveArticleToNote, saveFavoritesToNote } from '../../utils/note-utils';

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
    const { 
        article, 
        contentBlocks, 
        loading, 
        handleRandomArticle, 
        handleSync, 
        handleNextArticle, 
        handlePrevArticle,
        folders,
        selectedFolder,
        handleFolderChange,
        readOrder,
        readFilter,
        handleReadOrderChange,
        handleReadFilterChange
    } = useArticle(plugin);
    
    const { readingProgress } = useReadingProgress(plugin, article);
    const { fontSize, isDarkMode, handleFontSizeChange } = useReadingSettings(plugin);
    const { exportToMarkdown, getFavorites, removeFavorite, clearAllFavorites } = useFavorites();
    
    // 边栏状态管理
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    // 切换边栏显示状态
    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);
    
    // 保存全文为笔记 - 使用工具函数
    const handleSaveToNote = useCallback(async () => {
        await saveArticleToNote(article, contentBlocks, plugin);
    }, [article, contentBlocks, plugin]);
    
    // 保存收藏段落为笔记 - 使用工具函数
    const handleSaveHighlightsToNote = useCallback(async () => {
        await saveFavoritesToNote(article, getFavorites(), plugin);
    }, [article, plugin, getFavorites]);

    return (
        <div className="read-view-container" style={{ fontSize: `${fontSize}px` }}>
            <ReadHeader 
                fontSize={fontSize}
                plugin={plugin}
                handleFontSizeChange={handleFontSizeChange}
                handleSync={handleSync}
                handleRandomArticle={handleRandomArticle}
                handleNextArticle={handleNextArticle}
                handlePrevArticle={handlePrevArticle}
                handleSaveToNote={handleSaveToNote}
                handleSaveHighlightsToNote={handleSaveHighlightsToNote}
                exportToMarkdown={exportToMarkdown}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                articleLink={article?.link}
                folders={folders}
                selectedFolder={selectedFolder}
                onFolderChange={handleFolderChange}
                readOrder={readOrder}
                readFilter={readFilter}
                onReadOrderChange={handleReadOrderChange}
                onReadFilterChange={handleReadFilterChange}
            />
            <div className="read-main-content">
                {loading ? (
                    <div className="article-container">
                        <LoadingState />
                    </div>
                ) : !article ? (
                    <div className="article-container">
                        <EmptyState 
                            plugin={plugin}
                            handleSync={handleSync}
                            handleRandomArticle={handleRandomArticle}
                        />
                    </div>
                ) : (
                    <ArticleView 
                        article={article}
                        contentBlocks={contentBlocks}
                        tableOfContents={[]}
                        showToc={false}
                        toggleToc={() => {}}
                        scrollToHeading={() => {}}
                        fontSize={fontSize}
                    />
                )}
            </div>
            
            <ReadSidebar 
                isOpen={isSidebarOpen}
                onToggle={toggleSidebar}
                favorites={getFavorites()}
                currentArticleId={article?.id}
                onRemoveFavorite={removeFavorite}
                onClearAllFavorites={clearAllFavorites}
                plugin={plugin}
            />
        </div>
    );
};
