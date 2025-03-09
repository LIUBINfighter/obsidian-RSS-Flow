# Obsidian React Lab Plugin

这是一个用于在 Obsidian 中进行 React 开发实验的插件平台。

设计哲学是：减少设置界面/模态框/原生边栏，将主要交互放在工作区。

![image](https://github.com/user-attachments/assets/c5c40a07-e2b7-4f2d-bc63-53f82bee1a77)

欢迎访问由 [raistlind](https://raistlind.github.io/obsidian-dev-docs-zh/) 创建，目前由我 Fork 并维护的[中文obsidian插件开发文档](https://liubinfighter.github.io/obsidian-dev-docs-zh/)！我正在致力于翻译优质社区内容和开发通用插件平台。


## 🌟 核心特性

- **零配置开发环境**：预配置好的 React + TypeScript 环境，开箱即用
- **工作区优先**：减少设置界面和模态框，将主要交互放在工作区，提供更流畅的开发体验
- **国际化支持**：集成 i18next，轻松实现多语言支持
- **Markdown 增强**：支持渲染 Markdown、数学公式、Mermaid 图表等
- **Obsidian 集成**：完整支持内部链接、文件操作等 Obsidian API

## 🚀 快速开始

### 安装

1. 克隆仓库到你的 Obsidian 插件目录：
```bash
git clone https://github.com/your-username/obsidian-plugin-react-lab.git
```

2. 安装依赖：
```bash
npm install
# 如遇依赖冲突，使用：
npm install --legacy-peer-deps
```

3. 构建插件：
```bash
npm run build
```

### 开发

1. 启动开发服务：
```bash
npm run dev
```

2. 在 Obsidian 中启用插件
3. 开始开发！修改代码后会自动重新构建

## 📚 使用示例

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

## 📄 许可

[MIT License](LICENSE)
