---
title: 认证与登录
---

# 认证与登录

本文说明 admin 应用的认证流、路由守卫与弹窗登录机制，并给出在开发/测试环境下的快速登录用法。

## 核心组成

- `useAuthStore`（apps/admin/src/store/auth.ts）：管理 token 与登录态，提供初始化与设置方法
- 路由守卫（apps/admin/src/router/index.ts）：在目标路由需要登录时拦截，弹出登录窗口
- 登录弹窗（apps/admin/src/components/auth/LoginModal.tsx）：输入信息后调用登录接口，成功后通知并恢复导航
- 登录成功通知（apps/admin/src/composables/authFlow.tsx）：`notifyLoginSuccess()` 负责关闭弹窗并跳转到之前记录的路径

## 登录守卫流程

1. 访问需要登录的页面（`to.meta.requiresAuth` 为 true）
2. 若未登录，守卫记录目标地址并打开登录弹窗，阻止本次导航
3. 登录成功后调用 `notifyLoginSuccess()`，关闭弹窗并跳转到记录的地址

相关代码位置：

- 守卫：`apps/admin/src/router/index.ts`
- 弹窗：`apps/admin/src/components/auth/LoginModal.tsx`
- 通知：`apps/admin/src/composables/authFlow.tsx`

## 设置登录态

登录成功后应写入 `auth` store 并可选写入用户信息：

```ts
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
auth.setAuth({
  token: 'xxx',       // 后端返回的 token
  user: {             // 可选：用户基本信息
    id: '1001',
    name: '管理员',
    account: 'admin'
  }
})
```

若从本地恢复登录态，应用入口会执行 `initFromLocal()`：

```ts
// apps/admin/src/main.ts
useAuthStore().initFromLocal()
```

## 开发/测试环境快速登录

为提升联调效率，系统提供 `isTestDev()` 环境判断工具（来自 `@anteng/utils`）。

在 `packages/core/src/views/login/index.tsx` 的处理逻辑中，当未输入账号/验证码且当前为开发或测试环境时，将：

- 写入预设的 `userStore.userInfo`
- 将 `dev-token` 写入本地存储并调用 `useAuthStore().setAuth(...)`
- 显示“测试环境登录成功”，并跳转到 `/home`

示例（节选）：

```ts
import { isTestDev } from '@anteng/utils'
import useUserStore from '../../stores/user'
import { useAuthStore } from '@/store/auth'

if (await isTestDev()) {
  const userStore = useUserStore()
  userStore.userInfo = {
    id: '1001',
    name: '开发用户',
    account: 'dev'
  } as any

  localStorage.setItem('Blade-Auth', 'dev-token')
  useAuthStore().setAuth({ token: 'dev-token', user: userStore.userInfo })
  router.replace('/home')
}
```

## 与后端登录接口集成

登录弹窗中通常会调用后端登录接口（例如 `$login`），在返回成功后：

```ts
import { $login } from '@/api'
import { notifyLoginSuccess } from '@/composables/authFlow'
import { useAuthStore } from '@/store/auth'

const { token, user } = await $login({ account, password })
useAuthStore().setAuth({ token, user })
notifyLoginSuccess()
```

以上流程将关闭弹窗、执行等待队列并恢复到登录前的目标路由。

## 常见问题

- 点击登录后没有跳转？
  - 确认是否设置了 `auth` store 的 `token`；路由守卫依赖该状态判断是否已登录。
- 如何在页面内主动退出？
  - 调用 `useAuthStore().logout()` 或使用 core 包内相关逻辑，并在 `userStore.logout()` 中会跳转到登录页。