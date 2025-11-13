import { defineStore } from 'pinia'
import { computed, type DefineComponent, markRaw, ref, watch } from 'vue'
import { registeredComponents } from '../canvas-components'
import ComponentLoading from '../canvas-components/loading'
import ComponentError from '../canvas-components/error'
import { DeckComponentConfig } from '../canvas-components/defineDeckComponent'

export interface ComponentPackage {
  manifest: Record<string, any>
  render: DefineComponent<any, any, any>
  __LOADED?: boolean
}

export type ComponentDefine = (typeof registeredComponents.value)[string]

const useComponentStore = defineStore('Component', () => {
  const componentList = computed<DeckComponentConfig[]>(() => {
    return Object.values(registeredComponents.value)
  })

  const loadedComponents = ref<{ [key: string]: ComponentPackage }>({})

  /** 加载组件包 */
  const loadComponentPackage = (key: string): Promise<ComponentPackage> => {
    return new Promise((resolve, reject) => {
      if (loadedComponents.value[key]) {
        // 组件包已经开始加载了，但是还没加载完成
        if (loadedComponents.value[key].__LOADED === false) {
          // 监听这个组件包的 __LOADED 变成 true 时，返回组件包，同时停止监听
          const watchStopHandle = watch(
            () => loadedComponents.value[key],
            () => {
              if (loadedComponents.value[key].__LOADED === true) {
                watchStopHandle()
                resolve(loadedComponents.value[key])
              }
            }
          )
          return
        }
        return resolve(loadedComponents.value[key])
      }
      const loader = registeredComponents.value[key]?.render
      if (!loader) {
        // if (lackLoaders.indexOf(key) === -1) {
        //   lackLoaders.push(key)
        // }
        return reject(`找不到 ${key} 组件包!`)
      }
      loadedComponents.value[key] = {
        manifest: { key: key },
        render: markRaw(ComponentLoading),
        __LOADED: false
      }
      loader()
        .then((res) => {
          console.groupCollapsed(
            `组件包加载成功 %c${res.manifest.name}（ ${key} ）`,
            'color: #2ecc71;'
          )
          console.log(res)
          console.groupEnd()
          loadedComponents.value[key] = {
            manifest: res.manifest,
            render: markRaw(res.default),
            __LOADED: true
          }
          resolve(loadedComponents.value[key])
        })
        .catch((err) => {
          console.log(`组件包加载失败 %c${key}`, 'color: #eb2f06;', err)
          loadedComponents.value[key] = {
            manifest: { key: key },
            render: markRaw(ComponentError)
          }
          reject(err)
        })
        .catch((err) => {
          console.log(`组件包加载失败 %c${key}`, 'color: #eb2f06;')
          reject(err)
        })
    })
  }

  const getComponentPackage = (key: string) => {
    const comp = loadedComponents.value[key]
    if (!comp) {
      loadComponentPackage(key).catch((err) => console.error(err))
      return undefined
    }
    return comp
  }

  return {
    componentList,
    registeredComponents: loadedComponents,
    loadComponentPackage,
    getComponentPackage
  }
})

export default useComponentStore
