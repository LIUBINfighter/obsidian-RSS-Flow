export default {
    translation: {
        // Read View
        'read.empty.title': '请选择要阅读的文章',
        'read.empty.description': '您可以从文章库中选择一篇文章，或随机阅读一篇',
        'read.empty.goToGallery': '前往文章库',
        'read.empty.randomRead': '随机阅读',
        'read.empty.syncNow': '立即同步',
        'read.header.tooltip.random': '随机文章',
        'read.header.tooltip.sync': '同步RSS源',
        'read.header.tooltip.export': '导出为Markdown',
        'read.header.tooltip.decreaseFont': '减小字号',
        'read.header.tooltip.increaseFont': '增大字号',
        'read.header.tooltip.readme': '打开ReadMe',
        'read.header.tooltip.gallery': '打开文章库',
        'read.header.tooltip.sidebar': '切换侧边栏',
        'read.header.tooltip.prev': '上一篇文章',
        'read.header.tooltip.next': '下一篇文章',
        'read.header.tooltip.browser': '在浏览器中打开',
        'read.header.tooltip.saveArticle': '保存文章到笔记',
        'read.header.tooltip.saveHighlights': '保存收藏段落到笔记',
        'read.sidebar.title': '收藏',
        'read.sidebar.currentArticle': '当前文章',
        'read.sidebar.otherArticles': '其他文章',
        'read.sidebar.clearAll': '清空全部',
        'read.sidebar.saveAll': '保存全部到笔记',
        'read.sidebar.noFavorites': '暂无收藏内容',
        'read.sidebar.remove': '移除',
        // RSS sources
        'rss.sources.title': '订阅源',
        'rss.sources.add': '添加新订阅源',
        'rss.sources.name': '名称',
        'rss.sources.namePlaceholder': '请输入订阅源名称',
        'rss.sources.url': 'URL',
        'rss.sources.urlPlaceholder': '请输入订阅源URL',
        'rss.sources.folder': '分类',
        'rss.sources.folderPlaceholder': '请输入分类',
        'rss.sources.confirm': '确认',
        'rss.sources.cancel': '取消',
        'rss.sources.import': '导入OPML文件',
        'rss.sources.importSuccess': '成功导入 {{count}} 个RSS源',
        'rss.sources.importNoSource': '未找到有效的RSS源',
        'rss.sources.importError': '导入OPML文件失败: {{message}}',
        'rss.sources.exportSuccess': 'OPML文件导出成功',
        'rss.sources.exportError': '导出OPML文件失败: {{message}}',
        // RSS sync messages
        syncing: '正在同步RSS订阅...',
        noFeeds: '没有找到RSS订阅源',
        syncComplete: 'RSS同步完成: {{success}}个成功, {{fail}}个失败, 共{{total}}篇文章',
        partialSyncFail: '部分RSS源同步失败，您仍可阅读成功同步的内容',
        syncFail: 'RSS同步失败，查看控制台了解详情',
        syncPreserveStatus: '已保留所有文章的已读状态和收藏标记',

        // Commands
        openReadmeView: '打开ReadMe视图',
        readRSSMessages: '阅读RSS消息',
        rssGallery: 'RSS图库',
        syncRSSFeeds: '同步RSS订阅',

        // Ribbon icons
        manageRSSSetting: '管理RSS设置',
        readRSS: '阅读RSS',
        rssGalleryView: 'RSS图库',

        // ReadMe
        'rss.readme.welcome': '欢迎使用 RSS Flow，一个用于在 Obsidian 中阅读和管理 RSS 源的插件。',

        // Gallery
        'gallery.title': 'RSS 文章库',
        'gallery.search.placeholder': '搜索文章...',
        'gallery.filter.all': '全部',
        'gallery.filter.favorite': '收藏',
        'gallery.view.card': '卡片视图',
        'gallery.view.waterfall': '瀑布流视图',
        'gallery.actions.sync': '同步RSS源',
        'gallery.actions.refresh': '刷新文章状态',
        'gallery.loading': '加载中...',
        'gallery.empty.noArticles': '没有找到文章',
        'gallery.refreshSuccess': '已刷新文章列表',
        'gallery.refreshError': '刷新失败',
        'read.empty.syncTip': '提示：如果您刚开始使用，可能需要先同步RSS源获取文章'
    }
}
