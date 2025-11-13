
import { VNodeProps } from 'vue'

declare module 'vue' {
  interface HTMLAttributes {
    // 拓展 disabled 属性
    disabled?: boolean
  }
}
