export const VIEW_TYPES = {
    README: "rss-flow-readme-view",
    READ: "rss-flow-read-view",
    GALLERY: "rss-flow-gallery-view"
} as const;

export interface ReactLabSettings {
    setting: string;
    sidebarWidth: number;
}

// RSS源订阅的接口定义
export interface RSSSource {
    name: string;
    url: string;
    folder: string;
}

// RSS文章接口定义
export interface RSSItem {
    id: string;         // 文章唯一标识
    title: string;      // 文章标题
    content: string;    // 文章内容
    summary?: string;   // 文章摘要
    link: string;       // 原文链接
    publishDate: string; // 发布日期
    author?: string;    // 作者
    feedUrl: string;    // 来源Feed URL
    feedName: string;   // 来源Feed名称
    folder: string;     // 所属分类
    isRead: boolean;    // 是否已读
    isFavorite: boolean; // 是否收藏
    imageUrl?: string;  // 封面图片URL
    tags?: string[];    // 标签
}

// 内容块类型定义
export enum ContentBlockType {
    TEXT = 'text',
    PARAGRAPH = 'paragraph',
    HEADING = 'heading',
    IMAGE = 'image',
    VIDEO = 'video',
    EMBED = 'embed',
    CODE = 'code',
    BLOCKQUOTE = 'blockquote',
    LIST = 'list',
    TABLE = 'table',
    HTML = 'html'  // 其他复杂HTML内容
}

export interface ContentBlock {
    id: number;
    type: ContentBlockType;
    content: string;
    sourceUrl?: string; // 媒体资源的原始URL
    level?: number;     // 用于标题级别 (h1-h6) 或列表嵌套级别
    language?: string;  // 用于代码块的语言
}

// Feed元数据接口定义
export interface FeedMeta {
    url: string;
    name: string;
    folder: string;
    lastUpdated: string;
    itemCount: number;
}
