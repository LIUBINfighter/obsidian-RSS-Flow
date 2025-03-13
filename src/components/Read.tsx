import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import RSSFlowPlugin from '../main';
import { dbService } from '../services/db-service';
import { RSSItem } from '../types';
import { ArticleView } from './ArticleView';

interface ReadProps {
    plugin: RSSFlowPlugin;
}

export const Read: React.FC<ReadProps> = ({ plugin }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [article, setArticle] = useState<RSSItem | null>(null);
    const [loading, setLoading] = useState(true);

    const handleSidebarToggle = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const loadArticle = useCallback(async (articleId?: string) => {
        setLoading(true);
        try {
            await dbService.init();
            
            // 如果提供了文章ID，则加载该文章
            if (articleId) {
                const specificItem = await dbService.getItemById(articleId);
                setArticle(specificItem);
                // 清除当前文章ID，避免重复加载
                plugin.currentArticleId = null;
            } else {
                // 否则加载随机文章
                const randomItem = await dbService.getRandomItem();
                setArticle(randomItem);
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

    useEffect(() => {
        // 检查是否有指定要打开的文章
        const articleId = plugin.currentArticleId;
        // 直接传递可能为null的articleId，在loadArticle中处理
        loadArticle(articleId || undefined);
    }, [loadArticle, plugin.currentArticleId]);

    return (
        <div className="main-content-container">
            <div className={`content ${isSidebarOpen ? 'with-sidebar' : ''}`}>
                <div className="read-container">
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
                            <button 
                                onClick={handleSync}
                                className="sync-btn"
                                title="同步RSS"
                            >
                                同步RSS
                            </button>
                        </div>
                    </div>
                    <ArticleView 
                        article={article}
                        loading={loading}
                        onRefresh={handleRefresh}
                        onSync={handleSync}
                    />
                </div>
            </div>
            <Sidebar 
                isOpen={isSidebarOpen} 
                onToggle={handleSidebarToggle} 
            />
        </div>
    );
};
