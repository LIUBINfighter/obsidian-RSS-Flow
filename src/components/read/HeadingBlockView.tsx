import React, { useState, useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';
import { ContentBlock } from '../../types';

interface HeadingBlockProps {
    block: ContentBlock;
    onFavorite: (content: string, blockId: number) => void;
}

// 声明动态标题标签类型
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingTagType = `h${HeadingLevel}`;

export const HeadingBlockView: React.FC<HeadingBlockProps> = ({ block, onFavorite }) => {
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
    
    // 动态渲染不同级别的标题
    const level = (block.level || 2) as HeadingLevel;
    const HeadingTag = `h${level}` as HeadingTagType;
    
    return (
        <div 
            className={`heading-block block level-${block.level} ${isHovered ? 'hovered' : ''} ${isFavorited ? 'favorited' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <HeadingTag 
                className={`heading-content heading-${block.level}`}
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
