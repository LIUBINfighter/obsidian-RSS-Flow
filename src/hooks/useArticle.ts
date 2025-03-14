import { useState, useCallback, useEffect, useRef } from 'react';
import RSSFlowPlugin from '../main';
import { dbService } from '../services/db-service';
import { RSSItem, ContentBlock } from '../types';
import { processHtmlContent } from '../utils/content-processor';

export const useArticle = (plugin: RSSFlowPlugin) => {
    const [article, setArticle] = useState<RSSItem | null>(null);
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [articleHistory, setArticleHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    
    // 使用ref存储初始articleId，避免它在多次渲染中丢失
    const initialArticleIdRef = useRef<string | null>(plugin.currentArticleId);
    
    // 只在组件挂载时执行一次的加载文章逻辑
    useEffect(() => {
        const articleId = initialArticleIdRef.current;
        console.log("初始化时的文章ID:", articleId);
        
        if (articleId) {
            // 清理initialArticleIdRef以避免重复加载
            initialArticleIdRef.current = null;
            
            // 立即加载文章
            const loadInitialArticle = async () => {
                setLoading(true);
                try {
                    await dbService.init();
                    const specificItem = await dbService.getItemById(articleId);
                    if (specificItem) {
                        console.log("成功加载文章:", specificItem.title);
                        setArticle(specificItem);
                        setContentBlocks(processHtmlContent(specificItem.content));
                        await dbService.markItemAsRead(articleId);
                        
                        // 添加到历史记录
                        setArticleHistory([articleId]);
                        setHistoryIndex(0);
                    } else {
                        console.error("找不到指定ID的文章:", articleId);
                        setArticle(null);
                    }
                } catch (error) {
                    console.error('加载初始文章失败:', error);
                    setArticle(null);
                } finally {
                    setLoading(false);
                }
            };
            
            loadInitialArticle();
        } else {
            // 如果没有初始文章ID，则设置为非加载状态
            setLoading(false);
        }
    }, []); // 仅在组件挂载时执行一次

    const loadArticle = useCallback(async (articleId?: string) => {
        setLoading(true);
        try {
            await dbService.init();
            if (articleId) {
                const specificItem = await dbService.getItemById(articleId);
                if (specificItem) {
                    setArticle(specificItem);
                    setContentBlocks(processHtmlContent(specificItem.content));
                    await dbService.markItemAsRead(articleId);
                    
                    // 添加文章到历史记录
                    setArticleHistory(prev => {
                        // 如果当前不是最后一篇文章，则清除此后的历史
                        const newHistory = [...prev.slice(0, historyIndex + 1), articleId];
                        setHistoryIndex(newHistory.length - 1);
                        return newHistory;
                    });
                } else {
                    // 找不到指定文章
                    setArticle(null);
                }
            } else {
                // 不再自动加载随机文章，而是显示空状态
                setArticle(null);
            }
        } catch (error) {
            console.error('加载文章失败:', error);
            setArticle(null);
        } finally {
            setLoading(false);
        }
    }, [plugin, historyIndex]);

    // 专门用于随机加载文章的函数
    const handleRandomArticle = useCallback(async () => {
        setLoading(true);
        try {
            await dbService.init();
            const randomItem = await dbService.getRandomItem();
            if (randomItem) {
                setArticle(randomItem);
                setContentBlocks(processHtmlContent(randomItem.content));
                await dbService.markItemAsRead(randomItem.id);
                
                // 添加新文章到历史记录
                setArticleHistory(prev => {
                    const newHistory = [...prev.slice(0, historyIndex + 1), randomItem.id];
                    setHistoryIndex(newHistory.length - 1);
                    return newHistory;
                });
            } else {
                setArticle(null);
            }
        } catch (error) {
            console.error('加载随机文章失败:', error);
        } finally {
            setLoading(false);
        }
    }, [historyIndex]);

    const handleSync = useCallback(async () => {
        try {
            await plugin.syncRSSFeeds();
        } catch (error) {
            console.error('同步RSS失败:', error);
        }
    }, [plugin]);

    // 用于加载下一篇文章
    const handleNextArticle = useCallback(async () => {
        if (historyIndex < articleHistory.length - 1) {
            setHistoryIndex(historyIndex + 1);
            const nextArticleId = articleHistory[historyIndex + 1];
            if (nextArticleId) {
                setLoading(true);
                try {
                    await dbService.init();
                    const nextItem = await dbService.getItemById(nextArticleId);
                    if (nextItem) {
                        setArticle(nextItem);
                        setContentBlocks(processHtmlContent(nextItem.content));
                        await dbService.markItemAsRead(nextArticleId);
                    }
                } catch (error) {
                    console.error('加载下一篇文章失败:', error);
                } finally {
                    setLoading(false);
                }
            }
        } else {
            // 没有下一篇，获取新的随机文章
            await handleRandomArticle();
        }
    }, [historyIndex, articleHistory, handleRandomArticle]);

    // 用于加载上一篇文章
    const handlePrevArticle = useCallback(async () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            const prevArticleId = articleHistory[historyIndex - 1];
            if (prevArticleId) {
                setLoading(true);
                try {
                    await dbService.init();
                    const prevItem = await dbService.getItemById(prevArticleId);
                    if (prevItem) {
                        setArticle(prevItem);
                        setContentBlocks(processHtmlContent(prevItem.content));
                    }
                } catch (error) {
                    console.error('加载上一篇文章失败:', error);
                } finally {
                    setLoading(false);
                }
            }
        }
    }, [historyIndex, articleHistory]);

    return { 
        article, 
        contentBlocks, 
        loading, 
        handleRandomArticle, 
        handleSync,
        handleNextArticle,
        handlePrevArticle
    };
};
