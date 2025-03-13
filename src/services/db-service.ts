import { RSSItem, FeedMeta } from '../types';

// IndexedDB数据库名和版本
const DB_NAME = 'rssFlowDB';
const DB_VERSION = 1;

// 存储对象名称
const STORES = {
    ITEMS: 'items',
    FEEDS: 'feeds'
};

export class DBService {
    private db: IDBDatabase | null = null;

    // 初始化数据库
    async init(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = (event) => {
                console.error('IndexedDB打开失败:', event);
                reject(false);
            };
            
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                console.log('IndexedDB连接成功');
                resolve(true);
            };
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                // 创建存储RSS文章的对象仓库，使用id作为主键
                if (!db.objectStoreNames.contains(STORES.ITEMS)) {
                    const itemsStore = db.createObjectStore(STORES.ITEMS, { keyPath: 'id' });
                    // 创建索引以便于按照不同字段查询
                    itemsStore.createIndex('feedUrl', 'feedUrl', { unique: false });
                    itemsStore.createIndex('folder', 'folder', { unique: false });
                    itemsStore.createIndex('isRead', 'isRead', { unique: false });
                    itemsStore.createIndex('isFavorite', 'isFavorite', { unique: false });
                    itemsStore.createIndex('publishDate', 'publishDate', { unique: false });
                }
                
                // 创建存储Feed元数据的对象仓库
                if (!db.objectStoreNames.contains(STORES.FEEDS)) {
                    const feedsStore = db.createObjectStore(STORES.FEEDS, { keyPath: 'url' });
                    feedsStore.createIndex('folder', 'folder', { unique: false });
                    feedsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                }
            };
        });
    }

    // 添加或更新文章
    async saveItems(items: RSSItem[]): Promise<boolean> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([STORES.ITEMS], 'readwrite');
            const store = transaction.objectStore(STORES.ITEMS);
            
            let successCount = 0;
            
            items.forEach(item => {
                const request = store.put(item);
                
                request.onsuccess = () => {
                    successCount++;
                    if (successCount === items.length) {
                        resolve(true);
                    }
                };
                
                request.onerror = (event) => {
                    console.error('保存文章失败:', event);
                    reject(false);
                };
            });
            
            transaction.oncomplete = () => {
                console.log(`成功保存${successCount}篇文章`);
            };
            
            transaction.onerror = (event) => {
                console.error('保存文章事务失败:', event);
                reject(false);
            };
        });
    }

    // 添加或更新Feed元数据
    async saveFeedMeta(feedMeta: FeedMeta): Promise<boolean> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([STORES.FEEDS], 'readwrite');
            const store = transaction.objectStore(STORES.FEEDS);
            
            const request = store.put(feedMeta);
            
            request.onsuccess = () => {
                resolve(true);
            };
            
            request.onerror = (event) => {
                console.error('保存Feed元数据失败:', event);
                reject(false);
            };
        });
    }

    // 获取所有Feed元数据
    async getAllFeeds(): Promise<FeedMeta[]> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([STORES.FEEDS], 'readonly');
            const store = transaction.objectStore(STORES.FEEDS);
            
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('获取Feed元数据失败:', event);
                reject([]);
            };
        });
    }

    // 获取随机文章
    async getRandomItem(): Promise<RSSItem | null> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([STORES.ITEMS], 'readonly');
            const store = transaction.objectStore(STORES.ITEMS);
            
            const request = store.getAll();
            
            request.onsuccess = () => {
                const items = request.result as RSSItem[];
                if (items.length > 0) {
                    const randomIndex = Math.floor(Math.random() * items.length);
                    resolve(items[randomIndex]);
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = (event) => {
                console.error('获取随机文章失败:', event);
                reject(null);
            };
        });
    }

    // 根据Feed URL获取文章
    async getItemsByFeedUrl(feedUrl: string): Promise<RSSItem[]> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([STORES.ITEMS], 'readonly');
            const store = transaction.objectStore(STORES.ITEMS);
            const index = store.index('feedUrl');
            
            const request = index.getAll(feedUrl);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('获取Feed文章失败:', event);
                reject([]);
            };
        });
    }
    
    // 获取所有文章
    async getAllItems(): Promise<RSSItem[]> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([STORES.ITEMS], 'readonly');
            const store = transaction.objectStore(STORES.ITEMS);
            
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('获取所有文章失败:', event);
                reject([]);
            };
        });
    }
    
    // 根据ID获取文章
    async getItemById(id: string): Promise<RSSItem | null> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([STORES.ITEMS], 'readonly');
            const store = transaction.objectStore(STORES.ITEMS);
            
            const request = store.get(id);
            
            request.onsuccess = () => {
                resolve(request.result || null);
            };
            
            request.onerror = (event) => {
                console.error('获取文章失败:', event);
                reject(null);
            };
        });
    }
    
    // 获取收藏的文章
    async getFavoriteItems(): Promise<RSSItem[]> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            const transaction = this.db.transaction([STORES.ITEMS], 'readonly');
            const store = transaction.objectStore(STORES.ITEMS);
            const index = store.index('isFavorite');
            
            // 使用IDBKeyRange.only()创建精确匹配的键范围
            const keyRange = IDBKeyRange.only(true);
            const request = index.getAll(keyRange);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('获取收藏文章失败:', event);
                reject([]);
            };
        });
    }
    
    // 更新文章收藏状态
    async toggleFavorite(id: string): Promise<boolean> {
        if (!this.db) {
            await this.init();
        }

        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            try {
                // 先获取当前文章
                const item = await this.getItemById(id);
                if (!item) {
                    reject(new Error('文章不存在'));
                    return;
                }
                
                // 切换收藏状态
                item.isFavorite = !item.isFavorite;
                
                // 更新文章
                const transaction = this.db.transaction([STORES.ITEMS], 'readwrite');
                const store = transaction.objectStore(STORES.ITEMS);
                
                const request = store.put(item);
                
                request.onsuccess = () => {
                    resolve(item.isFavorite);
                };
                
                request.onerror = (event) => {
                    console.error('更新收藏状态失败:', event);
                    reject(false);
                };
            } catch (error) {
                console.error('更新收藏状态失败:', error);
                reject(false);
            }
        });
    }
    
    // 按照分类获取文章统计
    async getItemStatsByFolder(): Promise<{folder: string, count: number}[]> {
        if (!this.db) {
            await this.init();
        }
        
        const items = await this.getAllItems();
        
        // 按文件夹分组并计数
        const folderCounts: Record<string, number> = {};
        items.forEach(item => {
            if (!folderCounts[item.folder]) {
                folderCounts[item.folder] = 0;
            }
            folderCounts[item.folder]++;
        });
        
        // 转换为数组格式
        return Object.entries(folderCounts).map(([folder, count]) => ({ 
            folder, 
            count 
        }));
    }
}

// 导出单例
export const dbService = new DBService();
