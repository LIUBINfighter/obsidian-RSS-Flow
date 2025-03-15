// 从子文件夹索引文件导入组件
import { 
  LoadingState, 
  TableOfContents, 
  ReadSidebar, 
  ReadHeader, 
  EmptyState, 
  Read, 
  HeadingBlockView
} from './read';

import {
  SourceForm,
  Introduction
} from './readme';

import {
  ArticleView,
  ArticleCard,
  Gallery
} from './gallery';

import { Sidebar } from './Sidebar';

// 导出所有组件以保持向后兼容性
export {
  // 通用组件
  LoadingState,
  TableOfContents,
  SourceForm,
  
  // 介绍和设置相关组件
  Introduction,
  
  // 阅读视图相关组件
  ReadSidebar,
  ReadHeader,
  EmptyState,
  Read,
  HeadingBlockView,
  
  // 画廊相关组件
  ArticleView,
  ArticleCard,
  Gallery,
  
  // 侧边栏
  Sidebar
};

// 导出默认对象以支持 import components from './components'
export default {
  LoadingState,
  TableOfContents,
  SourceForm,
  Introduction,
  ReadSidebar,
  ReadHeader,
  EmptyState,
  Read,
  HeadingBlockView,
  ArticleView,
  ArticleCard,
  Gallery,
  Sidebar
};
