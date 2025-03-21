import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation, UseTranslationResponse } from 'react-i18next';
import { Namespace } from 'i18next';
import { setIcon } from 'obsidian';

interface FavoritedBlock {
    id: number;
    text: string;
    source: string;
    articleId: string;
    timestamp: number;
}

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    favoritedBlocks?: FavoritedBlock[];
    onExportMarkdown?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    isOpen, 
    onToggle, 
    favoritedBlocks = [], 
    onExportMarkdown 
}) => {
    const { t } = useTranslation<Namespace>('translation');
    const [width, setWidth] = useState(250);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('tab1');
    const dragHandleRef = useRef<HTMLDivElement>(null);
    const toggleButtonRef = React.useRef<HTMLButtonElement>(null);

    // 定义标签页配置
    const tabs = [
        { id: 'tab1', iconId: 'document', label: '笔记' },
        { id: 'tab2', iconId: 'search', label: '搜索' },
        { id: 'tab3', iconId: 'gear', label: '设置' },
    ];

    const handleDragStart = useCallback((e: React.MouseEvent) => {
        setIsDragging(true);
        e.preventDefault();
    }, []);

    const handleDrag = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const newWidth = window.innerWidth - e.clientX;
            setWidth(Math.max(200, Math.min(600, newWidth)));
        }
    }, [isDragging]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleTabChange = useCallback(() => {
        setActiveTab(prev => prev === 'tab1' ? 'tab2' : 'tab1');
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', handleDragEnd);
        }
        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging, handleDrag, handleDragEnd]);

    React.useEffect(() => {
        if (toggleButtonRef.current) {
            setIcon(toggleButtonRef.current, isOpen ? 'chevron-right' : 'chevron-left');
        }
    }, [isOpen]);

    return (
        <div 
            className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}
            style={{ width: isOpen ? `${width}px` : undefined }}
        >
            <button 
                className="sidebar-toggle"
                onClick={onToggle}
                aria-label={isOpen ? '收起边栏' : '展开边栏'}
                ref={toggleButtonRef}
            >
                {isOpen ? '→' : '←'}
            </button>
            
            <div className="sidebar-tabs">
                {tabs.map(tab => {
                    const iconContainer = React.useRef<HTMLSpanElement>(null);
                    
                    React.useEffect(() => {
                        if (iconContainer.current) {
                            setIcon(iconContainer.current, tab.iconId);
                        }
                    }, [tab.iconId]);

                    return (
                        <button
                            key={tab.id}
                            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            title={tab.label}
                        >
                            <span ref={iconContainer} className="sidebar-tab-icon" />
                        </button>
                    );
                })}
            </div>
            <div 
                ref={dragHandleRef}
                className="sidebar-drag-handle"
                onMouseDown={handleDragStart}
            />
            
            <div className="sidebar-content">
                {activeTab === 'tab1' && (
                    <>
                        <h3>{t('sidebar.title')}</h3>
                        <p>{t('sidebar.content')}</p>
                    </>
                )}
                {activeTab === 'tab2' && (
                    <>
                        <h3>{t('sidebar.tab2.title')}</h3>
                        <p>{t('sidebar.tab2.content')}</p>
                    </>
                )}
                {activeTab === 'tab3' && (
                    <>
                        <h3>{t('sidebar.tab3.title')}</h3>
                        <p>{t('sidebar.tab3.content')}</p>
                    </>
                )}
            </div>

            {isOpen && (
                <div className="sidebar-content">
                    <h3>收藏内容</h3>
                    
                    {favoritedBlocks.length === 0 ? (
                        <p className="no-favorites">暂无收藏内容</p>
                    ) : (
                        <>
                            <div className="favorited-blocks">
                                {favoritedBlocks.map((block, index) => (
                                    <div key={`${block.articleId}-${block.id}-${index}`} className="favorited-block">
                                        <div className="favorited-block-text">{block.text}</div>
                                        <div className="favorited-block-source">来源: {block.source}</div>
                                    </div>
                                ))}
                            </div>
                            
                            {onExportMarkdown && (
                                <button 
                                    className="export-markdown-btn"
                                    onClick={onExportMarkdown}
                                >
                                    导出为Markdown
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
