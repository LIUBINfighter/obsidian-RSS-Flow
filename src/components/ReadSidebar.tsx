import React, { useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';

interface FavoriteItem {
    id: number;
    text: string;
    source: string;
    articleId: string;
    timestamp: number;
}

interface ReadSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    favorites: FavoriteItem[];
    currentArticleId?: string;
    onRemoveFavorite?: (articleId: string, blockId: number) => void;
}

export const ReadSidebar: React.FC<ReadSidebarProps> = ({
    isOpen,
    onToggle,
    favorites,
    currentArticleId,
    onRemoveFavorite
}) => {
    const toggleBtnRef = useRef<HTMLButtonElement>(null);
    
    // 根据当前文章过滤收藏内容
    const currentArticleFavorites = currentArticleId
        ? favorites.filter(fav => fav.articleId === currentArticleId)
        : [];
    
    // 其他文章的收藏内容
    const otherArticleFavorites = favorites.filter(
        fav => !currentArticleId || fav.articleId !== currentArticleId
    );
    
    useEffect(() => {
        if (toggleBtnRef.current) {
            setIcon(toggleBtnRef.current, isOpen ? 'chevron-right' : 'chevron-left');
        }
    }, [isOpen]);
    
    return (
        <div className={`read-sidebar ${isOpen ? 'open' : ''}`}>
            <button 
                className="sidebar-toggle clickable-icon" 
                ref={toggleBtnRef}
                onClick={onToggle}
                aria-label={isOpen ? "收起边栏" : "展开边栏"}
                title={isOpen ? "收起边栏" : "展开边栏"}
            />
            
            <div className="sidebar-content">
                <h3>收藏内容</h3>
                
                {currentArticleId && (
                    <>
                        <h4>当前文章</h4>
                        {currentArticleFavorites.length > 0 ? (
                            <div className="favorites-list">
                                {currentArticleFavorites.map(fav => (
                                    <div key={`${fav.articleId}-${fav.id}`} className="favorite-item">
                                        <div 
                                            className="favorite-text"
                                            dangerouslySetInnerHTML={{ __html: fav.text }}
                                        />
                                        <div className="favorite-actions">
                                            <div className="favorite-source">{fav.source}</div>
                                            <div className="favorite-timestamp">{new Date(fav.timestamp).toLocaleString()}</div>
                                            {onRemoveFavorite && (
                                                <button 
                                                    className="remove-favorite small-button"
                                                    onClick={() => onRemoveFavorite(fav.articleId, fav.id)}
                                                    title="移除收藏"
                                                >
                                                    移除
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-message">当前文章没有收藏内容</p>
                        )}
                    </>
                )}
                
                {otherArticleFavorites.length > 0 && (
                    <>
                        <h4>其他文章</h4>
                        <div className="favorites-list other-articles">
                            {otherArticleFavorites.map(fav => (
                                <div key={`${fav.articleId}-${fav.id}`} className="favorite-item">
                                    <div 
                                        className="favorite-text"
                                        dangerouslySetInnerHTML={{ __html: fav.text }}
                                    />
                                    <div className="favorite-actions">
                                        <div className="favorite-source">{fav.source}</div>
                                        <div className="favorite-timestamp">{new Date(fav.timestamp).toLocaleString()}</div>
                                        {onRemoveFavorite && (
                                            <button 
                                                className="remove-favorite small-button"
                                                onClick={() => onRemoveFavorite(fav.articleId, fav.id)}
                                                title="移除收藏"
                                            >
                                                移除
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                
                {favorites.length === 0 && (
                    <p className="empty-message">暂无收藏内容</p>
                )}
            </div>
        </div>
    );
};

export default ReadSidebar;
