// 统一错误格式化，避免直接返回字符串 message
// 兼容 Zod/koa-swagger-decorator 的错误结构（issues 或 errors）
export const formatError = (err: any) => {
  try {
    const issues: any[] = Array.isArray(err?.issues)
      ? err.issues
      : (Array.isArray(err?.errors) ? err.errors : [])

    if (issues.length > 0) {
      const first = issues[0] || {}
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
    const message = err?.message || '服务器内部错误'
    return { message, issues: [], detail: { name: err?.name } }
  } catch (_) {
    return { message: '服务器内部错误', issues: [], detail: {} }
  }
}