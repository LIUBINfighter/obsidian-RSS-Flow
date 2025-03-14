import React, { useState, useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';
import { ContentBlock } from '../types';

interface HtmlBlockProps {
    block: ContentBlock;
    onFavorite: (content: string, blockId: number) => void;
}

export const HtmlBlockView: React.FC<HtmlBlockProps> = ({ block, onFavorite }) => {
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
            className={`html-block block ${isHovered ? 'hovered' : ''} ${isFavorited ? 'favorited' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className="html-content"
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
