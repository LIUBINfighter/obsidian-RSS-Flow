import React, { useRef, useEffect } from 'react';
import { RSSItem, ContentBlock } from '../types';
import TableOfContents from './TableOfContents';
import { ContentBlockView } from './ContentBlock';
import { setIcon } from 'obsidian';

interface ArticleViewProps {
    article: RSSItem;
    contentBlocks: ContentBlock[];
    tableOfContents: any[];
    showToc: boolean;
    toggleToc: () => void;
    scrollToHeading: (headingId: number) => void;
    fontSize?: number; // 添加字体大小属性
}

export const ArticleView: React.FC<ArticleViewProps> = ({
    article,
    contentBlocks,
    tableOfContents,
    showToc,
    toggleToc,
    scrollToHeading,
    fontSize
}) => {
    // 创建ref用于设置图标
    const originalLinkBtnRef = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        if (originalLinkBtnRef.current) setIcon(originalLinkBtnRef.current, 'external-link');
    }, []);
    
    return (
        <div className="article-container" style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}>
            <div className="article-header">
                <h2 className="article-title">{article.title}</h2>
                <div className="article-meta">
                    {article.author && <span className="article-author">by {article.author}</span>}
                    <span className="article-date">{new Date(article.publishDate).toLocaleString()}</span>
                    <span className="article-source">来源: {article.feedName}</span>
                </div>
                <div className="article-actions">
                    <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="external-link mod-primary"
                    >
                        <span ref={originalLinkBtnRef}></span>
                        查看原文
                    </a>
                </div>
            </div>
            {tableOfContents.length > 0 && (
                <div className="article-toc">
                    <h3 className="toc-title">目录</h3>
                    <TableOfContents items={tableOfContents} onItemClick={scrollToHeading} />
                </div>
            )}
            {article.imageUrl && <div className="article-image"><img src={article.imageUrl} alt={article.title} /></div>}
            <div className="article-content text-blocks-container">
                {contentBlocks.map((block) => (
                    <ContentBlockView key={`${article.id}-block-${block.id}`} block={block} articleId={article.id} articleTitle={article.title} />
                ))}
            </div>
            {article.tags && article.tags.length > 0 && (
                <div className="article-tags">
                    {article.tags.map(tag => <span key={tag} className="article-tag">#{tag}</span>)}
                </div>
            )}
        </div>
    );
};
