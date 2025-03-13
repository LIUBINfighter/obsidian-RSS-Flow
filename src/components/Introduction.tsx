import React, { useState, useRef, useEffect } from 'react';
import { RSSSource } from '../types';
import { setIcon } from 'obsidian';

// 将i18n相关内容简化，避免类型递归问题
const t = (key: string): string => {
    const translations: Record<string, string> = {
        'add_source': '添加订阅源',
        'edit_source': '编辑订阅源',
        'delete_source': '删除订阅源',
        // 添加其他翻译键值对...
    };
    return translations[key] || key;
};

interface IntroductionProps {
    sources: RSSSource[];
    onAddSource: () => void;
    onEditSource: (source: RSSSource) => void;
    onDeleteSource: (source: RSSSource) => void;
}

export const Introduction: React.FC<IntroductionProps> = ({ 
    sources, 
    onAddSource,
    onEditSource, 
    onDeleteSource 
}) => {
    const [selectedSource, setSelectedSource] = useState<RSSSource | null>(null);
    
    // 使用refs来处理图标
    const editButtonRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
    const deleteButtonRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
    
    // 在组件挂载和更新时设置图标
    useEffect(() => {
        // 设置所有编辑和删除按钮的图标
        Object.keys(editButtonRefs.current).forEach(key => {
            const button = editButtonRefs.current[key];
            if (button) setIcon(button, 'pencil');
        });
        
        Object.keys(deleteButtonRefs.current).forEach(key => {
            const button = deleteButtonRefs.current[key];
            if (button) setIcon(button, 'trash');
        });
    }, [sources]); // 当sources改变时重新设置图标
    
    return (
        <div className="introduction">
            <h2>RSS Flow 订阅管理</h2>
            
            <p className="introduction-text">
                管理您的RSS订阅源。添加新的订阅，或编辑、删除现有的订阅。
            </p>
            
            <div className="source-list">
                <h3>订阅源列表</h3>
                {sources.length === 0 ? (
                    <p className="no-sources">暂无订阅源，请添加</p>
                ) : (
                    <div className="sources">
                        {sources.map((source, index) => (
                            <div key={source.url} className="source-item">
                                <div className="source-info">
                                    <h4>{source.name}</h4>
                                    <p className="source-url">{source.url}</p>
                                    {source.folder && (
                                        <span className="source-folder">{source.folder}</span>
                                    )}
                                </div>
                                <div className="source-actions">
                                    <button
                                        className="source-action edit-btn"
                                        onClick={() => onEditSource(source)}
                                        title={t('edit_source')}
                                        ref={el => {
                                            editButtonRefs.current[`edit-${index}`] = el;
                                            if (el) setIcon(el, 'pencil');
                                        }}
                                    ></button>
                                    <button
                                        className="source-action delete-btn"
                                        onClick={() => onDeleteSource(source)}
                                        title={t('delete_source')}
                                        ref={el => {
                                            deleteButtonRefs.current[`delete-${index}`] = el;
                                            if (el) setIcon(el, 'trash');
                                        }}
                                    ></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <button 
                    className="add-source-btn"
                    onClick={onAddSource}
                >
                    {t('add_source')}
                </button>
            </div>
        </div>
    );
};
