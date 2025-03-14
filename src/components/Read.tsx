import React, { useState, useCallback, useEffect, useMemo } from 'react';
// 删除边栏导入
// import { Sidebar } from './Sidebar';
import RSSFlowPlugin from '../main';
import { dbService } from '../services/db-service';
import { RSSItem, ContentBlock } from '../types';
import { ContentBlockView } from './ContentBlock';
import { TableOfContents } from './TableOfContents';
// 删除 ReadingSettings 导入
import { FavoriteProvider, useFavorites } from '../contexts/favorite-context';
import { processHtmlContent, generateTableOfContents } from '../utils/content-processor';
import { Notice } from 'obsidian';

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
    // 删除侧边栏状态
    // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [article, setArticle] = useState<RSSItem | null>(null);
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [fontSize, setFontSize] = useState(16);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    // 删除showSettings状态
    const [showToc, setShowToc] = useState(false);
    
    // 获取收藏功能
    const { exportToMarkdown } = useFavorites();
    
    // 删除侧边栏切换函数
    // const handleSidebarToggle = useCallback(() => {
    //     setIsSidebarOpen(prev => !prev);
    // }, []);

    // 使用useMemo计算文章目录
    const tableOfContents = useMemo(() => {
        return generateTableOfContents(contentBlocks);
    }, [contentBlocks]);

    // 文章处理与加载
    const loadArticle = useCallback(async (articleId?: string) => {
        setLoading(true);
        try {
            await dbService.init();
            
            // 如果提供了文章ID，则加载该文章
            if (articleId) {
                const specificItem = await dbService.getItemById(articleId);
                if (specificItem) {
                    setArticle(specificItem);
                    // 使用工具函数处理文章内容为块
                    const blocks = processHtmlContent(specificItem.content);
                    setContentBlocks(blocks);
                    
                    // 标记文章为已读
                    try {
                        await dbService.markItemAsRead(articleId);
                    } catch (error) {
                        console.warn('标记文章为已读失败，可能需要更新dbService:', error);
                    }
                    
                    // 恢复阅读进度
                    try {
                        const data = await plugin.loadData() || {};
                        if (data.readingProgress && data.readingProgress[articleId]) {
                            setTimeout(() => {
                                window.scrollTo(0, data.readingProgress[articleId]);
                            }, 100);
                        }
                    } catch (error) {
                        console.warn('恢复阅读进度失败:', error);
                    }
                    
                    // 清除当前文章ID，避免重复加载
                    plugin.currentArticleId = null;
                }
            } else {
                // 加载随机文章
                const randomItem = await dbService.getRandomItem();
                if (randomItem) {
                    setArticle(randomItem);
                    // 使用工具函数处理文章内容为块
                    const blocks = processHtmlContent(randomItem.content);
                    setContentBlocks(blocks);
                    
                    // 标记文章为已读
                    try {
                        await dbService.markItemAsRead(randomItem.id);
                    } catch (error) {
                        console.warn('标记文章为已读失败，可能需要更新dbService:', error);
                    }
                }
            }
        } catch (error) {
            console.error('加载文章失败:', error);
        } finally {
            setLoading(false);
        }
    }, [plugin]);

    // 刷新文章
    const handleRefresh = useCallback(async () => {
        await loadArticle();
    }, [loadArticle]);

    // 同步RSS
    const handleSync = useCallback(async () => {
        try {
            await plugin.syncRSSFeeds();
            await loadArticle();
        } catch (error) {
            console.error('同步RSS失败:', error);
        }
    }, [plugin, loadArticle]);
    
    // 滚动到指定标题
    const scrollToHeading = useCallback((headingId: number) => {
        const element = document.getElementById(`heading-${headingId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);
    
    // 保存阅读进度
    const saveReadingProgress = useCallback(async () => {
        if (article) {
            try {
                const data = await plugin.loadData() || {};
                data.readingProgress = data.readingProgress || {};
                data.readingProgress[article.id] = window.scrollY;
                await plugin.saveData(data);
            } catch (error) {
                console.warn('保存阅读进度失败:', error);
            }
        }
    }, [article, plugin]);
    
    // 监听滚动保存阅读进度
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        const handleScroll = () => {
            // 使用节流技术，避免频繁保存
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setReadingProgress(window.scrollY);
                saveReadingProgress();
            }, 500);
        };
        
        window.addEventListener('scroll', handleScroll);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [saveReadingProgress]);

    // 字体大小变化处理 - 修改为保存到data.json
    const handleFontSizeChange = useCallback(async (change: number) => {
        const newSize = Math.max(12, Math.min(24, fontSize + change));
        setFontSize(newSize);
        document.documentElement.style.setProperty('--article-font-size', `${newSize}px`);
        
        // 保存字体大小到data.json
        try {
            const data = await plugin.loadData() || {};
            data.fontSize = newSize;
            await plugin.saveData(data);
        } catch (error) {
            console.warn('保存字体大小设置失败:', error);
        }
    }, [fontSize, plugin]);
    
    // 主题变化处理
    const handleThemeChange = useCallback((isDark: boolean) => {
        setIsDarkMode(isDark);
        document.documentElement.classList.toggle('theme-dark', isDark);
        document.documentElement.classList.toggle('theme-light', !isDark);
    }, []);

    // 初始化加载 - 修改为从data.json读取字体大小
    useEffect(() => {
        // 检查是否有指定要打开的文章
        const articleId = plugin.currentArticleId;
        loadArticle(articleId || undefined);
        
        // 从data.json读取字体大小设置
        const loadSettings = async () => {
            try {
                const data = await plugin.loadData() || {};
                if (data.fontSize) {
                    setFontSize(data.fontSize);
                    document.documentElement.style.setProperty('--article-font-size', `${data.fontSize}px`);
                }
            } catch (error) {
                console.warn('读取字体大小设置失败:', error);
            }
        };
        
        loadSettings();
    }, [loadArticle, plugin.currentArticleId]);

    // 删除toggleSettings函数
    
    // 切换目录
    const toggleToc = useCallback(() => {
        setShowToc(prev => !prev);
    }, []);

    return (
        <div className="read-view-container">
            {/* 移除侧边栏相关代码，只保留主内容区域 */}
            <div className="read-container" style={{ fontSize: `${fontSize}px` }}>
                <div className="read-header">
                    <h2>RSS Flow Reader</h2>
                    <div className="read-actions">
                        <button 
                            onClick={handleRefresh}
                            className="read-refresh-btn"
                            title="随机文章"
                        >
                            随机
                        </button>
                        {/* 删除侧边栏切换按钮 */}
                        <button 
                            onClick={handleSync}
                            className="sync-btn"
                            title="同步RSS"
                        >
                            同步RSS
                        </button>
                        <button 
                            onClick={exportToMarkdown}
                            className="export-btn"
                            title="导出收藏为Markdown"
                        >
                            导出收藏
                        </button>
                        
                        {/* 添加字体大小控制按钮 */}
                        <div className="font-size-controls">
                            <button 
                                onClick={() => handleFontSizeChange(-1)}
                                className="font-size-btn decrease"
                                title="减小字体"
                            >
                                A-
                            </button>
                            <span className="font-size-display">{fontSize}px</span>
                            <button 
                                onClick={() => handleFontSizeChange(1)}
                                className="font-size-btn increase"
                                title="增大字体"
                            >
                                A+
                            </button>
                        </div>
                        
                        {tableOfContents.length > 0 && (
                            <button 
                                onClick={toggleToc}
                                className={`toc-btn ${showToc ? 'active' : ''}`}
                                title="文章目录"
                            >
                                目录
                            </button>
                        )}
                    </div>
                </div>
                
                {/* 删除条件渲染阅读设置面板 */}
                
                {/* 条件渲染目录 */}
                {showToc && tableOfContents.length > 0 && (
                    <div className="floating-toc-panel">
                        <TableOfContents 
                            items={tableOfContents} 
                            onItemClick={scrollToHeading} 
                        />
                    </div>
                )}
                
                {loading ? (
                    <div className="article-loading">
                        <div className="article-loading-spinner"></div>
                        <p>正在加载文章...</p>
                    </div>
                ) : !article ? (
                    <div className="article-empty">
                        <p>没有找到文章</p>
                        <div className="article-actions-empty">
                            <button 
                                className="article-sync-btn" 
                                onClick={handleSync}
                            >
                                同步RSS源
                            </button>
                            <button 
                                className="article-refresh-btn" 
                                onClick={handleRefresh}
                            >
                                刷新
                            </button>
                        </div>
                        <p className="article-empty-tip">
                            提示：如果您已添加RSS源但还是看不到内容，可能是因为同步失败。请检查源URL是否正确，或者查看控制台日志获取详细错误信息。
                        </p>
                    </div>
                ) : (
                    <div className="article-container">
                        <div className="article-header">
                            <h2 className="article-title">{article.title}</h2>
                            <div className="article-meta">
                                {article.author && (
                                    <span className="article-author">by {article.author}</span>
                                )}
                                <span className="article-date">
                                    {new Date(article.publishDate).toLocaleString()}
                                </span>
                                <span className="article-source">
                                    来源: {article.feedName}
                                </span>
                            </div>
                            <div className="article-actions">
                                <a 
                                    href={article.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="article-link-btn"
                                >
                                    查看原文
                                </a>
                                {/* 删除重复的随机文章按钮 */}
                            </div>
                        </div>

                        {/* 移除这里的目录，改为由顶部按钮控制显示 */}

                        {article.imageUrl && (
                            <div className="article-image">
                                <img src={article.imageUrl} alt={article.title} />
                            </div>
                        )}

                        <div className="article-content text-blocks-container">
                            {contentBlocks.map((block) => (
                                <ContentBlockView
                                    key={`${article.id}-block-${block.id}`}
                                    block={block}
                                    articleId={article.id}
                                    articleTitle={article.title}
                                />
                            ))}
                        </div>

                        {article.tags && article.tags.length > 0 && (
                            <div className="article-tags">
                                {article.tags.map(tag => (
                                    <span key={tag} className="article-tag">#{tag}</span>
                                ))}
                            </div>
                        )}
                        
                        {/* 删除阅读进度条 */}
                    </div>
                )}
            </div>
        </div>
    );
};
