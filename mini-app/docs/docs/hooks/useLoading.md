# useLoading 加载态

packages/core/src/hooks/useLoading/index.tsx

由于 Taro.showLoading 是无状态的，如果遇到多个独立异步任务需要加载时，很难处理加载结束的状态，所以须使用 `useLoading`、`useLoadingEnd` 来管理

## 使用
```ts
import { useLoading, useLoadingEnd } from '@pkg/core'

useLoading()
asyncFn1().finally(useLoadingEnd)

useLoading()
asyncFn2().finally(useLoadingEnd)

useLoading()
asyncFn3().finally(useLoadingEnd)

// 效果等同于 Promise.allSettled([...]).finally(useLoadingEnd)

```