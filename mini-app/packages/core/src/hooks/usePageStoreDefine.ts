import { defineStore } from 'pinia'
import { inject, provide } from 'vue'

const STORES_MAP = {}

/**
 * 创建页面Store定义，仅 setup 阶段有效！
 */
const usePageStoreDefine = (options: { prefix: string; defineStoreHandler: () => any }) => {
  const _defineStore = (storeKey: string) => defineStore(storeKey, options.defineStoreHandler)

  const usePageStore = (key?: string, ...args: Parameters<ReturnType<typeof _defineStore>>) => {
    const prefix = options.prefix
    const provideKey = `pageStoe:${prefix}`
    if (key) {
      try {
        provide(provideKey, key)
      } catch {}
    }

    const _key = key ?? inject(provideKey)

    if (!_key) {
      throw new Error('usePageStore 必须在当前指定页面内使用，或指定 key')
    }

    const storeKey = `${options.prefix}-${_key}`

    const useStore = STORES_MAP[storeKey] ?? _defineStore(storeKey)
    STORES_MAP[storeKey] = useStore
    return useStore(...args)
  }

  return usePageStore
}

const useGoodsStore = usePageStoreDefine({
  prefix: 'goods-detail',
  defineStoreHandler: () => {
    return {}
  }
})

export default usePageStoreDefine

export const usePageStoreDispose = (id: string) => {
  // TODO 多个页面依赖同一个 store 需要等所有页面卸载后再销毁

  let store = STORES_MAP[id]
  if (!store) return void 0
  store.$dispose()
  store = null
  STORES_MAP[id] = null
  delete STORES_MAP[id]
}
