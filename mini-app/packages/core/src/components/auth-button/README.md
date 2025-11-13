# AuthButton

带权限控制的按钮组件。运行时通过 `withPermission` 判断是否有权限，并在无权限时支持隐藏或禁用的降级展示；开发模式下会将 `perm/label/pagePath` 等信息采集到 `window.__null_PERMISSIONS__`，供权限扫描器使用。

- 组件路径：`packages/core/src/components/auth-button/index.tsx`
- 完整文档：参见文档站点 `/dev/components/auth-button`

## 最小示例

```text
import { AuthButton } from '@anteng/core'

&lt;AuthButton
  type="primary"
  perm="goods.list.create"
  label="新建商品"
  pagePath="/goods/list"
  onClick={handleCreate}
&gt;
  新建商品
&lt;/AuthButton&gt;
```

## 关键 Props 概要
- `perm` (必填)：`string | string[] | { and?: string[]; or?: string[] }`
  - `string[]` 默认 AND 逻辑；对象写法中 `and` 优先于 `or`。
- `hiddenMode`：`'hide' | 'disable'`，默认 `'hide'`。
- `label`：按钮文案，用于采集权限点；未提供时尝试使用插槽文本。
- `pagePath`：所属页面路径，用于采集权限点；未提供时 fallback 为 `window.location.pathname`。
- 其余属性均透传 `@anteng/ui` 的 `Button`（如 `type/size/danger/onClick` 等）。

## 环境变量
- `VITE_APP_USE_BUTTON_PERMISSION='false'`：跳过权限控制，等同原生 `Button` 渲染。
- `VITE_APP_PERMISSION_PREFIX`：未配置则默认放行；配置后会为不含前缀的权限码自动补前缀。

更多用法、最佳实践、与权限扫描器的协同请查看文档站点：`/dev/components/auth-button`。
