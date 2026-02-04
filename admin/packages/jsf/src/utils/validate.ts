// TODO 支持局部刷新校验，例：Object、Array 的 hidden 值更新后，删除子项错误。
// 可以监听 Schema 变动，重新计算 validatorMap，然后过滤掉多余的错误。

import { shallowRef, toRaw, watch } from 'vue'
import type { Schema } from '../types/schema'
import type { SchemaValidateResult, SchemaValidator } from '../types/validate'
import jsonPath from 'jsonpath'
import type { PropsArg } from './field'
import { validateBankCardNumber, validateDate, validateEmail } from '@pkg/utils'

/** string 类型只适用于外部使用定义，排除 */
type SchemaValidatorDefine = Exclude<SchemaValidator, string>

/** 已注册校验器 */
const registeredValidators: Record<string, SchemaValidatorDefine> = {
  required: {
    compile: (value) => {
      return !isEmpty(value)
    },
    message: (title, value) => {
      return `必需，不能为空`
    }
  },
  phone: {
    compile: (value) => {
      return /^1[3456789]\d{9}$/.test(value)
    },
    message: '不符合手机号格式'
  },
  date: {
    compile: (value) => {
      return validateDate(value)
    },
    message: '不符合 YYYY-MM-DD 日期格式'
  },
  email: {
    compile: (value) => validateEmail(value),
    message: '不符合电子邮箱格式'
  },
  bankCardNumber: {
    compile: (value) => validateBankCardNumber(value),
    status: 'warn',
    message: '这可能不是正确的银行账号，请核验'
  }
}

const isEmpty = (value: any) => {
  if (value === undefined || value === null) {
    return true
  }
  if (value === '') {
    return true
  }
  if (Number.isNaN(value)) {
    return true
  }
  if (Array.isArray(value) && value.length === 0) {
    return true
  }
  return false
}

/**
 * 生成校验器，
 * form-item 在 setup 阶段将 validator 解析成一个工厂函数备用，onChange 阶段执行函数进行校验，而不是每次 onChange 都需要先解析后才能校验。
 */
export const useValidate = (props: PropsArg) => {
  const schema = props.schema

  const resultRef = shallowRef<SchemaValidateResult>({
    path: '',
    valid: true,
    schema: props.schema,
    errors: []
  })

  const validators = retrieveValidators(schema, props.rootValue, props.path)
  const validate: (value: any) => SchemaValidateResult = (value: any) => {
    let errors = [] as SchemaValidateResult['errors']

    if (!schema.required && isEmpty(value)) {
      // 非必填时，如果值为空也不进行校验
      errors = []
    } else {
      errors = validators
        .map((item) => {
          const itemValidator = item as SchemaValidatorDefine
          return {
            path: props.path,
            validator: itemValidator,
            valid: validateValue(value, itemValidator),
            status: itemValidator.status ?? 'error',
            message: formatValidateMessage(schema.title!, value, itemValidator.message)
          }
        })
        .filter((item) => !item.valid)
    }

    const result = {
      path: props.path,
      schema: schema,
      // warn 仅作为警告，并不会影响校验通过
      valid: errors.filter((item) => item.status === 'error').length === 0,
      errors: errors
    }
    resultRef.value = result

    if (props.errorSchema) {
      if (result.valid) {
        delete props.errorSchema.errorMap[props.path]
      } else {
        props.errorSchema.errorMap[props.path] = result
      }
      props.errorSchema.valid = !Object.values(props.errorSchema.errorMap).find((item) => !item.valid)
    }

    return result
  }

  const setResult = (res: SchemaValidateResult) => {
    resultRef.value = res
  }

  watch(
    () => props.errorSchema?.errorMap[props.path],
    () => {
      const res = props.errorSchema?.errorMap[props.path]
      if (res) {
        setResult(res)
      }
    },
    {
      immediate: true
    }
  )

  return { validate, resultRef, setResult }
}

