import React, { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import RSSFlowPlugin from '../main';

interface ReadProps {
    plugin: RSSFlowPlugin;
}

export const Read: React.FC<ReadProps> = ({ plugin }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleSidebarToggle = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    return (
        <div className="main-content-container">
            <div className={`content ${isSidebarOpen ? 'with-sidebar' : ''}`}>
                <div className="read-container">
                    <h2>RSS Flow Read</h2>
                    {/* 这里后续可以添加阅读区域的主要内容 */}
                </div>
            </div>
            <Sidebar 
                isOpen={isSidebarOpen} 
                onToggle={handleSidebarToggle} 
            />
        </div>
    );
};
