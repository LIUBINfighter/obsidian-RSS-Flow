import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import RSSFlowPlugin from '../main';
import { dbService } from '../services/db-service';
import { RSSItem, ContentBlock, ContentBlockType } from '../types';
import { TextBlockView } from './TextBlockView';
import { MediaBlockView } from './MediaBlockView';
import { ParagraphBlockView } from './ParagraphBlockView';
import { HeadingBlockView } from './HeadingBlockView';
import { CodeBlockView } from './CodeBlockView';
import { BlockquoteView } from './BlockquoteView';
import { HtmlBlockView } from './HtmlBlockView';
import { Notice } from 'obsidian';

interface ReadProps {
    plugin: RSSFlowPlugin;
}

interface FavoritedBlock {
    id: number;
    text: string;
    source: string;
    articleId: string;
    timestamp: number;
}

export const Read: React.FC<ReadProps> = ({ plugin }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [article, setArticle] = useState<RSSItem | null>(null);
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoritedBlocks, setFavoritedBlocks] = useState<FavoritedBlock[]>([]);
    
    const handleSidebarToggle = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    // 将HTML内容分割成文本块和媒体块，优化Markdown渲染
    const processContentIntoBlocks = useCallback((htmlContent: string): ContentBlock[] => {
        // 创建一个临时元素来解析HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        const blocks: ContentBlock[] = [];
        let blockId = 0;

        // 识别代码块语言
        const getCodeLanguage = (element: HTMLElement): string => {
            const classNames = element.className.split(' ');
            for (const cls of classNames) {
                if (cls.startsWith('language-')) {
                    return cls.replace('language-', '');
                }
            }
            return '';
        };

        // 递归处理节点
        const processNode = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                // 处理文本节点
                const text = node.textContent?.trim();
                if (text && text.length > 0) {
                    blocks.push({
                        id: blockId++,
                        type: ContentBlockType.TEXT,
                        content: text
                    });
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const tagName = element.tagName.toUpperCase();
                
                // 处理图片
                if (tagName === 'IMG') {
                    const img = element as HTMLImageElement;
                    blocks.push({
                        id: blockId++,
                        type: ContentBlockType.IMAGE,
                        content: `<img src="${img.src}" alt="${img.alt || ''}" />`,
                        sourceUrl: img.src
                    });
                    return; // 不需要进一步处理图片内部
                }
                
                // 处理视频
                else if (tagName === 'VIDEO') {
                    blocks.push({
                        id: blockId++,
                        type: ContentBlockType.VIDEO,
                        content: element.outerHTML,
                        sourceUrl: (element as HTMLVideoElement).src
                    });
                    return; // 不需要进一步处理视频内部
                }
                
                // 处理iframe嵌入内容
                else if (tagName === 'IFRAME') {
                    blocks.push({
                        id: blockId++,
                        type: ContentBlockType.EMBED,
                        content: element.outerHTML,
                        sourceUrl: (element as HTMLIFrameElement).src
                    });
                    return; // 不需要进一步处理iframe内部
                }
                
                // 处理标题
                else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tagName)) {
                    const level = parseInt(tagName.charAt(1));
                    blocks.push({
                        id: blockId++,
                        type: ContentBlockType.HEADING,
                        content: element.innerHTML,
                        level: level
                    });
                    return; // 不需要进一步处理标题内部
                }
                
                // 处理段落
                else if (tagName === 'P') {
                    // 检查段落是否只包含一个图片
                    if (element.childElementCount === 1 && element.firstElementChild?.tagName === 'IMG') {
                        // 如果是，交给图片处理逻辑
                        processNode(element.firstElementChild);
                    } else {
                        blocks.push({
                            id: blockId++,
                            type: ContentBlockType.PARAGRAPH,
                            content: element.innerHTML
                        });
                    }
                    return; // 不需要进一步处理段落内部
                }
                
                // 处理代码块
                else if (tagName === 'PRE') {
                    const codeElement = element.querySelector('code');
                    const language = codeElement ? getCodeLanguage(codeElement) : '';
                    blocks.push({
                        id: blockId++,
                        type: ContentBlockType.CODE,
                        content: codeElement ? codeElement.innerHTML : element.innerHTML,
                        language: language
                    });
                    return; // 不需要进一步处理代码块内部
                }
                
                // 处理引用块
                else if (tagName === 'BLOCKQUOTE') {
                    blocks.push({
                        id: blockId++,
                        type: ContentBlockType.BLOCKQUOTE,
                        content: element.innerHTML
                    });
                    return; // 不需要进一步处理引用块内部
                }
                
                // 处理列表
                else if (tagName === 'UL' || tagName === 'OL') {
                    blocks.push({
                        id: blockId++,
                        type: ContentBlockType.LIST,
                        content: element.outerHTML
                    });
                    return; // 不需要进一步处理列表内部
                }
                
                // 处理表格
                else if (tagName === 'TABLE') {
                    blocks.push({
                        id: blockId++,
                        type: ContentBlockType.TABLE,
                        content: element.outerHTML
                    });
                    return; // 不需要进一步处理表格内部
                }
                
                // 处理DIV容器或其他元素
                else if (tagName === 'DIV' || element.childNodes.length > 0) {
                    // 递归处理子元素
                    element.childNodes.forEach(child => {
                        processNode(child);
                    });
                    return;
                }
                
                // 处理其他HTML元素
                else if (element.innerHTML.trim()) {
                    blocks.push({
                        id: blockId++,
                        type: ContentBlockType.HTML,
                        content: element.outerHTML
                    });
                }
            }
        };
        
        // 处理所有子节点
        tempDiv.childNodes.forEach(node => {
            processNode(node);
        });
        
        return blocks;
    }, []);

    const loadArticle = useCallback(async (articleId?: string) => {
        setLoading(true);
        try {
            await dbService.init();
            
            // 如果提供了文章ID，则加载该文章
            if (articleId) {
                const specificItem = await dbService.getItemById(articleId);
                if (specificItem) {
                    setArticle(specificItem);
                    // 处理文章内容为块
                    const blocks = processContentIntoBlocks(specificItem.content);
                    setContentBlocks(blocks);
                    
                    // 标记文章为已读
                    try {
                        await dbService.markItemAsRead(articleId);
                    } catch (error) {
                        console.warn('标记文章为已读失败，可能需要更新dbService:', error);
                    }
                    
                    // 清除当前文章ID，避免重复加载
                    plugin.currentArticleId = null;
                }
            } else {
                // 否则加载随机文章
                const randomItem = await dbService.getRandomItem();
                if (randomItem) {
                    setArticle(randomItem);
                    // 处理文章内容为块
                    const blocks = processContentIntoBlocks(randomItem.content);
                    setContentBlocks(blocks);
                    
                    // 标记文章为已读
                    try {
                        await dbService.markItemAsRead(randomItem.id);
                    } catch (error) {
                        console.warn('标记文章为已读失败，可能需要更新dbService:', error);
                    }
                }
            }
        } catch (error) {
            console.error('加载文章失败:', error);
        } finally {
            setLoading(false);
        }
    }, [plugin, processContentIntoBlocks]);

    const handleRefresh = useCallback(async () => {
        await loadArticle();
    }, [loadArticle]);

    const handleSync = useCallback(async () => {
        try {
            await plugin.syncRSSFeeds();
            await loadArticle();
        } catch (error) {
            console.error('同步RSS失败:', error);
        }
    }, [plugin, loadArticle]);
    
    // 处理收藏文本块
    const handleFavoriteBlock = useCallback((content: string, blockId: number) => {
        if (article) {
            // 检查是否已经收藏
            const existingIndex = favoritedBlocks.findIndex(
                block => block.text === content && block.articleId === article.id && block.id === blockId
            );
            
            if (existingIndex >= 0) {
                // 如果已存在，则移除收藏
                const updatedFavorites = [...favoritedBlocks];
                updatedFavorites.splice(existingIndex, 1);
                setFavoritedBlocks(updatedFavorites);
                new Notice('已从收藏中移除');
            } else {
                // 否则添加收藏
                const newFavorite: FavoritedBlock = {
                    id: blockId,
                    text: content,
                    source: article.title,
                    articleId: article.id,
                    timestamp: Date.now()
                };
                setFavoritedBlocks(prev => [...prev, newFavorite]);
                new Notice('已添加到收藏');
            }
            
            // 保存到持久存储
            saveFavoritesToStorage([...favoritedBlocks]);
        }
    }, [article, favoritedBlocks]);
    
    // 保存收藏到存储
    const saveFavoritesToStorage = async (favorites: FavoritedBlock[]) => {
        try {
            const data = await plugin.loadData() || {};
            data.favoritedBlocks = favorites;
            await plugin.saveData(data);
        } catch (error) {
            console.error('保存收藏失败:', error);
        }
    };
    
    // 将收藏转换为Markdown
    const convertToMarkdown = useCallback(async () => {
        if (favoritedBlocks.length === 0) {
            new Notice('没有收藏的内容');
            return;
        }
        
        try {
            // 构建Markdown内容
            let markdown = `# 收藏内容 - ${new Date().toLocaleString()}\n\n`;
            
            favoritedBlocks.forEach((block, index) => {
                markdown += `> ${block.text}\n\n`;
                markdown += `*来源: ${block.source}*\n\n`;
                if (index < favoritedBlocks.length - 1) {
                    markdown += '---\n\n';
                }
            });
            
            // 使用Obsidian API创建新的Markdown文件
            const fileName = `RSS收藏-${Date.now()}.md`;
            const vault = plugin.app.vault;
            
            await vault.create(fileName, markdown);
            new Notice(`已创建文件: ${fileName}`);
        } catch (error) {
            console.error('创建Markdown文件失败:', error);
            new Notice('创建Markdown文件失败');
        }
    }, [favoritedBlocks, plugin.app.vault]);
    
    // 加载收藏
    const loadFavorites = useCallback(async () => {
        try {
            const data = await plugin.loadData() || {};
            if (data.favoritedBlocks) {
                setFavoritedBlocks(data.favoritedBlocks);
            }
        } catch (error) {
            console.error('加载收藏失败:', error);
        }
    }, [plugin]);

    useEffect(() => {
        // 检查是否有指定要打开的文章
        const articleId = plugin.currentArticleId;
        // 直接传递可能为null的articleId，在loadArticle中处理
        loadArticle(articleId || undefined);
        
        // 加载收藏的文本块
        loadFavorites();
    }, [loadArticle, plugin.currentArticleId, loadFavorites]);

    return (
        <div className="main-content-container">
            <div className={`content ${isSidebarOpen ? 'with-sidebar' : ''}`}>
                <div className="read-container">
                    <div className="read-header">
                        <h2>RSS Flow Reader</h2>
                        <div className="read-actions">
                            <button 
                                onClick={handleRefresh}
                                className="read-refresh-btn"
                                title="随机文章"
                            >
                                随机
                            </button>
                            <button 
                                onClick={handleSync}
                                className="sync-btn"
                                title="同步RSS"
                            >
                                同步RSS
                            </button>
                            <button 
                                onClick={convertToMarkdown}
                                className="export-btn"
                                title="导出收藏为Markdown"
                            >
                                导出收藏
                            </button>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="article-loading">
                            <div className="article-loading-spinner"></div>
                            <p>正在加载文章...</p>
                        </div>
                    ) : !article ? (
                        <div className="article-empty">
                            <p>没有找到文章</p>
                            <div className="article-actions-empty">
                                <button 
                                    className="article-sync-btn" 
                                    onClick={handleSync}
                                >
                                    同步RSS源
                                </button>
                                <button 
                                    className="article-refresh-btn" 
                                    onClick={handleRefresh}
                                >
                                    刷新
                                </button>
                            </div>
                            <p className="article-empty-tip">
                                提示：如果您已添加RSS源但还是看不到内容，可能是因为同步失败。请检查源URL是否正确，或者查看控制台日志获取详细错误信息。
                            </p>
                        </div>
                    ) : (
                        <div className="article-container">
                            <div className="article-header">
                                <h2 className="article-title">{article.title}</h2>
                                <div className="article-meta">
                                    {article.author && (
                                        <span className="article-author">by {article.author}</span>
                                    )}
                                    <span className="article-date">
                                        {new Date(article.publishDate).toLocaleString()}
                                    </span>
                                    <span className="article-source">
                                        来源: {article.feedName}
                                    </span>
                                </div>
                                <div className="article-actions">
                                    <a 
                                        href={article.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="article-link-btn"
                                    >
                                        查看原文
                                    </a>
                                    <button 
                                        className="article-refresh-btn" 
                                        onClick={handleRefresh}
                                    >
                                        随机文章
                                    </button>
                                </div>
                            </div>

                            {article.imageUrl && (
                                <div className="article-image">
                                    <img src={article.imageUrl} alt={article.title} />
                                </div>
                            )}

                            <div className="article-content text-blocks-container">
                                {contentBlocks.map((block) => {
                                    switch (block.type) {
                                        case ContentBlockType.TEXT:
                                            return (
                                                <TextBlockView 
                                                    key={`${article.id}-block-${block.id}`} 
                                                    text={block.content}
                                                    blockId={block.id}
                                                    onFavorite={handleFavoriteBlock}
                                                />
                                            );
                                        case ContentBlockType.PARAGRAPH:
                                            return (
                                                <ParagraphBlockView 
                                                    key={`${article.id}-paragraph-${block.id}`}
                                                    block={block}
                                                    onFavorite={handleFavoriteBlock}
                                                />
                                            );
                                        case ContentBlockType.HEADING:
                                            return (
                                                <HeadingBlockView 
                                                    key={`${article.id}-heading-${block.id}`}
                                                    block={block}
                                                    onFavorite={handleFavoriteBlock}
                                                />
                                            );
                                        case ContentBlockType.CODE:
                                            return (
                                                <CodeBlockView 
                                                    key={`${article.id}-code-${block.id}`}
                                                    block={block}
                                                    onFavorite={handleFavoriteBlock}
                                                />
                                            );
                                        case ContentBlockType.IMAGE:
                                        case ContentBlockType.VIDEO:
                                        case ContentBlockType.EMBED:
                                            return (
                                                <MediaBlockView
                                                    key={`${article.id}-media-${block.id}`}
                                                    block={block}
                                                    onFavorite={handleFavoriteBlock}
                                                />
                                            );
                                        case ContentBlockType.BLOCKQUOTE:
                                            return (
                                                <BlockquoteView
                                                    key={`${article.id}-quote-${block.id}`}
                                                    block={block}
                                                    onFavorite={handleFavoriteBlock}
                                                />
                                            );
                                        case ContentBlockType.LIST:
                                        case ContentBlockType.TABLE:
                                        case ContentBlockType.HTML:
                                            return (
                                                <HtmlBlockView
                                                    key={`${article.id}-html-${block.id}`}
                                                    block={block}
                                                    onFavorite={handleFavoriteBlock}
                                                />
                                            );
                                        default:
                                            return null;
                                    }
                                })}
                            </div>

                            {article.tags && article.tags.length > 0 && (
                                <div className="article-tags">
                                    {article.tags.map(tag => (
                                        <span key={tag} className="article-tag">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Sidebar 
                isOpen={isSidebarOpen} 
                onToggle={handleSidebarToggle}
                favoritedBlocks={favoritedBlocks}
                onExportMarkdown={convertToMarkdown}
            />
        </div>
    );
};
