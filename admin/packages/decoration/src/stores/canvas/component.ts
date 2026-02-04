import { uuid } from '@pkg/core'
import { LayerTree } from './tree'
import { DefineComponent } from 'vue'

/** 装修组件类 */
export class DeckComponent {
  /** 组件id */
  id: string
  /** 组件配置 */
  config: unknown = {}
  /** 所属画布 */
  private $canvas: Canvas
  constructor(canvas: Canvas) {
    this.$canvas = canvas
    this.id = uuid()
  }

  get layerNode() {
    return this.$canvas.getLayerNode(this.id)
  }

  /** 子组件 */
  get children() {
    return []
  }
  /** 父组件 */
  get parent() {
    return null
  }
}

/** 组件管理 */
export class Canvas {
  /** 组件列表 */
  readonly components: DeckComponent[] = []
  /** 图层树，用于映射组件嵌套关系 */
  private layerTree: LayerTree
  /** 当前选中组件id */
  private currentComponentId: string | null = null

  constructor() {
    this.layerTree = new LayerTree()
  }

  /** 生成组件id */
  generateComponentId(): string {
    const id = uuid(6)
    if (this.components.find((item) => item.id === id)) {
      return this.generateComponentId()
    }
    return id
  }
  /** 生成组件（初始状态） */
  generateComponent() {}
  /** 添加组件 */
  addComponent() {}
  /** 移除组件 */
  removeComponent(id: string) {}
  /** 复制组件 */
  copyComponent(id: string) {}
  /** 选中组件 */
  selectComponent(id: string) {
    this.layerTree.selectNode(id)
  }
  /** 选中页面（取消选中组件） */
  selectPage() {
    this.layerTree.selectNode(null)
  }

  getLayerNode(id: string) {
    return this.layerTree.getNode(id)
  }

  /** 当前选中组件实例 */
  get currentComponent() {
    return this.components.find((item) => item.id === this.currentComponentId)
  }

  /** 恢复快照 */
  retrieveSnapshot(payload: any) {}
  /** 生成快照 */
  generateSnapshot() {}

  /** 画布滚动到组件位置 */
  componentScrollIntoView(id: string) {}
}

/* ----------------------------------- 组件库 ---------------------------------- */

export interface ComponentPackage {
  key: string
  title: string
  version: string
  thumbnail?: string
  images?: string[]
  /** 组件类型 */
  type: 'common' | 'content' | 'page'
  /** 是否position：fixed */
  fixed?: boolean
}

/** 装修组件库（单例模式）通过 getInstance() 获取实例  */
export class ComponentLibrary {
  private static instance: ComponentLibrary | undefined
  /** 已经注册的组件包 */
  private registeredComponentPackages: { [key: string]: ComponentPackage } = {}
  /** 已经加载的组件包 */
  private loadedComponentPackages: { [key: string]: ComponentPackage } = {}

  // 私有化构造函数，防止外部创建实例
  private constructor() {}

  static getInstance() {
    if (!ComponentLibrary.instance) {
      ComponentLibrary.instance = new ComponentLibrary()
    }
    return ComponentLibrary.instance
  }

  /** 注册组件包 */
  registerComponentPackage() {}
  /** 加载组件包 */
  loadComponentPackage(key: string) {
    if (this.loadedComponentPackages[key]) {
      return Promise.resolve(this.loadedComponentPackages[key])
    }

    const pkg = this.registeredComponentPackages[key]

    if (!pkg) {
      return Promise.reject(new Error('找不到组件包，请确保已经注册'))
    }
  }
}

/** 装修组件库实例 */
export const componentLibrary = ComponentLibrary.getInstance()
;(window as any).componentLibrary = componentLibrary
