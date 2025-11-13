---
title: 路由生成与配置
---

# 路由生成与配置

本文说明 admin 应用的约定式路由、菜单树构建、动态重定向与登录守卫等逻辑，包含如何新增页面与常见配置项。

## 约定式路由

- 路由来源：扫描 `apps/admin/src/views/**/index.{tsx,vue}`，每个 `index` 文件导出的默认组件即为路由页面；同时读取其导出的 `routeMeta` 用于配置。
- 路径规则：文件路径 `src/views/foo/bar/index.tsx` 生成路由路径 `/foo/bar`；`src/views/home/index.tsx` 生成 `/home`。
- 标题规则：若 `routeMeta.title` 未设置，则根据路径最后一段生成一个 PascalCase 标题。

示例：

```ts
// 文件：apps/admin/src/views/test/index.tsx
import type { RouteMeta } from '@/router/routeMeta'

export const routeMeta: RouteMeta = {
  title: 'test的一级路由页面',
  // 父级页面重定向：留空字符串表示“自动跳到首个子路由”
  redirect: ''
}
```

## RouteMeta 类型

`apps/admin/src/router/routeMeta.ts` 定义了页面可用的配置项：

```ts
export interface RouteMeta {
  title: string               // 页面标题（用于菜单与标签）
  requiresAuth?: boolean      // 是否需要登录权限
  hideInMenu?: boolean        // 是否在菜单中隐藏
  hideInProd?: boolean        // 正式环境隐藏该路由（父级为 true 时其子路由也隐藏）
  order?: number              // 菜单或路由排序（越小越靠前），默认 1000
  icon?: string               // 图标（按项目约定）
  keepAlive?: boolean         // 是否缓存页面组件
  redirect?: string           // 路由重定向；留空字符串表示“父级跳到首个子路由”
}
```

### 配置项一览（表格）

| 配置项 | 类型 | 默认值 | 生效范围 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `string` | 必填 | 菜单、标签、面包屑 | 页面标题；未设置时按路径最后一段生成 PascalCase 标题 |
| `requiresAuth` | `boolean` | `false` | 路由守卫 | 是否需要登录；未登录会弹窗登录并拦截导航 |
| `hideInMenu` | `boolean` | `false` | 菜单构建 | 隐藏该页面的菜单项；路由仍可访问 |
| `hideInProd` | `boolean` | `false` | 生产构建、路由生成 | 生产环境不展示该路由；若父级目录的一级页面设置为 `true`，其同目录子页面也会被隐藏（`auto.ts` 中的过滤逻辑） |
| `order` | `number` | `1000` | 菜单排序、重定向计算 | 排序权重，值越小越靠前；用于父级跳首个子路由的计算 |
| `icon` | `string` | `undefined` | 菜单 | 图标名称或路径（按项目约定） |
| `keepAlive` | `boolean` | `false` | 页面缓存 | 开启后通过 `KeepAlive` 缓存页面组件 |
| `redirect` | `string` | `undefined` | 路由增强 | 父级路由重定向；若设为空字符串 `''`，访问父级时将自动跳到该目录下排序最靠前的子路由 |

> 生产环境过滤规则详见下文“生产环境隐藏与过滤”。

## 动态重定向（父级 → 首个子路由）

- 对于一级页面（如 `/home`），当其 `routeMeta.redirect` 设置为 `''`（空字符串）时，系统会按 `order` 找到该目录下排序最靠前的子路由，并在访问父级时自动重定向到该子路由。
- 相关实现位于 `apps/admin/src/router/auto.ts`：
  - 先计算每个父级目录的“首个子路由”（`firstChildPathMap`）。
  - 在增强路由时，若父级的 `redirect === ''`，则将其重定向指向该目录的首个子路由。

示例：

```ts
// 文件：apps/admin/src/views/home/index.tsx
export const routeMeta = {
  title: '首页',
  redirect: ''  // 访问 /home 时自动跳到 /home 下排序第一个子路由
}

// 文件：apps/admin/src/views/home/login/index.tsx
export const routeMeta = {
  title: '登录页面',
  order: 1      // 置为首个子路由（数值越小越靠前）
}
```

## 菜单树构建

