---
title: 环境与配置
---

# 环境与配置

本文整理开发/测试/生产环境的主要配置项、构建行为与代理设置，并介绍 `isTestDev()` 的使用。

## 运行端口与代理（admin）

在 `apps/admin/vite.config.ts` 中：

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

- 开发服务器默认运行在 `http://localhost:3300`
- 所有以 `/api` 开头的请求将代理到后端服务（本地 3279）

## 构建模式

`apps/admin/package.json`：

```json
{
  "scripts": {
    "build": "vite build",
    "build-test": "vite build --mode test"
  }
}
```

- `build`：生产构建（最小化压缩，禁用 sourcemap）
- `build-test`：测试构建（`minify: false`，`sourcemap: true`），便于定位问题

## 环境变量

主要通过 `VITE_APP_` 前缀在构建时注入，示例：

```ts
// apps/admin/vite.config.ts
const env = loadEnv(mode, process.cwd(), 'VITE_APP')
const VITE_APP_NAME = env.VITE_APP_NAME || ''
define: {
  'import.meta.env.VITE_APP_NAME': `"${VITE_APP_NAME || ''}"`
}
```

- `VITE_APP_NAME`：应用名称字符串，可用于标题或构建产物路径
- 其它变量按需扩展（如后端网关地址、场景常量等）

## 样式与主题

通过 Vite 的 SCSS `additionalData` 在 admin 中全局注入样式变量：

```ts
css: {
  preprocessorOptions: {
    scss: {
      additionalData: "@use '@anteng/styles/src/variables/index.scss' as *;"
    }
  }
}
```

`@anteng/ui` 内部使用 Ant Design Vue 的 `ConfigProvider` 设置统一样式前缀 `PREFIX_CLS`。

## isTestDev()（开发/测试辅助）

工具位置：`@anteng/utils`（`packages/utils/src/env.ts`）

作用：在开发或测试环境下返回 `true`；可选执行传入回调以统一异步判断。

签名：

```ts
declare function isTestDev<T extends boolean | Promise<boolean>>(
  checker?: () => T
): Promise<boolean> | boolean
```

使用示例（登录页快速登录）：

```ts
import { isTestDev } from '@anteng/utils'

if (await isTestDev()) {
  // 写入用户信息与 auth store，并跳转首页
}
```

> 注：`isTestDev()` 的环境判断规则为 `import.meta.env.DEV` 或 `import.meta.env.MODE === 'test'`。

## 常见问题

- 代理不生效？
  - 确认请求路径以 `/api` 开头，并检查 `vite.config.ts` 中的 `proxy.target`
- 构建产物过大？
  - 依赖拆包在 `vite.config.ts` 的 `manualChunks` 中配置了 `antd`、`vendor` 等分组，可按需扩展