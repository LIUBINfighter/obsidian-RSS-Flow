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

    // 获取随机文章，支持按文件夹筛选
    async getRandomItem(folder?: string): Promise<RSSItem | null> {
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
            
            // 如果指定了文件夹，使用索引查询
            if (folder) {
                const index = store.index('folder');
                const request = index.getAll(folder);
                
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
            } else {
                // 无文件夹筛选，获取所有文章
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
            }
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

    /**
     * 删除指定URL的Feed
     * @param url Feed的URL
     */
    async deleteFeedByUrl(url: string): Promise<boolean> {
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
            
            const request = store.delete(url);
            
            request.onsuccess = () => {
                console.log(`成功删除Feed: ${url}`);
                resolve(true);
            };
            
            request.onerror = (event) => {
                console.error('删除Feed失败:', event);
                reject(false);
            };
        });
    }

    /**
     * 删除与特定Feed URL关联的所有文章
     * @param feedUrl Feed的URL
     */
    async deleteItemsByFeedUrl(feedUrl: string): Promise<boolean> {
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
            const index = store.index('feedUrl');
            
            // 先获取所有匹配的文章
            const getRequest = index.getAll(feedUrl);
            
            getRequest.onsuccess = () => {
                const items = getRequest.result;
                if (items.length === 0) {
                    resolve(true);
                    return;
                }
                
                let deletedCount = 0;
                items.forEach(item => {
                    const deleteRequest = store.delete(item.id);
                    
                    deleteRequest.onsuccess = () => {
                        deletedCount++;
                        if (deletedCount === items.length) {
                            console.log(`成功删除${deletedCount}篇与Feed ${feedUrl} 相关的文章`);
                            resolve(true);
                        }
                    };
                    
                    deleteRequest.onerror = (event) => {
                        console.error('删除文章失败:', event);
                        reject(false);
                    };
                });
            };
            
            getRequest.onerror = (event) => {
                console.error('获取Feed相关文章失败:', event);
                reject(false);
            };
        });
    }

    /**
     * 清理不再存在于有效列表中的Feeds及其相关文章
     * @param validFeedUrls 有效的Feed URL列表
     */
    async cleanupOrphanedFeeds(validFeedUrls: string[]): Promise<boolean> {
        if (!this.db) {
            await this.init();
        }

        try {
            // 获取所有存储的feeds
            const storedFeeds = await this.getAllFeeds();
            
            // 找出需要删除的feeds (存在于数据库但不在有效列表中)
            const feedsToDelete = storedFeeds.filter(feed => !validFeedUrls.includes(feed.url));
            
            if (feedsToDelete.length === 0) {
                console.log('没有需要删除的feeds');
                return true;
            }
            
            console.log(`发现${feedsToDelete.length}个需要删除的feeds`);
            
            // 对每个需要删除的feed执行删除操作
            for (const feed of feedsToDelete) {
                // 先删除相关的文章
                await this.deleteItemsByFeedUrl(feed.url);
                
                // 然后删除feed本身
                await this.deleteFeedByUrl(feed.url);
            }
            
            console.log(`成功清理了${feedsToDelete.length}个过期的feeds及其相关文章`);
            return true;
        } catch (error) {
            console.error('清理过期feeds时出错:', error);
            return false;
        }
    }

    /**
     * 将文章标记为已读
     * @param itemId 文章ID
     */
    async markItemAsRead(itemId: string): Promise<boolean> {
        if (!this.db) {
            await this.init();
        }

        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            try {
                const transaction = this.db.transaction([STORES.ITEMS], 'readwrite');
                const store = transaction.objectStore(STORES.ITEMS);
                
                // 获取文章
                const getRequest = store.get(itemId);
                
                getRequest.onsuccess = () => {
                    const item = getRequest.result;
                    if (item) {
                        // 更新已读状态
                        item.isRead = true;
                        const putRequest = store.put(item);
                        
                        putRequest.onsuccess = () => {
                            console.log(`文章已标记为已读: ${itemId}`);
                            resolve(true);
                        };
                        
                        putRequest.onerror = (event) => {
                            console.error('更新文章已读状态失败:', event);
                            reject(new Error('更新文章已读状态失败'));
                        };
                    } else {
                        console.warn(`未找到要标记为已读的文章: ${itemId}`);
                        reject(new Error('文章不存在'));
                    }
                };
                
                getRequest.onerror = (event) => {
                    console.error('获取文章失败:', event);
                    reject(new Error('获取文章失败'));
                };
            } catch (error) {
                console.error('标记文章为已读时出错:', error);
                reject(error);
            }
        });
    }

    /**
     * 获取已读文章
     */
    async getReadItems(): Promise<RSSItem[]> {
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
            const index = store.index('isRead');
            
            // 使用IDBKeyRange.only()创建精确匹配的键范围
            const keyRange = IDBKeyRange.only(true);
            const request = index.getAll(keyRange);
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = (event) => {
                console.error('获取已读文章失败:', event);
                reject([]);
            };
        });
    }

    /**
     * 更新文章已读状态
     * @param id 文章ID
     * @param isRead 已读状态
     */
    async setReadStatus(id: string, isRead: boolean): Promise<boolean> {
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
                
                // 设置已读状态
                item.isRead = isRead;
                
                // 更新文章
                const transaction = this.db.transaction([STORES.ITEMS], 'readwrite');
                const store = transaction.objectStore(STORES.ITEMS);
                
                const request = store.put(item);
                
                request.onsuccess = () => {
                    resolve(true);
                };
                
                request.onerror = (event) => {
                    console.error('更新已读状态失败:', event);
                    reject(false);
                };
            } catch (error) {
                console.error('更新已读状态失败:', error);
                reject(false);
            }
        });
    }

    /**
     * 数据库与配置同步方法
     * 确保IndexedDB中的feeds与配置文件中的feeds保持一致
     * @param validFeeds 配置文件中的有效feeds
     */
    async synchronizeWithConfig(validFeeds: FeedMeta[]): Promise<boolean> {
        try {
            if (!this.db) {
                await this.init();
            }
            
            // 提取所有有效的feed URLs
            const validFeedUrls = validFeeds.map(feed => feed.url);
            
            // 清理不在配置中的feeds
            const cleanupResult = await this.cleanupOrphanedFeeds(validFeedUrls);
            if (!cleanupResult) {
                console.error('清理过期feeds失败');
            }
            
            // 更新或添加当前有效的feeds元数据
            for (const feed of validFeeds) {
                await this.saveFeedMeta(feed);
            }
            
            console.log('数据库与配置同步完成');
            return true;
        } catch (error) {
            console.error('数据库与配置同步失败:', error);
            return false;
        }
    }

    /**
     * 按照指定条件获取文章
     * @param options 查询选项
     */
    async getArticlesByOptions(options: {
        folder?: string, 
        isRead?: boolean,
        orderBy?: 'newest' | 'oldest' | 'random'
    }): Promise<RSSItem[]> {
        if (!this.db) {
            await this.init();
        }

        return new Promise(async (resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未初始化'));
                return;
            }

            try {
                // 先获取所有文章或按文件夹筛选的文章
                let articles: RSSItem[] = [];
                if (options.folder && options.folder !== 'all') {
                    // 获取特定文件夹的文章
                    const transaction = this.db.transaction([STORES.ITEMS], 'readonly');
                    const store = transaction.objectStore(STORES.ITEMS);
                    const index = store.index('folder');
                    const request = index.getAll(options.folder);
                    
                    articles = await new Promise<RSSItem[]>((res, rej) => {
                        request.onsuccess = () => res(request.result);
                        request.onerror = (event) => {
                            console.error('获取文件夹文章失败:', event);
                            rej([]);
                        };
                    });
                } else {
                    // 获取所有文章
                    articles = await this.getAllItems();
                }

                // 应用已读/未读筛选
                if (options.isRead !== undefined) {
                    articles = articles.filter(article => article.isRead === options.isRead);
                }

                // 应用排序
                if (options.orderBy) {
                    switch (options.orderBy) {
                        case 'newest':
                            articles.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
                            break;
                        case 'oldest':
                            articles.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
                            break;
                        case 'random':
                            articles = this.shuffleArray(articles);
                            break;
                    }
                }

                resolve(articles);
            } catch (error) {
                console.error('按条件获取文章失败:', error);
                reject([]);
            }
        });
    }

    /**
     * 获取下一篇文章（按指定条件）
     */
    async getNextArticle(currentArticleId: string | null, options: {
        folder?: string, 
        isRead?: boolean,
        orderBy?: 'newest' | 'oldest'
    }): Promise<RSSItem | null> {
        try {
            // 获取符合条件的文章列表
            const articles = await this.getArticlesByOptions(options);
            
            if (articles.length === 0) return null;
            
            // 如果没有当前文章，返回列表中的第一篇
            if (!currentArticleId) return articles[0];
            
            // 找出当前文章在列表中的位置
            const currentIndex = articles.findIndex(a => a.id === currentArticleId);
            
            // 如果找不到当前文章，返回第一篇
            if (currentIndex === -1) return articles[0];
            
            // 返回下一篇文章，如果是最后一篇则循环到第一篇
            const nextIndex = (currentIndex + 1) % articles.length;
            return articles[nextIndex];
        } catch (error) {
            console.error('获取下一篇文章失败:', error);
            return null;
        }
    }

    /**
     * 获取上一篇文章（按指定条件）
     */
    async getPrevArticle(currentArticleId: string | null, options: {
        folder?: string, 
        isRead?: boolean,
        orderBy?: 'newest' | 'oldest'
    }): Promise<RSSItem | null> {
        try {
            // 获取符合条件的文章列表
            const articles = await this.getArticlesByOptions(options);
            
            if (articles.length === 0) return null;
            
            // 如果没有当前文章，返回列表中的最后一篇
            if (!currentArticleId) return articles[articles.length - 1];
            
            // 找出当前文章在列表中的位置
            const currentIndex = articles.findIndex(a => a.id === currentArticleId);
            
            // 如果找不到当前文章，返回最后一篇
            if (currentIndex === -1) return articles[articles.length - 1];
            
            // 返回上一篇文章，如果是第一篇则循环到最后一篇
            const prevIndex = (currentIndex - 1 + articles.length) % articles.length;
            return articles[prevIndex];
        } catch (error) {
            console.error('获取上一篇文章失败:', error);
            return null;
        }
    }
    
    /**
     * 打乱数组顺序（Fisher-Yates洗牌算法）
     */
    private shuffleArray<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

// 导出单例
export const dbService = new DBService();
