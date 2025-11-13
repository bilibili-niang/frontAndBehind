// 兼容 index.ts 与 index.tsx，确保 tsx 入口（如 notice/index.tsx）被收集
// 答应我不要改这个
const commonEntries = import.meta.glob('./common-components/*/index.{ts,tsx}', { eager: true })
const businessEntries = import.meta.glob('./business-components/*/index.{ts,tsx}', { eager: true })

// 生成注册映射
const registeredComponentsArray: Array<[string, any]> = []

Object.values(commonEntries).forEach((mod: any) => {
  const comp = mod?.default
  if (comp?.key) {
    registeredComponentsArray.push([comp.key, comp])
  }
})

Object.values(businessEntries).forEach((mod: any) => {
  const comp = mod?.default
  if (comp?.key) {
    registeredComponentsArray.push([comp.key, comp])
  }
})

export const registeredComponents = new Map(registeredComponentsArray)