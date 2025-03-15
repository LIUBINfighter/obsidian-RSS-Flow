import React, { useState, useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';

interface TextBlockProps {
    text: string;
    blockId: number;
    onFavorite: (text: string, blockId: number) => void;
}

export const TextBlockView: React.FC<TextBlockProps> = ({ text, blockId, onFavorite }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const favoriteButtonRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        if (favoriteButtonRef.current) {
            setIcon(favoriteButtonRef.current, isFavorited ? 'star-fill' : 'star');
        }
    }, [isFavorited, isHovered]);
    
    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation(); // 防止事件冒泡
        setIsFavorited(!isFavorited);
        onFavorite(text, blockId);
    };
    
    // 如果文本块为空，返回空段落以保持间隔，但不显示控件
    if (!text.trim()) {
        return <p className="text-block empty-block">&nbsp;</p>;
    }
    
    return (
        <div 
            className={`text-block block ${isHovered ? 'hovered' : ''} ${isFavorited ? 'favorited' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="text-block-content">
                {text}
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
};
