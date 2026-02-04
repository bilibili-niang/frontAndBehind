import { defineStore } from 'pinia'
import { computed, nextTick, reactive, readonly, ref, toRaw, watch } from 'vue'
import useEditorStore from '../editor'
import type { ComponentDefine, ComponentPackage } from '../component'
import useComponentStore from '../component'
import { message } from '@pkg/ui'
import { cloneDeep, defaultsDeep, set, flatten } from 'lodash'
import { type Snapshot } from '../snapshot'

import { PAGE_TEMPLATE_DEFAULT, SCOPE_LOGIN, TEMPLATE_OPTIONS } from '../../constants'
import { router, uuid } from '@pkg/core'
import { SCOPE_LAUNCH } from '../../constants/content'
import { registeredComponents } from '../../canvas-components'
import { ComponentAttrs, DeckComponent, FlattenTreeCompNode, TreeCompNode } from './types'
import { LayerTree, LayerTreeNode } from './tree'
import { Canvas } from './component'

export type { DeckComponent, ComponentAttrs }

const generateStore = (name: string) =>
  defineStore(name, () => {
    const editorStore = useEditorStore()
    const componentStore = useComponentStore()

    const scope = computed(() => (router.currentRoute.value.query?.scope as string) ?? 'custom')
    const template = ref(
      (router.currentRoute.value.query?.template as string) ?? PAGE_TEMPLATE_DEFAULT
    )

    watch(
      () => router.currentRoute.value,
      () => {
        template.value =
          (router.currentRoute.value.query?.template as string) ?? PAGE_TEMPLATE_DEFAULT
      }
    )

    const pagePkg = computed(() => {
      const pages = Object.values(registeredComponents.value).filter((item) => item.type === 'page')
      const pkg =
        pages.find((item) => item.key === template.value)?.key ||
        pages.find((item) => {
          return item.key === scope.value || item.key === scope.value + '-page'
        })?.key ||
        TEMPLATE_OPTIONS.find((item) => item.value === template.value)?.pkg
      if (!pkg) return undefined

      // 这里会触发加载重试：加载失败 -> 组件包注册 -> 加载
      return componentStore.getComponentPackage(/-page$/.test(pkg) ? pkg : `${pkg}-page`)
    })

    const pageDefine = computed(() => pagePkg.value?.manifest)
    const page = ref<any>(cloneDeep(pageDefine.value?.default ?? null))
    watch(
      () => pageDefine.value,
      () => {
        // 因为页面组件的加载是异步的，此时page可能是一个空的object，加载完成后进行赋值
        // console.log(page.value, pageDefine.value?.default)

        page.value = defaultsDeep(page.value, pageDefine.value?.default)
      },
      {
        immediate: true
      }
    )

    const canvas = new Canvas()

    /** 组件数组（扁平数据） */
    const components = ref<DeckComponent[]>([])
    /** 组件数组（计算属性） */
    const componentsGetter = computed(() => {
      const componentStore = useComponentStore()
      return components.value.map((item) => {
        return {
          ...item,
          package: componentStore.getComponentPackage(item.key)
        }
      })
    })

    /** 生成唯一组件id */
    const generateComponentId = (): string => {
      const id = uuid(6)
      if (components.value.find((item) => item.id === id)) {
        return generateComponentId()
      }
      return id
    }

    /** 生成组件（初始状态） */
    const generateComponent = (pkg: ComponentPackage): DeckComponent => {
      const { key, name, version } = pkg.manifest
      return {
        id: generateComponentId(),
        key,
        name,
        version,
        config: cloneDeep(pkg.manifest.default),
        attrs: Object.assign(
          {
            backgroundEnable: false,
            background: 'rgba(255, 255, 255, 1)',
            borderRadius: [0, 0, 0, 0],
            border: {
              enable: false,
              shape: 'solid',
              width: 1,
              color: '#000000'
            },
            opacity: 100,
            margin: [0, 0, 0, 0],
            padding: [0, 0, 0, 0],
            overflow: 'visible'
          },
          cloneDeep(pkg.manifest.defaultAttrs)
        ) as ComponentAttrs,
        hidden: false,
        locked: false
      }
    }

    /** 添加组件 */
    const addComponent = (
      comp: ComponentDefine,
      targetId?: string,
      position?: 'inside' | 'above' | 'below'
    ) => {
      if (scope.value === SCOPE_LAUNCH) {
        message.info('启动页不支持配置组件')
        return void 0
      }
      const msgId = uuid()
      message.loading({ content: '组件加载中...', duration: 0, key: msgId })
      return useComponentStore()
        .loadComponentPackage(comp.key)
        .then((pkg: ComponentPackage) => {
          message.success({ content: '添加成功', key: msgId })
          const newComponent = generateComponent(pkg)

          if (position === 'inside') {
            newComponent.parent = targetId
          } else {
            newComponent.parent = layerTree.value.getComponent(targetId!)?.parent
          }

          components.value.push(newComponent)

          layerTree.value.addNode(newComponent)

          if (targetId && position) {
            layerTree.value.moveNode(newComponent.id, targetId, position)
          }

          nextTick(() => {
            selectComponent(newComponent.id)
          })

          return newComponent
        })
        .catch((err) => {
          message.error({ content: `添加失败：${err.message}`, key: msgId })
        })
    }

    /** 移除组件 */
    const removeComponent = (id: string) => {
      // const index = components.value.findIndex((item) => item.id === id)
      // if (index !== -1) {
      //   if (currentSelectedComponentId.value === id) {
      //     currentSelectedComponentId.value = null
      //   }
      //   components.value.splice(index, 1)
      // }

      const removedNode = layerTree.value.removeNode(id)
    }

    /** 复制组件 */
    const copyComponent = (id: string) => {
      const target = getRawComponent(id)
      if (target) {
        const newComponent = cloneDeep(target)

        // 这里覆盖掉不能复制的属性
        newComponent.id = uuid(6)

        components.value.splice(
          components.value.findIndex((item) => item.id === id) + 1,
          0,
          newComponent
        )

        retrieveTreeMap()
        selectComponent(newComponent.id)
      }
    }

    /** 更新组件 */
    const updateComponent = (id: string, payload: Partial<Omit<DeckComponent, 'id'>>) => {
      const component = getRawComponent(id)
      if (!component) {
        throw Error(`找不到组件 ${id}`)
      }
      Object.assign(component, payload)
    }

    let componentScrollIntoViewDisabled = false

    const disableComponentScrollIntoView = () => {
      componentScrollIntoViewDisabled = true
      setTimeout(() => {
        componentScrollIntoViewDisabled = false
      }, 300)
    }

    /** 页面滚动到组件位置 */
    const componentScrollIntoView = (id: string) => {
      if (componentScrollIntoViewDisabled) return void 0

      // 固定定位的组件不允许滚动
      if (getComponent(id)?.package?.manifest.fixed) {
        return void 0
      }

      // 登录页不允许滚动
      if (scope.value === SCOPE_LOGIN) return void 0
      const el = document.getElementById(`deck-comp-${id}`)
      if (el) {
        const scroller = document.querySelector('.deck-editor-render__viewport')!
        scroller.scrollTo({ top: el.offsetTop - 88 * editorStore.scale })
      }
    }

    /** 当前选中组件id */
    const currentSelectedComponentId = ref<string | null>(null)

    watch(
      () => currentSelectedComponentId.value,
      () => {
        layerTree.value.selectNode(currentSelectedComponentId.value)
      }
    )
    /** 当前选中组件 */
    const currentSelectedComponent = computed(() => {
      if (!currentSelectedComponentId.value) {
        return null
      }
      return getComponent(currentSelectedComponentId.value)
    })
    /** 获取组件 */
    const getComponent = (id: string) => {
      return componentsGetter.value.find((item) => item.id === id) ?? null
    }
    const getRawComponent = (id: string) => {
      return components.value.find((item) => item.id === id) ?? null
    }

    /** 选择组件 */
    const selectComponent = (id: string, scrollIntoView: boolean = true) => {
      if (!getRawComponent(id)) {
        currentSelectedComponentId.value = null
        return void 0
      }
      currentSelectedComponentId.value = id

      // 展开所有祖先节点
      let parent = layerTree.value.getNode(id)?.parent
      while (parent) {
        parent.expanded = true
        parent = parent.parent || undefined
      }

      // 滚动到视图
      scrollIntoView && componentScrollIntoView(id)
    }

    /** 移动组件 */
    const moveComponent = (id: string, key: 'up' | 'down' | 'top' | 'bottom') => {
      const parent = layerTree.value.getNode(id)?.parent || layerTree.value

      const index = parent?.children.findIndex((item) => item.id === id) ?? -1

      if (index !== -1) {
        const target: any = parent!.children.splice(index, 1)[0]
        if (key === 'up') {
          parent!.children.splice(index - 1 < 0 ? 0 : index - 1, 0, target)
        } else if (key === 'down') {
          parent!.children.splice(index + 1, 0, target)
        } else if (key === 'top') {
          parent!.children.unshift(target)
        } else if (key === 'bottom') {
          parent!.children.push(target)
        }
        setTimeout(() => {
          selectComponent(id)
          if (currentSelectedComponentId.value === id) {
            nextTick(() => {
              componentScrollIntoView(id)
            })
          }
        })
      }
    }
    /** 组件上移 */
    const moveComponentUp = (id: string) => moveComponent(id, 'up')
    /** 组件下移 */
    const moveComponentDown = (id: string) => moveComponent(id, 'down')
    /** 组件置顶 */
    const moveComponentTop = (id: string) => moveComponent(id, 'top')
    /** 组件置底 */
    const moveComponentBottom = (id: string) => moveComponent(id, 'bottom')

    /** 生成快照 */
    const snapshot = () => {
      const comps = cloneDeep(toRaw(components.value))
      return {
        page: cloneDeep(toRaw(page.value)),
        // 这里需要根据树的扁平顺序
        components: layerTree.value.flatNodes
          .map((node) => {
            const comp = comps.find((comp) => comp.id === node.id)
            if (comp?.key === 'swiper') {
              try {
                comp.config.images = comp.config.images.map((i) => {
                  return {
                    ...i,
                    ...i.image
                  }
                })
              } catch (err) {
                console.log(err)
              }
            }
            return comp
          })
          .filter((comp) => comp !== undefined)
      }
    }
    /** 恢复快照 */
    const retrieveSnapshot = (snapshot: Snapshot) => {
      const componentStore = useComponentStore()
      console.log(snapshot, pageDefine.value)
      page.value = defaultsDeep(snapshot.payload.page, pageDefine.value?.default)

      template.value = snapshot.template || template.value

      const list = [...snapshot.payload.components]
      list.forEach((item) => {
        /** 给组件添加标志，组件包加载之后给组件填充默认值并删除该标志 */
        item.__RETRIEVE_DEFAULT_DATA = false
        componentStore
          .loadComponentPackage(item.key)
          .then((res) => {
            // 版本升级，数据适配

            const versionAdapter = res.manifest.versionAdapter
            if (versionAdapter) {
              const newItem = versionAdapter(cloneDeep(item)) ?? item
              const target = components.value.find((comp) => comp.id === newItem.id)
              if (target) {
                Object.assign(target, newItem)
              }
            }

            // 填充缺失的默认数据（如果新增配置项，原来的配置数据会缺失这个默认值）
            defaultsDeep(item.config, res.manifest.default)
          })
          .catch((err) => {
            console.log('[retrieveSnapshot] 组件包加载失败：', err)
          })
      })
      // console.log(snapshot.payload.page)
      components.value = list

      // 恢复树形结构，根据组件的 parent 计算出树形结构
      retrieveTreeMap()
    }

    /* --------------------------------- 树形图层映射 --------------------------------- */

    const layerTree = ref(new LayerTree())

    const retrieveTreeMap = () => {
      const treeMap: Record<string, LayerTreeNode<any>> = {}
      const nodes: LayerTreeNode<any>[] = []

      // 只遍历一次，构建树
      components.value.forEach((component) => {
        const node = treeMap[component.id] || { id: component.id, children: [] }
        treeMap[component.id] = node // 更新或初始化节点

        if (component.parent === null || component.parent === undefined) {
          nodes.push(node) // 如果没有父节点，说明是根节点
        } else {
          // 如果有父节点，先确保父节点也已初始化
          const parentNode = treeMap[component.parent] || { id: component.parent, children: [] }
          treeMap[component.parent] = parentNode
          parentNode.children.push(node) // 将当前节点作为父节点的子节点
        }
      })

      layerTree.value = new LayerTree(nodes, components.value)
      ;(window as any).layerTree = layerTree.value
    }

    /* --------------------------------- 树形图层映射 --------------------------------- */

    /** 画布渲染组件（仅深度为 0 的组件） */
    const renderComponents = computed(() =>
      layerTree.value.children.filter((item) => !item.hidden).map((layer) => layer.$component)
    )

    return {
      id: name,
      scope,
      template,
      pageDefine,
      page,
      pagePkg,
      components: componentsGetter,
      addComponent,
      updateComponent,
      removeComponent,
      copyComponent,

      moveComponentUp,
      moveComponentDown,
      moveComponentTop,
      moveComponentBottom,

      currentSelectedComponentId,
      currentSelectedComponent,
      selectComponent,

      snapshot,
      retrieveSnapshot,

      layerTree: layerTree,

      renderComponents,
      disableComponentScrollIntoView
    }
  })

/* -------------------------- 以下为生成 Store 的逻辑，不可修改 -------------------------- */

// 这里需要注意，当 currentCanvas 改变后 需要重新挂载组件setup，否则 currentCanvas 返回的 store 不会自动刷新
// 可以给组件添加 key 属性，赋 currentCanvas 的值，达到重新渲染组件目的来刷新 store

const CanvasStores: {
  [key: string]: ReturnType<typeof generateStore>
} = {}

const useCanvasStore = (...args: Parameters<ReturnType<typeof generateStore>>) => {
  const key = useEditorStore().currentCanvas
  if (!key) {
    throw Error('缺失当前页面 Key')
  }
  const name = `Canvas_${key}`
  if (CanvasStores[name]) {
    return CanvasStores[name](...args)
  }
  const store = generateStore(name)
  CanvasStores[name] = store
  return store(...args)
}

export default useCanvasStore
