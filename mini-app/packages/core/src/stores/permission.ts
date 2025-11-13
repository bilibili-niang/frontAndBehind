import { flatMapDeep, omit } from 'lodash'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface MenuItem {
  id: string
  parentId: string
  title?: string
  key?: string
  value?: string
  source?: string
  sort?: number
  customId?: string
  customSource?: string
  customName?: string
  code?: string
  name?: string
  path?: string
  component?: string
  hidden?: boolean
  category?: number
  children?: MenuItem[]
}

export const usePermissionStore = defineStore('core-permission', () => {
  const permissions = ref<MenuItem[]>()

  const controls = computed(() => {
    // return permissions.value
    return permissions.value?.filter((item) => item.category == 2)
  })

  const controlCodes = computed(() => controls.value?.map((item) => item.code) ?? [])

  const generatePermission = (routes: any[]) => {
    permissions.value = flattenTree(routes)

    console.log('生成权限映射：', permissions.value, controls.value, controlCodes.value)
  }

  /**
   * 是否有功能（按钮）权限
   *
   * 注意：需在 .env 配置权限前缀 VITE_APP_PERMISSION_PREFIX，否则一律返回 true
   */
  const hasPermission = (code: string) => {
    if (import.meta.env.VITE_APP_USE_BUTTON_PERMISSION == 'false') {
      return true
    }
    try {
      // 若设置的权限code 不含前缀、表示这个权限是功能模块的
      // 注意：运营后台对不同应用配置的公共权限 code 必须是相同的！
      const prefix = import.meta.env.VITE_APP_PERMISSION_PREFIX

      if (!prefix) return true

      if (!code?.startsWith(prefix)) {
        code = prefix + '-' + code
      }
    } catch (err) {
      return true
    }

    return controlCodes.value.includes(code)
  }

  return {
    generatePermission,
    hasPermission
  }
})

function flattenTree(tree: any): any[] {
  return flatMapDeep(tree, (node: any) => {
    return [omit(node, 'children')].concat(flattenTree(node.children || []))
  })
}

type PermissionControls =
  | boolean
  | string
  | string[]
  | {
  /** 必须同时满足这些权限，优先于 or */
  and?: string[]
  /** 必须同时满足这些权限，如有 and 条件将失效 */
  or?: string[]
}

/**
 * 判断是否有权限，
 *
 * 注意：需在 .env 配置权限前缀 VITE_APP_PERMISSION_PREFIX，否则一律视为拥有权限，
 *
 * 可直接传入 boolean，方便用于多应用环境判断
 */
export const withPermission = (controls: PermissionControls, render?: (() => any) | any) => {
  // 不使用按钮权限控制
  if (import.meta.env.VITE_APP_USE_BUTTON_PERMISSION == 'false') {
    console.log('不使用按钮权限控制')
    return true
  }
  const { hasPermission } = usePermissionStore()

  const check = (): boolean => {
    if (typeof controls === 'boolean') {
      return controls
    }

    if (typeof controls === 'string') {
      return hasPermission(controls)
    }

    if (Array.isArray(controls)) {
      // 默认 AND 逻辑
      return controls.every(hasPermission)
    }

    if (controls?.and?.length) {
      // AND 优先
      return controls.and.every(hasPermission)
    }

    if (controls?.or?.length) {
      return controls.or.some(hasPermission)
    }

    return false
  }

  const isAllowed = check()

  if (render !== undefined) {
    return isAllowed ? (typeof render === 'function' ? render() : render) : null
  }

  return isAllowed
}
