# 输入框组件

常用的输入框组件，支持多种类型和状态。

## 基础用法

```html
<Input placeholder="请输入内容" />
<Input type="password" placeholder="请输入密码" />
<Input disabled placeholder="禁用状态" />
<Input clearable placeholder="可清空" />
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 输入框类型 | string | 'text' |
| value | 绑定值 | string | - |
| placeholder | 占位文本 | string | - |
| disabled | 是否禁用 | boolean | false |
| clearable | 是否可清空 | boolean | false |
| showPassword | 是否显示切换密码可见性 | boolean | false |
| maxlength | 最大输入长度 | number | - |
| showWordLimit | 是否显示输入字数统计 | boolean | false |

## 事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| input | 输入时触发 | (value: string) => void |
| change | 值改变时触发 | (value: string) => void |
| focus | 获取焦点时触发 | (event: Event) => void |
| blur | 失去焦点时触发 | (event: Event) => void |
| clear | 点击清空按钮时触发 | () => void |
