import { useEffect, useState } from 'react';
import RSSFlowPlugin from '../main';
import { RSSItem } from '../types';

export const useReadingProgress = (plugin: RSSFlowPlugin, article: RSSItem | null) => {
    const [readingProgress, setReadingProgress] = useState(0);
    
    // 处理滚动事件和保存进度
    useEffect(() => {
        if (!article) return;
        
        // 节流函数：限制滚动事件的触发频率
        let timeout: NodeJS.Timeout;
        
        // 滚动事件处理
        const handleScroll = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const progress = window.scrollY;
                setReadingProgress(progress);
                
                // 保存阅读进度
                plugin.loadData().then(data => {
                    const updatedData = data || {};
                    updatedData.readingProgress = updatedData.readingProgress || {};
                    updatedData.readingProgress[article.id] = progress;
                    plugin.saveData(updatedData);
                }).catch(error => {
                    console.warn('保存阅读进度失败:', error);
                });
            }, 500);
        };
        
        // 添加滚动事件监听
        window.addEventListener('scroll', handleScroll);
        
        // 恢复上次阅读位置
        plugin.loadData().then(data => {
            if (data?.readingProgress?.[article.id]) {
                setTimeout(() => {
                    window.scrollTo(0, data.readingProgress[article.id]);
                    setReadingProgress(data.readingProgress[article.id]);
                }, 100);
            }
        }).catch(error => {
            console.warn('恢复阅读进度失败:', error);
        });
        
        // 清理函数
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeout);
        };
    }, [article, plugin]);

    return { readingProgress };
};
