import { useEffect, useCallback, useState } from 'react';
import RSSFlowPlugin from '../main';
import { RSSItem } from '../types';

export const useReadingProgress = (plugin: RSSFlowPlugin, article: RSSItem | null) => {
    const [readingProgress, setReadingProgress] = useState(0);
    
    const saveReadingProgress = useCallback(async () => {
        if (article) {
            try {
                const data = await plugin.loadData() || {};
                data.readingProgress = data.readingProgress || {};
                data.readingProgress[article.id] = window.scrollY;
                setReadingProgress(window.scrollY);
                await plugin.saveData(data);
            } catch (error) {
                console.warn('保存阅读进度失败:', error);
            }
        }
    }, [article, plugin]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setReadingProgress(window.scrollY);
                saveReadingProgress();
            }, 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [saveReadingProgress]);

    // 加载文章时恢复阅读进度
    useEffect(() => {
        const restoreProgress = async () => {
            if (article) {
                try {
                    const data = await plugin.loadData() || {};
                    if (data.readingProgress && data.readingProgress[article.id]) {
                        setTimeout(() => {
                            window.scrollTo(0, data.readingProgress[article.id]);
                            setReadingProgress(data.readingProgress[article.id]);
                        }, 100);
                    }
                } catch (error) {
                    console.warn('恢复阅读进度失败:', error);
                }
            }
        };
        
        restoreProgress();
    }, [article, plugin]);

    return { readingProgress, saveReadingProgress };
};
