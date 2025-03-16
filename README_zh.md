[English](README.md)

# Obsidian RSS Flow

重视阅读体验，通过画廊管理（Gallery）和阅读UI,Obsidian RSS Flow 将 RSS 阅读器无缝集成到 Obsidian 中。  构建你的专属信息流，让知识获取更便捷！

## 如何使用

## 设计思路

### 核心功能

0.在学习使用插件的时候完成设置

打开的第一个界面为ReadMeView，用户会在这里学会如何导入rss和迁移opml文件.

1.订阅源管理

添加和删除rss

导入opml

2.内容管理

使用indexdb存储所有的文章, 使用 Gallery View 在 obsidian 中进行展示。

### UI设计

界面UI设计哲学是：减少设置界面/模态框/原生边栏，将主要交互放在工作区。

### 视图管理


1.设置视图（Readme view）

2.阅读视图（RSS Flow view）

3.画廊视图（Gallery View）

> Readme视图的命名既不能和setting tab有关，也不能和readme有关，暂时搁置。

## 📚 插件平台使用示例

### 创建一个简单的 React 视图

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';

export const MyView = () => {
  return (
    <div>
      <h1>Hello Obsidian!</h1>
    </div>
  );
};
```

### 使用内置的 Markdown 渲染器

```typescript
import { MarkdownRenderer } from './components/MarkdownRenderer';

export const MyComponent = () => {
  return (
    <MarkdownRenderer>
      # 标题
      - 列表项 1
      - 列表项 2
      
      ```js
      //console.log('代码块');
      ```
    </MarkdownRenderer>
  );
};
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！无论是 bug 修复、新功能建议还是文档改进，我们都非常感谢你的贡献。

同时，欢迎访问由 [raistlind](https://raistlind.github.io/obsidian-dev-docs-zh/) 创建，目前由我 Fork 并维护的[中文obsidian插件开发文档](https://liubinfighter.github.io/obsidian-dev-docs-zh/)！我正在致力于翻译优质社区内容和开发通用插件平台，并将我的工作呈现在上面。

## 📄 许可

[MIT License](LICENSE)
