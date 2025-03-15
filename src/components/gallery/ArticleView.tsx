import { setIcon } from 'obsidian';
import React, { useEffect, useRef } from 'react';
import { ContentBlockView } from '../read/ContentBlock';
import { Article, ContentBlock, RSSItem } from '../../types';

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
                <div className="article-view">
                    <h1 className="article-title">{article.title}</h1>
                    <div className="article-meta">
                        {article.author && <span className="article-author">{article.author}</span>}
                        <span className="article-date">{new Date(article.publishDate).toLocaleString()}</span>
                        <span className="article-source">{article.feedName}</span>
                    </div>
                    
                    <div className="article-content">
                        {contentBlocks.map((block, index) => (
                            <div key={block.id || index} className={`block ${block.type}-block`}>
                                {block.type === 'heading' && (
                                    <h2 className="heading-content">
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
        );
    }
    
    // 默认视图模式（原components文件夹下的ArticleView功能）
    return (
        <>
            <div className="article-header" style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}>
                <h2 className="article-title">{article.title}</h2>
                <div className="article-meta">
                    {article.author && <span className="article-author">by {article.author}</span>}
                    <span className="article-date">{new Date(article.publishDate).toLocaleString()}</span>
                    <span className="article-source">来源: {article.feedName}</span>
                </div>
            </div>
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
        </>
    );
};
