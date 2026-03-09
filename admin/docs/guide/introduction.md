# 项目介绍

## 概述

ice 前端管理系统是一个基于 Vue 3 + TypeScript + Vite + Ant Design Vue 构建的企业级前端管理解决方案。项目采用 pnpm + monorepo 工作区，将可复用能力沉淀为独立包并在应用内组合使用，兼顾工程可维护性与多端复用。

## 技术栈

- Vue 3、TypeScript、Vite、Vue Router、Pinia
- Ant Design Vue（由 `@pkg/ui` 做轻封装并统一样式前缀）
- pnpm + workspace（apps + packages 多仓协同）
- TSX 优先的组件开发体验（同时兼容 Vue SFC）

## 包与模块

- `@pkg/ui`：在 Ant Design Vue 之上封装按钮、输入、Modal、message、Icon 等通用组件与能力
- `@pkg/core`：通用业务逻辑与基础能力（路由增强、弹窗登录、CRUD、Hooks 等）
- `@pkg/utils`：工具函数（如 `isTestDev()`、环境/颜色/文本等工具）
- `@pkg/config`：跨应用的常量、主题与前缀约定（`PREFIX_CLS` 等）
- `@pkg/styles`：全局样式变量与主题（SCSS）
- 业务应用：`apps/admin` 为管理端应用，按需引用上述包

## 主要特性

- 约定式路由与菜单树构建，自动生成并支持父级重定向至首个子路由
- 登录守卫与弹窗登录流程，支持记录待跳转路径并在登录后恢复
- 工作区复用：公共能力以包形式复用，应用只聚焦业务实现
- 主题与样式前缀统一，支持暗色主题与可配置主题色
- 现代工程：按需拆包、依赖预构建、TSX 开发、代码分割与懒加载

## 浏览器支持

现代浏览器（Chrome、Edge、Firefox、Safari）最新两个主版本。不再支持 IE11。

