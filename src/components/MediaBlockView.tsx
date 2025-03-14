import React, { useState, useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';
import { ContentBlock, ContentBlockType } from '../types';

interface MediaBlockProps {
    block: ContentBlock;
    onFavorite: (content: string, blockId: number) => void;
}

export const MediaBlockView: React.FC<MediaBlockProps> = ({ block, onFavorite }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const favoriteButtonRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        if (favoriteButtonRef.current) {
            setIcon(favoriteButtonRef.current, isFavorited ? 'star-fill' : 'star');
        }
    }, [isFavorited, isHovered]);
    
    const handleFavorite = () => {
        setIsFavorited(!isFavorited);
        // 对于媒体，我们保存URL或者描述性信息
        const contentToSave = block.sourceUrl || block.content;
        onFavorite(contentToSave, block.id);
    };
    
    return (
        <div 
            className={`media-block ${isHovered ? 'hovered' : ''} ${isFavorited ? 'favorited' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className={`media-block-content media-type-${block.type}`}
                dangerouslySetInnerHTML={{ __html: block.content }}
            />
            
            {isHovered && (
                <div className="media-block-actions">
                    <button 
                        className="media-block-action favorite-btn"
                        onClick={handleFavorite}
                        ref={favoriteButtonRef}
                        title={isFavorited ? "取消收藏" : "添加到收藏"}
                    />
                </div>
            )}
        </div>
    );
};
