/**
 * 内容处理工具，将HTML内容处理为结构化区块
 */
import { ContentBlock, ContentBlockType } from '../types';

/**
 * 提取代码块的语言
 */
const getCodeLanguage = (element: HTMLElement): string => {
    const classNames = element.className.split(' ');
    for (const cls of classNames) {
        if (cls.startsWith('language-')) {
            return cls.replace('language-', '');
        }
    }
    return '';
};

/**
 * 将HTML内容处理为结构化区块
 */
export function processHtmlContent(htmlContent: string): ContentBlock[] {
    // 创建一个临时元素来解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const blocks: ContentBlock[] = [];
    let blockId = 0;

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
}

/**
 * 从内容块生成文章目录
 */
export function generateTableOfContents(blocks: ContentBlock[]): {id: number, level: number, title: string}[] {
    return blocks
        .filter(block => block.type === ContentBlockType.HEADING)
        .map(block => ({
            id: block.id,
            level: block.level || 1,
            title: stripHtml(block.content)
        }));
}

/**
 * 从HTML字符串中移除HTML标签
 */
export function stripHtml(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}
