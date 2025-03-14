import React from 'react';

interface EmptyStateProps {
    handleSync: () => void;
    handleRefresh: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ handleSync, handleRefresh }) => {
    return (
        <div className="article-empty">
            <p>没有找到文章</p>
            <div className="article-actions-empty">
                <button className="article-sync-btn" onClick={handleSync}>同步RSS源</button>
                <button className="article-refresh-btn" onClick={handleRefresh}>刷新</button>
            </div>
            <p className="article-empty-tip">
                提示：如果您已添加RSS源但还是看不到内容，可能是因为同步失败。请检查源URL是否正确，或者查看控制台日志获取详细错误信息。
            </p>
        </div>
    );
};

// 确保组件被正确导出
export default EmptyState;
