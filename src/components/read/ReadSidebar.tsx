import React, { useRef, useEffect, useState, useCallback } from 'react';
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
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(300);
    
    // 根据当前文章过滤收藏内容
    const currentArticleFavorites = currentArticleId
        ? favorites.filter(fav => fav.articleId === currentArticleId)
        : [];
    
    // 其他文章的收藏内容
    const otherArticleFavorites = favorites.filter(
        fav => !currentArticleId || fav.articleId !== currentArticleId
    );
    
    // 处理边栏拖拽调整宽度
    const startResize = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        
        const onMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            
            // 计算新宽度 (窗口宽度 - 鼠标位置)
            const newWidth = Math.max(
                200, // 最小宽度
                Math.min(
                    window.innerWidth * 0.5, // 最大宽度 (屏幕的50%)
                    window.innerWidth - e.clientX
                )
            );
            
            // 更新宽度
            if (sidebarRef.current) {
                sidebarRef.current.style.setProperty('--sidebar-width', `${newWidth}px`);
            }
            
            setSidebarWidth(newWidth);
        };
        
        const onMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // 保存宽度到本地存储
            localStorage.setItem('rss-flow-sidebar-width', sidebarWidth.toString());
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, [isResizing, sidebarWidth]);
    
    // 从本地存储加载保存的宽度
    useEffect(() => {
        const savedWidth = localStorage.getItem('rss-flow-sidebar-width');
        if (savedWidth) {
            const width = parseInt(savedWidth);
            setSidebarWidth(width);
            
            if (sidebarRef.current) {
                sidebarRef.current.style.setProperty('--sidebar-width', `${width}px`);
            }
        }
    }, []);
    
    // 设置图标
    useEffect(() => {
        if (toggleBtnRef.current) {
            setIcon(toggleBtnRef.current, isOpen ? 'chevron-right' : 'chevron-left');
        }
    }, [isOpen]);
    
    return (
        <div 
            className={`read-sidebar ${isOpen ? 'open' : ''}`}
            ref={sidebarRef}
            style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
        >
            <button 
                className="sidebar-toggle clickable-icon" 
                ref={toggleBtnRef}
                onClick={onToggle}
                aria-label={isOpen ? "收起边栏" : "展开边栏"}
                title={isOpen ? "收起边栏" : "展开边栏"}
                style={{ top: '40px', right: '10px', position: 'fixed' }}
            />
            
            {isOpen && (
                <div 
                    className={`sidebar-resize-handle ${isResizing ? 'active' : ''}`}
                    onMouseDown={startResize}
                />
            )}
            
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
