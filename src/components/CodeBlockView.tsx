import React, { useState, useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';
import { ContentBlock } from '../types';

interface CodeBlockProps {
    block: ContentBlock;
    onFavorite: (content: string, blockId: number) => void;
}

export const CodeBlockView: React.FC<CodeBlockProps> = ({ block, onFavorite }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const favoriteButtonRef = useRef<HTMLButtonElement>(null);
    const copyButtonRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        if (favoriteButtonRef.current) {
            setIcon(favoriteButtonRef.current, isFavorited ? 'star-fill' : 'star');
        }
        if (copyButtonRef.current) {
            setIcon(copyButtonRef.current, 'clipboard-copy');
        }
    }, [isFavorited, isHovered]);
    
    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation(); // 防止事件冒泡
        setIsFavorited(!isFavorited);
        onFavorite(block.content, block.id);
    };
    
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // 防止事件冒泡
        navigator.clipboard.writeText(block.content.replace(/<[^>]*>/g, ''));
        // 显示一个短暂的"已复制"提示
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
    
    return (
        <div 
            className={`code-block block ${isHovered ? 'hovered' : ''} ${isFavorited ? 'favorited' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="code-block-header">
                {block.language && <span className="code-language">{block.language}</span>}
            </div>
            <pre className="code-content">
                <code 
                    className={block.language ? `language-${block.language}` : ''}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                />
            </pre>
            
            {isHovered && (
                <div className="block-actions">
                    <button 
                        className="block-action copy-btn"
                        onClick={handleCopy}
                        ref={copyButtonRef}
                        title="复制代码"
                        aria-label="复制代码"
                    />
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
