import React, { useEffect, useRef } from 'react';
import { MarkdownRenderer as ObsidianRenderer, MarkdownView } from 'obsidian';
import { App } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';

interface MarkdownRendererProps {
    content: string;
    customComponents?: Record<string, React.ComponentType>;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, customComponents = {} }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const componentRoots = useRef<Map<HTMLElement, Root>>(new Map());
    const clickHandlerRef = useRef<(event: MouseEvent) => void>(() => {});

    useEffect(() => {
        if (containerRef.current) {
            // 清理之前的 React roots
            componentRoots.current.forEach(root => root.unmount());
            componentRoots.current.clear();
            
            containerRef.current.empty();
            
            const app = (window as any).app as App;
            
            ObsidianRenderer.renderMarkdown(
                content,
                containerRef.current,
                '',
                {} as any
            );

            // 使用新的 createRoot API 渲染自定义组件
            Object.entries(customComponents).forEach(([tagName, Component]) => {
                containerRef.current?.querySelectorAll(tagName).forEach(element => {
                    const container = document.createElement('div');
                    const props: { [key: string]: string } = {};
                    // 获取元素的所有属性
                    Array.from(element.attributes).forEach(attr => {
                        props[attr.name] = attr.value;
                    });
                    // 获取元素的内部内容
                    (props as any).children = element.innerHTML;
                    element.replaceWith(container);
                    const root = createRoot(container);
                    root.render(<Component {...props} />);
                    componentRoots.current.set(container, root);
                });
            });

            // 移除旧的事件监听器
            if (clickHandlerRef.current) {
                containerRef.current.removeEventListener('click', clickHandlerRef.current);
            }

            // 创建新的事件监听器
            clickHandlerRef.current = (event: MouseEvent) => {
                const target = event.target as HTMLElement;
                if (target.hasClass('internal-link')) {
                    event.preventDefault();
                    const href = target.getAttribute('href');
                    if (href) {
                        app.workspace.openLinkText(
                            href,
                            app.workspace.getActiveFile()?.path || '',
                            true
                        );
                    }
                }
            };

            // 添加新的事件监听器
            containerRef.current.addEventListener('click', clickHandlerRef.current);
        }

        // 清理函数
        return () => {
            componentRoots.current.forEach(root => root.unmount());
            componentRoots.current.clear();
            if (containerRef.current && clickHandlerRef.current) {
                containerRef.current.removeEventListener('click', clickHandlerRef.current);
            }
        };
    }, [content, customComponents]);

    return <div ref={containerRef} className="markdown-preview-view" />;
};