/** 检测校验器列表是否已经存在 required 规则 */
const checkHasRequiredRule = (list: SchemaValidator[]) => {
  return list.some((item) => {
    if (typeof item === 'string') {
      return item === 'required'
    }
    return item.compile === 'required' || item.name === 'required'
  })
}

const retrieveValidators = (schema: Schema, rootValue: any, path: string) => {
  const list = schema.validator ? (Array.isArray(schema.validator) ? schema.validator : [schema.validator]) : []

  // TODO 如果指定的 enableKey 值为 false 跳过校验

  // 如果 Schema.hidden 为 true 跳过校验
  if (schema.hidden) {
    return []
  }

  if (typeof schema.condition === 'boolean') {
    if (schema.condition === false) {
      return []
    }
  } else if (schema.condition) {
    const parentalPath = path.split('.').slice(0, -1).join('.')
    const parentalValue = jsonPath.query(rootValue, parentalPath)[0]
    if (!schema.condition(rootValue, parentalValue, {})) {
      return []
    }
  }

  // 如果指定了 required 并且没有重写 required 规则 那么添加一条校验规则
  if (schema.required && !checkHasRequiredRule(list)) {
    list.unshift('required')
  }

  return list
    .map((validator) => {
      if (typeof validator === 'string') {
        const targetValidator = registeredValidators[validator]
        if (!targetValidator) console.warn(`找不到校验器定义：${validator}`)
        return targetValidator ?? null
      }

      if (typeof validator.compile === 'string') {
        const targetValidator = registeredValidators[validator.compile]
        if (!targetValidator) {
          console.warn(`找不到校验器定义：${validator}`)
          return null
        }
        return {
          ...targetValidator,
          ...validator,
          compile: targetValidator.compile
        }
      }

      return validator
    })
    .filter((item) => !!item)
}

export const validateValue = (value: any, validator: SchemaValidator): boolean => {
  /** 检索校验器名称 */
  if (typeof validator === 'string') {
    const targetValidator = registeredValidators[validator]

    // 找不到校验器，不校验，直接返回 true
    if (!targetValidator) {
      console.warn(`找不到校验器定义：${validator}`)
      return true
    }

    return validateValue(value, targetValidator)
  } else if (Array.isArray(validator)) {
    // 多个校验器，必须全部规则校验通过
    const results = validator.map((item) => {
      return validateValue(value, item)
    })
    return !results.find((result) => result === false)
  }

  // 校验逻辑
  if (typeof validator.compile === 'string') {
    return validateValue(value, validator)
  }

  try {
    return Boolean(validator.compile(value))
  } catch (err) {
    console.error('校验解析错误：', err)
    return false
  }
}

const formatValidateMessage = (title: string, value: any, message: SchemaValidatorDefine['message']) => {
  if (typeof message === 'string') return message
  return (message as Function)(title, toRaw(value))
}

type ValidateQueue = {
  path: string
  value: string
  schema: Schema
  validatorKey: string
}

export const validateForm = (schema: Schema, value: any) => {
  // console.time()
  const validatorsMap = extractSchemaValidator(schema, undefined, undefined, value)
  const rawData = toRaw(value)
  /** 校验队列 */
  const list = ([] as ValidateQueue[])
    .concat(
      ...Object.keys(validatorsMap).map((path: string) => {
        const target = resolveValidator(rawData, path) as unknown as ValidateQueue[]
        delete (target as any)['__root_path']
        return Object.values(target)
      })
    )
    .map((item) => {
      return {
        ...item,
        validator: validatorsMap[item.validatorKey]?.validator,
        schema: validatorsMap[item.validatorKey]?.schema
      }
    })

  const errorMap: Record<string, SchemaValidateResult> = {}
  let valid = true
  list.forEach((item) => {
    const schema = item.schema
    if (!schema.required && (value === '' || value === undefined || value === null)) {
      // 非必填时，如果值为空也不进行校验
    } else {
      const errors = item.validator
        .map((i, index) => {
          const itemValidator = i as SchemaValidatorDefine
          return {
            path: item.path,
            value: item.value,
            validator: item.validator[index],
            valid: validateValue(item.value, itemValidator),
            status: itemValidator.status ?? 'error',
            message: formatValidateMessage(schema.title!, item.value, itemValidator.message)
          }
        })
        .filter((i) => !i.valid)
      const result = {
        path: item.path,
        schema: item.schema,
        // warn 仅作为警告，并不会影响校验通过
        valid: errors.filter((item) => item.status === 'error').length === 0,
        errors: errors
      }

      // 校验失败的才保存起来
      // TODO 支持警告信息
      if (!result.valid) {
        errorMap[item.path] = result
      }

      if (!result.valid) {
        valid = false
      }
    }
  })
  const result = {
    valid,
    errorMap: errorMap
  }
  // console.log(result)
  // console.timeEnd()
  return result
}

