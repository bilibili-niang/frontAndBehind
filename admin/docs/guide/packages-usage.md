# 包管理与引用（packages）

本项目采用 pnpm + monorepo 的工作区管理，所有可复用的能力以独立包形式放在 packages 目录下，并通过 workspace 引用。

## 工作区结构

- packages/ui：UI 组件库包，提供基础组件、通知、Modal、表单等能力，包名为 `@pkg/ui`
- packages/core：核心逻辑与基础能力包，封装通用 hooks、CRUD、错误处理等，包名为 `@pkg/core`
- apps/*：具体业务应用（例如 admin），从上述包中按需引用

根目录包含 `pnpm-workspace.yaml`，用于声明工作区：

```yaml
packages:
  - "packages/*"
  - "apps/*"
  - "docs"
```

## 包命名与版本

- 统一使用 scoped 包：`@pkg/<name>`，例如：`@pkg/ui`、`@pkg/core`
- 包内部的 `package.json` 必须设置正确的 `name`：
  - `packages/ui/package.json` 中：`"name": "@pkg/ui"`
  - `packages/core/package.json` 中：`"name": "@pkg/core"`
- 应用或其它包引用工作区包时，使用 `workspace:*` 版本以链接本地包：
  - 根或应用的 `package.json`：
    ```json
    {
      "dependencies": {
        "@pkg/ui": "workspace:*",
        "@pkg/core": "workspace:*"
      }
    }
    ```

## 安装与链接

- 在项目根目录执行安装：
  - `pnpm i`
- 若出现 `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`：
  - 检查 `pnpm-workspace.yaml` 是否包含 `packages/*`、`apps/*`、`docs`
  - 检查各包 `package.json` 的 `name` 是否与引用一致（如 `@pkg/ui`）

## 在应用中引用包

- 直接使用包名导入：
  - 示例（apps/admin）：
    ```ts
    import { installNotify } from '@pkg/ui'
    import { notifySuccess, notifyError, Modal, createModal } from '@pkg/ui'
    ```
- 若历史代码使用了别名（如 `@pkg/ui`），请全局替换为 `@pkg/ui`。

## 包内部导出与使用

- `@pkg/ui`：
  - 导出组件与工具函数，例如：`Button`、`Input`、`Modal`、`createModal`、`notifySuccess`、`notifyError`、`vuetify` 等
  - 需要在应用入口执行一次 `installNotify(app)`，以便通知能力继承应用上下文（包含 Vuetify 注入）
- `@pkg/core`：
  - 导出通用逻辑能力，如 `useCrud`、`useRequestErrorMessage`、常量与类型等

## 构建与开发

- 构建各包：
  - `pnpm --filter @pkg/ui run build`
  - `pnpm --filter @pkg/core run build`
- 启动应用（示例 admin）：
  - `pnpm --filter admin run dev`

## 常见问题

- 安装提示 Ignored build scripts
  - 这是 pnpm v10 的安全提示，若依赖需要执行构建脚本（如 esbuild、@swc/core 等），可执行：
    - `pnpm approve-builds`
- 组件类型与事件（TSX）
  - 某些从 UI 包 re-export 的组件在 TSX 下事件类型不完整，可在应用中使用 `as any` 进行断言，后续可在 UI 包完善类型导出。

## 约定与最佳实践

- 包名全小写，统一使用 `@pkg` 作用域
- 包内 `type` 设置为 `module`，并按需配置 `exports` 与入口文件
- 业务应用尽量通过 `@pkg/core` 与 `@pkg/ui` 提供的能力完成常见场景，避免在应用中重复造轮子