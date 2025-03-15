import { RSSSource } from '../types';

/**
 * 预处理XML内容，处理常见的特殊字符问题
 */
export function preprocessXML(xmlContent: string): string {
    // 处理未转义的&字符（不是已有实体如&amp;, &lt;等的一部分）
    let processed = xmlContent.replace(/&(?!(?:amp|lt|gt|apos|quot|#\d+);)/g, '&amp;');
    
    // 处理其他可能的特殊字符
    processed = processed.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // 恢复XML标签
    processed = processed.replace(/&lt;(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z][a-zA-Z0-9]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^'">\s]+))?)*)\s*(\/?)\s*&gt;/g, 
        (match, close, tag, attrs, end) => {
            // 恢复标签，但保持属性值中的实体编码
            const processedAttrs = attrs.replace(/=\s*"([^"]*)"/g, (m, content) => {
                return `="${content}"`;
            });
            return `<${close}${tag}${processedAttrs}${end}>`;
        });
    
    return processed;
}

/**
 * 解析OPML文件内容为RSS源数组
 */
export function parseOPML(xmlContent: string): RSSSource[] {
    try {
        // 预处理XML内容
        const processedContent = preprocessXML(xmlContent);
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(processedContent, "text/xml");
        
        // 检查解析错误
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('XML解析错误: ' + parserError.textContent);
        }
        
        const sources: RSSSource[] = [];
        // 更全面的选择器，兼容各种OPML格式
        const outlines = xmlDoc.querySelectorAll('outline[type="rss"], outline[type="atom"], outline[xmlUrl], outline[xmlurl]');
        
        outlines.forEach(outline => {
            const title = outline.getAttribute('title') || outline.getAttribute('text') || '未命名源';
            // 兼容不同的属性名
            const url = outline.getAttribute('xmlUrl') || outline.getAttribute('xmlurl');
            // 尝试从父节点获取分类信息
            let folder = '默认分类';
            const parentOutline = outline.parentElement;
            if (parentOutline && parentOutline.tagName.toLowerCase() === 'outline' && 
                !parentOutline.getAttribute('xmlUrl') && !parentOutline.getAttribute('xmlurl')) {
                folder = parentOutline.getAttribute('title') || parentOutline.getAttribute('text') || '默认分类';
            }
            
            if (url) {
                sources.push({
                    name: title,
                    url: url,
                    folder: folder
                });
            }
        });
        
        return sources;
    } catch (error) {
        console.error('解析OPML出错:', error);
        throw error;
    }
}

/**
 * 生成OPML文件内容
 */
export function generateOPML(sources: RSSSource[]): string {
    try {
        // 按分类分组
        const folderMap = new Map<string, RSSSource[]>();
        sources.forEach(source => {
            if (!folderMap.has(source.folder)) {
                folderMap.set(source.folder, []);
            }
            folderMap.get(source.folder)?.push(source);
        });
        
        let opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="1.0">
  <head>
    <title>RSS Flow Subscriptions</title>
  </head>
  <body>
`;
        
        // 添加每个分类和源
        folderMap.forEach((sourcesInFolder, folder) => {
            // 确保文件夹名称中的特殊字符被正确转义
            const escapedFolder = folder
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            
            opmlContent += `    <outline text="${escapedFolder}" title="${escapedFolder}">\n`;
            
            sourcesInFolder.forEach(source => {
                // 确保名称和URL中的特殊字符被正确转义
                const escapedName = source.name
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
                
                const escapedUrl = source.url
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
                
                opmlContent += `      <outline text="${escapedName}" title="${escapedName}" type="rss" xmlUrl="${escapedUrl}"/>\n`;
            });
            
            opmlContent += `    </outline>\n`;
        });
        
        opmlContent += `  </body>
</opml>`;

        return opmlContent;
    } catch (error) {
        console.error('生成OPML出错:', error);
        throw error;
    }
}
