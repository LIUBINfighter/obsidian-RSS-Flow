import React, { useRef, useEffect } from 'react';
import { VIEW_TYPES } from '../../types';
import RSSFlowPlugin from '../../main';
import { setIcon } from 'obsidian';

interface EmptyStateProps {
    plugin: RSSFlowPlugin;
    handleSync: () => void;
    handleRandomArticle: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ plugin, handleSync, handleRandomArticle }) => {
    // 创建refs用于设置图标
    const galleryBtnRef = useRef<HTMLButtonElement>(null);
    const randomBtnRef = useRef<HTMLButtonElement>(null);
    const syncBtnRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        // 设置按钮图标
        if (galleryBtnRef.current) setIcon(galleryBtnRef.current, 'layout-grid');
        if (randomBtnRef.current) setIcon(randomBtnRef.current, 'shuffle');
        if (syncBtnRef.current) setIcon(syncBtnRef.current, 'refresh-cw');
    }, []);
    
    const goToGallery = () => {
        plugin.activateView(VIEW_TYPES.GALLERY);
    };
    
    return (
        <div className="article-empty">
            <h3>请选择要阅读的文章</h3>
            <p>您可以从文章库中选择一篇文章，或随机阅读一篇</p>
            
            <div className="article-actions-empty">
                <button 
                    className="mod-cta"
                    ref={galleryBtnRef}
                    onClick={goToGallery}
                >
                    前往文章库
                </button>
                <button 
                    className="mod-primary"
                    ref={randomBtnRef}
                    onClick={handleRandomArticle}
                >
                    随机阅读
                </button>
            </div>
            
            <div className="sync-section">
                <p className="article-empty-tip">
                    提示：如果您刚开始使用，可能需要先同步RSS源获取文章
                </p>
                <button 
                    className="mod-warning"
                    ref={syncBtnRef}
                    onClick={handleSync}
                >
                    同步RSS源
                </button>
            </div>
        </div>
    );
};

export default EmptyState;
