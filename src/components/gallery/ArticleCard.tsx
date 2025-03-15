import React, { useState, useRef, useEffect } from 'react';
import { RSSItem } from '../../types';
import { setIcon } from 'obsidian';
import { dbService } from '../../services/db-service';

interface ArticleCardProps {
    article: RSSItem;
    onOpenInReadView: (articleId: string) => void;
    onRefresh?: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onOpenInReadView, onRefresh }) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(article.isFavorite);
    const [isRead, setIsRead] = useState<boolean>(article.isRead);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // 使用 useRef 替代直接在 ref 属性中使用函数
    const favoriteButtonRef = useRef<HTMLButtonElement>(null);
    const browserButtonRef = useRef<HTMLButtonElement>(null);
    const readButtonRef = useRef<HTMLButtonElement>(null);
    const readStatusButtonRef = useRef<HTMLButtonElement>(null);
    
    // 使用 useEffect 设置图标
    useEffect(() => {
        if (favoriteButtonRef.current) {
            setIcon(favoriteButtonRef.current, isFavorite ? 'star-fill' : 'star');
        }
        if (browserButtonRef.current) {
            setIcon(browserButtonRef.current, 'external-link');
        }
        if (readButtonRef.current) {
            setIcon(readButtonRef.current, 'book-open');
        }
        if (readStatusButtonRef.current) {
            setIcon(readStatusButtonRef.current, isRead ? 'eye' : 'eye-off');
        }
    }, [isFavorite, isRead]);
    
    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        
        try {
            const newFavoriteState = await dbService.toggleFavorite(article.id);
            setIsFavorite(newFavoriteState);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('无法更新收藏状态:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleToggleReadStatus = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        
        try {
            // 切换已读状态
            const newReadState = !isRead;
            await dbService.setReadStatus(article.id, newReadState);
            setIsRead(newReadState);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('无法更新已读状态:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOpenInBrowser = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(article.link, '_blank');
    };
    
    const handleOpenInReadView = (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenInReadView(article.id);
        
        // 打开阅读视图时自动标记为已读
        if (!isRead) {
            dbService.markItemAsRead(article.id).then(() => {
                setIsRead(true);
                if (onRefresh) onRefresh();
            });
        }
    };
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };
    
    return (
        <div className={`article-card ${isRead ? 'article-read' : ''}`}>
            {article.imageUrl && (
                <div className="article-card-image">
                    <img src={article.imageUrl} alt={article.title} />
                </div>
            )}
            
            <div className="article-card-content">
                <h3 className="article-card-title">{article.title}</h3>
                
                <div className="article-card-meta">
                    <span className="article-card-date">{formatDate(article.publishDate)}</span>
                    <span className="article-card-source">{article.feedName}</span>
                    {article.folder && (
                        <span className="article-card-folder">{article.folder}</span>
                    )}
                    {isRead && (
                        <span className="article-card-read-status">已读</span>
                    )}
                </div>
                
                <p className="article-card-summary">{article.summary}</p>
            </div>
            
            <div className="article-card-actions">
                <button
                    className={`article-card-action ${isFavorite ? 'active' : ''}`}
                    onClick={handleToggleFavorite}
                    disabled={isLoading}
                    title={isFavorite ? '取消收藏' : '添加收藏'}
                    ref={favoriteButtonRef}
                ></button>
                
                <button
                    className={`article-card-action ${isRead ? 'active' : ''}`}
                    onClick={handleToggleReadStatus}
                    disabled={isLoading}
                    title={isRead ? '标记为未读' : '标记为已读'}
                    ref={readStatusButtonRef}
                ></button>
                
                <button
                    className="article-card-action"
                    onClick={handleOpenInBrowser}
                    title="在浏览器中打开"
                    ref={browserButtonRef}
                ></button>
                
                <button
                    className="article-card-action"
                    onClick={handleOpenInReadView}
                    title="在阅读视图中打开"
                    ref={readButtonRef}
                ></button>
            </div>
        </div>
    );
};