- 菜单来源：在增强后的路由列表中，过滤掉 `hideInMenu` 的页面得到 `menuRoutes`。
- 父子关系：
  - 一级路由（`/foo`）作为父级；其同目录下的二级路由（`/foo/bar`）作为子级挂载到父级的 `children`。
  - 若存在同名的一级路由，父级的标题、图标、排序会从该一级路由的 `meta` 中继承。
- 排序规则：父级与子级分别按 `order` 升序排序，默认值为 `1000`。
- 相关实现位于 `apps/admin/src/router/auto.ts` 的 `buildMenuTree()`。

## 顶层路由与默认跳转

- 顶层 `router` 配置位于 `apps/admin/src/router/index.ts`：
  - 根路由 `path: '/'` 指向主布局组件 `MainLayout`。
  - `children` 使用自动生成的 `generatedChildrenRoutes`。
  - 根路由的 `redirect` 默认指向 `/home`；若不存在，则指向第一个生成的路由路径。

## 登录守卫与弹窗登录

- 路由守卫：在进入目标路由前，如果 `to.meta.requiresAuth` 且用户未登录，系统会记录待跳转路径并弹出登录窗口，阻止本次导航。
- 登录成功后：关闭弹窗，自动跳转到之前记录的待跳转路径。
- 相关实现：
  - 守卫：`apps/admin/src/router/index.ts` 中的 `beforeEach`。
  - 弹窗与回调：`apps/admin/src/composables/authFlow.tsx` 与 `apps/admin/src/components/auth/LoginModal.tsx`。

## KeepAlive 与页面切换

- 当某路由的 `meta.keepAlive` 为 `true` 时，主内容区域通过 `KeepAlive` 包裹组件，避免二次进入时重新渲染。
- 页面切换动画在 `MainLayout` 中通过 `Transition` 控制，可按需调整。

## 生产环境隐藏与过滤

- 在页面的 `routeMeta` 中设置 `hideInProd: true`，该页面在生产构建时不展示、不会进入路由表与菜单。
- 若某一级页面（例如 `src/views/template/index.tsx` 对应 `/template`）设置了 `hideInProd: true`，则该目录下的所有二级页面（如 `/template/vue2`、`/template/useSearchTableForVue2`）也会一并被过滤。
- 过滤逻辑实现位置：`apps/admin/src/router/auto.ts`。
  - 收集所有一级页面中 `hideInProd: true` 的目录段；
  - 在生成的路由列表中：生产环境下过滤这些目录段及所有显式设置了 `hideInProd: true` 的页面；
  - 其它功能（排序、重定向、菜单树）保持不变。

## 新增页面的步骤

1. 新建页面文件：在 `apps/admin/src/views/<模块>/<页面>/index.tsx`（或 `.vue`）创建文件，并导出默认组件。
2. 导出 `routeMeta`：
   - 设置 `title`（必填）。
   - 按需设置 `order`、`icon`、`keepAlive`、`requiresAuth`、`hideInMenu` 等。
3. 若需要父级自动重定向到首个子路由：在父级 `index.tsx` 的 `routeMeta` 中设置 `redirect: ''`。
4. 保存文件后，无需手动改动路由配置，页面与菜单会自动生效。

示例：

```ts
// apps/admin/src/views/user/index.tsx （父级）
export const routeMeta = { title: '用户管理', redirect: '' }

// apps/admin/src/views/user/list/index.tsx （子级）
export const routeMeta = { title: '用户列表', order: 1 }

// apps/admin/src/views/user/create/index.tsx （子级）
export const routeMeta = { title: '创建用户', order: 2, requiresAuth: true }

// 若要在生产环境隐藏整个目录：
// apps/admin/src/views/template/index.tsx （父级）
export const routeMeta = { title: '模板页', hideInProd: true, redirect: '' }
```

## 常见问题

- 为什么访问 `/home` 会进入登录页面？
  - 因为首页父级设置了 `redirect: ''`，而登录页面设置了较小的 `order`，成为首个子路由。
- 如何让某个页面不出现在菜单？
  - 在页面的 `routeMeta` 中设置 `hideInMenu: true`，仍可通过路由直接访问。
- 想要仅手动展开菜单分组？
  - 可以在布局组件中改为纯手动展开逻辑；默认实现为“包含当前子路由的分组保持展开”。