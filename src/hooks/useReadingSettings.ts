import { useState, useCallback, useEffect } from 'react';
import RSSFlowPlugin from '../main';

// 预设字体选项
const FONT_FAMILIES = [
    { label: '系统默认', value: 'system-ui' },
    { label: '思源宋体', value: '"Noto Serif SC", serif' },
    { label: '思源黑体', value: '"Noto Sans SC", sans-serif' },
    { label: '等距更纱黑体', value: '"Sarasa Mono SC", monospace' }
];

export const useReadingSettings = (plugin: RSSFlowPlugin) => {
    const [fontSize, setFontSize] = useState(() => {
        // 从插件数据中读取字体大小，如果没有则使用默认值16
        const savedData = plugin.settings?.fontSize || 16;
        return savedData;
    });
    
    const [lineHeight, setLineHeight] = useState(() => {
        // 从插件数据中读取行高，如果没有则使用默认值1.6
        const savedData = plugin.settings?.lineHeight || 1.6;
        return savedData;
    });

    const [fontFamily, setFontFamily] = useState(() => {
        // 从插件数据中读取字体，如果没有则使用默认值
        const savedData = plugin.settings?.fontFamily || FONT_FAMILIES[0].value;
        return savedData;
    });

    const [isDarkMode, setIsDarkMode] = useState(false);

    // 初始加载时设置字体样式
    useEffect(() => {
        document.documentElement.style.setProperty('--article-font-size', `${fontSize}px`);
        document.documentElement.style.setProperty('--article-line-height', `${lineHeight}`);
        document.documentElement.style.setProperty('--article-font-family', fontFamily);
        
        // 应用到相关元素
        const articleContentElements = document.querySelectorAll('.article-content, .text-blocks-container');
        articleContentElements.forEach(el => {
            const element = el as HTMLElement;
            element.style.fontSize = `${fontSize}px`;
            element.style.lineHeight = `${lineHeight}`;
            element.style.fontFamily = fontFamily;
        });
    }, [fontSize, lineHeight, fontFamily]);

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

    const handleLineHeightChange = useCallback(async (change: number) => {
        const newLineHeight = Math.max(1.2, Math.min(2.4, lineHeight + change));
        setLineHeight(newLineHeight);
        
        // 设置CSS变量和全局样式
        document.documentElement.style.setProperty('--article-line-height', `${newLineHeight}`);
        
        // 保存设置到插件数据
        try {
            const data = await plugin.loadData() || {};
            data.lineHeight = newLineHeight;
            await plugin.saveData(data);
        } catch (error) {
            console.warn('保存行高设置失败:', error);
        }
    }, [lineHeight, plugin]);

    const handleFontFamilyChange = useCallback(async (newFontFamily: string) => {
        setFontFamily(newFontFamily);
        
        // 设置CSS变量和全局样式
        document.documentElement.style.setProperty('--article-font-family', newFontFamily);
        
        // 保存设置到插件数据
        try {
            const data = await plugin.loadData() || {};
            data.fontFamily = newFontFamily;
            await plugin.saveData(data);
        } catch (error) {
            console.warn('保存字体设置失败:', error);
        }
    }, [plugin]);

    return { 
        fontSize, 
        lineHeight,
        fontFamily,
        isDarkMode, 
        handleFontSizeChange,
        handleLineHeightChange,
        handleFontFamilyChange,
        FONT_FAMILIES
    };
};
