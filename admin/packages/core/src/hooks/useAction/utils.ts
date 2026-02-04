import type { Schema } from '@pkgjsf'

export type ActionDefine = {
  key: string
  title: string
  icon?: string
  schema?: Schema
  default?: Record<string, any>
  handler?: (config?: any) => void
  preview?: (props: { config: any }) => any
}

export const defineAction = (action: ActionDefine) => {
  return action
}
