import { VNode } from 'vue'

/**
 * 边缘浮现方向
 */
export type EdgeDirection = 'top' | 'bottom' | 'left' | 'right'

/**
 * 浮动模式
 */
export type FloatMode = 'float' | 'static'

/**
 * 边缘检测阈值配置
 */
export interface EdgeThreshold {
  /** 触发距离（像素） */
  triggerDistance?: number
  /** 隐藏延迟（毫秒） */
  hideDelay?: number
}

/**
 * EdgeFloat组件属性
 */
export interface EdgeFloatProps {
  /** 子组件内容 */
  children?: VNode | VNode[] | string
  
  /** 浮现方向 */
  direction?: EdgeDirection

  /** 模式：浮动/静态 */
  mode?: FloatMode

  /** 静态模式默认是否可见 */
  defaultVisible?: boolean

  /** 边缘检测阈值配置 */
  threshold?: EdgeThreshold

  /** 自定义类名 */
  className?: string

  /** 动画时长（毫秒） */
  animationDuration?: number

  /** 是否显示背景遮罩 */
  backdrop?: boolean

  /** 圆角 */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

  /** 阴影 */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

  /** 主题 */
  theme?: 'light' | 'dark' | 'glass'

  /** 边缘提示是否开启 */
  hint?: boolean

  /** 提示条长度（px），top/bottom为宽度，left/right为高度 */
  hintLength?: number

  /** 提示条厚度（px），top/bottom为高度，left/right为宽度 */
  hintThickness?: number

  /** 提示条颜色类名（例如 bg-blue-500） */
  hintColor?: string

  /** 光晕覆盖范围（百分比 0-100），默认30% */
  hintCoverage?: number

  /** 光晕模糊强度（px），默认14 */
  hintBlur?: number

  /** 光晕动画时长（毫秒），默认2800 */
  hintAnimationDuration?: number

  /** 可见性变化回调 */
  onVisibilityChange?: (visible: boolean) => void
}

/**
 * 位置样式
 */
export interface PositionStyles {
  container: string
  content: string
  transform: {
    visible: string
    hidden: string
  }
}