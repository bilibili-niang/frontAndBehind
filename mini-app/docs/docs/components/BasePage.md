# BasePage 基础页面

## 简介
由于小程序技术方案限制，各页面之间无法共用组件。

Loading、Toast、Modal 等都需要在每个页面单独引入使用

BasePage 组件解决了这一痛点，并支持使用 hooks 来处理 UI 事务

## 使用

```tsx
import { BasePage } from '@anteng/core'

<BasePage>
  {/* 页面内容 */}
</BasePage>

```

## Hooks
如果你要使用以下 Hooks 必须确保该页面内已经引入了 BasePage 组件

- useLogin  弹出登录弹窗
- usePopup  创建空白弹窗

## 注意事项
请勿在非页面组件内引入，否则可能导致意外问题发生。