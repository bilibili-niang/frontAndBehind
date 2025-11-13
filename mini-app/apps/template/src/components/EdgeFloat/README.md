# EdgeFloat 边缘浮现组件

一个支持四个方向边缘浮现效果的React组件，具有美观的样式和丰富的配置选项。

## 特性

- 🎯 **四方向支持**: 支持上、下、左、右四个方向的边缘浮现
- 🎨 **美观样式**: 基于TailwindCSS，支持多种主题和样式配置
- 🔄 **双模式**: 支持浮动模式和静态模式
- ⚡ **高性能**: 优化的事件处理和动画效果
- 🎛️ **高度可配置**: 丰富的配置选项满足不同需求
- 📱 **响应式**: 自适应不同屏幕尺寸

## 基本用法

```tsx
import EdgeFloat from '@/components/EdgeFloat'

// 基本浮动组件
<EdgeFloat direction="top">
  <div>浮现内容</div>
</EdgeFloat>

// 静态组件
<EdgeFloat 
  direction="left" 
  mode="static" 
  defaultVisible={true}
>
  <div>静态内容</div>
</EdgeFloat>
```

## 属性配置

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ReactNode` | - | 子组件内容 |
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | - | 浮现方向 |
| `mode` | `'float' \| 'static'` | `'float'` | 组件模式 |
| `defaultVisible` | `boolean` | `false` | 默认显示状态（仅静态模式） |

### 样式配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `'light' \| 'dark' \| 'glass'` | `'light'` | 主题样式 |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | 圆角大小 |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'lg'` | 阴影效果 |
| `backdrop` | `boolean` | `false` | 背景遮罩 |
| `className` | `string` | `''` | 自定义样式类名 |

### 动画配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `animationDuration` | `number` | `300` | 动画持续时间（毫秒） |
| `threshold` | `EdgeThreshold` | `{}` | 边缘检测配置 |

### 事件回调

| 属性 | 类型 | 说明 |
|------|------|------|
| `onVisibilityChange` | `(visible: boolean) => void` | 显示状态变化回调 |

## EdgeThreshold 配置

```tsx
interface EdgeThreshold {
  triggerDistance?: number  // 触发距离（像素），默认10
  hideDelay?: number       // 隐藏延迟（毫秒），默认500
}
```

## 使用示例

### 1. 顶部通知栏

```tsx
<EdgeFloat 
  direction="top" 
  theme="light" 
  rounded="lg"
  shadow="xl"
>
  <div className="text-center">
    <h3>系统通知</h3>
    <p>您有新的消息</p>
  </div>
</EdgeFloat>
```

### 2. 侧边导航菜单

```tsx
<EdgeFloat 
  direction="left" 
  theme="glass" 
  backdrop={true}
  threshold={{ triggerDistance: 15, hideDelay: 300 }}
>
  <nav>
    <a href="#">首页</a>
    <a href="#">产品</a>
    <a href="#">服务</a>
  </nav>
</EdgeFloat>
```

### 3. 底部工具栏

```tsx
<EdgeFloat 
  direction="bottom" 
  theme="dark"
  animationDuration={400}
>
  <div className="flex gap-4">
    <button>保存</button>
    <button>取消</button>
  </div>
</EdgeFloat>
```

### 4. 静态侧边栏

```tsx
const [visible, setVisible] = useState(false)

<EdgeFloat 
  direction="right" 
  mode="static"
  defaultVisible={visible}
  onVisibilityChange={setVisible}
>
  <div>静态内容</div>
</EdgeFloat>
```

## 尺寸规则

- **上下方向**: 宽度为 `99vw`，高度自适应（最大 `80vh`）
- **左右方向**: 高度为 `99vh`，宽度自适应（最大 `80vw`）

## 注意事项

1. 组件使用 `fixed` 定位，确保在页面滚动时保持位置
2. 浮动模式下，鼠标离开边缘区域会自动隐藏组件
3. 悬停在组件上时会保持显示状态
4. 静态模式下组件表现为普通的相对定位元素
5. 建议在根组件或高层级组件中使用，避免被其他元素遮挡

## 演示页面

访问 `/edge-float-demo` 查看完整的演示和使用示例。