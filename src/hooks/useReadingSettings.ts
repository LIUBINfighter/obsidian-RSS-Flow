import { useState, useCallback, useEffect } from 'react';
import RSSFlowPlugin from '../main';

export const useReadingSettings = (plugin: RSSFlowPlugin) => {
    const [fontSize, setFontSize] = useState(() => {
        // 从插件数据中读取字体大小，如果没有则使用默认值16
        const savedData = plugin.settings?.fontSize || 16;
        return savedData;
    });
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 初始加载时设置字体样式
    useEffect(() => {
        document.documentElement.style.setProperty('--article-font-size', `${fontSize}px`);
        // 应用到相关元素
        const articleContentElements = document.querySelectorAll('.article-content, .text-blocks-container');
        articleContentElements.forEach(el => {
            (el as HTMLElement).style.fontSize = `${fontSize}px`;
        });
    }, [fontSize]);

    const handleFontSizeChange = useCallback(async (change: number) => {
        const newSize = Math.max(12, Math.min(24, fontSize + change));
        setFontSize(newSize);
        
        // 设置CSS变量和全局样式
        document.documentElement.style.setProperty('--article-font-size', `${newSize}px`);
        
        // 保存设置到插件数据
        try {
            const data = await plugin.loadData() || {};
            data.fontSize = newSize;
            await plugin.saveData(data);
        } catch (error) {
            console.warn('保存字体大小设置失败:', error);
        }
    }, [fontSize, plugin]);

    // 简化后只暴露必要的状态和方法
    return { fontSize, isDarkMode, handleFontSizeChange };
};
