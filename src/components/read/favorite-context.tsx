/**
 * 收藏内容上下文，集中管理收藏状态
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notice, Modal, App } from 'obsidian';
import RSSFlowPlugin from '../../main';

export interface FavoritedBlock {
    id: number;
    text: string;
    source: string;
    articleId: string;
    timestamp: number;
}

// 添加确认模态框
class ConfirmationModal extends Modal {
    result: boolean;
    message: string;
    onConfirm: () => void;
    
    constructor(app: App, message: string, onConfirm: () => void) {
        super(app);
        this.message = message;
        this.onConfirm = onConfirm;
    }

    onOpen() {
        const {contentEl} = this;
        
        contentEl.createEl('h3', {text: '确认操作'});
        contentEl.createEl('p', {text: this.message});
        
        const buttonContainer = contentEl.createEl('div', {
            cls: 'modal-button-container',
        });
        
        // 添加样式
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.marginTop = '20px';
        
        // 取消按钮
        const cancelButton = buttonContainer.createEl('button', {
            text: '取消',
            cls: 'mod-muted',
        });
        cancelButton.addEventListener('click', () => {
            this.close();
        });
        
        // 确认按钮
        const confirmButton = buttonContainer.createEl('button', {
            text: '确认',
            cls: 'mod-warning',
        });
        confirmButton.addEventListener('click', () => {
            this.onConfirm();
            this.close();
        });
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

interface FavoriteContextType {
    favoritedBlocks: FavoritedBlock[];
    addFavorite: (block: Omit<FavoritedBlock, 'timestamp'>) => void;
    removeFavorite: (articleId: string, blockId: number) => void;
    isFavorited: (articleId: string, blockId: number) => boolean;
    exportToMarkdown: () => Promise<void>;
    getFavorites: () => FavoritedBlock[];
    clearAllFavorites: () => Promise<void>; // 添加清空所有收藏的方法
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider: React.FC<{
    children: React.ReactNode;
    plugin: RSSFlowPlugin;
}> = ({ children, plugin }) => {
    const [favoritedBlocks, setFavoritedBlocks] = useState<FavoritedBlock[]>([]);

    // 初始化时从存储加载收藏
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const data = await plugin.loadData() || {};
                if (data.favoritedBlocks) {
                    setFavoritedBlocks(data.favoritedBlocks);
                }
            } catch (error) {
                console.error('加载收藏失败:', error);
            }
        };

        loadFavorites();
    }, [plugin]);

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

    // 添加收藏
    const addFavorite = (block: Omit<FavoritedBlock, 'timestamp'>) => {
        const newFavorite: FavoritedBlock = {
            ...block,
            timestamp: Date.now()
        };
        
        const updatedFavorites = [...favoritedBlocks, newFavorite];
        setFavoritedBlocks(updatedFavorites);
        saveFavoritesToStorage(updatedFavorites);
        new Notice('已添加到收藏');
    };

    // 移除收藏
    const removeFavorite = (articleId: string, blockId: number) => {
        const index = favoritedBlocks.findIndex(
            block => block.articleId === articleId && block.id === blockId
        );
        
        if (index >= 0) {
            const updatedFavorites = [...favoritedBlocks];
            updatedFavorites.splice(index, 1);
            setFavoritedBlocks(updatedFavorites);
            saveFavoritesToStorage(updatedFavorites);
            new Notice('已从收藏中移除');
        }
    };

    // 检查是否已收藏
    const isFavorited = (articleId: string, blockId: number): boolean => {
        return favoritedBlocks.some(
            block => block.articleId === articleId && block.id === blockId
        );
    };

    // 将收藏导出为Markdown
    const exportToMarkdown = async () => {
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
    };

    // 获取所有收藏
    const getFavorites = () => {
        return favoritedBlocks;
    };

    // 清空所有收藏 - 使用Obsidian模态框
    const clearAllFavorites = async () => {
        // 使用Obsidian的Modal代替浏览器confirm
        new ConfirmationModal(plugin.app, '确定要清空所有收藏内容吗？此操作不可恢复。', async () => {
            setFavoritedBlocks([]);
            await saveFavoritesToStorage([]);
            new Notice('已清空所有收藏内容');
        }).open();
    };

    const value = {
        favoritedBlocks,
        addFavorite,
        removeFavorite,
        isFavorited,
        exportToMarkdown,
        getFavorites,
        clearAllFavorites // 添加到context值中
    };

    return (
        <FavoriteContext.Provider value={value}>
            {children}
        </FavoriteContext.Provider>
    );
};

// 自定义Hook，方便组件使用
export function useFavorites() {
    const context = useContext(FavoriteContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoriteProvider');
    }
    return context;
}
