import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { RSSSource } from '../types';

/**
 * 解析OPML文件内容，提取出RSS订阅源
 * @param opmlContent OPML文件内容
 * @returns RSS源数组
 */
export function parseOPML(opmlContent: string): RSSSource[] {
    try {
        const parserOptions = {
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            isArray: (name: string) => ['outline'].includes(name)
        };
        
        const parser = new XMLParser(parserOptions);
        const result = parser.parse(opmlContent);
        
        if (!result.opml || !result.opml.body) {
            console.error('无效的OPML格式：缺少opml或body标签');
            return [];
        }

        const sources: RSSSource[] = [];
        const processOutlines = (outlines: any[], folder = '默认分类') => {
            if (!outlines) return;
            
            for (const outline of outlines) {
                // RSS源通常具有xmlUrl属性
                if (outline['@_xmlUrl']) {
                    sources.push({
                        name: outline['@_text'] || outline['@_title'] || '未命名源',
                        url: outline['@_xmlUrl'],
                        folder: folder
                    });
                } 
                // 如果有子项但没有xmlUrl，可能是一个分类
                else if (outline.outline) {
                    const newFolder = outline['@_text'] || outline['@_title'] || folder;
                    processOutlines(outline.outline, newFolder);
                }
            }
        };
        
        if (result.opml.body.outline) {
            processOutlines(result.opml.body.outline);
        }
        
        return sources;
    } catch (error) {
        console.error('解析OPML出错:', error);
        throw new Error(`解析OPML失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * 生成OPML文件内容
 * @param sources RSS源数组
 * @returns OPML文件内容
 */
export function generateOPML(sources: RSSSource[]): string {
    try {
        // 按文件夹分组
        const folderMap = new Map<string, RSSSource[]>();
        
        for (const source of sources) {
            const folder = source.folder || '默认分类';
            if (!folderMap.has(folder)) {
                folderMap.set(folder, []);
            }
            folderMap.get(folder)!.push(source);
        }
        
        // 构建OPML结构
        const outlines: any[] = [];
        
        // 添加每个文件夹及其源
        folderMap.forEach((folderSources, folderName) => {
            if (folderName === '默认分类') {
                // 直接添加到顶层
                folderSources.forEach(source => {
                    outlines.push({
                        '@_text': source.name,
                        '@_title': source.name,
                        '@_type': 'rss',
                        '@_xmlUrl': source.url,
                    });
                });
            } else {
                // 创建文件夹并添加子项
                const folderOutline = {
                    '@_text': folderName,
                    '@_title': folderName,
                    outline: folderSources.map(source => ({
                        '@_text': source.name,
                        '@_title': source.name,
                        '@_type': 'rss',
                        '@_xmlUrl': source.url,
                    }))
                };
                outlines.push(folderOutline);
            }
        });
        
        const opmlObj = {
            opml: {
                '@_version': '1.0',
                head: {
                    title: 'RSS Flow Subscriptions'
                },
                body: {
                    outline: outlines
                }
            }
        };
        
        const builderOptions = {
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            format: true
        };
        
        const builder = new XMLBuilder(builderOptions);
        const xmlContent = builder.build(opmlObj);
        
        // 添加XML声明
        return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`;
    } catch (error) {
        console.error('生成OPML出错:', error);
        throw new Error(`生成OPML失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}
