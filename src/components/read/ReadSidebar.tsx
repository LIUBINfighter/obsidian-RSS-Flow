import React, { useRef, useEffect, useState, useCallback } from 'react';
import { setIcon } from 'obsidian';
import { saveAllFavoritesToNote } from '../../utils/note-utils';

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
    onClearAllFavorites?: () => Promise<void>; // 添加清空所有收藏的回调
    plugin: any; // 添加plugin属性
}

export const ReadSidebar: React.FC<ReadSidebarProps> = ({
    isOpen,
    onToggle,
    favorites,
    currentArticleId,
    onRemoveFavorite,
    onClearAllFavorites,
    plugin
}) => {
    const toggleBtnRef = useRef<HTMLButtonElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        // 从localStorage获取保存的宽度，默认300
        const savedWidth = localStorage.getItem('rss-flow-sidebar-width');
        return savedWidth ? parseInt(savedWidth) : 300;
    });
    
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
                sidebarRef.current.style.width = `${newWidth}px`;
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
        }
    }, []);
    
    // 设置图标
    useEffect(() => {
        if (toggleBtnRef.current) {
            setIcon(toggleBtnRef.current, isOpen ? 'chevron-right' : 'chevron-left');
        }
    }, [isOpen]);
    
    // 保存所有收藏到新文件
    const handleSaveAllFavorites = useCallback(async () => {
        if (favorites.length === 0) {
            new Notice('没有收藏内容可保存');
            return;
        }
        
        try {
            await saveAllFavoritesToNote(favorites, plugin);
        } catch (error) {
            console.error('保存所有收藏失败:', error);
            new Notice('保存收藏内容失败');
        }
    }, [favorites, plugin]);
    
    return (
        <>
            {/* 边栏切换按钮 - 始终可见 */}
            <button 
                className="sidebar-toggle-floating clickable-icon" 
                ref={toggleBtnRef}
                onClick={onToggle}
                aria-label={isOpen ? "收起边栏" : "展开边栏"}
                title={isOpen ? "收起边栏" : "展开边栏"}
                style={{ 
                    position: 'fixed',
                    top: '80px',
                    right: isOpen ? `${sidebarWidth + 10}px` : '10px',
                    zIndex: 1000,
                    transition: 'right 0.3s ease-in-out',
                    backgroundColor: 'var(--background-primary)',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px var(--background-modifier-border)',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px solid var(--background-modifier-border)'
                }}
            />
            
            {/* 悬浮侧边栏 */}
            <div 
                className={`read-sidebar ${isOpen ? 'open' : ''}`}
                ref={sidebarRef}
                style={{ 
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100%',
                    width: `${sidebarWidth}px`,
                    backgroundColor: 'var(--background-primary)', 
                    borderLeft: '1px solid var(--background-modifier-border)',
                    boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 999,
                    transform: isOpen ? 'translateX(0)' : `translateX(100%)`,
                    transition: 'transform 0.3s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* 调整大小的手柄 */}
                <div 
                    className={`sidebar-resize-handle ${isResizing ? 'active' : ''}`}
                    onMouseDown={startResize}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '6px',
                        height: '100%',
                        cursor: 'col-resize',
                        backgroundColor: 'transparent',
                        '&:hover': {
                            backgroundColor: 'var(--interactive-accent)'
                        }
                    }}
                />
                
                {/* 边栏内容 */}
                <div className="sidebar-content" style={{ 
                    padding: '16px', 
                    height: '100%', 
                    overflowY: 'auto',
                    paddingTop: '48px' // 为顶部按钮留出空间
                }}>
                    <div className="sidebar-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                    }}>
                        <h3>收藏内容</h3>
                        <div className="sidebar-actions" style={{
                            display: 'flex',
                            gap: '8px'
                        }}>
                            <button 
                                className="mod-cta small-button"
                                onClick={handleSaveAllFavorites}
                                title="保存所有收藏内容到新的文件"
                                disabled={favorites.length === 0}
                            >
                                保存全部
                            </button>
                            <button 
                                className="mod-warning small-button"
                                onClick={onClearAllFavorites}
                                title="清空所有收藏内容"
                                disabled={favorites.length === 0}
                            >
                                清空
                            </button>
                        </div>
                    </div>
                    
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
        </>
    );
};

export default ReadSidebar;
