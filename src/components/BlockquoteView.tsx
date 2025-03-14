import React, { useState, useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';
import { ContentBlock } from '../types';

interface BlockquoteProps {
    block: ContentBlock;
    onFavorite: (content: string, blockId: number) => void;
}

export const BlockquoteView: React.FC<BlockquoteProps> = ({ block, onFavorite }) => {
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
        onFavorite(block.content, block.id);
    };
    
    return (
        <div 
            className={`blockquote-block block ${isHovered ? 'hovered' : ''} ${isFavorited ? 'favorited' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <blockquote 
                className="blockquote-content"
                dangerouslySetInnerHTML={{ __html: block.content }}
            />
            
            {isHovered && (
                <div className="block-actions">
                    <button 
                        className="block-action favorite-btn"
                        onClick={handleFavorite}
                        ref={favoriteButtonRef}
                        title={isFavorited ? "取消收藏" : "添加到收藏"}
                    />
                </div>
            )}
        </div>
    );
};
