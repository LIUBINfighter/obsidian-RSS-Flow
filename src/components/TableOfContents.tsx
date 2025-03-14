import React, { useState, useEffect, useRef } from 'react';
import { setIcon } from 'obsidian';

interface TocItem {
    id: number;
    level: number;
    title: string;
}

interface TableOfContentsProps {
    items: TocItem[];
    onItemClick: (id: number) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items, onItemClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeItemId, setActiveItemId] = useState<number | null>(null);
    const toggleButtonRef = useRef<HTMLButtonElement>(null);
    
    useEffect(() => {
        if (toggleButtonRef.current) {
            setIcon(toggleButtonRef.current, isOpen ? 'chevron-down' : 'chevron-right');
        }
    }, [isOpen]);
    
    // 监听滚动，高亮当前可见的标题
    useEffect(() => {
        const handleScroll = () => {
            if (!items.length) return;
            
            // 找到当前可见的标题
            for (let i = items.length - 1; i >= 0; i--) {
                const element = document.getElementById(`heading-${items[i].id}`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100) { // 当标题到达页面顶部时
                        setActiveItemId(items[i].id);
                        break;
                    }
                }
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // 初始检查
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [items]);

    if (!items.length) {
        return null;
    }

    return (
        <>
            <button 
                className="clickable-icon toc-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? "隐藏目录" : "显示目录"}
                ref={toggleButtonRef}
            />
            
            {isOpen && (
                <ul className="toc-list">
                    {items.map(item => (
                        <li 
                            key={item.id} 
                            className={`toc-item level-${item.level} ${activeItemId === item.id ? 'active' : ''}`}
                            style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
                        >
                            <a 
                                href={`#heading-${item.id}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onItemClick(item.id);
                                }}
                            >
                                {item.title}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default TableOfContents;
