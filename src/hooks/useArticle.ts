import { useState, useCallback, useEffect, useRef } from 'react';
import RSSFlowPlugin from '../main';
import { dbService } from '../services/db-service';
import { RSSItem, ContentBlock } from '../types';
import { processHtmlContent } from '../utils/content-processor';
import { ReadOrder, ReadFilter } from '../components/read/ReadOrderSelector';

export const useArticle = (plugin: RSSFlowPlugin) => {
    const [article, setArticle] = useState<RSSItem | null>(null);
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [articleHistory, setArticleHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [folders, setFolders] = useState<string[]>(['all']);
    const [selectedFolder, setSelectedFolder] = useState<string>('all');
    const [readOrder, setReadOrder] = useState<ReadOrder>('newest');
    const [readFilter, setReadFilter] = useState<ReadFilter>('all');
    
    // 使用ref存储初始articleId，避免多次渲染问题
    const initialArticleIdRef = useRef<string | null>(plugin.currentArticleId);
    
    // 加载所有可用文件夹
    const loadFolders = useCallback(async () => {
        try {
            await dbService.init();
            const stats = await dbService.getItemStatsByFolder();
            const folderNames = stats.map(item => item.folder).filter(Boolean);
            setFolders(['all', ...folderNames]);
        } catch (error) {
            console.error('加载文件夹失败:', error);
        }
    }, []);

    // 组件挂载时加载文件夹列表
    useEffect(() => {
        loadFolders();
    }, [loadFolders]);
    
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
    
    // 按照当前顺序和过滤器随机加载文章
    const handleRandomArticle = useCallback(async () => {
        setLoading(true);
        try {
            await dbService.init();
            
            // 准备查询选项
            const options: any = {
                folder: selectedFolder !== 'all' ? selectedFolder : undefined,
                orderBy: 'random'
            };
            
            // 应用已读/未读过滤器
            if (readFilter === 'unread') {
                options.isRead = false;
            } else if (readFilter === 'read') {
                options.isRead = true;
            }
            
            // 获取符合条件的文章
            const articles = await dbService.getArticlesByOptions(options);
            
            if (articles.length > 0) {
                // 随机选择一篇
                const randomIndex = Math.floor(Math.random() * articles.length);
                const randomItem = articles[randomIndex];
                
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
    }, [historyIndex, selectedFolder, readOrder, readFilter]);
    
    // 同步RSS
    const handleSync = useCallback(async () => {
        try {
            await plugin.syncRSSFeeds();
        } catch (error) {
            console.error('同步RSS失败:', error);
        }
    }, [plugin]);
    
    // 加载下一篇文章（按当前顺序和过滤条件）
    const handleNextArticle = useCallback(async () => {
        if (historyIndex < articleHistory.length - 1) {
            // 直接从历史中加载下一篇
            setHistoryIndex(historyIndex + 1);
            await loadArticleById(articleHistory[historyIndex + 1], false);
        } else {
            // 按条件获取下一篇
            setLoading(true);
            try {
                // 准备查询选项
                const options: any = {
                    folder: selectedFolder !== 'all' ? selectedFolder : undefined,
                    orderBy: readOrder === 'random' ? 'newest' : readOrder // 随机模式下默认按最新顺序
                };
                
                // 应用已读/未读过滤器
                if (readFilter === 'unread') {
                    options.isRead = false;
                } else if (readFilter === 'read') {
                    options.isRead = true;
                }
                
                const nextArticle = await dbService.getNextArticle(
                    article?.id || null, 
                    options
                );
                
                if (nextArticle) {
                    setArticle(nextArticle);
                    setContentBlocks(processHtmlContent(nextArticle.content));
                    await dbService.markItemAsRead(nextArticle.id);
                    
                    // 添加到历史记录
                    setArticleHistory(prev => {
                        const newHistory = [...prev.slice(0, historyIndex + 1), nextArticle.id];
                        setHistoryIndex(newHistory.length - 1);
                        return newHistory;
                    });
                }
            } catch (error) {
                console.error('加载下一篇文章失败:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [historyIndex, articleHistory, loadArticleById, article?.id, selectedFolder, readOrder, readFilter]);
    
    // 加载上一篇文章
    const handlePrevArticle = useCallback(async () => {
        if (historyIndex > 0) {
            // 从历史中加载上一篇
            setHistoryIndex(historyIndex - 1);
            await loadArticleById(articleHistory[historyIndex - 1], false);
        } else {
            // 按条件获取上一篇
            setLoading(true);
            try {
                // 准备查询选项
                const options: any = {
                    folder: selectedFolder !== 'all' ? selectedFolder : undefined,
                    orderBy: readOrder === 'random' ? 'newest' : readOrder // 随机模式下默认按最新顺序
                };
                
                // 应用已读/未读过滤器
                if (readFilter === 'unread') {
                    options.isRead = false;
                } else if (readFilter === 'read') {
                    options.isRead = true;
                }
                
                const prevArticle = await dbService.getPrevArticle(
                    article?.id || null, 
                    options
                );
                
                if (prevArticle) {
                    setArticle(prevArticle);
                    setContentBlocks(processHtmlContent(prevArticle.content));
                    await dbService.markItemAsRead(prevArticle.id);
                }
            } catch (error) {
                console.error('加载上一篇文章失败:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [historyIndex, articleHistory, loadArticleById, article?.id, selectedFolder, readOrder, readFilter]);

    // 处理文件夹选择变更
    const handleFolderChange = useCallback((folder: string) => {
        setSelectedFolder(folder);
    }, []);
    
    // 处理阅读顺序变更
    const handleReadOrderChange = useCallback((order: ReadOrder) => {
        setReadOrder(order);
    }, []);
    
    // 处理阅读过滤器变更
    const handleReadFilterChange = useCallback((filter: ReadFilter) => {
        setReadFilter(filter);
    }, []);

    return { 
        article, 
        contentBlocks, 
        loading, 
        handleRandomArticle, 
        handleSync,
        handleNextArticle,
        handlePrevArticle,
        loadArticle: loadArticleById,
        folders,
        selectedFolder,
        handleFolderChange,
        readOrder,
        readFilter,
        handleReadOrderChange,
        handleReadFilterChange
    };
};
