import request from './request'
import useAppStore from '../stores/app'

// 递归按 sort 升序排序（子级也排序；sort 为空的排在最后），返回新的树结构
const sortMenuTree = <T extends { sort?: number | null; children?: T[] }>(nodes: T[] = []): T[] => {
  const norm = (v: unknown) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY
  }
  const sorted = [...nodes].sort((a, b) => {
    const sa = norm(a?.sort)
    const sb = norm(b?.sort)
    // 降序：sort 越大越靠前
    return sb - sa
  })
  return sorted.map((n) => ({
    ...(n as any),
    children: Array.isArray(n.children) ? sortMenuTree(n.children) : n.children
  }))
}

/** 获取顶部菜单栏 */
export const getHeaderMenus = (scope?: string) => {
  const appStore = useAppStore()
  return request({
    url: '/null-cornerstone-system/menu/top-menu',
    method: 'GET',
    params: {
      scope: scope ?? appStore.scope
    }
  })
}

/** 获取侧边菜单栏 */
export const getSideMenus = (topMenuId: string) => {
  return request({
    url: `/null-cornerstone-system/menu/routesIncludeButton/${topMenuId}`
  }).then((res: any) => {
    if (res && Array.isArray(res.data)) {
      const sorted = sortMenuTree(res.data)
      // 返回一个新的响应对象，避免直接篡改原始引用
      return { ...res, data: sorted }
    }
    return res
  })
}

/** 获取侧边菜单栏权限树 */
export const getSideMenusTree = (topMenuId: string) => {
  return request({
    // url: `/null-cornerstone-system/menu/tree/${topMenuId}`,
    url: `/null-cornerstone-system/menu/treeIncludeButton/${topMenuId}`
  }).then((res: any) => {
    if (res && Array.isArray(res.data)) {
      const sorted = sortMenuTree(res.data)
      // 返回一个新的响应对象，避免直接篡改原始引用
      return { ...res, data: sorted }
    }
    return res
  })
}

/*
 * 菜单树，运营中心分配产品对应的菜单
 * */
export const getsTheMenuForANonButton = (topMenuId: string) => {
  return request({
    url: `/null-cornerstone-system/menu/tree/${topMenuId}`
  }).then((res: any) => {
    if (res && Array.isArray(res.data)) {
      const sorted = sortMenuTree(res.data)
      // 返回一个新的响应对象，避免直接篡改原始引用
      return { ...res, data: sorted }
    }
    return res
  })
}
