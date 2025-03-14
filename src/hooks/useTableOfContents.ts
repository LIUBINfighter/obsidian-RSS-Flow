import { useState, useCallback, useMemo } from 'react';
import { ContentBlock } from '../types';
import { generateTableOfContents } from '../utils/content-processor';

export const useTableOfContents = (contentBlocks: ContentBlock[]) => {
    const [showToc, setShowToc] = useState(false);

    const tableOfContents = useMemo(() => {
        return generateTableOfContents(contentBlocks);
    }, [contentBlocks]);

    const toggleToc = useCallback(() => {
        setShowToc(prev => !prev);
    }, []);

    const scrollToHeading = useCallback((headingId: number) => {
        const element = document.getElementById(`heading-${headingId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    return { tableOfContents, showToc, toggleToc, scrollToHeading };
};
