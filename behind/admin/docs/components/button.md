# 按钮组件

常用的按钮组件，支持多种类型和状态。

## 基础用法

```html
<Button>默认按钮</Button>
<Button type="primary">主要按钮</Button>
<Button type="success">成功按钮</Button>
<Button type="warning">警告按钮</Button>
<Button type="danger">危险按钮</Button>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 按钮类型 | 'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' | 'default' |
| size | 按钮大小 | 'small' \| 'medium' \| 'large' | 'medium' |
| disabled | 是否禁用 | boolean | false |
| loading | 是否加载中 | boolean | false |

## 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| click | 点击事件 | event: Event |
