---
title: ScrollContainer
---

# ScrollContainer

一个轻量的滚动容器组件，基于 `simplebar-vue` 封装，提供更一致的滚动体验与样式控制。用于页面主体、侧栏面板、列表区等需要“内部滚动”的场景。

## 快速使用

```vue
<template>
  <!-- 让容器占满可滚动空间，高度通常由父容器控制 -->
  <ScrollContainer class="main-scroll" :thickness="8" :autoHide="false">
    <div style="height: 1200px; padding: 12px;">
      内容区域（超出高度时可滚动）
    </div>
  </ScrollContainer>
  <!-- 父容器示例：.bottom-content { height: calc(100vh - 44px); overflow: hidden; } -->
  <!-- .main-scroll { height: 100%; } -->
</template>

<script setup lang="ts">
import { ScrollContainer } from '@anteng/ui'
</script>
```

TSX 示例：

```ts
import { defineComponent } from 'vue'
import { ScrollContainer } from '@anteng/ui'

export default defineComponent(() => {
  return () => (
    <ScrollContainer class="main-scroll" thickness={8} autoHide={false}>
      <div style={{ height: '1200px', padding: '12px' }}>内容</div>
    </ScrollContainer>
  )
})
```

## Props

- `autoHide?: boolean`：是否自动隐藏滚动条，默认 `true`。
- `thickness?: number | string`：滚动条粗细，默认 `6`。数字按 `px` 处理，也可传入字符串（如 `"8px"`、`"0.5rem"`）。

其余属性（如 `class`、`style`、`id` 等）会原样传递到内部的 `SimpleBar` 组件上。

## 插槽

- 默认插槽：滚动容器的内容。

## 实例方法

通过 `ref` 获取组件实例，调用内部暴露的辅助方法：

```vue
<template>
  <div class="wrap">
    <div class="toolbar">
      <Button @click="scrollTop">回到顶部</Button>
      <Button @click="forceRecalc">重新计算</Button>
    </div>
    <ScrollContainer ref="scRef" class="main-scroll" :thickness="8" :autoHide="false">
      <div style="height: 1600px;">长内容...</div>
    </ScrollContainer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button, ScrollContainer } from '@anteng/ui'

const scRef = ref<InstanceType<typeof ScrollContainer> | null>(null)

// 获取内部原生滚动元素并滚动到顶部
const scrollTop = () => {
  const el = scRef.value?.getScrollElement?.()
  el?.scrollTo({ top: 0, behavior: 'smooth' })
}

// 当容器尺寸或内容结构变化时，调用以重新计算滚动条
const forceRecalc = () => scRef.value?.recalc?.()
</script>
```

## 样式与行为

- 组件会在根元素上添加类名 `at-scrollbar`，并通过 CSS 变量 `--sb-thickness` 控制粗细（由 `thickness` 生成）。
- 需要“父容器设定高度 + 子容器填满”的布局来启用内部滚动：
  - 父容器建议设置 `overflow: hidden`，防止出现页面双滚动条。
  - 给 `ScrollContainer` 添加 `height: 100%`（如示例中的 `.main-scroll`）。
- 暗色主题自动适配滚动条色彩（依赖全局主题变量）。

示例（与主布局结合）：

```scss
.bottom-content {
  height: calc(100vh - 44px);
  display: flex;
  flex-direction: column;
  overflow: hidden; // 使用 ScrollContainer 控制滚动
}
.bottom-content .main-scroll {
  height: 100%;
}
```

## 使用建议

- 页面主体：在主内容区用 `ScrollContainer` 包裹 `RouterView` 或页面内容，保证导航与顶部栏固定，内部滚动更顺滑。
- 侧栏面板：属性面板、图层列表等（示例见 `packages/decoration` 内的使用）。
- 内容变更后调用 `recalc()`：当动态增删大量节点、容器尺寸变化时，调用以保证滚动条位置与长度正确。

## 常见问题

- “为什么没滚动？”：确保父容器限定了可用高度，并给 `ScrollContainer` 设置 `height: 100%` 或具体高度。
- “滚动条太细/太粗？”：通过 `thickness` 调整，也可传入字符串单位。
- “原生滚动条和自定义叠在一起？”：父容器请使用 `overflow: hidden`，只让 `ScrollContainer` 负责滚动。

## 参考

- 组件实现：`packages/ui/src/components/scrollContainer/index.tsx`
- 演示页面：`apps/admin/src/views/components-preview/scrollContainer/index.tsx`