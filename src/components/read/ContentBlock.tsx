import React, { useState, useRef, useEffect, memo } from 'react';
import { setIcon } from 'obsidian';
import { ContentBlock, ContentBlockType } from '../../types';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}
import { useFavorites } from './favorite-context';

interface ContentBlockProps {
    block: ContentBlock;
    articleId: string;
    articleTitle: string;
}

// 使用React.memo优化渲染性能
export const ContentBlockView = memo(({ block, articleId, articleTitle }: ContentBlockProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const { isFavorited, addFavorite, removeFavorite } = useFavorites();
    const favorited = isFavorited(articleId, block.id);
    const favoriteButtonRef = useRef<HTMLButtonElement>(null);
    const copyButtonRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        if (favoriteButtonRef.current) {
            setIcon(favoriteButtonRef.current, favorited ? 'star-fill' : 'star');
        }
        
        if (copyButtonRef.current && (block.type === ContentBlockType.CODE)) {
            setIcon(copyButtonRef.current, 'clipboard-copy');
        }
    }, [favorited, block.type, isHovered]);
    
    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (favorited) {
            removeFavorite(articleId, block.id);
        } else {
            addFavorite({
                id: block.id,
                text: block.content,
                source: articleTitle,
                articleId: articleId
            });
        }
    };
    
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(block.content.replace(/<[^>]*>/g, ''));

        // 显示复制成功提示
        if (copyButtonRef.current) {
            const originalTitle = copyButtonRef.current.getAttribute('title');
            copyButtonRef.current.setAttribute('title', '已复制!');
            setTimeout(() => {
                if (copyButtonRef.current) {
                    copyButtonRef.current.setAttribute('title', originalTitle || '复制代码');
                }
            }, 1500);
        }
    };

    // 渲染文本块
    const renderTextBlock = () => (
        <div className="text-block-content">{block.content}</div>
    );

    // 渲染段落块
    const renderParagraphBlock = () => (
        <p 
            className="paragraph-content"
            dangerouslySetInnerHTML={{ __html: block.content }}
        />
    );

    // 渲染标题块
    const renderHeadingBlock = () => {
        const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
        return (
            <HeadingTag 
                className={`heading-content heading-${block.level}`}
                id={`heading-${block.id}`} // 为目录导航添加id
                dangerouslySetInnerHTML={{ __html: block.content }}
            />
        );
    };

    // 渲染代码块
    const renderCodeBlock = () => (
        <>
            <div className="code-block-header">
                {block.language && <span className="code-language">{block.language}</span>}
            </div>
            <pre className="code-content">
                <code 
                    className={block.language ? `language-${block.language}` : ''}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                />
            </pre>
        </>
    );

    // 渲染引用块
    const renderBlockquote = () => (
        <blockquote 
            className="blockquote-content"
            dangerouslySetInnerHTML={{ __html: block.content }}
        />
    );

    // 渲染图片块
    const renderImageBlock = () => (
        <div 
            className="media-block-content media-type-IMAGE"
            dangerouslySetInnerHTML={{ __html: block.content }}
        />
    );

    // 渲染其他HTML块
    const renderHtmlBlock = () => (
        <div 
            className="html-content"
            dangerouslySetInnerHTML={{ __html: block.content }}
        />
    );

    // 根据块类型渲染不同内容
    const renderContent = () => {
        switch (block.type) {
            case ContentBlockType.TEXT:
                return renderTextBlock();
            case ContentBlockType.PARAGRAPH:
                return renderParagraphBlock();
            case ContentBlockType.HEADING:
                return renderHeadingBlock();
            case ContentBlockType.CODE:
                return renderCodeBlock();
            case ContentBlockType.BLOCKQUOTE:
                return renderBlockquote();
            case ContentBlockType.IMAGE:
                return renderImageBlock();
            case ContentBlockType.VIDEO:
            case ContentBlockType.EMBED:
            case ContentBlockType.LIST:
            case ContentBlockType.TABLE:
            case ContentBlockType.HTML:
                return renderHtmlBlock();
            default:
                return null;
        }
    };

    // 获取块的类名
    const getBlockClassName = () => {
        let className = `block ${isHovered ? 'hovered' : ''} ${favorited ? 'favorited' : ''}`;
        
        switch (block.type) {
            case ContentBlockType.TEXT:
                className += ' text-block';
                break;
            case ContentBlockType.PARAGRAPH:
                className += ' paragraph-block';
                break;
            case ContentBlockType.HEADING:
                className += ` heading-block level-${block.level}`;
                break;
            case ContentBlockType.CODE:
                className += ' code-block';
                break;
            case ContentBlockType.BLOCKQUOTE:
                className += ' blockquote-block';
                break;
            case ContentBlockType.IMAGE:
            case ContentBlockType.VIDEO:
            case ContentBlockType.EMBED:
                className += ' media-block';
                break;
            case ContentBlockType.LIST:
            case ContentBlockType.TABLE:
            case ContentBlockType.HTML:
                className += ' html-block';
                break;
        }
        
        return className;
    };

    // 如果是空文本块，返回空间隔
    if (block.type === ContentBlockType.TEXT && !block.content.trim()) {
        return <div className="empty-block">&nbsp;</div>;
    }

    return (
        <div 
            className={getBlockClassName()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-block-id={block.id}
            data-block-type={block.type}
        >
            {renderContent()}
            
            {isHovered && (
                <div className="block-actions">
                    {block.type === ContentBlockType.CODE && (
                        <button 
                            className="block-action copy-btn"
                            onClick={handleCopy}
                            ref={copyButtonRef}
                            title="复制代码"
                            aria-label="复制代码"
                        />
                    )}
                    <button 
                        className="block-action favorite-btn"
                        onClick={handleFavorite}
                        ref={favoriteButtonRef}
                        title={favorited ? "取消收藏" : "添加到收藏"}
                        aria-label={favorited ? "取消收藏" : "添加到收藏"}
                    />
                </div>
            )}
        </div>
    );
});

ContentBlockView.displayName = 'ContentBlockView';
