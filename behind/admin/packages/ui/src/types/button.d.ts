import { HTMLAttributes } from 'vue'

// 导出 Button 组件的属性类型
export interface Button extends Omit<HTMLAttributes, keyof VBtn> {
  // 这里可以添加 Vuetify 的 VBtn 特定属性
  color?: string
  variant?: 'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  loading?: boolean
  disabled?: boolean

  // 允许其他任意属性
  [key: string]: any
}

// 声明全局组件类型
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    UiButton: typeof import('../components/button')['default']
  }
}
