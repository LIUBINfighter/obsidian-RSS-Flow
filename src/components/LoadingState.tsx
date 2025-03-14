import React from 'react';

export const LoadingState: React.FC = () => {
    return (
        <div className="article-loading">
            <div className="article-loading-spinner"></div>
            <p>正在加载文章...</p>
        </div>
    );
};

// 确保组件被正确导出
export default LoadingState;
