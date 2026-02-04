# 项目结构

本文档介绍 anTeng 前端管理系统的工作区结构与各目录职责。

## 顶层结构（pnpm workspace）

```
web-admin/
├── apps/                   # 业务应用
│   └── admin/              # 管理端（yesong-admin）
├── packages/               # 可复用能力包
│   ├── core/               # 基础能力与通用逻辑
│   ├── ui/                 # UI 组件封装（Ant Design Vue）
│   ├── utils/              # 通用工具函数
│   ├── config/             # 常量与样式前缀、主题约定
│   ├── styles/             # 全局样式与变量
│   └── jsf/                # SchemaForm 等扩展能力
├── docs/                   # 技术文档（VitePress）
├── pnpm-workspace.yaml     # 工作区声明
└── package.json            # 根脚本（admin:dev 等）
```

## admin 应用结构（apps/admin）

```
apps/admin/
├── src/
│   ├── api/                # 业务接口封装
│   ├── components/         # 应用内可复用组件
│   ├── layouts/            # 布局（如 MainLayout）
│   ├── router/             # 路由配置与自动生成
│   ├── store/              # 应用侧状态（auth 等）
│   ├── styles/             # 主题、全局样式
│   ├── views/              # 页面（约定式路由：/**/index.tsx）
│   ├── App.tsx             # 根组件
│   └── main.ts             # 入口挂载
├── vite.config.ts          # 开发/构建配置（端口、代理、拆包）
└── package.json            # 应用脚本与依赖
```

### 路由与菜单

- 约定式路由：自动扫描 `src/views/**/index.{tsx,vue}` 构建路由与菜单
- `routeMeta`：页面元信息（标题、排序、重定向、权限等）
- 详情见《路由生成与配置》

### 认证与登录

- `useAuthStore`（apps/admin）：admin 侧 token 与登录态
- 登录守卫与弹窗：`router/index.ts` 与 `composables/authFlow.tsx`
- 快速登录（开发/测试）：`packages/core/src/views/login/index.tsx` 内置 `isTestDev()` 分支

## packages 结构

### `@pkg/core`
- 通用逻辑与基础能力：路由增强、CRUD、Hooks、组件封装等
- 重要视图：`packages/core/src/views/**`

### `@pkg/ui`
- 在 Ant Design Vue 之上封装常用组件（Button、Input、Modal、message、Icon 等）
- 全局前缀：通过 `ConfigProvider.config({ prefixCls: PREFIX_CLS })` 统一样式前缀

### `@pkg/utils`
- 工具方法：颜色、文本、复制、环境判断（`isTestDev()`）等

### `@pkg/config`
- 常量与主题：`PREFIX_CLS`、场景常量、LOGO 等

### `@pkg/styles`
- SCSS 变量与主题色，Vite 通过 `additionalData` 全局注入

## 命名与导入约定

- 组件文件与导出使用 PascalCase；路由页面位于 `views/**/index.tsx`
- 使用 `@` 指向应用 `src`；工作区包使用 `@pkg/<name>` 引入

```ts
import { Button, message } from '@pkg/ui'
import { router } from '@pkg/core'
import { PREFIX_CLS } from '@pkg/config'
import { isTestDev } from '@pkg/utils'
```

## 代码组织原则

- 功能内聚、职责单一、可复用优先
- 包内聚合通用能力；应用关注业务实现
- 类型安全与一致性（TypeScript、统一前缀与主题）