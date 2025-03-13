import React, { useState, useEffect, useCallback, useRef } from 'react';
import { dbService } from '../services/db-service';
import { RSSItem, FeedMeta } from '../types';
import { ArticleCard } from './ArticleCard';
import RSSFlowPlugin from '../main';
import { setIcon } from 'obsidian';

interface GalleryProps {
    plugin: RSSFlowPlugin;
}

export const Gallery: React.FC<GalleryProps> = ({ plugin }) => {
    const [feeds, setFeeds] = useState<FeedMeta[]>([]);
    const [articles, setArticles] = useState<RSSItem[]>([]);
    const [expandedFeeds, setExpandedFeeds] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [view, setView] = useState<'card' | 'waterfall'>('card');
    const [filter, setFilter] = useState<'all' | 'favorite'>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // 使用refs存储DOM元素引用
    const clearButtonRef = useRef<HTMLButtonElement>(null);
    const cardViewButtonRef = useRef<HTMLButtonElement>(null);
    const waterfallViewButtonRef = useRef<HTMLButtonElement>(null);
    const syncButtonRef = useRef<HTMLButtonElement>(null);
    
    // 存储动态生成的折叠图标refs
    const toggleRefs = useRef<{[key: string]: HTMLSpanElement | null}>({});
    
    useEffect(() => {
        // 设置静态按钮图标
        if (clearButtonRef.current) setIcon(clearButtonRef.current, 'x');
        if (cardViewButtonRef.current) setIcon(cardViewButtonRef.current, 'layout-grid');
        if (waterfallViewButtonRef.current) setIcon(waterfallViewButtonRef.current, 'layout-columns');
        if (syncButtonRef.current) setIcon(syncButtonRef.current, 'refresh-cw');
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
    }, [filter, searchTerm]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenInReadView = useCallback(async (articleId: string) => {
        // 打开ReadView并传递文章ID
        await plugin.activateReadView(articleId);
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
                <h2>RSS 文章库</h2>
                
                <div className="gallery-controls">
                    <div className="gallery-search">
                        <input
                            type="text"
                            placeholder="搜索文章..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <button 
                            className="gallery-search-clear"
                            onClick={() => setSearchTerm('')}
                            style={{ display: searchTerm ? 'block' : 'none' }}
                            ref={clearButtonRef}
                        ></button>
                    </div>
                    
                    <div className="gallery-filters">
                        <button 
                            className={`gallery-filter ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            全部
                        </button>
                        <button 
                            className={`gallery-filter ${filter === 'favorite' ? 'active' : ''}`}
                            onClick={() => setFilter('favorite')}
                        >
                            收藏
                        </button>
                    </div>
                    
                    <div className="gallery-views">
                        <button 
                            className={`gallery-view-btn ${view === 'card' ? 'active' : ''}`}
                            onClick={() => setView('card')}
                            title="卡片视图"
                            ref={cardViewButtonRef}
                        ></button>
                        <button 
                            className={`gallery-view-btn ${view === 'waterfall' ? 'active' : ''}`}
                            onClick={() => setView('waterfall')}
                            title="瀑布流视图"
                            ref={waterfallViewButtonRef}
                            disabled
                        ></button>
                    </div>
                    
                    <button 
                        className="gallery-sync-btn"
                        onClick={handleSyncFeeds}
                        title="同步RSS源"
                        ref={syncButtonRef}
                    ></button>
                </div>
            </div>

            {loading ? (
                <div className="gallery-loading">
                    <div className="gallery-loading-spinner"></div>
                    <p>加载中...</p>
                </div>
            ) : articles.length === 0 ? (
                <div className="gallery-empty">
                    <p>没有找到文章</p>
                    <button 
                        className="gallery-sync-btn-large"
                        onClick={handleSyncFeeds}
                    >
                        同步RSS源
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
