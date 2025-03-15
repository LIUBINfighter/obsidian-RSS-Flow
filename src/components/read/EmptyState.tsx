import React, { useRef, useEffect } from 'react';
import { VIEW_TYPES } from '../../types';
import RSSFlowPlugin from '../../main';
import { setIcon } from 'obsidian';
import { useTranslation } from 'react-i18next';

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
    
    const { t } = useTranslation();

    return (
        <div className="article-empty">
            <h3>{t('read.empty.title')}</h3>
            <p>{t('read.empty.description')}</p>
            
            <div className="article-actions-empty">
                <button 
                    className="mod-cta"
                    ref={galleryBtnRef}
                    onClick={goToGallery}
                >
                    {t('read.empty.goToGallery')}
                </button>
                <button 
                    className="mod-primary"
                    ref={randomBtnRef}
                    onClick={handleRandomArticle}
                >
                    {t('read.empty.randomRead')}
                </button>
            </div>
            
            <div className="sync-section">
                <p className="article-empty-tip">
                    {t('read.empty.syncTip')}
                </p>
                <button 
                    className="mod-warning"
                    ref={syncBtnRef}
                    onClick={handleSync}
                >
                    {t('read.empty.syncNow')}
                </button>
            </div>
        </div>
    );
};

export default EmptyState;
