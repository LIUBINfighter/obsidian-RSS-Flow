import React, { useState, useCallback } from 'react';
import { setIcon, App, Notice } from 'obsidian';
import { useTranslation } from 'react-i18next';
import { SourceForm } from './SourceForm';
import { RSSSource } from '../../types';

interface FeedManagerProps {
    app: App;
    feeds: RSSSource[];
    onSave: (updatedFeeds: RSSSource[]) => void;
}

export const FeedManager: React.FC<FeedManagerProps> = ({ app, feeds, onSave }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const [editingSource, setEditingSource] = useState<RSSSource | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleAddSource = useCallback(() => {
        setEditingSource(null);
        setShowSourceForm(true);
    }, []);

    const handleEditSource = useCallback((source: RSSSource) => {
        setEditingSource(source);
        setShowSourceForm(true);
    }, []);

    const handleSourceSubmit = useCallback((data: RSSSource) => {
        const updatedFeeds = editingSource
            ? feeds.map(feed => feed.url === editingSource.url ? data : feed)
            : [...feeds, data];
        onSave(updatedFeeds);
        setShowSourceForm(false);
        setEditingSource(null);
    }, [feeds, editingSource, onSave]);

    const handleDeleteSource = useCallback((sourceUrl: string) => {
        if (deleteConfirm === sourceUrl) {
            const updatedFeeds = feeds.filter(feed => feed.url !== sourceUrl);
            onSave(updatedFeeds);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(sourceUrl);
        }
    }, [deleteConfirm, feeds, onSave]);

    const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
        setDraggedIndex(index);
        e.currentTarget.classList.add('dragging');
    }, []);

    const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('dragging');
        setDraggedIndex(null);
        setDropTargetIndex(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        setDropTargetIndex(index);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDropTargetIndex(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (sourceIndex !== targetIndex) {
            const updatedFeeds = [...feeds];
            const [movedItem] = updatedFeeds.splice(sourceIndex, 1);
            updatedFeeds.splice(targetIndex, 0, movedItem);
            onSave(updatedFeeds);
        }
        setDraggedIndex(null);
        setDropTargetIndex(null);
    }, [feeds, onSave]);

    return (
        <div className="rss-feed-manager">
            <div className="rss-sources-header">
                <h2>{t('rss.sources.title', '订阅源')}</h2>
            </div>
            
            <button className="add-source-btn" ref={(el) => { if (el) setIcon(el, 'plus'); }} onClick={handleAddSource}>
                {t('rss.sources.add', '添加新订阅源')}
            </button>

            {showSourceForm && !editingSource && (
                <SourceForm
                    initialData={editingSource || undefined}
                    onSubmit={handleSourceSubmit}
                    onCancel={() => {
                        setShowSourceForm(false);
                        setEditingSource(null);
                    }}
                />
            )}
            
            <div className="rss-source-list">
                {feeds.map((feed, index) => (
                    <div
                        key={feed.url}
                        className={`rss-source-item ${draggedIndex === index ? 'dragging' : ''} ${dropTargetIndex === index ? 'drop-target' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        <div className="rss-source-info">
                            <div className="rss-source-title">
                                <span className="rss-source-name">{feed.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                <span className="rss-source-folder">#{feed.folder}</span>
                            </div>
                            <div className="rss-source-url">{feed.url}</div>
                        </div>
                        {editingSource && editingSource.url === feed.url && (
                            <SourceForm
                                initialData={editingSource}
                                onSubmit={handleSourceSubmit}
                                onCancel={() => setEditingSource(null)}
                            />
                        )}
                        <div className="rss-source-actions">
                            <button 
                                className="rss-action-btn" 
                                aria-label="编辑" 
                                ref={el => el && setIcon(el, 'pencil')}
                                onClick={() => handleEditSource({ name: feed.name, url: feed.url, folder: feed.folder })}
                            ></button>
                            <button 
                                className={`rss-action-btn delete-btn ${deleteConfirm === feed.url ? 'confirm-delete' : ''}`}
                                aria-label="删除" 
                                ref={el => el && setIcon(el, 'trash')}
                                onClick={() => handleDeleteSource(feed.url)}
                            ></button>
                        </div>
                        {showSourceForm && editingSource?.url === feed.url && (
                            <SourceForm
                                initialData={editingSource}
                                onSubmit={handleSourceSubmit}
                                onCancel={() => {
                                    setShowSourceForm(false);
                                    setEditingSource(null);
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
