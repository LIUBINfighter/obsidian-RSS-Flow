import React, { useState, useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';
import { ContentBlock, ContentBlockType } from '../../types';

interface MediaBlockProps {
    block: ContentBlock;
    onFavorite: (content: string, blockId: number) => void;
}

export const MediaBlockView: React.FC<MediaBlockProps> = ({ block, onFavorite }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const favoriteButtonRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        if (favoriteButtonRef.current) {
            setIcon(favoriteButtonRef.current, isFavorited ? 'star-fill' : 'star');
        }
    }, [isFavorited, isHovered]);
    
    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFavorited(!isFavorited);
        // 对于媒体，我们保存URL或者描述性信息
        const contentToSave = block.sourceUrl || block.content;
        onFavorite(contentToSave, block.id);
    };
    
    // 处理图片加载完成事件
    const handleImageLoaded = () => {
        setImageLoaded(true);
    };
    
    // 处理图片加载错误
    const handleImageError = () => {
        setImageError(true);
    };
    
    // 优先渲染图片类型的媒体
    if (block.type === ContentBlockType.IMAGE) {
        return (
            <div 
                className={`media-block block ${isHovered ? 'hovered' : ''} ${isFavorited ? 'favorited' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="media-block-content media-type-IMAGE">
                    <img 
                        src={block.sourceUrl || ''} 
                        alt="Media content" 
                        onLoad={handleImageLoaded}
                        onError={handleImageError}
                        style={{ 
                            display: imageError ? 'none' : 'block',
                            maxWidth: '100%',
                            height: 'auto'
                        }}
                    />
                    {imageError && (
                        <div className="media-error">
                            <p>图片加载失败: {block.sourceUrl}</p>
                        </div>
                    )}
                </div>
                
                {isHovered && (
                    <div className="block-actions">
                        <button 
                            className="block-action favorite-btn"
                            onClick={handleFavorite}
                            ref={favoriteButtonRef}
                            title={isFavorited ? "取消收藏" : "添加到收藏"}
                            aria-label={isFavorited ? "取消收藏" : "添加到收藏"}
                        />
                    </div>
                )}
            </div>
        );
    }
    
    // 其他媒体类型使用HTML渲染
    return (
        <div 
            className={`media-block block ${isHovered ? 'hovered' : ''} ${isFavorited ? 'favorited' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className={`media-block-content media-type-${block.type}`}
                dangerouslySetInnerHTML={{ __html: block.content }}
            />
            
            {isHovered && (
                <div className="block-actions">
                    <button 
                        className="block-action favorite-btn"
                        onClick={handleFavorite}
                        ref={favoriteButtonRef}
                        title={isFavorited ? "取消收藏" : "添加到收藏"}
                        aria-label={isFavorited ? "取消收藏" : "添加到收藏"}
                    />
                </div>
            )}
        </div>
    );
};
