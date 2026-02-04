/**
 * @file 树选择器组件
 * @description 基于 TreeSelect 的树形选择器组件,用于widget,
 */

import { Cascader, TreeSelect } from '@pkg/ui'
import { CommonWidgetPropsDefine } from '@pkg/jsf'
import { request } from '../../../lib'
import { computed, ref, DefineComponent, Ref, ComputedRef } from 'vue'

/**
 * 树选择器配置项接口
 */
export interface TreeSelectorConfig {
  /** 数据源 API 地址 */
  url: string
  /** 搜索时使用的标签字段名 */
  labelKey?: string
  /** 搜索时使用的搜索字段名 */
  searchKey?: string
  /** 子节点字段名 */
  childrenField?: string
  /** 显示标签字段名 */
  labelField?: string
  /** 值字段名 */
  valueField?: string
  /** 是否禁用叶子节点（最低一级） */
  disableLeafNodes?: boolean
  /** 最大可选层级 */
  maxLevel?: number
}

/**
 * 树节点数据接口
 */
export interface TreeNodeData {
  /** 节点ID */
  id: string | number
  /** 节点名称 */
  name: string
  /** 节点层级 */
  level?: number
  /** 父节点ID */
  parentId?: string | number
  /** 是否禁用 */
  disabled?: boolean

  /** 子节点列表 */
  [key: string]: any
}

/**
 * 树选择器返回值接口
 */
export interface TreeSelectorReturn {
  /** 树选择器组件 */
  TreeSelectorWidget: DefineComponent<any, any, any>
  /** 原始数据引用 */
  options: Ref<TreeNodeData[]>
  /** 处理后的数据引用 */
  processedOptions: ComputedRef<TreeNodeData[]>
  /** 刷新数据方法 */
  refresh: () => Promise<void>
}

/**
 * 树选择器 Hook
 * @description 创建一个可用于表单中的树形选择器组件
 *
 * @param {TreeSelectorConfig} config - 配置项
 * @returns {TreeSelectorReturn} 返回包含 TreeSelectorWidget 组件的对象
 *
 * @example
 * // 基本用法
 * const { TreeSelectorWidget } = useTreeSelector({ url: '/api/categories' })
 *
 * // 禁用叶子节点
 * const { TreeSelectorWidget } = useTreeSelector({
 *   url: '/api/categories',
 *   disableLeafNodes: true
 * })
 *
 * // 完整配置
 * const { TreeSelectorWidget } = useTreeSelector({
 *   url: '/api/categories',
 *   childrenField: 'children',
 *   labelField: 'title',
 *   valueField: 'id',
 *   disableLeafNodes: true,
 *   maxLevel: 3
 * })
 */
const useTreeSelector = (config: TreeSelectorConfig): TreeSelectorReturn => {
  const options = ref<TreeNodeData[]>([])
  const init = async () => {
    request({
      url: config.url,
      method: 'get',
      params: {
        current: 1,
        size: 9999
      }
    }).then((res) => {
      if (res.data?.records) {
        options.value = res.data.records
      }
    })
  }

  // 初始化
  init()

  // 刷新数据的方法
  const refresh = async () => {
    await init()
    return
  }

  /**
   * 处理树形数据，为叶子节点添加禁用属性
   * @param {TreeNodeData[]} data - 原始树形数据
   * @returns {TreeNodeData[]} 处理后的树形数据，包含禁用状态
   * @private
   */
  const processTreeData = (data: TreeNodeData[]): TreeNodeData[] => {
    if (!data || !Array.isArray(data)) return []

    const childrenField = config.childrenField || 'childCategories'
    const levelField = 'level' // 假设有level字段表示层级

    const processNode = (node: TreeNodeData): TreeNodeData => {
      const children = node[childrenField]
      const hasChildren = children && children.length > 0

      // 创建新节点，避免直接修改原始数据
      const newNode: TreeNodeData = { ...node }

      // 如果配置了禁用叶子节点，并且当前节点是叶子节点（没有子节点）
      if (config.disableLeafNodes && !hasChildren) {
        newNode.disabled = true
      }

      // 如果配置了最大层级，并且当前节点层级达到或超过最大层级
      if (config.maxLevel && node[levelField] && node[levelField] >= config.maxLevel) {
        newNode.disabled = true
      }

      // 递归处理子节点
      if (hasChildren) {
        newNode[childrenField] = children.map((child: TreeNodeData) => processNode(child))
      }

      return newNode
    }

    return data.map((node: TreeNodeData) => processNode(node))
  }

  const processedOptions = computed<TreeNodeData[]>(() => {
    return processTreeData(options.value)
  })

  /**
   * 树选择器组件
   * @param {Object} props - 组件属性
   * @returns {JSX.Element} TreeSelect 组件
   */
  const TreeSelectorWidget = (props: typeof CommonWidgetPropsDefine) => {
    return (
      <TreeSelect
        showSearch
        allowClear
        placeholder=""
        treeNodeFilterProp="label"
        {...props.config}
        treeData={processedOptions.value}
        value={props.value || null}
        onChange={props.onChange}
        fieldNames={{
          children: config.childrenField || 'childCategories',
          label: config.labelField || 'name',
          value: config.valueField || 'id'
        }}
      />
    )
  }

  return {
    TreeSelectorWidget,
    // 下面几个没试过
    options,
    processedOptions,
    refresh
  }
}

export default useTreeSelector
// export { TreeSelectorConfig, TreeNodeData, TreeSelectorReturn }
