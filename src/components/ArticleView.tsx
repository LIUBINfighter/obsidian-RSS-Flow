import React, { useRef, useEffect } from 'react';
import { RSSItem, ContentBlock, Article } from '../types';
import TableOfContents from './TableOfContents';
import { ContentBlockView } from './ContentBlock';
import { setIcon } from 'obsidian';

// 统一接口，支持RSSItem和Article两种类型
interface ArticleViewProps {
    article: RSSItem | Article;
    contentBlocks: ContentBlock[];
    tableOfContents: any[];
    showToc: boolean;
    toggleToc: () => void;
    scrollToHeading: (headingId: number) => void;
    fontSize?: number;
    simpleView?: boolean; // 标记是否使用简化视图（来自components子文件夹的版本）
}

export const ArticleView: React.FC<ArticleViewProps> = ({
    article,
    contentBlocks,
    tableOfContents,
    showToc,
    toggleToc,
    scrollToHeading,
    fontSize,
    simpleView = false
}) => {
    // 创建ref用于设置图标
    const originalLinkBtnRef = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        if (originalLinkBtnRef.current) setIcon(originalLinkBtnRef.current, 'external-link');
    }, []);
    
    // 简化视图模式（原components子文件夹下的ArticleView功能）
    if (simpleView) {
        return (
            <div className="article-container">
                <div className="article-view">
                    <h1 className="article-title">{article.title}</h1>
                    <div className="article-meta">
                        {article.author && <span className="article-author">{article.author}</span>}
                        <span className="article-date">{new Date(article.publishDate).toLocaleString()}</span>
                        <span className="article-source">{article.feedName}</span>
                    </div>
                    
                    {showToc && tableOfContents.length > 0 && (
                        <div className="article-toc">
                            <TableOfContents items={tableOfContents} onItemClick={scrollToHeading} />
                        </div>
                    )}
                    
                    <div className="article-content">
                        {contentBlocks.map((block, index) => (
                            <div key={block.id || index} className={`block ${block.type}-block`}>
                                {block.type === 'heading' && (
                                    <h2 id={`heading-${block.id}`} className="heading-content">
                                        {block.content}
                                    </h2>
                                )}
                                {block.type === 'paragraph' && (
                                    <p className="paragraph-content" dangerouslySetInnerHTML={{ __html: block.content }} />
                                )}
                                {block.type === 'blockquote' && (
                                    <blockquote className="blockquote-content" dangerouslySetInnerHTML={{ __html: block.content }} />
                                )}
                                {block.type === 'code' && (
                                    <pre className="code-content">
                                        <code>{block.content}</code>
                                    </pre>
                                )}
                                {block.type === 'image' && (
                                    <div className="image-block">
                                        <img src={block.src} alt={block.alt || ''} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    
    // 默认视图模式（原components文件夹下的ArticleView功能）
    return (
        <div className="article-container" style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}>
            <div className="article-header">
                <h2 className="article-title">{article.title}</h2>
                <div className="article-meta">
                    {article.author && <span className="article-author">by {article.author}</span>}
                    <span className="article-date">{new Date(article.publishDate).toLocaleString()}</span>
                    <span className="article-source">来源: {article.feedName}</span>
                </div>
            </div>
            {tableOfContents.length > 0 && (
                <div className="article-toc">
                    <h3 className="toc-title">目录</h3>
                    <TableOfContents items={tableOfContents} onItemClick={scrollToHeading} />
                </div>
            )}
            {'imageUrl' in article && article.imageUrl && <div className="article-image"><img src={article.imageUrl} alt={article.title} /></div>}
            <div className="article-content text-blocks-container">
                {contentBlocks.map((block) => (
                    <ContentBlockView key={`${article.id}-block-${block.id}`} block={block} articleId={article.id} articleTitle={article.title} />
                ))}
            </div>
            {'tags' in article && article.tags && article.tags.length > 0 && (
                <div className="article-tags">
                    {article.tags.map(tag => <span key={tag} className="article-tag">#{tag}</span>)}
                </div>
            )}
        </div>
    );
};
