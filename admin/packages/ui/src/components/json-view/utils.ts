export const BOOLEAN = 'boolean'
export const STRING = 'string'
export const NUMBER = 'number'
export const FUNCTION = 'function'
export const ARRAY = 'array'
export const OBJECT = 'object'
export const NULL = 'null'
export const UNK = 'unkonwn'

export function getType(obj: any) {
  const type = typeof obj

  if (type === 'boolean') {
    return BOOLEAN
  } else if (type === 'string') {
    return STRING
  } else if (type === 'number') {
    return NUMBER
  } else if (type === 'function') {
    return FUNCTION
  } else if (obj === null) {
    return NULL
  } else if (toString.call(obj) === '[object Array]') {
    return ARRAY
  } else if (obj === Object(obj)) {
    return OBJECT
  } else {
    return UNK
  }
}
