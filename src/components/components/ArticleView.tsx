import React from 'react';
import { Article, ContentBlock } from '../../types';
import { TableOfContents } from '../TableOfContents';

interface ArticleViewProps {
    article: Article;
    contentBlocks: ContentBlock[];
    tableOfContents: any[];
    showToc: boolean;
    toggleToc: () => void;
    scrollToHeading: (id: number) => void;
    fontSize: number;
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
                    {/* 渲染文章内容块 */}
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
};
