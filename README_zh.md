[English](README.md)

# Obsidian RSS Flow

重视阅读体验，通过画廊管理（Gallery）和阅读UI,Obsidian RSS Flow 将 RSS 阅读器无缝集成到 Obsidian 中。  构建你的专属信息流，让知识获取更便捷！

## 如何使用

## 设计思路

界面UI设计哲学是：减少设置界面/模态框/原生边栏，将主要交互放在工作区。

### 视图管理


1.设置视图

2.阅读视图


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
      console.log('代码块');
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
