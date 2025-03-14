import React, { useEffect } from 'react';
import { RSSItem } from '../types';
import { setIcon } from 'obsidian';

interface ArticleViewProps {
    article: RSSItem | null;
    loading: boolean;
    onRefresh: () => void;
    onSync: () => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ article, loading, onRefresh, onSync }) => {
    useEffect(() => {
        if (article) setIcon(document.querySelector('.article-link-btn'), 'external-link');
    }, [article]);
    
    if (loading) {
        return (
            <div className="article-loading">
                <div className="article-loading-spinner"></div>
                <p>正在加载文章...</p>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="article-empty">
                <p>没有找到文章</p>
                <div className="article-actions-empty">
                    <button 
                        className="article-sync-btn" 
                        onClick={onSync}
                    >
                        同步RSS源
                    </button>
                    <button 
                        className="article-refresh-btn" 
                        onClick={onRefresh}
                    >
                        刷新
                    </button>
                </div>
                <p className="article-empty-tip">
                    提示：如果您已添加RSS源但还是看不到内容，可能是因为同步失败。请检查源URL是否正确，或者查看控制台日志获取详细错误信息。
                </p>
            </div>
        );
    }

    return (
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
                    <button 
                        className="article-refresh-btn" 
                        onClick={onRefresh}
                    >
                        随机文章
                    </button>
                </div>
            </div>

            {article.imageUrl && (
                <div className="article-image">
                    <img src={article.imageUrl} alt={article.title} />
                </div>
            )}

            <div 
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.tags && article.tags.length > 0 && (
                <div className="article-tags">
                    {article.tags.map(tag => (
                        <span key={tag} className="article-tag">#{tag}</span>
                    ))}
                </div>
            )}
        </div>
    );
};
