import { useState, useCallback } from 'react';
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
                }
            } else {
                const randomItem = await dbService.getRandomItem();
                if (randomItem) {
                    setArticle(randomItem);
                    setContentBlocks(processHtmlContent(randomItem.content));
                    await dbService.markItemAsRead(randomItem.id);
                }
            }
        } catch (error) {
            console.error('加载文章失败:', error);
        } finally {
            setLoading(false);
        }
    }, [plugin]);

    const handleRefresh = useCallback(async () => {
        await loadArticle();
    }, [loadArticle]);

    const handleSync = useCallback(async () => {
        try {
            await plugin.syncRSSFeeds();
            await loadArticle();
        } catch (error) {
            console.error('同步RSS失败:', error);
        }
    }, [plugin, loadArticle]);

    return { article, contentBlocks, loading, handleRefresh, handleSync };
};
