import { warn } from '@/config/log4j'

/**
 * 响应体结构
 */
export interface ResponseBody {
  code: number
  msg: string
  success: boolean
  data: unknown
}

/**
 * 请求体参数
 */
export interface RequestBody {
  code?: number
  msg?: string
  success?: boolean
  data?: unknown
}

/**
 * 校验器函数类型
 */
export type ValidatorFunction = (value: unknown) => boolean

/**
 * 参数类型定义
 */
export interface ParamTypeDefinition {
  required?: boolean
  validator?: ValidatorFunction
}

/**
 * 校验结果
 */
export interface ValidationResult {
  result: Record<string, unknown>
  missing: string[]
  invalid: Record<string, string>
  extra: string[]
}

// 对返回的响应状态进行规范
/**
 * 强制传入的数据返回指定的格式
 * @param requestBody 请求体
 * @returns 规范化的响应体
 */
export const ctxBody = (requestBody: RequestBody): ResponseBody => {
  const hopeResult: ResponseBody = {
    code: 500,
    msg: '响应失败辣',
    success: false,
    data: {}
  }
  return Object.assign(hopeResult, requestBody)
}

/**
 * 对传入的对象进行简单的校验
 * @param params 目标参数
 * @param paramType 模板参数
 * @returns 校验结果
 */
export const checkDesign = (
  params: Record<string, unknown>,
  paramType: Record<string, ParamTypeDefinition>
): Promise<ValidationResult> => {
  return new Promise((resolve, reject) => {
    try {
      const result: Record<string, unknown> = {}
      const missing: string[] = []
      const invalid: Record<string, string> = {}

      // 遍历模板参数，检查目标参数是否包含对应的键并验证其值
      for (const key in paramType) {
        if (Object.prototype.hasOwnProperty.call(paramType, key)) {
          const { required = true, validator } = paramType[key]
          const value = params[key]
          if (required && (value === undefined || value === null || (typeof value === 'string' && value.trim() === ''))) {
            missing.push(key)
          } else if (validator && value !== undefined && !validator(value)) {
            invalid[key] = `Invalid value for ${key}`
          } else if (value !== undefined) {
            result[key] = value
          }
        }
      }

      // 检查是否有额外的参数
      const extra: string[] = Object.keys(params).filter(key => !(key in paramType))

      // 使用 Object.assign 将结果和缺失项、无效项合并到一个对象中
      const response: ValidationResult = { result, missing, invalid, extra }

      // 如果有缺失或无效的参数，可以根据业务逻辑决定是抛出错误还是简单地返回它们
      if (missing.length > 0 || Object.keys(invalid).length > 0 || extra.length > 0) {
        warn(`Validation issues: ${JSON.stringify({ missing, invalid, extra })}`)
      }

      resolve(response)
    } catch (error) {
      reject(error)
    }
  })
}
