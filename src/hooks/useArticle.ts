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
    
    // 使用ref存储初始articleId，避免多次渲染问题
    const initialArticleIdRef = useRef<string | null>(plugin.currentArticleId);
    
    // 加载文章内容
    const loadArticleById = useCallback(async (articleId: string, addToHistory = true) => {
        setLoading(true);
        try {
            await dbService.init();
            const item = await dbService.getItemById(articleId);
            if (item) {
                setArticle(item);
                setContentBlocks(processHtmlContent(item.content));
                await dbService.markItemAsRead(articleId);
                
                // 添加到历史记录
                if (addToHistory) {
                    setArticleHistory(prev => {
                        const newHistory = [...prev.slice(0, historyIndex + 1), articleId];
                        setHistoryIndex(newHistory.length - 1);
                        return newHistory;
                    });
                }
                return true;
            } else {
                console.error("找不到指定ID的文章:", articleId);
                setArticle(null);
                return false;
            }
        } catch (error) {
            console.error('加载文章失败:', error);
            setArticle(null);
            return false;
        } finally {
            setLoading(false);
        }
    }, [historyIndex]);
    
    // 组件挂载时加载初始文章
    useEffect(() => {
        const articleId = initialArticleIdRef.current;
        if (articleId) {
            initialArticleIdRef.current = null; // 清除以避免重复加载
            loadArticleById(articleId, true);
        } else {
            setLoading(false);
        }
    }, [loadArticleById]);
    
    // 随机加载文章
    const handleRandomArticle = useCallback(async () => {
        setLoading(true);
        try {
            await dbService.init();
            const randomItem = await dbService.getRandomItem();
            if (randomItem) {
                setArticle(randomItem);
                setContentBlocks(processHtmlContent(randomItem.content));
                await dbService.markItemAsRead(randomItem.id);
                
                // 添加到历史记录
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
    
    // 同步RSS
    const handleSync = useCallback(async () => {
        try {
            await plugin.syncRSSFeeds();
        } catch (error) {
            console.error('同步RSS失败:', error);
        }
    }, [plugin]);
    
    // 加载下一篇文章
    const handleNextArticle = useCallback(async () => {
        if (historyIndex < articleHistory.length - 1) {
            // 直接从历史中加载下一篇
            setHistoryIndex(historyIndex + 1);
            await loadArticleById(articleHistory[historyIndex + 1], false);
        } else {
            // 没有下一篇，获取新的随机文章
            await handleRandomArticle();
        }
    }, [historyIndex, articleHistory, handleRandomArticle, loadArticleById]);
    
    // 加载上一篇文章
    const handlePrevArticle = useCallback(async () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            await loadArticleById(articleHistory[historyIndex - 1], false);
        }
    }, [historyIndex, articleHistory, loadArticleById]);

    return { 
        article, 
        contentBlocks, 
        loading, 
        handleRandomArticle, 
        handleSync,
        handleNextArticle,
        handlePrevArticle,
        loadArticle: loadArticleById
    };
};
