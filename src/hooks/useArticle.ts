import { useState, useCallback, useEffect } from 'react';
import RSSFlowPlugin from '../main';
import { dbService } from '../services/db-service';
import { RSSItem, ContentBlock } from '../types';
import { processHtmlContent } from '../utils/content-processor';

export const useArticle = (plugin: RSSFlowPlugin) => {
    const [article, setArticle] = useState<RSSItem | null>(null);
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);

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
                    plugin.currentArticleId = null;
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
    }, [plugin]);

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
            } else {
                setArticle(null);
            }
        } catch (error) {
            console.error('加载随机文章失败:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSync = useCallback(async () => {
        try {
            await plugin.syncRSSFeeds();
        } catch (error) {
            console.error('同步RSS失败:', error);
        }
    }, [plugin]);

    // 当组件挂载或currentArticleId变化时加载文章
    useEffect(() => {
        loadArticle(plugin.currentArticleId || undefined);
    }, [loadArticle, plugin.currentArticleId]);

    return { 
        article, 
        contentBlocks, 
        loading, 
        handleRandomArticle, 
        handleSync 
    };
};
