# 快速开始

本指南帮助你在本地快速运行 anTeng 前端管理系统（monorepo 工作区）。

## 环境要求

- Node.js ≥ 18（建议 18/20 LTS）
- pnpm ≥ 8（项目 `packageManager` 使用 pnpm@10）
- Git

## 安装

### 1. 克隆项目

```bash
git clone <repository-url>
cd web-admin
```

### 2. 安装依赖（工作区）

```bash
pnpm i
```

> 若提示 Ignored build scripts，可执行 `pnpm approve-builds` 以允许相关依赖的构建脚本。

### 3. 启动 admin 应用

在项目根目录执行：

```bash
pnpm run admin:dev
# 等价：pnpm --filter ./apps/admin dev
```

默认会在 `http://localhost:3300` 启动开发服务器（`apps/admin/vite.config.ts` 中可配置）。

## 构建与预览

- 测试构建（保留 sourcemap、禁用压缩）：

```bash
pnpm run admin:build:test
```

- 生产构建：

```bash
pnpm run admin:build:prod
```

- 预览构建产物：

```bash
pnpm --filter ./apps/admin preview
```

## 环境变量与代理

开发期间主要使用以 `VITE_APP_` 前缀的变量：

- `VITE_APP_NAME`：应用名称（在构建时注入，用于路径/标题等）
- 其它按需变量请参见各应用/包的读取逻辑

开发代理在 `apps/admin/vite.config.ts` 中配置：

```ts
server: {
  port: 3300,
  proxy: {
    '/api': {
      target: 'http://localhost:3279',
      changeOrigin: true
    }
  }
}
```

## 快速登录（开发/测试环境）

为提升联调效率，登录页内置了 `isTestDev()` 快速登录逻辑：

- 在未填写账号/验证码的情况下点击“登录”，若当前为开发或测试环境，将：
  - 写入预设的 `userStore.userInfo`
  - 设置本地 token（`localStorage`）并同步 admin 侧 `auth` store
  - 直接跳转到首页（`/home`）

该逻辑位于 `packages/core/src/views/login/index.tsx`，环境判断与外部使用参考 `@anteng/utils` 的 `isTestDev()`。

## 下一步

- [项目结构](./project-structure.md)
- [认证与登录](./auth-and-login.md)
- [环境与配置](./env-config.md)
- [路由生成与配置](./routing.md)