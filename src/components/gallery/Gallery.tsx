import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dbService } from '../../services/db-service';
import { RSSItem, FeedMeta } from '../../types';
import { ArticleCard } from './ArticleCard';
import RSSFlowPlugin from '../../main';
import { setIcon, Notice } from 'obsidian';
import { useTranslation } from 'react-i18next';
import { FolderSelector } from './FolderSelector';
import { ensureString } from '../../utils/i18n-utils';

interface GalleryProps {
    plugin: RSSFlowPlugin;
}

export const Gallery: React.FC<GalleryProps> = ({ plugin }) => {
    const { t } = useTranslation();
    const [feeds, setFeeds] = useState<FeedMeta[]>([]);
    const [articles, setArticles] = useState<RSSItem[]>([]);
    const [expandedFeeds, setExpandedFeeds] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [view, setView] = useState<'card' | 'waterfall'>('card');
    const [filter, setFilter] = useState<'all' | 'favorite'>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [folders, setFolders] = useState<string[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    
    // 使用refs存储DOM元素引用
    const clearButtonRef = useRef<HTMLButtonElement>(null);
    const cardViewButtonRef = useRef<HTMLButtonElement>(null);
    const waterfallViewButtonRef = useRef<HTMLButtonElement>(null);
    const syncButtonRef = useRef<HTMLButtonElement>(null);
    const refreshButtonRef = useRef<HTMLButtonElement>(null);
    
    // 存储动态生成的折叠图标refs
    const toggleRefs = useRef<{[key: string]: HTMLSpanElement | null}>({});
    
    useEffect(() => {
        // 设置静态按钮图标
        if (clearButtonRef.current) setIcon(clearButtonRef.current, 'x');
        if (cardViewButtonRef.current) setIcon(cardViewButtonRef.current, 'layout-grid');
        if (waterfallViewButtonRef.current) setIcon(waterfallViewButtonRef.current, 'layout-columns');
        if (syncButtonRef.current) setIcon(syncButtonRef.current, 'refresh-cw');
        if (refreshButtonRef.current) setIcon(refreshButtonRef.current, 'rotate-cw');
    }, []);
    
    // 更新切换图标状态
    useEffect(() => {
        // 为每个feed设置折叠/展开图标
        Object.entries(expandedFeeds).forEach(([feedUrl, isExpanded]) => {
            const ref = toggleRefs.current[feedUrl];
            if (ref) {
                setIcon(ref, isExpanded ? 'chevron-down' : 'chevron-right');
            }
        });
    }, [expandedFeeds]);

    // 获取所有可用的文件夹
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

    useEffect(() => {
        loadFolders();
    }, [loadFolders]);
    
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            await dbService.init();
            
            // 获取所有Feed
            const feedsData = await dbService.getAllFeeds();
            setFeeds(feedsData);
            
            // 根据过滤器获取文章
            let articlesData: RSSItem[] = [];
            if (filter === 'favorite') {
                articlesData = await dbService.getFavoriteItems();
            } else {
                articlesData = await dbService.getAllItems();
            }
            
            // 应用文件夹筛选
            if (selectedFolder !== 'all') {
                articlesData = articlesData.filter(article => 
                    article.folder === selectedFolder
                );
            }
            
            // 应用搜索过滤
            if (searchTerm) {
                articlesData = articlesData.filter(article => 
                    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    article.content.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            // 按时间从新到旧排序
            articlesData.sort((a, b) => 
                new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
            );
            
            setArticles(articlesData);
        } catch (error) {
            console.error('加载数据失败:', error);
        } finally {
            setLoading(false);
        }
    }, [filter, searchTerm, selectedFolder]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    // 添加刷新按钮处理函数
    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return; // 防止重复点击
        
        setIsRefreshing(true);
        try {
            await loadData();
            new Notice(ensureString(t, 'gallery.refreshSuccess', '已刷新文章列表'));
        } catch (error) {
            console.error('刷新失败:', error);
            new Notice(ensureString(t, 'gallery.refreshError', '刷新失败'));
        } finally {
            setIsRefreshing(false);
        }
    }, [loadData, isRefreshing]);

    const handleOpenInReadView = useCallback(async (articleId: string) => {
        // 添加更详细的日志
        //console.log('Gallery: 准备在Read View中打开文章，ID:', articleId);
        
        // 先设置ID再激活视图，确保ID不会丢失
        plugin.currentArticleId = articleId;
        
        try {
            await plugin.activateReadView(articleId);
            //console.log('Gallery: Read View激活成功');
        } catch (error) {
            console.error('Gallery: 打开Read View失败:', error);
        }
    }, [plugin]);

    const toggleFeedExpand = useCallback((feedUrl: string) => {
        setExpandedFeeds(prev => ({
            ...prev,
            [feedUrl]: !prev[feedUrl]
        }));
    }, []);

    const handleSyncFeeds = useCallback(async () => {
        await plugin.syncRSSFeeds();
        loadData();
    }, [plugin, loadData]);

    const handleFolderChange = useCallback((folder: string) => {
        setSelectedFolder(folder);
    }, []);

    // 按Feed分组文章
    const groupedArticles: Record<string, RSSItem[]> = {};
    articles.forEach(article => {
        if (!groupedArticles[article.feedUrl]) {
            groupedArticles[article.feedUrl] = [];
        }
        groupedArticles[article.feedUrl].push(article);
    });

    // 保存新的toggle ref
    const saveToggleRef = (feedUrl: string, element: HTMLSpanElement | null) => {
        toggleRefs.current[feedUrl] = element;
        // 设置初始图标
        const isExpanded = expandedFeeds[feedUrl] !== false; // 默认展开
        if (element) {
            setIcon(element, isExpanded ? 'chevron-down' : 'chevron-right');
        }
    };

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h2>{ensureString(t, 'gallery.title', 'RSS Flow Gallery')}</h2>
                
                <div className="gallery-controls">
                    <div className="gallery-search">
                        <input
                            type="text"
                            placeholder={ensureString(t, 'gallery.search.placeholder', '搜索文章...')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* 添加文件夹选择器 */}
                    <FolderSelector 
                        folders={folders}
                        selectedFolder={selectedFolder}
                        onChange={handleFolderChange}
                    />
                    
                    <div className="gallery-filters">
                        <button 
                            className={`gallery-filter ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            {t('gallery.filter.all')}
                        </button>
                        <button 
                            className={`gallery-filter ${filter === 'favorite' ? 'active' : ''}`}
                            onClick={() => setFilter('favorite')}
                        >
                            {t('gallery.filter.favorite')}
                        </button>
                    </div>
                    
                    <div className="gallery-views">
                        <button 
                            className={`rss-action-btn ${view === 'card' ? 'active' : ''}`}
                            onClick={() => setView('card')}
                            title={ensureString(t, 'gallery.view.card', '卡片视图')}
                            ref={cardViewButtonRef}
                        ></button>
                        <button 
                            className={`rss-action-btn ${view === 'waterfall' ? 'active' : ''}`}
                            onClick={() => setView('waterfall')}
                            title={ensureString(t, 'gallery.view.waterfall', '瀑布流视图')}
                            ref={waterfallViewButtonRef}
                            disabled
                        ></button>
                    </div>
                    
                    {/* 添加刷新按钮 */}
                    <button 
                        className="rss-action-btn"
                        onClick={handleRefresh}
                        title={ensureString(t, 'gallery.actions.refresh', '刷新文章状态')}
                        ref={refreshButtonRef}
                        disabled={isRefreshing}
                    ></button>
                    
                    <button 
                        className="rss-action-btn"
                        onClick={handleSyncFeeds}
                        title={ensureString(t, 'gallery.actions.sync', '同步RSS源')}
                        ref={syncButtonRef}
                    ></button>
                </div>
            </div>

            {loading ? (
                <div className="gallery-loading">
                    <div className="rss-action-btn"></div>
                    <p>{t('gallery.loading')}</p>
                </div>
            ) : articles.length === 0 ? (
                <div className="gallery-empty">
                    <p>{t('gallery.empty.noArticles')}</p>
                    <button 
                        className="rss-action-btn"
                        onClick={handleSyncFeeds}
                    >
                        {t('gallery.actions.sync')}
                    </button>
                </div>
            ) : (
                <div className="gallery-content">
                    {Object.entries(groupedArticles).map(([feedUrl, feedArticles]) => {
                        const feed = feeds.find(f => f.url === feedUrl) || {
                            name: feedArticles[0]?.feedName || '未知来源',
                            url: feedUrl,
                            folder: feedArticles[0]?.folder || '未分类',
                            lastUpdated: '',
                            itemCount: feedArticles.length
                        };
                        
                        const isExpanded = expandedFeeds[feedUrl] !== false; // 默认展开
                        
                        return (
                            <div className="gallery-feed-section" key={feedUrl}>
                                <div 
                                    className="gallery-feed-header"
                                    onClick={() => toggleFeedExpand(feedUrl)}
                                >
                                    <div className="gallery-feed-info">
                                        <span 
                                            className="gallery-feed-toggle"
                                            ref={el => saveToggleRef(feedUrl, el)}
                                        ></span>
                                        <h3>{feed.name}</h3>
                                        <span className="gallery-feed-count">{feedArticles.length}</span>
                                    </div>
                                    {feed.folder && (
                                        <span className="gallery-feed-folder">{feed.folder}</span>
                                    )}
                                </div>
                                
                                {isExpanded && (
                                    <div className={`gallery-articles ${view === 'waterfall' ? 'waterfall-view' : 'card-view'}`}>
                                        {feedArticles.map(article => (
                                            <ArticleCard
                                                key={article.id}
                                                article={article}
                                                onOpenInReadView={handleOpenInReadView}
                                                onRefresh={loadData}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
