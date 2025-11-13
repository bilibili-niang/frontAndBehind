import { ref, type Ref } from 'vue'
import type { Schema } from '../types'

export interface SchemaFormModalOptions {
  title: string
  schema: Schema
  data?: any
  width?: number | string
  fullScreen?: boolean
  readonly?: boolean
  onChange?: (data: any) => void
  onOk?: (data: any) => Promise<any>
  onCancel?: () => void
}

export default function useSchemaFormModal(options: SchemaFormModalOptions) {
  // 这里需要根据实际项目中的实现来补充
  // 返回一个可以关闭模态框的函数
  return {
    close: () => {}
  }
}
