import { RSSSource, RSSItem, FeedMeta } from '../types';
import { dbService } from './db-service';

export class RSSService {
    // 解析日期字符串为标准格式
    private parseDate(dateStr: string): string {
        try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
        } catch (e) {
            return new Date().toISOString();
        }
    }

    // 生成唯一ID - 修复Unicode字符编码问题
    private generateId(url: string, title: string): string {
        try {
            // 使用安全的方式处理Unicode字符
            // 1. 先用encodeURIComponent处理Unicode字符
            // 2. 然后再用btoa进行Base64编码
            const input = encodeURIComponent(`${url}-${title}`);
            return btoa(input).replace(/[+/=]/g, '');
        } catch (error) {
            // 兜底方案：使用简单的哈希算法
            console.warn('使用备用ID生成方法:', error);
            let hash = 0;
            const str = `${url}-${title}`;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            // 添加时间戳确保唯一性
            return `hash_${Math.abs(hash)}_${Date.now()}`;
        }
    }

    // 从HTML中提取第一个图片URL
    private extractImageFromHTML(html: string): string | undefined {
        const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
        return imgMatch ? imgMatch[1] : undefined;
    }

    // 从HTML中提取纯文本摘要
    private extractSummaryFromHTML(html: string, maxLength: number = 200): string {
        const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // 获取并解析RSS源
    async fetchAndParseRSS(source: RSSSource): Promise<RSSItem[]> {
        try {
            console.log(`正在获取RSS源: ${source.name} - ${source.url}`);
            
            const response = await fetch(source.url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8'
                }
            });
            
            if (!response.ok) {
                throw new Error(`获取RSS失败: ${response.status} ${response.statusText}`);
            }
            
            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            
            // 检查是否解析错误
            const parseError = xmlDoc.querySelector("parsererror");
            if (parseError) {
                throw new Error(`XML解析错误: ${parseError.textContent}`);
            }
            
            // 处理RSS 2.0格式
            let items: Element[] = Array.from(xmlDoc.querySelectorAll("item"));
            let feedTitle = xmlDoc.querySelector("channel > title")?.textContent || source.name;
            
            // 如果没有找到RSS项，尝试Atom格式
            if (items.length === 0) {
                items = Array.from(xmlDoc.querySelectorAll("entry"));
                feedTitle = xmlDoc.querySelector("feed > title")?.textContent || source.name;
            }
            
            console.log(`找到${items.length}条RSS条目`);
            
            const rssItems: RSSItem[] = [];
            for (const item of items) {
                try {
                    // RSS 2.0
                    let title = item.querySelector("title")?.textContent || "无标题";
                    let link = item.querySelector("link")?.textContent;
                    // 处理Atom格式的链接
                    if (!link) {
                        const linkElement = item.querySelector("link[rel='alternate']") || item.querySelector("link");
                        link = linkElement?.getAttribute("href") || "";
                    }
                    
                    // 尝试获取内容 (可能是content:encoded, description, 或 Atom的content)
                    let content = item.querySelector("content\\:encoded")?.textContent || 
                               item.querySelector("description")?.textContent ||
                               item.querySelector("content")?.textContent || "";
                    
                    // 尝试获取日期 (pubDate for RSS 2.0, published or updated for Atom)
                    let dateStr = item.querySelector("pubDate")?.textContent || 
                               item.querySelector("published")?.textContent ||
                               item.querySelector("updated")?.textContent ||
                               new Date().toISOString();
                    
                    // 尝试获取作者
                    let author = item.querySelector("author")?.textContent ||
                              item.querySelector("dc\\:creator")?.textContent || undefined;
                    
                    // 为文章生成唯一ID
                    const id = this.generateId(source.url, title);
                    
                    // 提取图片和摘要
                    const imageUrl = this.extractImageFromHTML(content);
                    const summary = this.extractSummaryFromHTML(content);
                    
                    rssItems.push({
                        id,
                        title,
                        content,
                        summary,
                        link: link || "",
                        publishDate: this.parseDate(dateStr),
                        author,
                        feedUrl: source.url,
                        feedName: source.name,
                        folder: source.folder,
                        isRead: false,
                        isFavorite: false,
                        imageUrl,
                        tags: []
                    });
                } catch (itemError) {
                    console.error('处理RSS条目失败:', itemError);
                    // 继续处理下一个条目
                }
            }
            
            if (rssItems.length > 0) {
                try {
                    // 更新Feed元数据
                    await dbService.saveFeedMeta({
                        url: source.url,
                        name: source.name,
                        folder: source.folder,
                        lastUpdated: new Date().toISOString(),
                        itemCount: rssItems.length
                    });
                    
                    // 保存到数据库
                    await dbService.saveItems(rssItems);
                    
                    return rssItems;
                } catch (dbError) {
                    console.error('保存到数据库失败:', dbError);
                    // 即使数据库保存失败，仍然返回解析的条目以便查看
                    return rssItems;
                }
            }
            
            // 没有找到文章项目，返回空数组
            return [];
        } catch (error) {
            console.error(`处理RSS源失败: ${source.name}`, error);
            return [];
        }
    }
}

// 导出单例
export const rssService = new RSSService();
