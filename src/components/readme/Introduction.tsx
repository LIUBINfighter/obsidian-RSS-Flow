import React from 'react';
import { App } from 'obsidian';
import { FeedManager } from './FeedManager';
import { RSSSource } from '../../types';

interface IntroductionProps {
    app: App;
    sources: RSSSource[];
    onAddSource?: () => void;
    onEditSource?: (source: RSSSource) => void;
    onDeleteSource?: (source: RSSSource) => void;
    onImport?: () => void;
    onExport?: () => void;
    onSaveOrder?: (sources: RSSSource[]) => void;
    onSaveSources: (sources: RSSSource[]) => void;
}

export const Introduction: React.FC<IntroductionProps> = ({ 
    app, 
    sources,
    onAddSource,
    onEditSource,
    onDeleteSource,
    onImport,
    onExport,
    onSaveOrder,
    onSaveSources
}) => {
    // 如果提供了外部导入/导出回调，则使用它们
    const handleImport = () => {
        if (onImport) {
            onImport();
        }
    };

    const handleExport = () => {
        if (onExport) {
            onExport();
        }
    };

    // 处理源的更新
    const handleSourcesUpdate = (updatedSources: RSSSource[]) => {
        if (onSaveOrder) {
            onSaveOrder(updatedSources);
        } else {
            onSaveSources(updatedSources);
        }
    };

    return (
        <div className="rss-flow-container">
            <FeedManager 
                app={app} 
                feeds={sources} 
                onSave={handleSourcesUpdate} 
            />
        </div>
    );
};