const resolveValidator = (
  rootValue: any,
  path: string,
  target: any = {}
): Record<string, Pick<ValidateQueue, 'path' | 'validatorKey' | 'value'>> => {
  if (path.includes('[$i]')) {
    // 需要根据数据遍历出具体 path
    target['__root_path'] = target['__root_path'] ?? path
    // 可能包含多个 $i，解析第一个，依次遍历下去
    const [scopePath, ...restPath] = path.split('[$i]')
    let scope: any[] = queryValue(rootValue, scopePath)
    scope = Array.isArray(scope) ? scope : []
    scope.forEach((item, index) => {
      const formatPath = `${scopePath}[${index}]${restPath.join('[$i]')}`
      // 当前已经解析过一次了，如果路径还包含 $i，那继续向下处理
      if (!formatPath.includes('[$i]')) {
        target[formatPath] = {
          path: formatPath,
          value: queryValue(rootValue, formatPath),
          validatorKey: target['__root_path'] as unknown as string
        }
      } else {
        resolveValidator(rootValue, formatPath, target)
      }
    })
  } else {
    try {
      target[path] = {
        path,
        value: jsonPath.query(rootValue, path)[0],
        validatorKey: path
      }
    } catch (err) {
      target[path] = {
        path,
        value: undefined,
        validatorKey: path
      }
    }
  }
  return target
}

const queryValue = (value: any, path: string) => {
  try {
    return jsonPath.query(value, path)?.[0]
  } catch (err) {
    return undefined
  }
}

const traverseValue = (value: any, path = '$') => {}

const extractSchemaValidator = (
  schema: Schema,
  currentPath = '$',
  map: Record<
    string,
    {
      validator: SchemaValidatorDefine[]
      schema: Schema
    }
  > = {},
  rootValue: any
) => {
  const validators = retrieveValidators(schema, rootValue, currentPath).filter(
    (item) => !!item
  ) as SchemaValidatorDefine[]
  if (validators && validators.length > 0) {
    map[currentPath] = {
      validator: validators,
      schema
    }
  }

  // Object、Array 未命中 condition 后不再向子项遍历
  if (typeof schema.condition === 'boolean') {
    if (schema.condition === false) {
      return map
    }
  } else if (schema.condition) {
    const parentalPath = currentPath.split('.').slice(0, -1).join('.')
    const parentalValue = jsonPath.query(rootValue, parentalPath)[0]
    if (!schema.condition(rootValue, parentalValue, {})) {
      return map
    }
  }

  // Object、Array 设置 hidden 后不再向子项遍历
  if (!schema.hidden) {
    // 处理对象类型的节点
    if (schema.type === 'object' && schema.properties) {
      for (const prop in schema.properties) {
        const propPath = currentPath ? `${currentPath}.${prop}` : prop
        extractSchemaValidator(schema.properties[prop], propPath, map, rootValue)
      }
    }

    // 处理数组类型的节点
    if (schema.type === 'array' && schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach((itemSchema, index) => {
          const itemPath = `${currentPath}[${index}]`
          extractSchemaValidator(itemSchema, itemPath, map, rootValue)
        })
      } else {
        const itemPath = `${currentPath}[$i]`
        extractSchemaValidator(schema.items, itemPath, map, rootValue)
      }
    }
  }

  // 返回包含所有 "validator" 属性的对象
  return map
}
