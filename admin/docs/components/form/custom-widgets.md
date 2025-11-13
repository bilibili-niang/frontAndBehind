# 自定义 Widget（SchemaForm）

SchemaForm 支持以字符串、组件或函数三种方式指定控件。你可以在主题中注册命名控件，或直接在 Schema 中内联传入组件/函数。

## 三种写法

- 字符串：使用主题内已注册的组件。

> 支持的控件（按主题分类）

- standard：
  - 基础：`string`、`input(=string)`、`number`、`boolean`、`switch(=boolean)`、`textarea`、`color`、`fill`
  - 选择：`select`、`radio`、`radio-button`、`tree-select`、`cities`
  - 时间：`time`、`time-range`、`time-picker`、`date-picker`、`day-picker`、`range-picker`、`date-range`
  - 文件与媒体：`file`、`file-uploader`、`image`、`images`、`audio`、`video`
  - 对象与数组：`object`、`group`、`suite`、`array`、`list`
  - 业务扩展：`address-selector`、`rich-text`、`tag`、`contracts`、`action`

- compact：
  - 基础：`string`、`input(=string)`、`number`、`boolean`、`switch(=boolean)`、`textarea`、`color`、`fill`
  - 选择：`select`、`radio-button`
  - 文件与媒体：`file`、`image`、`audio`、`video`
  - 对象与数组：`object`、`group`、`suite`、`array`
  - 布局与装饰：`border-radius`、`padding`、`menu`
  - 扩展：`slider`、`rich-text`、`action`、`action-image`

说明：`input -> string`、`switch -> boolean` 为别名；当 `widget` 为空时，会根据 `schema.type` 自动选择默认控件。

```ts
// 主题已注册 'string'、'select'、'date-picker' 等
properties: {
  name: { title: '名称', type: 'string', widget: 'string', config: { placeholder: '请输入名称' } }
}
```

- 组件：传入实现了 `CommonWidgetPropsDefine` 的 Vue 组件。

```ts
import { defineComponent } from 'vue'
import { Input } from '@anteng/ui'
import { CommonWidgetPropsDefine } from '@anteng/jsf'

const MyInput = defineComponent({
  name: 'MyInput',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => (
      <Input {...props.config} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
    )
  }
})

// 在 Schema 中使用
properties: {
  name: { title: '名称', type: 'string', widget: MyInput }
}
```

- 函数：传入函数式控件，接收同样的属性。

```ts
properties: {
  name: {
    title: '名称',
    type: 'string',
    widget: (props) => <Input {...props.config} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
  }
}
```

## 注册命名控件

若希望在多个页面复用并通过字符串引用，建议在主题中注册：

```ts
import { registerWidget } from '@anteng/jsf'

registerWidget('my-input', MyInput) // 同时注册到 standard/compact 两个主题
// 或者仅注册到某个主题：registerWidget('my-input', MyInput, 'standard')

// 使用
properties: { name: { title: '名称', type: 'string', widget: 'my-input' } }
```

## 主题与切换

SchemaForm 内置两种主题，用于适配不同的使用场景与展示风格：

- standard（标准）：更适合通用业务表单，标签与说明常规展示，控件间距较为舒适；内置字段类型更完整（如时间范围、富文本、合同等）。
- compact（紧凑）：更适合设置面板/设计器这类密度高的界面，标签采用下划线样式，字段说明通过浮层弹出，整体更紧凑；包含布局/装饰类控件（如圆角、边距、菜单等）。

使用：

```tsx
// 默认是 standard
<SchemaForm theme="standard" schema={schema} value={form} />

// 切换为紧凑主题
<SchemaForm theme="compact" schema={schema} value={form} />
```

注册到指定主题：

```ts
import { registerWidget, registerTheme, type Theme } from '@anteng/jsf'

// 控件注册到某个主题
registerWidget('my-input', MyInput, 'standard')

// 自定义主题（可选）
const myTheme: Theme = {
  name: 'my',
  widgets: {},            // 该主题的控件集合
  presetSchema: {},       // 该主题的预设 Schema（通过字符串名称引用）
  pureWidgets: []         // 纯控件列表（仅渲染控件，不渲染 label 等）
}
registerTheme('my', myTheme)
// 使用：<SchemaForm theme="my" .../>
```

说明：
- `theme` 支持字符串主题名或完整 `Theme` 对象；未设置时默认为 `standard`。
- 在某些独立上下文中（例如仅渲染控件），会自动回退到紧凑主题以保证展示正常。

## 组件通用 Props（CommonWidgetPropsDefine）

- `path`：字段路径，如 `root.a.b`。
- `value`：字段值。
- `rootValue`：表单根值。
- `schema`/`rootSchema`：当前/根 Schema。
- `onChange(value)`：值变更。
- `config`：控件自定义配置，透传。
- `errorSchema`：校验错误信息。

## 读取配置

主题内置工具 `getWidgetConfig(schema, 'xxx')` 可从 `schema.config.xxx` 中读取并做安全处理；也可直接使用 `props.config`。

## 控制控件实例

在字段的 `config` 中可传入 `widgetRef`，以便外部通过 ref 获取控件实例（若控件主动暴露方法）：

```ts
const refObj = { ref: null as any }
properties: {
  name: { title: '名称', type: 'string', config: { widgetRef: refObj } }
}
// 在控件内部暴露：expose({ focus() { ... } })
```

## 主题与内置控件

### standard（标准）
- 基础：`string`、`input(=string)`、`number`、`boolean`、`switch(=boolean)`、`textarea`、`color`、`fill`
- 选择：`select`、`radio`、`radio-button`、`tree-select`、`cities`
- 时间：`time`、`time-range`、`time-picker`、`date-picker`、`day-picker`、`range-picker`、`date-range`
- 文件与媒体：`file`、`file-uploader`、`image`、`images`、`audio`、`video`
- 对象与数组：`object`、`group`、`suite`、`array`、`list`
- 业务扩展：`address-selector`、`rich-text`、`tag`、`contracts`、`action`

### compact（紧凑）
- 基础：`string`、`input(=string)`、`number`、`boolean`、`switch(=boolean)`、`textarea`、`color`、`fill`
- 选择：`select`、`radio-button`
- 文件与媒体：`file`、`image`、`audio`、`video`
- 对象与数组：`object`、`group`、`suite`、`array`
- 布局与装饰：`border-radius`、`padding`、`menu`
- 扩展：`slider`、`rich-text`、`action`、`action-image`

### 说明
- 别名：`input -> string`、`switch -> boolean`。
- 纯控件（不渲染 label 等）：standard：`object`、`array`、`group`、`list`；compact：`object`、`array`、`group`、`menu`。
- 当 `widget` 为空时，会根据 `schema.type` 自动选择默认控件。