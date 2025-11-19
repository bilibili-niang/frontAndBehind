# usePopup 创建弹出层

## 使用

```ts
usePopup({
  content: <组件 />,
  maskClosable: false,
  placement: 'center'
})
```

## PopupOptions

| 参数         | 说明             | 类型    | 默认值 | 可选值              |
| ------------ | ---------------- | ------- | ------ | ------------------- |
| content      | 弹出层内容       | any     |        |                     |
| maskClosable | 点击遮罩层可关闭 | boolean | true   |                     |
| placement    | 弹出位置         | string  | center | top／center／bottom |
