import React, { useRef, useEffect } from 'react';
import { setIcon } from 'obsidian';
import { useTranslation } from 'react-i18next';
import { ensureString } from '../../utils/i18n-utils';

export type ReadOrder = 'newest' | 'oldest' | 'random';
export type ReadFilter = 'all' | 'unread' | 'read';

interface ReadOrderSelectorProps {
    readOrder: ReadOrder;
    readFilter: ReadFilter;
    onOrderChange: (order: ReadOrder) => void;
    onFilterChange: (filter: ReadFilter) => void;
}

export const ReadOrderSelector: React.FC<ReadOrderSelectorProps> = ({
    readOrder,
    readFilter,
    onOrderChange,
    onFilterChange
}) => {
    const { t } = useTranslation();
    
    const newestBtnRef = useRef<HTMLButtonElement>(null);
    const oldestBtnRef = useRef<HTMLButtonElement>(null);
    const randomBtnRef = useRef<HTMLButtonElement>(null);
    const filterBtnRef = useRef<HTMLButtonElement>(null);
    
    // 设置按钮图标
    useEffect(() => {
        if (newestBtnRef.current) setIcon(newestBtnRef.current, 'arrow-down');
        if (oldestBtnRef.current) setIcon(oldestBtnRef.current, 'arrow-up');
        if (randomBtnRef.current) setIcon(randomBtnRef.current, 'shuffle');
        
        // 根据当前过滤器设置不同图标
        if (filterBtnRef.current) {
            switch (readFilter) {
                case 'unread':
                    setIcon(filterBtnRef.current, 'eye-off');
                    break;
                case 'read':
                    setIcon(filterBtnRef.current, 'eye');
                    break;
                default:
                    setIcon(filterBtnRef.current, 'layers');
                    break;
            }
        }
    }, [readFilter]);
    
    // 循环切换过滤器
    const cycleReadFilter = () => {
        switch (readFilter) {
            case 'all':
                onFilterChange('unread');
                break;
            case 'unread':
                onFilterChange('read');
                break;
            case 'read':
                onFilterChange('all');
                break;
        }
    };
    
    return (
        <div className="read-order-selector">
            <div className="read-order-buttons">
                <button 
                    ref={newestBtnRef}
                    className={`order-btn ${readOrder === 'newest' ? 'active' : ''}`}
                    onClick={() => onOrderChange('newest')}
                    title={ensureString(t, 'read.order.newest', '最新到最旧')}
                />
                
                <button 
                    ref={oldestBtnRef}
                    className={`order-btn ${readOrder === 'oldest' ? 'active' : ''}`}
                    onClick={() => onOrderChange('oldest')}
                    title={ensureString(t, 'read.order.oldest', '最旧到最新')}
                />
                
                <button 
                    ref={randomBtnRef}
                    className={`order-btn ${readOrder === 'random' ? 'active' : ''}`}
                    onClick={() => onOrderChange('random')}
                    title={ensureString(t, 'read.order.random', '随机顺序')}
                />
                
                <button 
                    ref={filterBtnRef}
                    className={`filter-btn ${readFilter !== 'all' ? 'active' : ''}`}
                    onClick={cycleReadFilter}
                    title={ensureString(t, `read.filter.${readFilter}`, 
                        readFilter === 'all' ? '所有文章' : 
                        readFilter === 'unread' ? '仅未读文章' : '仅已读文章'
                    )}
                />
            </div>
        </div>
    );
};
