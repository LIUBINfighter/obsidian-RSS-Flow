import React, { useCallback, useState, useEffect } from 'react';
import RSSFlowPlugin from '../../main';
import { FavoriteProvider, useFavorites } from './favorite-context';
import { useArticle, useReadingProgress, useReadingSettings } from '../../hooks';
import { ReadHeader } from './ReadHeader';
import { ArticleView } from '../gallery/ArticleView';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ReadSidebar } from './ReadSidebar';

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
    const { article, contentBlocks, loading, handleRandomArticle, handleSync, handleNextArticle, handlePrevArticle } = useArticle(plugin);
    const { readingProgress } = useReadingProgress(plugin, article);
    const { fontSize, isDarkMode, handleFontSizeChange } = useReadingSettings(plugin);
    const { exportToMarkdown, getFavorites, removeFavorite } = useFavorites();
    
    // 边栏状态管理
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    // 切换边栏显示状态
    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);
    
    // 保存全文为笔记
    const handleSaveToNote = useCallback(async () => {
        if (!article) return;
        
        try {
            // 构建笔记内容
            const noteContent = `# ${article.title}\n\n` + 
                `> [!info] 文章信息\n` +
                `> - 作者: ${article.author || '未知'}\n` +
                `> - 发布时间: ${new Date(article.publishDate).toLocaleString()}\n` +
                `> - 来源: [${article.feedName}](${article.link})\n\n` +
                `## 内容\n\n` +
                contentBlocks.map(block => {
                    if (block.type === 'heading') {
                        const level = block.level || 3;
                        return `${'#'.repeat(level)} ${block.content.replace(/<[^>]*>/g, '')}\n`;
                    } else if (block.type === 'paragraph' || block.type === 'text') {
                        return `${block.content.replace(/<[^>]*>/g, '')}\n\n`;
                    } else if (block.type === 'code') {
                        return `\`\`\`${block.language || ''}\n${block.content.replace(/<[^>]*>/g, '')}\n\`\`\`\n\n`;
                    } else if (block.type === 'blockquote') {
                        return `> ${block.content.replace(/<[^>]*>/g, '').replace(/\n/g, '\n> ')}\n\n`;
                    } else {
                        return `${block.content.replace(/<[^>]*>/g, '')}\n\n`;
                    }
                }).join('');
            
            // 创建笔记文件
            const filename = `${article.feedName} - ${article.title.replace(/[\\/:*?"<>|]/g, '-')}`;
            
            // 使用Obsidian API创建笔记
            await plugin.app.vault.create(`${filename}.md`, noteContent);
            
            // 显示成功通知
            new plugin.app.Notice('笔记已保存成功');
            
        } catch (error) {
            console.error('保存笔记失败:', error);
            new plugin.app.Notice('保存笔记失败，查看控制台了解详情');
        }
    }, [article, contentBlocks, plugin]);
    
    // 保存收藏段落为笔记
    const handleSaveHighlightsToNote = useCallback(async () => {
        if (!article) return;
        
        try {
            const { getFavorites } = useFavorites();
            const favorites = getFavorites();
            
            // 过滤出当前文章的收藏内容
            const articleFavorites = favorites.filter(fav => fav.articleId === article.id);
            
            if (articleFavorites.length === 0) {
                new plugin.app.Notice('当前文章没有收藏内容');
                return;
            }
            
            // 构建笔记内容
            const noteContent = `# ${article.title} - 精选内容\n\n` + 
                `> [!info] 文章信息\n` +
                `> - 作者: ${article.author || '未知'}\n` +
                `> - 发布时间: ${new Date(article.publishDate).toLocaleString()}\n` +
                `> - 来源: [${article.feedName}](${article.link})\n\n` +
                `## 收藏内容\n\n` +
                articleFavorites.map(fav => {
                    return `> ${fav.text.replace(/<[^>]*>/g, '')}\n\n`;
                }).join('');
            
            // 创建笔记文件
            const filename = `${article.feedName} - ${article.title.replace(/[\\/:*?"<>|]/g, '-')} - 精选`;
            
            // 使用Obsidian API创建笔记
            await plugin.app.vault.create(`${filename}.md`, noteContent);
            
            // 显示成功通知
            new plugin.app.Notice('收藏内容已保存为笔记');
            
        } catch (error) {
            console.error('保存收藏笔记失败:', error);
            new plugin.app.Notice('保存收藏笔记失败，查看控制台了解详情');
        }
    }, [article, plugin]);

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
            />
        </div>
    );
};
