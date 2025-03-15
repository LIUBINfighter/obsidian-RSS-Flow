import { useState, useCallback, useEffect } from 'react';
import { ContentBlock, ContentBlockType } from '../types';
import { generateTableOfContents } from '../utils/content-processor';

// 简化的目录hook，直接基于React状态管理
export const useTableOfContents = (contentBlocks: ContentBlock[]) => {
    const [tableOfContents, setTableOfContents] = useState<{id: number, level: number, title: string}[]>([]);
    const [showToc, setShowToc] = useState(false);
    
    // 当内容块变化时生成目录
    useEffect(() => {
        if (contentBlocks.length > 0) {
            const toc = generateTableOfContents(contentBlocks);
            setTableOfContents(toc);
        } else {
            setTableOfContents([]);
        }
    }, [contentBlocks]);
    
    // 切换目录显示/隐藏
    const toggleToc = useCallback(() => {
        setShowToc(prev => !prev);
    }, []);
    
    // 滚动到指定标题
    const scrollToHeading = useCallback((headingId: number) => {
        const headingElement = document.getElementById(`heading-${headingId}`);
        if (headingElement) {
            headingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);
    
    return {
        tableOfContents,
        showToc,
        toggleToc,
        scrollToHeading
    };
};
