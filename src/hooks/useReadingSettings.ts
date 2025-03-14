import { useState, useCallback, useEffect } from 'react';
import RSSFlowPlugin from '../main';

export const useReadingSettings = (plugin: RSSFlowPlugin) => {
    const [fontSize, setFontSize] = useState(16);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleFontSizeChange = useCallback(async (change: number) => {
        const newSize = Math.max(12, Math.min(24, fontSize + change));
        setFontSize(newSize);
        
        // 同时设置CSS变量和全局样式
        document.documentElement.style.setProperty('--article-font-size', `${newSize}px`);
        
        // 确保样式应用到正确的元素
        const articleContentElements = document.querySelectorAll('.article-content, .text-blocks-container');
        articleContentElements.forEach(el => {
            (el as HTMLElement).style.fontSize = `${newSize}px`;
        });
        
        try {
            const data = await plugin.loadData() || {};
            data.fontSize = newSize;
            await plugin.saveData(data);
        } catch (error) {
            console.warn('保存字体大小设置失败:', error);
        }
    }, [fontSize, plugin]);

    const handleThemeChange = useCallback((isDark: boolean) => {
        setIsDarkMode(isDark);
        document.documentElement.classList.toggle('theme-dark', isDark);
        document.documentElement.classList.toggle('theme-light', !isDark);
    }, []);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await plugin.loadData() || {};
                if (data.fontSize) {
                    setFontSize(data.fontSize);
                    document.documentElement.style.setProperty('--article-font-size', `${data.fontSize}px`);
                }
            } catch (error) {
                console.warn('读取字体大小设置失败:', error);
            }
        };
        loadSettings();
    }, [plugin]);

    return { fontSize, isDarkMode, handleFontSizeChange, handleThemeChange };
};
