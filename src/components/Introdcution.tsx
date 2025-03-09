import React from 'react';
import { useTranslation } from 'react-i18next';

export const Introdcution: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="rss-flow-container">
            <div className="rss-sources-section">
                <div className="rss-sources-header">
                    <h2>{t('rss.sources.title', '订阅源')}</h2>
                    <div className="rss-sources-actions">
                        <button className="rss-action-btn" aria-label="导入">
                            <svg viewBox="0 0 100 100" className="rss-action-icon">
                                <path fill="currentColor" d="M37.5,75L25,75L25,25L75,25L75,50" />
                                <path fill="currentColor" d="M55,65L75,65L65,75L75,65L65,55" />
                            </svg>
                        </button>
                        <button className="rss-action-btn" aria-label="导出">
                            <svg viewBox="0 0 100 100" className="rss-action-icon">
                                <path fill="currentColor" d="M25,75L75,75L75,25L62.5,25" />
                                <path fill="currentColor" d="M45,35L25,35L35,25L25,35L35,45" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="rss-source-list">
                    {/* RSS源列表项示例 */}
                    <div className="rss-source-item">
                        <div className="rss-source-info">
                            <div className="rss-source-title">AI - Google News</div>
                            <div className="rss-source-url">https://blog.google/technology/ai/rss/</div>
                        </div>
                        <div className="rss-source-actions">
                            <button className="rss-action-btn" aria-label="编辑">
                                <svg viewBox="0 0 100 100" className="rss-action-icon">
                                    <path fill="currentColor" d="M70,20L80,30L40,70L20,80L30,60L70,20" />
                                </svg>
                            </button>
                            <button className="rss-action-btn" aria-label="删除">
                                <svg viewBox="0 0 100 100" className="rss-action-icon">
                                    <path fill="currentColor" d="M30,30L70,70M70,30L30,70" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <button className="add-source-btn">
                    <svg viewBox="0 0 100 100" className="add-source-icon">
                        <path fill="currentColor" d="M20,50L80,50M50,20L50,80" />
                    </svg>
                    {t('rss.sources.add', '添加新订阅源')}
                </button>
            </div>
        </div>
    );
};
