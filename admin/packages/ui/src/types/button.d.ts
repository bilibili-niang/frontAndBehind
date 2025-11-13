import { HTMLAttributes } from 'vue'

// 导出 Button 组件的属性类型
export interface Button extends HTMLAttributes {
  color?: string
  variant?: 'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  loading?: boolean
  disabled?: boolean
  [key: string]: any
}

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    UiButton: typeof import('../components/button')['default']
  }
}
