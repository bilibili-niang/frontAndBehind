import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'

// 字段生成配置
export interface FieldSpec {
  // 与 zod 请求体保持一致，这里允许可选
  type?: string
  required?: boolean
  enum?: unknown[]
  enumAuto?: number | { size?: number } // 自动生成枚举候选数量
  generator?: string // 自定义生成器: 例如 'name', 'email'
  default?: unknown
  min?: number
  max?: number
  // children 在请求体中为 Record<string, unknown>，此处也放宽
  children?: Record<string, FieldSpec>
}

export interface DataSchemaSpec {
  type: 'object' | 'array'
  schema: { [key: string]: FieldSpec }
}

// 基础随机工具
const randInt = (min = 0, max = 1000) => Math.floor(Math.random() * (max - min + 1)) + min
const randPick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

// 轻量级生成器集合（可扩展）
const generators: Record<string, () => unknown> = {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  phone: () => faker.phone.number(),
  title: () => `${randPick(['高级','资深','初级','中级'])}${randPick(['工程师','产品经理','设计师','运营'])}`,
  url: () => faker.internet.url(),
}

// 将传入的字段规格标准化，兼容字符串和嵌套 object 写法
const normalizeFieldSpec = (field: unknown): FieldSpec => {
  if (field == null) return { type: 'string' }
  if (typeof field === 'string') return { type: field }
  // 兼容 { type: 'object', schema: {...} } 的写法
  const fieldObj = field as Record<string, unknown>
  if (typeof field === 'object' && fieldObj.type === 'object' && fieldObj.schema && typeof fieldObj.schema === 'object') {
    return { type: 'object', children: fieldObj.schema as Record<string, FieldSpec> }
  }
  return field as FieldSpec
}

// 基于类型或生成器，自动构造枚举候选集
const buildAutoEnumCandidates = (spec: FieldSpec): unknown[] => {
  const enumAuto = spec.enumAuto as number | { size?: number } | undefined
  const size = typeof enumAuto === 'number' ? enumAuto : (enumAuto?.size ?? 3)
  const makeOne = () => {
    const type = spec.type || 'string'
    if (spec.generator && generators[spec.generator]) return generators[spec.generator]()
    switch (type) {
      case 'string':
        return faker.lorem.word()
      case 'number':
        return faker.number.float({ min: spec.min ?? 0, max: spec.max ?? 1000 })
      case 'integer':
        return faker.number.int({ min: spec.min ?? 0, max: spec.max ?? 1000 })
      case 'boolean':
        return faker.datatype.boolean()
      case 'date':
        return faker.date.recent().toISOString()
      case 'uuid':
        return faker.string.uuid()
      default:
        return faker.word.sample()
    }
  }
  const set = new Set<unknown>()
  while (set.size < size) set.add(makeOne())
  return Array.from(set)
}

export const generateValue = (spec: FieldSpec): unknown => {
  if (!spec) return faker.word.sample()
  // 枚举优先（过滤掉 null/undefined），如果全是空则走后续逻辑
  if (Array.isArray(spec.enum)) {
    const candidates = spec.enum.filter(v => v !== null && v !== undefined)
    if (candidates.length > 0) return randPick(candidates)
  }
  // 自动枚举：当配置 enumAuto 时，先生成候选集再随机选
  if (spec.enumAuto) {
    const autoCandidates = buildAutoEnumCandidates(spec)
    if (autoCandidates.length > 0) return randPick(autoCandidates)
  }

  // default 仅在非 null/undefined 时生效；避免 default:null 产生空值
  if (spec.default != null) return spec.default
  if (spec.generator && generators[spec.generator]) return generators[spec.generator]()

  const type = spec.type || 'string'
  switch (type) {
    case 'string':
      return faker.lorem.word()
    case 'number':
      return faker.number.float({ min: spec.min ?? 0, max: spec.max ?? 1000 })
    case 'integer':
      return faker.number.int({ min: spec.min ?? 0, max: spec.max ?? 1000 })
    case 'boolean':
      return faker.datatype.boolean()
    case 'date':
      return faker.date.recent().toISOString()
    case 'uuid':
      return uuidv4()
    case 'object':
      return generateObject(spec.children || {})
    default:
      return faker.word.sample()
  }
}

export const generateObject = (schema: { [key: string]: FieldSpec }): Record<string, unknown> => {
  const obj: Record<string, unknown> = {}
  const keys = Object.keys(schema || {})
  if (keys.length === 0) return obj

  const requiredKeys: string[] = []
  const optionalKeys: string[] = []

  for (const key of keys) {
    const field = normalizeFieldSpec(schema[key])
    const must = field.required !== false
    if (must) requiredKeys.push(key)
    else optionalKeys.push(key)
  }

  // 先填充必填字段
  for (const key of requiredKeys) {
    const field = normalizeFieldSpec(schema[key])
    obj[key] = generateValue(field)
  }

  // 再处理可选字段（约 35% 概率省略）
  for (const key of optionalKeys) {
    if (Math.random() < 0.35) continue
    const field = normalizeFieldSpec(schema[key])
    obj[key] = generateValue(field)
  }

  // 防止所有字段被省略：如果当前无键且存在可选字段，强制至少保留一个
  if (Object.keys(obj).length === 0 && optionalKeys.length > 0) {
    const key = optionalKeys[Math.floor(Math.random() * optionalKeys.length)]
    const field = normalizeFieldSpec(schema[key])
    obj[key] = generateValue(field)
  }

  return obj
}

/**
 * 分页结果结构
 */
export interface PaginationResult {
  records: Record<string, unknown>[]
  total: number
  size: number
  current: number
  orders: unknown[]
  optimizeCountSql: boolean
  searchCount: boolean
  maxLimit: null
  countId: null
  pages: number
}

export const generateByDataSchema = (spec: DataSchemaSpec, count = 10): Record<string, unknown> | PaginationResult => {
  // 兼容 schema 写成 { type:'object', schema:{...} }
  const schemaObj = spec.schema as unknown as Record<string, unknown>
  const baseSchema: Record<string, FieldSpec> = schemaObj?.type === 'object' && schemaObj?.schema
    ? (schemaObj.schema as Record<string, FieldSpec>)
    : spec.schema

  if (spec.type === 'object') {
    return generateObject(baseSchema)
  }
  // 数组时遵循分页返回规范（类似 MyBatis-Plus）：
  // { records, total, size, current, orders, optimizeCountSql, searchCount, maxLimit, countId, pages }
  const size = count
  const records = Array.from({ length: size }).map(() => generateObject(baseSchema))
  const total = faker.number.int({ min: size, max: size * 50 })
  const current = 1
  const orders: unknown[] = []
  const optimizeCountSql = true
  const searchCount = true
  const maxLimit = null
  const countId = null
  const pages = Math.max(1, Math.ceil(total / size))

  return { records, total, size, current, orders, optimizeCountSql, searchCount, maxLimit, countId, pages }
}
