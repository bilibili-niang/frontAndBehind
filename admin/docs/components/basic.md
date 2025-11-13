---
title: 基础组件
---

# 基础组件

这里收录项目中常用的基础组件使用示例与建议。

## 概述

`@anteng/ui` 在 Ant Design Vue 之上封装了常用基础组件，统一样式前缀与交互体验。以下为二次封装并对外导出的组件清单（按类别分组）：

基础输入与选择
- Button
- Input
- InputNumber
- Select
- Switch
- Slider
- Tag

布局与交互
- Tabs
- Modal
- ScrollContainer
- ScrollTab（含 `ScrollTabItem`）
- PropertyTabs

数据与展示
- Empty
- List / ListItem / ListItemTitle / ListItemSubtitle
- InfoList
- JsonView
- SourceView
- Icon

主题与工具
- ThemeSwitch
- ConfigProvider
- message

其他与兼容
- Result（占位导出）
- DeckImage（装修相关组件）
- 同时直接 re-export Ant Design Vue 的组件与类型：`export * from 'ant-design-vue'`

说明
- 所有以上组件均基于 Ant Design Vue 封装，保持官方 API 兼容；你可以直接使用官方文档中的 Props/事件/插槽等能力。
- 封装仅做统一样式前缀、主题变量与少量便捷增强，不影响现有用法。

## 官方文档链接

- Ant Design Vue（中文）：https://antdv.com/components/overview-cn
- Ant Design Vue（英文）：https://antdv.com/components/overview
- 兼容说明：本库对外同时 `export * from 'ant-design-vue'`，可直接使用官方组件与类型。

## 扩展组件说明

- `ScrollContainer`：基于 `simplebar-vue` 的轻量滚动容器，统一滚动样式与行为。
- `ScrollTab`/`ScrollTabItem`：可横向滚动的标签栏，适合标签较多的场景。
- `PropertyTabs`：属性面板标签页封装，用于配置表单或属性分组。
- `InfoList`：信息列表展示组件，适合以行/列呈现业务字段。
- `JsonView`：JSON 数据查看器，支持折叠与高亮。
- `SourceView`：源码/文本查看器，配合示例页面展示代码片段。
- `ThemeSwitch`：主题切换控件，统一项目的暗/亮主题开关。
- `Icon`：统一图标封装，兼容项目内自定义图标体系。
- `message`：消息提示的封装，保持一致的样式与调用入口。
- `DeckImage`：装修相关图片组件（装饰模块专用）。

源码位置参考：`web-admin/packages/ui/src/components/*` 与 `web-admin/packages/ui/src/deck/*`。

## 示例

```vue
<template>
  <Button type="primary">确定</Button>
  <Input v-model:value="text" placeholder="请输入" />
  <Switch />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button, Input, Switch } from '@anteng/ui'

const text = ref('')
</script>
```

后续将补充更完整的属性说明与最佳实践。