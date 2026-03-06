/**
 * Zod Issue 结构
 */
export interface ZodIssue {
  message: string
  path: (string | number)[]
  code?: string
}

/**
 * 格式化后的错误结构
 */
export interface FormattedError {
  message: string
  issues: ZodIssue[]
  detail: Record<string, unknown>
}

/**
 * 错误对象类型
 */
export type ErrorInput = Error | Record<string, unknown> | unknown

// 统一错误格式化，避免直接返回字符串 message
// 兼容 Zod/koa-swagger-decorator 的错误结构（issues 或 errors）
export const formatError = (err: ErrorInput): FormattedError => {
  try {
    const errorObj = err as Record<string, unknown>
    const issues: ZodIssue[] = Array.isArray(errorObj?.issues)
      ? (errorObj.issues as ZodIssue[])
      : (Array.isArray(errorObj?.errors) ? (errorObj.errors as ZodIssue[]) : [])

    if (issues.length > 0) {
      const first = issues[0] || {} as ZodIssue
      const message = first?.message || '参数校验失败'
      const path = first?.path || []
      const code = first?.code
      return {
        message,
        issues,
        detail: { path, code }
      }
    }

    // 非校验错误，尽量保留原始信息
    const message = errorObj?.message as string || '服务器内部错误'
    return { message, issues: [], detail: { name: errorObj?.name } }
  } catch (_) {
    return { message: '服务器内部错误', issues: [], detail: {} }
  }
}
