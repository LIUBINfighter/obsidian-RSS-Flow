/**
 * 笔记创建相关工具函数
 */
import { Notice } from 'obsidian';
import { ContentBlock } from '../types';
import { FavoritedBlock } from '../components/read/favorite-context';

/**
 * 创建安全的文件名
 * @param feedName RSS源名称
 * @param title 文章标题
 * @param suffix 后缀（如"精选"）
 * @returns 处理后的安全文件名
 */
export function createSafeFilename(feedName: string, title: string, suffix?: string): string {
    let filename = `${feedName || 'RSS'} - ${title || 'Untitled'}${suffix ? ` - ${suffix}` : ''}`;
    return filename.replace(/[\\/:*?"<>|]/g, '-')
                  .replace(/\s+/g, ' ')  // 合并多个空格
                  .replace(/^[\s.-]+|[\s.-]+$/g, '')  // 移除首尾的空格、点和连字符
                  .substring(0, 100);  // 限制长度
}

/**
 * 将HTML内容转换为纯文本
 * @param html HTML内容
 * @returns 去除HTML标签的纯文本
 */
export function stripHtmlTags(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
}

/**
 * 确保目录存在
 * @param plugin 插件实例
 * @param path 路径
 */
async function ensureFolderExists(plugin: any, path: string): Promise<void> {
    const folders = path.split('/').filter(Boolean);
    let currentPath = '';
    
    for (const folder of folders) {
        currentPath += folder + '/';
        if (!(await plugin.app.vault.adapter.exists(currentPath))) {
            await plugin.app.vault.createFolder(currentPath);
        }
    }
}

/**
 * 获取保存路径
 * @param plugin 插件实例
 * @param isArticle 是否为文章（true为文章，false为收藏笔记）
 * @returns 保存路径
 */
function getSavePath(plugin: any, isArticle: boolean): string {
    if (isArticle) {
        return 'RSS-Flow/Articles/';
    } else {
        // 从用户设置中读取收藏笔记保存路径，如果没有则使用默认路径
        return plugin.settings?.notesFolderPath || 'RSS-Flow/Notes/';
    }
}

/**
 * 创建YAML Front Matter
 * @param article 文章数据
 * @param isFavorites 是否为收藏内容
 * @returns YAML front matter字符串
 */
function createFrontMatter(article: any, isFavorites: boolean = false): string {
    const date = new Date().toISOString().split('T')[0];
    const publishDate = article.publishDate ? new Date(article.publishDate).toISOString().split('T')[0] : 'unknown';
    
    return `---
title: ${article.title}${isFavorites ? ' - 精选内容' : ''}
author: ${article.author || 'unknown'}
source: ${article.feedName || 'unknown'}
source_url: ${article.link || ''}
publish_date: ${publishDate}
saved_date: ${date}
tags: [RSS-Flow${isFavorites ? ', favorites' : ''}]
---

`;
}

/**
 * 保存文章为Markdown笔记
 * @param article 当前文章
 * @param contentBlocks 文章内容块
 * @param plugin 插件实例
 */
export async function saveArticleToNote(article: any, contentBlocks: ContentBlock[], plugin: any): Promise<void> {
    if (!article) return;
    
    try {
        // 获取保存路径并确保目录存在
        const basePath = getSavePath(plugin, true);
        await ensureFolderExists(plugin, basePath);
        
        // 创建安全的文件名
        const filename = createSafeFilename(article.feedName, article.title);
        
        // 构建笔记内容，使用YAML front matter
        const frontMatter = createFrontMatter(article);
        
        // 构建文章内容
        const articleContent = contentBlocks.map(block => {
            if (block.type === 'heading') {
                const level = block.level || 3;
                return `${'#'.repeat(level)} ${stripHtmlTags(block.content)}\n`;
            } else if (block.type === 'paragraph' || block.type === 'text') {
                return `${stripHtmlTags(block.content)}\n\n`;
            } else if (block.type === 'code') {
                return `\`\`\`${block.language || ''}\n${stripHtmlTags(block.content)}\n\`\`\`\n\n`;
            } else if (block.type === 'blockquote') {
                return `> ${stripHtmlTags(block.content).replace(/\n/g, '\n> ')}\n\n`;
            } else {
                return `${stripHtmlTags(block.content)}\n\n`;
            }
        }).join('');
        
        // 组合完整内容
        const noteContent = frontMatter + articleContent;
        
        // 完整文件路径
        const fullPath = `${basePath}${filename}.md`;
        
        // 使用Obsidian API创建笔记
        console.log('尝试保存文章笔记到路径:', fullPath);
        await plugin.app.vault.create(fullPath, noteContent);
        
        // 显示成功通知
        new Notice(`文章已保存到 ${fullPath}`);
        
    } catch (error) {
        // 详细记录错误
        console.error('保存文章笔记失败:', error);
        console.error('错误详情:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        new Notice(`保存文章笔记失败: ${error.message || '未知错误'}`);
    }
}

/**
 * 保存收藏内容为Markdown笔记
 * @param article 当前文章
 * @param favorites 所有收藏内容
 * @param plugin 插件实例
 */
export async function saveFavoritesToNote(article: any, favorites: FavoritedBlock[], plugin: any): Promise<void> {
    if (!article) return;
    
    try {
        // 过滤出当前文章的收藏内容
        const articleFavorites = favorites.filter(fav => fav.articleId === article.id);
        
        if (articleFavorites.length === 0) {
            new Notice('当前文章没有收藏内容');
            return;
        }
        
        // 获取保存路径并确保目录存在
        const basePath = getSavePath(plugin, false);
        await ensureFolderExists(plugin, basePath);
        
        // 创建安全的文件名
        const filename = createSafeFilename(article.feedName, article.title, '精选');
        
        // 构建笔记内容，使用YAML front matter
        const frontMatter = createFrontMatter(article, true);
        
        // 构建收藏内容部分
        const favoritesContent = articleFavorites.map(fav => {
            // 添加引用格式
            return `> ${stripHtmlTags(fav.text)}\n\n`;
        }).join('');
        
        // 组合完整内容
        const noteContent = frontMatter + 
            `# 收藏内容\n\n` +
            favoritesContent;
        
        // 完整文件路径
        const fullPath = `${basePath}${filename}.md`;
        
        // 使用Obsidian API创建笔记
        console.log('尝试保存收藏笔记到路径:', fullPath);
        await plugin.app.vault.create(fullPath, noteContent);
        
        // 显示成功通知
        new Notice(`收藏内容已保存到 ${fullPath}`);
        
    } catch (error) {
        // 详细记录错误
        console.error('保存收藏笔记失败:', error);
        console.error('错误详情:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        new Notice(`保存收藏笔记失败: ${error.message || '未知错误'}`);
    }
}

/**
 * 保存所有收藏内容到单个Markdown文件
 * @param favorites 所有收藏内容
 * @param plugin 插件实例
 */
export async function saveAllFavoritesToNote(favorites: FavoritedBlock[], plugin: any): Promise<void> {
    if (favorites.length === 0) {
        new Notice('没有收藏内容');
        return;
    }
    
    try {
        // 获取保存路径并确保目录存在
        const basePath = getSavePath(plugin, false);
        await ensureFolderExists(plugin, basePath);
        
        // 创建带时间戳的文件名
        const timestamp = new Date().toLocaleString().replace(/[\\/:*?"<>|]/g, '-');
        const filename = `RSS收藏集合-${timestamp}`;
        
        // 构建YAML Front Matter
        const frontMatter = `---
title: RSS收藏集合
date: ${new Date().toISOString().split('T')[0]}
tags: [RSS-Flow, favorites]
---

# RSS收藏内容集合

*创建于: ${new Date().toLocaleString()}*

`;
        
        // 按来源分组收藏内容
        const groupedFavorites: { [source: string]: FavoritedBlock[] } = {};
        
        favorites.forEach(fav => {
            if (!groupedFavorites[fav.source]) {
                groupedFavorites[fav.source] = [];
            }
            groupedFavorites[fav.source].push(fav);
        });
        
        // 构建内容
        let noteContent = frontMatter;
        
        for (const source in groupedFavorites) {
            noteContent += `## ${source}\n\n`;
            
            groupedFavorites[source].forEach(fav => {
                noteContent += `> ${stripHtmlTags(fav.text)}\n\n`;
                noteContent += `*收藏于: ${new Date(fav.timestamp).toLocaleString()}*\n\n`;
                noteContent += `---\n\n`;
            });
        }
        
        // 完整文件路径
        const fullPath = `${basePath}${filename}.md`;
        
        // 使用Obsidian API创建笔记
        console.log('尝试保存所有收藏内容到路径:', fullPath);
        await plugin.app.vault.create(fullPath, noteContent);
        
        // 显示成功通知
        new Notice(`所有收藏内容已保存到 ${fullPath}`);
        
    } catch (error) {
        // 详细记录错误
        console.error('保存所有收藏内容失败:', error);
        console.error('错误详情:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        new Notice(`保存收藏内容失败: ${error.message || '未知错误'}`);
    }
}
