import { defaults } from 'lodash'

export type DeckComponentConfig = {
  /** 组件标志 */
  key: string
  /** 组件名称 */
  name: string
  /** 版本 */
  version: string
  /** 缩略图 */
  thumbnail: string
  /** 案例图片 */
  images?: string[]
  /**
   * 组件类型：
   *
   * common 通用组件
   *
   * content 业务组件
   *
   * page 页面组件
   *
   * */
  type: 'common' | 'content' | 'page'
  /**
   * 异步加载，需要返回 Promise<{ default: 渲染组件, manifest }>，如：
   *
   * export const manifest = { schema: Schema, default: {} }
   *
   * export default defineComponent({})
   */
  render: () => Promise<{
    // manifest: { schema: Schema; default?: any }
    manifest: { schema: any; default?: any; defaultAttrs?: any } & Partial<
      Omit<DeckComponentConfig, 'render'>
    >
    default: any
  }>

  /** 是否position：fixed */
  fixed?: boolean
  /** 隐式，不显示在组件库内 */
  implicit?: boolean
  /** 无序的，例如弹窗、悬浮按钮 */
  unordered?: boolean

  /**
   * 嵌套关系
   *
   * 需要重点考虑什么问题？
   * 1. 公共通用组件并不知道后续可能注册哪些组件？
   * 2. 非直接父子关系怎么处理？
   */
  nestRelation?: {
    /** 允许嵌套的父组件 */
    allowedParents?: {
      /** 包含，默认 ['*'], 允许任何父组件，可用 * 表示所有组件 */
      includes?: string[]
      /** 排除，默认 []，不排除任何组件，可用 * 表示所有组件 */
      excludes?: string[]
    }
    /** 允许嵌套的子组件 */
    allowedChildren?: {
      /** 包含，默认 [], 不允许任何子组件，可用 * 表示所有组件 */
      includes?: string[]
      /** 排除，默认 []，不排除任何子组件，可用 * 表示所有组件 */
      excludes?: string[]
    }
    /**
     * 后置条件判断，
     * 在允许嵌套的前提下，再进行更严格的判断
     */
    // condition?: (
    //   childComponent: DeckComponentConfig,
    //   parentComponent: DeckComponentConfig
    // ) => boolean
  }

  // TODO 其实这里适配器应该是数组，逐级适配

  /** 有破坏性改动情况下，使用版本升级数据适配器 */
  versionAdapter?: (config: any) => any

  /** 隐藏气泡？ */
  bubbleHidden?: boolean
}

/**
 * 定义装修组件加载器
 *
 */
export const defineDeckComponent = (config: DeckComponentConfig) => {
  const { render, ...manifest } = config
  return {
    ...config,
    render: () =>
      config.render().then((res) => {
        defaults(res.manifest, manifest)
        return res
      })
  }
}
