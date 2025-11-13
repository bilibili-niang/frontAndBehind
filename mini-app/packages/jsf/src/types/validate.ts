import type { Schema } from './schema'

/** 自定义校验器 */
export type SchemaValidator =
  | string
  | {
      /**
       * 校验函数，可以使用已注册校验器（主要为了重写错误信息）
       * 支持异步校验，返回 Promise
       */
      name?: string
      compile: string | ((value: any) => boolean | Promise<boolean>)

      /** 错误内容支持字符串、VNode */
      message: string | ((title: string, value: any) => any)

      /** 校验状态，归属于 “错误” 或 “警告”，默认 error */
      status?: 'error' | 'warn'

      /** 格式化数据 */
      format?: (value: any) => any
    }

/** 校验结果 */
export type SchemaValidateResult = {
  path: string
  valid: boolean
  schema: Schema
  errors: {
    /** 校验结果，null 表示未进行校验 */
    valid: boolean | null
    /** 校验状态 */
    status: 'error' | 'warn'
    /** 校验描述信息，可能是字符串或组件 */
    message: any
  }[]
}
